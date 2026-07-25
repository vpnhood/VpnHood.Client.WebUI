import { defineConfig } from 'vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'url';
import VueRouter from 'vue-router/vite'
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import legacy from '@vitejs/plugin-legacy';
import postcssPresetEnv from 'postcss-preset-env';
import { version } from './package.json';

// The SPA carries its own version line, bumped by CI on every published build, so a shipped bundle
// traces back to a commit in this repo. Local builds do NOT bump — nothing increments, so the
// version alone cannot tell a fresh local build from a stale one. The build time can, and is shown
// instead of the version for local builds.
// 'sv-SE' formats as "2026-07-19 14:32:05"; GitHub Actions sets CI=true.
const buildTime = new Date().toLocaleString('sv-SE').slice(0, 16);
const isCiBuild = process.env.CI === 'true';

// https://vite.dev/config/
// noinspection JSUnusedGlobalSymbols
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    }
  },
  server: {
    //host: '0.0.0.0',
    port: 8080,
  },
  plugins: [
    VueRouter({
      extensions: ['.vue'],
      importMode: 'async', // Keep lazy-loading
      routesFolder: [
        {
          src: 'src/pages',
          path: (file) => {
            const prefix = 'src/pages';
            // Customize path naming
            return file.slice(file.lastIndexOf(prefix) + prefix.length + 1).replace(/index$/, '').replace(/\.vue$/, '');
          },
        },
      ],
      extendRoute(route) {
        // vue-router types a nameless route as `false`; every file-based route here carries a name.
        const rawName = route.name === false ? '' : route.name;

        // Remove leading and trailing slashes, then extract the segment after the last "/"
        const segments = rawName.replace(/^\/|\/$/g, '').split('/');
        const lastSegment = segments[segments.length - 1];

        const name = rawName === '/' ? 'HOME' : lastSegment.toUpperCase().replace(/-/g, '_');
        route.name = name;

        const pageTitle = name.toLowerCase().split('_');
        route.meta = {
          title: pageTitle.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        };
      }
    }),
    vue(),
    // Imports only the Vuetify components a template actually renders. Without this the app
    // registers all of them up front, which is most of the main chunk.
    vuetify({ autoImport: true }),
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
            // Vuetify ships @layer with revert-layer, which the cascade-layers polyfill cannot
            // emulate; it warns and flattens to different styles. Keep layers native instead.
            'cascade-layers': false
          }
        }),
      ]
    }
  },
  //------------------------------
  define: {
    'import.meta.env.PACKAGE_VERSION': JSON.stringify(version),
    'import.meta.env.SPA_BUILD_TIME': JSON.stringify(buildTime),
    'import.meta.env.SPA_IS_CI_BUILD': JSON.stringify(isCiBuild),
  }
});
