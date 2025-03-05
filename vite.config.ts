import { defineConfig } from 'vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'url';
import VueRouter from 'unplugin-vue-router/vite'
import vue from '@vitejs/plugin-vue';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import legacy from '@vitejs/plugin-legacy';
import postcssPresetEnv from 'postcss-preset-env';
import { version } from './package.json';

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
        if (route.name === '/') {
          route.name = 'HOME';
        }
        else if (route.name) {

          // Remove leading and trailing slashes
          const normalizedPath = route.name.replace(/^\/|\/$/g, '');

          // Extract the last segment after the last "/"
          const segments = normalizedPath.split('/');
          const lastSegment = segments[segments.length - 1];

          route.name = lastSegment.toUpperCase().replace(/-/g, '_');
        }

        const pageTitle = route.name.toLowerCase().split('_');
        route.meta = {
          title: pageTitle.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        };
      }
    }),
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
            'logical-viewport-units': false
          }
        }),
      ]
    }
  },
  //------------------------------
  define: {
    'import.meta.env.PACKAGE_VERSION': JSON.stringify(version),
  }
});
