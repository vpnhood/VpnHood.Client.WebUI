import { createI18n } from 'vue-i18n';
import type { I18nOptions } from 'vue-i18n';

interface MessageModule {
  default: Record<string, string>;
}

function loadLocaleMessages(): I18nOptions['messages'] {
  const locales = import.meta.glob<MessageModule>('./*.json', { eager: true });
  const messages: I18nOptions['messages'] = {};

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
