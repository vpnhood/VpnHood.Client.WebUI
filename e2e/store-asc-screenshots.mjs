#!/usr/bin/env node
/**
 * Sync App Store screenshots by checksum — the App Store twin of Play's image sync.
 *
 * deliver's screenshot push is all-or-nothing: it deletes every screenshot on the version and
 * re-creates all of them, every run, even when nothing changed. Apple deletes are eventually
 * consistent, so re-creating a file whose ghost still lingers makes the API 500 that write, and
 * deliver retries it forever — four runs on this app wedged that way, each on one random file near
 * the end ("Waiting for screenshots to appear before uploading … Server error got 500"). A cancelled
 * run then leaves the surviving screenshots in upload-completion order, i.e. scrambled.
 *
 * This tool never does the mass delete. It compares what is live (fileName + sourceFileChecksum —
 * the MD5 Apple stores from the original upload) against the store repo's files and:
 *   - deletes only records whose file no longer exists locally, whose checksum differs, or which
 *     are stuck in a non-COMPLETE delivery state (half-finished uploads left by a dead run);
 *   - uploads only what is missing (reserve → PUT chunks → commit, retrying 5xx with backoff, so a
 *     lingering ghost clears instead of wedging);
 *   - waits — bounded, not forever — for the new uploads to finish processing;
 *   - restores the display order everywhere (the order IS the listing's story);
 *   - prints exactly which file failed if one does. An unchanged listing is a no-op in seconds.
 *
 * Auth: the App Store Connect API key, from the same env vars the CI workflow already has
 * (APPSTORE_CONNECT_API_KEY / _API_KEY_ID / _ISSUER_ID), or --keys-dir <dir> holding
 * appstore_connect_api_key_*.p8, appstore_connect_api_key_id.txt, appstore_connect_issuer_id.txt.
 *
 * Usage:
 *   node e2e/store-asc-screenshots.mjs --bundle-id com.vpnhood.client.ios [--root <store-repo>]
 *   node e2e/store-asc-screenshots.mjs --bundle-id … --check          report drift, write nothing
 *   node e2e/store-asc-screenshots.mjs --bundle-id … --keys-dir ../.user
 */
import { promises as fs } from 'fs';
import { createSign, createHash } from 'crypto';
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
const bundleId = argValue('--bundle-id', null) ?? (() => { throw new Error('--bundle-id is required (e.g. com.vpnhood.client.ios).'); })();
const checkOnly = args.includes('--check');
const keysDir = argValue('--keys-dir', null);
const shotsRoot = path.join(root, 'fastlane', 'screenshots', 'ios');

/** Which ASC screenshot set a local file belongs to, by the repo's naming convention. */
const FAMILIES = [
  { type: 'APP_IPHONE_67', match: /^(\d+)\.png$/ },
  { type: 'APP_IPAD_PRO_3GEN_129', match: /^ipad_(\d+)\.png$/ },
];
const familyOf = (name) => FAMILIES.find((f) => f.match.test(name));
const shotIndex = (family, name) => Number(name.match(family.match)[1]);

// ---------- App Store Connect client (no dependencies; Node's crypto signs the JWT) ----------

async function credentials() {
  if (keysDir) {
    const dir = path.resolve(keysDir);
    const p8 = (await fs.readdir(dir)).find((f) => /^appstore_connect_api_key.*\.p8$/.test(f));
    if (!p8) throw new Error(`no appstore_connect_api_key*.p8 in ${dir}`);
    return {
      key: await fs.readFile(path.join(dir, p8), 'utf8'),
      kid: (await fs.readFile(path.join(dir, 'appstore_connect_api_key_id.txt'), 'utf8')).trim(),
      iss: (await fs.readFile(path.join(dir, 'appstore_connect_issuer_id.txt'), 'utf8')).trim(),
    };
  }
  const { APPSTORE_CONNECT_API_KEY: key, APPSTORE_CONNECT_API_KEY_ID: kid, APPSTORE_CONNECT_ISSUER_ID: iss } = process.env;
  if (!key || !kid || !iss)
    throw new Error('APPSTORE_CONNECT_API_KEY / _API_KEY_ID / _ISSUER_ID must be set (or pass --keys-dir).');
  return { key, kid, iss };
}

const creds = await credentials();
let cachedToken = null, cachedExp = 0;
/** Apple caps token lifetime at 20 minutes; long syncs re-mint before expiry. */
function token() {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedExp - now > 60) return cachedToken;
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const unsigned = `${b64({ alg: 'ES256', kid: creds.kid, typ: 'JWT' })}.${b64({ iss: creds.iss, iat: now, exp: now + 900, aud: 'appstoreconnect-v1' })}`;
  const sig = createSign('SHA256').update(unsigned).end().sign({ key: creds.key, dsaEncoding: 'ieee-p1363' }).toString('base64url');
  cachedExp = now + 900;
  return (cachedToken = `${unsigned}.${sig}`);
}

