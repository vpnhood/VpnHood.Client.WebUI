const { defineConfig } = require('@vue/cli-service');
process.env.VUE_APP_VERSION = require('./package.json').version;
module.exports = defineConfig({
  transpileDependencies: true,

  pluginOptions: {
    vuetify: {},
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableLegacy: false,
      runtimeOnly: false,
      compositionOnly: false,
      fullInstall: true
    }
  },

  assetsDir: 'src/assets'
});
