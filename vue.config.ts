import {defineConfig} from "@vue/cli-service";
import {version} from "./package.json";

process.env.VUE_APP_VERSION = version.version;
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