/** 5xx are retried with backoff: Apple's ghost-delete collisions clear after a wait, and transient
 * 500 waves pass. 4xx are real errors and fail immediately. */
async function api(pathname, method = 'GET', body) {
  const delays = [0, 5000, 15000, 30000, 60000];
  let last;
  for (const delay of delays) {
    if (delay) await new Promise((r) => setTimeout(r, delay));
    const res = await fetch(`https://api.appstoreconnect.apple.com${pathname}`, {
      method,
      headers: { Authorization: `Bearer ${token()}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.ok) return res.status === 204 ? null : res.json();
    last = `${res.status} ${method} ${pathname} :: ${(await res.text()).slice(0, 300)}`;
    if (res.status < 500) break;
    console.log(`  retryable ${res.status} on ${method} ${pathname}${delay < 60000 ? ' — backing off' : ''}`);
  }
  throw new Error(last);
}

// ---------- sync ----------

const md5 = async (file) => createHash('md5').update(await fs.readFile(file)).digest('hex');

async function uploadScreenshot(setId, file) {
  const bytes = await fs.readFile(file.absolute);
  const created = await api('/v1/appScreenshots', 'POST', {
    data: {
      type: 'appScreenshots',
      attributes: { fileName: file.name, fileSize: bytes.length },
      relationships: { appScreenshotSet: { data: { type: 'appScreenshotSets', id: setId } } },
    },
  });
  for (const op of created.data.attributes.uploadOperations ?? []) {
    const headers = Object.fromEntries((op.requestHeaders ?? []).map((h) => [h.name, h.value]));
    const res = await fetch(op.url, { method: op.method, headers, body: bytes.subarray(op.offset, op.offset + op.length) });
    if (!res.ok) throw new Error(`chunk upload for ${file.name}: ${res.status} ${await res.text()}`);
  }
  await api(`/v1/appScreenshots/${created.data.id}`, 'PATCH', {
    data: { type: 'appScreenshots', id: created.data.id, attributes: { uploaded: true, sourceFileChecksum: await md5(file.absolute) } },
  });
  return created.data.id;
}

/** Bounded wait — a stuck asset must FAIL the run with its name, never spin forever. */
async function waitComplete(setId, ids, minutes = 5) {
  const deadline = Date.now() + minutes * 60000;
  let pending = new Set(ids);
  while (pending.size && Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 10000));
    const shots = (await api(`/v1/appScreenshotSets/${setId}/appScreenshots?limit=20`)).data;
    for (const s of shots) {
      const st = s.attributes.assetDeliveryState?.state;
      if (!pending.has(s.id)) continue;
      if (st === 'COMPLETE') pending.delete(s.id);
      else if (st === 'FAILED') throw new Error(`${s.attributes.fileName} FAILED processing on Apple's side`);
    }
  }
  if (pending.size) throw new Error(`${pending.size} screenshot(s) still processing after ${minutes} minutes`);
}

const app = (await api(`/v1/apps?filter[bundleId]=${bundleId}`)).data[0];
if (!app) throw new Error(`no app with bundle id ${bundleId}`);
const versions = (await api(`/v1/apps/${app.id}/appStoreVersions?limit=5`)).data;
const version = versions.find((v) => v.attributes.appStoreState === 'PREPARE_FOR_SUBMISSION');
if (!version)
  throw new Error(`no editable version — states: ${versions.map((v) => `${v.attributes.versionString}=${v.attributes.appStoreState}`).join(', ')}`);
console.log(`${app.attributes.name} ${version.attributes.versionString} — sync from ${path.relative(process.cwd(), shotsRoot) || '.'}\n`);

const localizations = (await api(`/v1/appStoreVersions/${version.id}/appStoreVersionLocalizations?limit=50`)).data;
const localLocales = (await fs.readdir(shotsRoot, { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name);
const liveLocales = new Set(localizations.map((l) => l.attributes.locale));
// Locales must agree in both directions: silent drift here would mean a storefront language whose
// screenshots never update (or local work that never ships).
const missingLive = localLocales.filter((l) => !liveLocales.has(l));
const missingLocal = [...liveLocales].filter((l) => !localLocales.includes(l));
if (missingLive.length || missingLocal.length)
  throw new Error(`locale drift — on disk but not on the listing: [${missingLive.join(', ')}]; on the listing but not on disk: [${missingLocal.join(', ')}] (deliver's text push creates localizations)`);

let uploads = 0, deletions = 0, reorders = 0, drift = 0;
for (const loc of localizations.sort((a, b) => a.attributes.locale.localeCompare(b.attributes.locale))) {
  const locale = loc.attributes.locale;
  const dir = path.join(shotsRoot, locale);
  const files = (await fs.readdir(dir)).filter((n) => familyOf(n));
  const sets = (await api(`/v1/appStoreVersionLocalizations/${loc.id}/appScreenshotSets?limit=20`)).data;

  for (const family of FAMILIES) {
    const want = files.filter((n) => familyOf(n) === family).sort((a, b) => shotIndex(family, a) - shotIndex(family, b));
    if (!want.length) continue;
    let set = sets.find((s) => s.attributes.screenshotDisplayType === family.type);
    const actions = [];

    if (!set) {
      drift++;
      if (checkOnly) { console.log(`  ${locale.padEnd(8)} ${family.type}: set MISSING (${want.length} to upload)`); continue; }
      set = (await api('/v1/appScreenshotSets', 'POST', {
        data: {
          type: 'appScreenshotSets',
          attributes: { screenshotDisplayType: family.type },
          relationships: { appStoreVersionLocalization: { data: { type: 'appStoreVersionLocalizations', id: loc.id } } },
        },
      })).data;
      actions.push('set created');
    }

    let shots = (await api(`/v1/appScreenshotSets/${set.id}/appScreenshots?limit=20`)).data;
    const wantMd5 = new Map();
    for (const name of want) wantMd5.set(name, await md5(path.join(dir, name)));

    const stale = [];
    for (const s of shots) {
      const name = s.attributes.fileName;
      const state = s.attributes.assetDeliveryState?.state;
      if (!wantMd5.has(name)) stale.push([s, 'not in repo']);
      else if (state && state !== 'COMPLETE' && state !== 'UPLOAD_COMPLETE') stale.push([s, `state ${state}`]);
      else if (s.attributes.sourceFileChecksum && s.attributes.sourceFileChecksum !== wantMd5.get(name)) stale.push([s, 'checksum differs']);
    }
    const staleNames = new Set(stale.map(([s]) => s.attributes.fileName));
    const present = new Set(shots.filter((s) => !staleNames.has(s.attributes.fileName)).map((s) => s.attributes.fileName));
    const toUpload = want.filter((n) => !present.has(n));

    if (stale.length || toUpload.length) {
      drift++;
      if (checkOnly) {
        console.log(`  ${locale.padEnd(8)} ${family.type}: delete ${stale.length} (${stale.map(([s, why]) => `${s.attributes.fileName}: ${why}`).join('; ') || '-'}), upload ${toUpload.length} (${toUpload.join(' ')})`);
        continue;
      }
      for (const [s, why] of stale) {
        await api(`/v1/appScreenshots/${s.id}`, 'DELETE');
        deletions++;
        actions.push(`deleted ${s.attributes.fileName} (${why})`);
      }
      const newIds = [];
      for (const name of toUpload) {
        newIds.push(await uploadScreenshot(set.id, { name, absolute: path.join(dir, name) }));
        uploads++;
        actions.push(`uploaded ${name}`);
      }
      if (newIds.length) await waitComplete(set.id, newIds);
      shots = (await api(`/v1/appScreenshotSets/${set.id}/appScreenshots?limit=20`)).data;
    }

    const names = shots.map((s) => s.attributes.fileName);
    if (JSON.stringify(names) !== JSON.stringify(want)) {
      drift++;
      if (checkOnly) { console.log(`  ${locale.padEnd(8)} ${family.type}: order ${names.join(',')} -> ${want.join(',')}`); continue; }
      const byName = new Map(shots.map((s) => [s.attributes.fileName, s.id]));
      await api(`/v1/appScreenshotSets/${set.id}/relationships/appScreenshots`, 'PATCH',
        { data: want.map((n) => ({ type: 'appScreenshots', id: byName.get(n) })) });
      reorders++;
      actions.push('reordered');
    }

    if (actions.length) console.log(`  ${locale.padEnd(8)} ${family.type}: ${actions.join(', ')}`);
  }
}

if (checkOnly) {
  console.log(drift ? `\n${drift} set(s) out of sync` : 'listing screenshots are in sync with the repo');
  process.exit(drift ? 1 : 0);
}
console.log(`\nsync done — uploaded ${uploads}, deleted ${deletions}, reordered ${reorders} set(s)${uploads + deletions + reorders === 0 ? ' (already in sync)' : ''}`);
