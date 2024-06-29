import {createApp} from 'vue'
import App from './App.vue'
import {VpnHoodApp} from "@/services/VpnHoodApp";
import {AppName, ComponentName} from "@/UiConstants";
import {FirebaseApp} from "@/services/Firebase";
import vuetify from './plugins/vuetify'
import i18n from './locales/i18n'
import router from './plugins/router'
import VueGtag from "vue-gtag";
import ErrorPage from "@/pages/ErrorPage.vue";
import './assets/css/general.css'
import './assets/css/override.css'
import './assets/css/vpn-hood.css'
import './assets/css/vpn-hood-connect.css'
import './assets/css/rtl.css'

async function main(): Promise<void> {
    try {
        // Init app
        const vpnHoodApp: VpnHoodApp = await VpnHoodApp.create();
        const app = createApp(App);

        // Init firebase based on app name
        FirebaseApp.initialize(vpnHoodApp.isConnectApp());

        // Global properties
        app.config.globalProperties.$vpnHoodApp = vpnHoodApp;
        app.config.globalProperties.$componentName = ComponentName;

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
        app.config.errorHandler = (err: any) => vpnHoodApp.processError(err);

        // Init Vue
        app.use(i18n)
            .use(router)
            .use(vuetify);

        // Initialize analytics for VpnHood Client only
        if (!vpnHoodApp.isConnectApp()){
            app.use(VueGtag, {
                appName: AppName.VpnHood,
                pageTrackerEnabled: true,
                pageTrackerScreenviewEnabled: true,
                config: {
                    id: "G-H4S5747LBT",
                },
            }, router);
        }

        app.mount('#app')
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