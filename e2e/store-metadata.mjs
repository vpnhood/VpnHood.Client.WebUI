#!/usr/bin/env node
/**
 * Compile store listing TEXTS from one translatable source per app.
 *
 * The raw fastlane files (title.txt, description.txt, …) are compiler OUTPUT, one directory per
 * store locale — never hand-edited and never fed to a translator. The single source of truth is
 * store-i18n/ in the store-asset repo:
 *
 *   store-i18n/locales.json         the app's store locales; first entry is the source language
 *   store-i18n/store.<tag>.json     the texts, one file per locale, per-store sections
 *
 * Only store.<source>.json is written by humans; vhtranslator generates every other locale file
 * (the same rule as the SPA's en.json). This compiler fans them out into the fastlane trees and
 * FAILS LOUDLY on what hand-kept txt files get wrong silently: store character limits (translations
 * overflow English-sized fields), per-store locale availability (App Store Connect has no Persian),
 * missing or unknown fields (a typo in a key), and platform names inside App Store copy
 * (Guideline 2.3.10 — naming Android or Windows in iOS metadata is a rejection).
 *
 * Per-version files (changelogs/, release_notes.txt) belong to the release pipeline, and
 * screenshots to store-screenshots.mjs — this tool never touches either. Non-translated
 * passthrough files (URLs, video.txt) are copied from the source locale's directory into every
 * other locale's.
 *
 * Usage:
 *   node e2e/store-metadata.mjs                              compile into INSTALL_ROOT (project.mjs)
 *   node e2e/store-metadata.mjs --root ../Vpnhood.App.Client
 *   node e2e/store-metadata.mjs --check                      validate only, write nothing
 *   node e2e/store-metadata.mjs --extract                    one-time: build store.<source>.json
 *                                                            from the existing fastlane txt files
 */
import { promises as fs } from 'fs';
import path from 'path';
import url from 'url';
import { INSTALL_ROOT } from './store/project.mjs';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const argValue = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const root = path.resolve(projectRoot, argValue('--root', null) ?? INSTALL_ROOT ?? '.');
const i18nDir = path.join(root, 'store-i18n');
const checkOnly = args.includes('--check');
const doExtract = args.includes('--extract');

/**
 * What each store's listing is made of. `max` values are the stores' own hard field limits — a
 * compile that exceeds one would only move the failure to upload time, so it fails here instead.
 */
const STORES = {
  android: {
    storeKey: 'googlePlay',
    dir: (tag) => path.join(root, 'fastlane', 'metadata', 'android', tag),
    fields: {
      title: { file: 'title.txt', max: 30 },
      short_description: { file: 'short_description.txt', max: 80 },
      full_description: { file: 'full_description.txt', max: 4000 },
    },
    passthrough: ['video.txt'],
  },
  ios: {
    storeKey: 'appStore',
    dir: (tag) => path.join(root, 'fastlane', 'metadata', 'ios', tag),
    fields: {
      subtitle: { file: 'subtitle.txt', max: 30 },
      description: { file: 'description.txt', max: 4000 },
      keywords: { file: 'keywords.txt', max: 100 },
      promotional_text: { file: 'promotional_text.txt', max: 170 },
    },
    passthrough: ['marketing_url.txt', 'support_url.txt'],
    // Guideline 2.3.10: App Store metadata must not name another platform. The app copy already
    // follows this; the lint keeps a translation (or a careless edit) from breaking it.
    forbidden: /android|google play|windows|linux|samsung/i,
  },
};

/** Store limits count characters; a file's single trailing newline is layout, not content. */
const charCount = (text) => [...text.replace(/\n$/, '')].length;

/** The store folder for a locale on this store: a `stores` override wins (null: the store has no
 * such locale, skip it), the tag otherwise — the same rule store-screenshots.mjs applies. */
const storeFolder = (store, locale) =>
  locale.stores && store.storeKey in locale.stores ? locale.stores[store.storeKey] : locale.tag;

async function readLocales() {
  const file = path.join(i18nDir, 'locales.json');
  const raw = await fs.readFile(file, 'utf8').catch(() => null);
  if (raw === null)
    throw new Error(`${file} is missing — it names the app's store locales (first entry = source language).`);
  const { locales } = JSON.parse(raw);
  if (!locales?.length) throw new Error(`${file} declares no locales.`);
  return locales;
}

