//--- Handle legacy browsers ---
import "core-js/stable";
import "regenerator-runtime/runtime";
//------------------------------
import {createApp} from 'vue'
import App from './App.vue'
import { VpnHoodApp } from './services/VpnHoodApp'
import vuetify from './theme/vuetify'
import i18n from './locales/i18n'
import router from './services/router'
import ErrorPage from "./pages/error-page.vue"
import './assets/styles/general.css'
import './assets/styles/override.css'
import './assets/styles/vpn-hood-client.css'
import './assets/styles/vpn-hood-connect.css'
import './assets/styles/rtl.css'

async function main(): Promise<void> {
  try {
    console.log("Current Mode: " + import.meta.env.MODE);

    // Init app
    const vpnHoodApp: VpnHoodApp = await VpnHoodApp.create();
    const app = createApp(App);

    // Set the app theme
    vuetify.theme.change(vpnHoodApp.data.features.uiName ?? 'VpnHoodClientDark');

    // Set the default UI language
    const isUserSetDefaultLanguage: boolean = i18n.global.availableLocales.includes(vpnHoodApp.data.state.currentUiCultureInfo.code);
    if (isUserSetDefaultLanguage) i18n.global.locale.value = vpnHoodApp.data.state.currentUiCultureInfo.code;
    // Set Vuetify current language
    vuetify.locale.current.value = i18n.global.locale.value;

    // Add language code as a class to the body element
    window.document.body.classList.add(i18n.global.locale.value);

    // Apply custom CSS for scrollbar on the Windows platform
    if (vuetify.display.platform.value.win) {
      const styleElement = document.createElement('style');
      styleElement.textContent = `

    ::-webkit-scrollbar {
      width: 5px;
    }
    ::-webkit-scrollbar:hover {
      width: 8px;
    }

    ::-webkit-scrollbar-track {
      background-color: rgb(var(--v-theme-scroll-track));
      border-radius: 5px;
    }

    ::-webkit-scrollbar-thumb {
      background: rgb(var(--v-theme-scroll-thumb));
      transition: all .5s ease;
      border-radius: 5px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: rgb(var(--v-theme-scroll-thumb-hover));
    }
  `;
      document.head.appendChild(styleElement);
    }

    // To compensate for the delay in applying edge to edge on the first run, call it in this section as well;
    // otherwise it is called every second on the App.vue.
    vpnHoodApp.data.edgeToEdge();

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

