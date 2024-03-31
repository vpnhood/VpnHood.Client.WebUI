import {createApp} from 'vue'
import App from './App.vue'
import ErrorPage from "@/pages/ErrorPage.vue";
import router from './plugins/router'
import vuetify from './plugins/vuetify'
import i18n from './locales/i18n'
import './assets/css/general.css'
import './assets/css/override.css'
import './assets/css/rtl.css'
import './assets/css/vpn-hood.css'
import './assets/css/vpn-hood-connect.css'
import "./services/Firebase";
import {VpnHoodApp} from "@/services/VpnHoodApp";
import {AppName, ComponentName, LanguagesCode} from "@/UiConstants";

async function main(): Promise<void> {
    try {
        // init app
        const vpnHoodApp: VpnHoodApp = await VpnHoodApp.create();
        const app = createApp(App);

        // Global property
        app.config.globalProperties.$vpnHoodApp = vpnHoodApp;
        app.config.globalProperties.$componentName = ComponentName;

        // Set app theme
        vuetify.theme.global.name.value = vpnHoodApp.data.features.uiName ?? AppName.VpnHood;

        // Set available languages
        await vpnHoodApp.apiClient.setCultures(i18n.global.availableLocales);

        // Set default UI language
        const isDefaultLanguageAvailable = i18n.global.availableLocales.includes(vpnHoodApp.data.state.cultureCode);
        i18n.global.locale.value = isDefaultLanguageAvailable ? vpnHoodApp.data.state.cultureCode : LanguagesCode.English;
        vuetify.locale.current.value = i18n.global.locale.value;

        // Global catch exception
        app.config.errorHandler = (err: any) => vpnHoodApp.showError(err);

        // init Vue
        app.use(i18n)
            .use(router)
            .use(vuetify)
            .mount('#app')
    }
    catch (ex: any) {
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