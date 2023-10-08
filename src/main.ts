import {createApp, reactive} from 'vue'
import App from './App.vue'
import ErrorPage from "@/pages/ErrorPage.vue";
import router from './plugins/router'
import vuetify from './plugins/vuetify'
import i18n from './locales/i18n'
import './assets/css/override.css'
import './assets/css/general.css'
import "./services/Firebase";
import {VpnHoodApp} from "@/services/VpnHoodApp";

async function main(): Promise<void> {
    try {
        // init app
        const vpnHoodApp: VpnHoodApp = reactive(await VpnHoodApp.create());
        const app = createApp(App);

        // Global property
        app.config.globalProperties.$vpnHoodApp = vpnHoodApp;

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

document.addEventListener("DOMContentLoaded", () => {
    const userAgent = window.navigator.userAgent;

    // Check if the device is Android
    if (/Android/i.test(userAgent)) {

        // Extract WebView version from user agent string
        const match = userAgent.match(/Version\/(\d+\.\d+)/i);
        const pageContents: any = document.getElementById("app");

        if (match && match[1]) {
            const webViewVersion = parseFloat(match[1]);

            // Check if WebView version is not supported
            if (webViewVersion < 69) {
                pageContents.innerHTML = "<h1>Device is Android and WebView version is smaller than 105</h1>";
                console.log("Device is Android and WebView version is smaller than 69");
            } else {
                // WebView version is supported and runs the app normally
                // noinspection JSIgnoredPromiseFromCall
                main();
            }
        } else {
            pageContents.innerHTML = "<h1>We could not determine your device's WebView version, maybe your version is too old</h1>";
            console.log("Could not determine WebView version");
        }
    } else {
        // The device is not an android and runs the app normally
        // noinspection JSIgnoredPromiseFromCall
        main();
        console.log("Device is not Android");
    }
});