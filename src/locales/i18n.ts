import { createI18n } from 'vue-i18n';
import type { LocaleMessageObject, LocaleMessageDictionary } from 'vue-i18n';

function loadLocaleMessages(): { [x: string]: LocaleMessageDictionary<LocaleMessageObject> } {
  const locales = import.meta.glob('./*.json', { eager: true });
  const messages: { [x: string]: LocaleMessageDictionary<LocaleMessageObject> } = {};

  for (const path in locales) {
    const matched = path.match(/([A-Za-z0-9-_]+)\./i);
    if (matched && matched.length > 1) {
      const locale = matched[1];
      messages[locale] = locales[path].default;
    }
  }

  return messages;
}

export default createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: loadLocaleMessages()
});
