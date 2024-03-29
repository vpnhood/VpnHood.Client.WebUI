import {createApp} from 'vue'
import App from './App.vue'
import ErrorPage from "@/pages/ErrorPage.vue";
import router from './plugins/router'
import vuetify from './plugins/vuetify'
import i18n from './locales/i18n'
import './assets/css/general.css'
import './assets/css/override.css'
import './assets/css/vpn-hood.css'
import './assets/css/vpn-hood-connect.css'
import "./services/Firebase";
import {VpnHoodApp} from "@/services/VpnHoodApp";
import {AppName, ComponentName} from "@/UiConstants";

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

        // Global catch exception
        app.config.errorHandler = (err: any) => vpnHoodApp.showError(err);

        // init Vue
        app.use(i18n)
            .use(router)
            .use(vuetify)
            .mount('#app')
    } catch (ex: any) {
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