/** One-time migration (and a fork's starting point): existing fastlane txt -> store.<source>.json. */
async function extract(locales) {
  const source = locales[0];
  const data = {};
  for (const [name, store] of Object.entries(STORES)) {
    const dir = store.dir(source.tag);
    if (!await fs.stat(dir).catch(() => null)) continue; // an app without this store has no section
    data[name] = {};
    for (const [field, spec] of Object.entries(store.fields)) {
      const text = await fs.readFile(path.join(dir, spec.file), 'utf8').catch(() => null);
      if (text === null)
        throw new Error(`${name}/${source.tag}: ${spec.file} is missing — every field of a present store must exist.`);
      data[name][field] = text;
    }
  }
  await fs.mkdir(i18nDir, { recursive: true });
  const out = path.join(i18nDir, `store.${source.tag}.json`);
  await fs.writeFile(out, JSON.stringify(data, null, 2) + '\n');
  console.log(`extracted ${Object.keys(data).join(' + ')} -> ${path.relative(root, out)}`);
}

async function compile(locales) {
  const source = locales[0];
  const readLocale = async (locale) => {
    const file = path.join(i18nDir, `store.${locale.tag}.json`);
    const raw = await fs.readFile(file, 'utf8').catch(() => null);
    if (raw === null)
      throw new Error(`${file} is missing — every locale in locales.json needs its translation ` +
        '(vhtranslator generates it from the source file).');
    return JSON.parse(raw);
  };

  // The source locale defines the app's store set; every translation must match it exactly — a
  // listing is a deliverable, so a locale either has the full set or is not declared at all.
  const sourceData = await readLocale(source);
  const sections = Object.keys(sourceData);
  for (const section of sections)
    if (!STORES[section])
      throw new Error(`store.${source.tag}.json: unknown section "${section}" — known: ${Object.keys(STORES).join(', ')}.`);

  for (const locale of locales) {
    const data = locale === source ? sourceData : await readLocale(locale);
    const extra = Object.keys(data).filter(s => !sections.includes(s));
    const missing = sections.filter(s => !(s in data));
    if (extra.length || missing.length)
      throw new Error(`store.${locale.tag}.json: sections must match the source (${sections.join(', ')})` +
        `${missing.length ? `; missing: ${missing.join(', ')}` : ''}${extra.length ? `; unexpected: ${extra.join(', ')}` : ''}.`);

    for (const section of sections) {
      const store = STORES[section];
      const folder = storeFolder(store, locale);
      if (folder === null) {
        console.log(`skipped   ${section.padEnd(7)} ${locale.tag}: this store has no such locale`);
        continue;
      }

      const fields = Object.keys(store.fields);
      for (const key of Object.keys(data[section]))
        if (!fields.includes(key))
          throw new Error(`store.${locale.tag}.json ${section}: unknown field "${key}" — known: ${fields.join(', ')}.`);

      for (const [field, spec] of Object.entries(store.fields)) {
        const text = data[section][field];
        if (typeof text !== 'string')
          throw new Error(`store.${locale.tag}.json ${section}: field "${field}" is missing.`);
        const count = charCount(text);
        if (count > spec.max)
          throw new Error(`store.${locale.tag}.json ${section}.${field}: ${count} characters — the store allows ${spec.max}.`);
        const banned = store.forbidden && text.match(store.forbidden);
        if (banned)
          throw new Error(`store.${locale.tag}.json ${section}.${field}: contains "${banned[0]}" — ` +
            'App Store metadata must not name another platform (Guideline 2.3.10).');
      }

      if (checkOnly) continue;
      const dir = store.dir(folder);
      await fs.mkdir(dir, { recursive: true });
      for (const [field, spec] of Object.entries(store.fields))
        await fs.writeFile(path.join(dir, spec.file), data[section][field]);
      // URLs and the like are locale-independent: the source directory owns them, every other
      // locale gets a copy so the store never sees a locale with holes.
      if (locale !== source)
        for (const file of store.passthrough) {
          const from = path.join(store.dir(storeFolder(store, source)), file);
          if (await fs.stat(from).catch(() => null))
            await fs.copyFile(from, path.join(dir, file));
        }
      console.log(`compiled  ${section.padEnd(7)} ${locale.tag} -> ${path.relative(root, dir)}`);
    }
  }
  if (checkOnly) console.log('check passed — nothing written');
}

const locales = await readLocales().catch(async (err) => {
  // --extract bootstraps a repo that has no store-i18n yet: fall back to en-US as the source.
  if (doExtract && err.message.includes('is missing')) return [{ tag: 'en-US' }];
  throw err;
});
await (doExtract ? extract(locales) : compile(locales));
