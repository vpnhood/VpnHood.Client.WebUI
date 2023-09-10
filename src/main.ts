import {createApp, reactive} from 'vue'
import App from './App.vue'
import router from './plugins/router'
import vuetify from './plugins/vuetify'
import i18n from './locales/i18n'
import './assets/css/override.css'
import './assets/css/general.css'
import {VpnHoodApp} from "@/hood/VpnHoodApp";


// main
async function main():Promise<void> {
    try {
        // init app
        const clientApp: VpnHoodApp = await VpnHoodApp.create();
        const app = createApp(App);
        app.config.globalProperties.$clientApp = reactive(clientApp);

        // init Vue
        app.use(i18n)
            .use(router)
            .use(vuetify)
            .mount('#app')
    }
    catch (ex) {
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