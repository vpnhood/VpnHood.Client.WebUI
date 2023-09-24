import {createApp, reactive} from 'vue'
import App from './App.vue'
import router from './plugins/router'
import vuetify from './plugins/vuetify'
import i18n from './locales/i18n'
import './assets/css/override.css'
import './assets/css/general.css'
import {VpnHoodApp} from "@/hood/VpnHoodApp";
import { ApiException } from './hood/VpnHood.Client.Api'


// main
async function main():Promise<void> {
    try {
        // init app
        const vpnHoodApp: VpnHoodApp = reactive(await VpnHoodApp.create());
        const app = createApp(App);
        app.config.globalProperties.$vpnHoodApp = vpnHoodApp;

        // Global catch exception
        app.config.errorHandler = (err: any) => vpnHoodApp.showError(err);

        // init Vue
        app.use(i18n)
            .use(router)
            .use(vuetify)
            .mount('#app')
    }
    catch (ex: any) {
        console.log("Could not create client app.", ex);
        // show error page
        /*new Vue({
            i18n,
            router,
            vuetify,
            render: h => h(AppError, { props: { error: ex } })
        }).$mount('#app');*/
    }
}
main();