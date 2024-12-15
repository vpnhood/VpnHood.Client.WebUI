import { defineConfig } from 'vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'url';
import vue from '@vitejs/plugin-vue';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import legacy from '@vitejs/plugin-legacy';
import postcssPresetEnv from 'postcss-preset-env';
import { version } from './package.json';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VueI18nPlugin({
      // locale messages resource pre-compile option
      include: resolve(dirname(fileURLToPath(import.meta.url)), './src/locales'),
      runtimeOnly: false,
      compositionOnly: false,
      fullInstall: true,
    }),
    //--- Handle legacy browsers ---
    legacy(),
    //------------------------------
  ],
  //--- Handle legacy browsers ---
  css: {
    postcss: {
      plugins: [
        postcssPresetEnv({
          features:{
            'not-pseudo-class':true,
            'logical-properties-and-values': false,
            'logical-viewport-units': false,
          }
        }),
      ]
    }
  },
  //------------------------------
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    }
  },
  server: {
    port: 8080,
  },
  define: {
    'import.meta.env.PACKAGE_VERSION': JSON.stringify(version),
  }
});
