import { createI18n } from 'vue-i18n';
import type { I18nOptions } from 'vue-i18n';
import en from './en.json';

interface MessageModule {
  default: Record<string, string>;
}

// A glob WITHOUT `eager` yields the paths at build time but leaves each JSON in its own chunk, so a
// user downloads their own language instead of all of them. English is imported directly because it
// is the fallback locale and must be present before anything renders.
const messageLoaders = import.meta.glob<MessageModule>('./*.json');

function localeCodeOf(path: string): string {
  const matched = path.match(/([A-Za-z0-9-_]+)\./i);
  if (!matched) throw new Error(`Could not read a locale code from '${path}'.`);

  return matched[1];
}

// Every locale this SPA ships, known without loading any of them. VpnHoodApp reports this list to
// the backend before a language has been chosen, so it cannot be derived from the loaded messages.
export const availableLocales: string[] = Object.keys(messageLoaders).map(localeCodeOf);

// Typed as I18nOptions['messages'] rather than left to inference: a concrete object would narrow
// the instance's locale type to 'en' and then reject every language loaded later.
const messages: I18nOptions['messages'] = { en };

const i18n = createI18n({
  legacy: false,
  warnHtmlMessage: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages
});

// Pulls one locale's chunk in and registers it. Await this before activating the locale, otherwise
// the UI renders in the fallback language instead.
export async function loadLocale(code: string): Promise<void> {
  if (i18n.global.availableLocales.includes(code)) return;

  const loader = messageLoaders[`./${code}.json`];
  if (!loader) throw new Error(`No message bundle is shipped for the locale '${code}'.`);

  i18n.global.setLocaleMessage(code, (await loader()).default);
}

export default i18n;
