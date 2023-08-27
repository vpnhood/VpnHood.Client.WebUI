import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import i18n from './locales/i18n'

loadFonts()

createApp(App).use(i18n)
  .use(router)
  .use(vuetify)
  .mount('#app')
