import { createApp } from 'vue'
import App from './App.vue'
import router from './plugins/router'
import vuetify from './plugins/vuetify'
import i18n from './locales/i18n'
import './assets/css/override.css'
import './assets/css/general.css'

createApp(App).use(i18n)
  .use(router)
  .use(vuetify)
  .mount('#app')
