//--- Handle legacy browsers ---
import "core-js/stable";
import "regenerator-runtime/runtime";
//------------------------------
import {createApp} from 'vue'
import App from './App.vue'
import { VpnHoodApp } from './services/VpnHoodApp'
import { AppName } from '@/helpers/UiConstants'
import vuetify from './services/vuetify'
import i18n from './locales/i18n'
import router from './services/router'
import ErrorPage from "./pages/ErrorPage.vue"
import './assets/styles/general.css'
import './assets/styles/override.css'
import './assets/styles/vpn-hood.css'
import './assets/styles/vpn-hood-connect.css'
import './assets/styles/rtl.css'

async function main(): Promise<void> {
  try {
    console.log("Current Mode: " + import.meta.env.MODE);
    // Init app
    const vpnHoodApp: VpnHoodApp = await VpnHoodApp.create();
    const app = createApp(App);

    // Set app theme
    vuetify.theme.global.name.value = vpnHoodApp.data.features.uiName ?? AppName.VpnHood;

    // Set default UI language
    const isUserSetDefaultLanguage: boolean = i18n.global.availableLocales.includes(vpnHoodApp.data.state.currentUiCultureInfo.code);
    if (isUserSetDefaultLanguage) i18n.global.locale.value = vpnHoodApp.data.state.currentUiCultureInfo.code;
    // Set Vuetify current language
    vuetify.locale.current.value = i18n.global.locale.value;

    // Add language code as class to the body element
    window.document.body.classList.add(i18n.global.locale.value);

    // Global catch exception
    app.config.errorHandler = (err: unknown) => vpnHoodApp.processError(err);

    // Init Vue
    app.use(i18n)
      .use(router)
      .use(vuetify)
      .mount('#app');
  }
  catch (ex: unknown) {
    console.error("Could not create client app.", ex);

    // show error page
    const app = createApp(ErrorPage);
    app.use(i18n)
      .use(vuetify)
      .mount('#app')
  }
}
// noinspection JSIgnoredPromiseFromCall
main();

