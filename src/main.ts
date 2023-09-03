import {createApp, reactive} from 'vue'
import App from './App.vue'
import router from './plugins/router'
import vuetify from './plugins/vuetify'
import i18n from './locales/i18n'
import './assets/css/override.css'
import './assets/css/general.css'
import {ClientApp} from "@/hood/ClientApp";


// main
async function main():Promise<void> {
    try {
        // init app

        const clientApp: ClientApp = await ClientApp.create();
        const app = createApp(App);
        app.config.globalProperties.$clientApp = reactive(clientApp);

        app.use(i18n)
            .use(router)
            .use(vuetify)
            .mount('#app')
    }
    catch (ex) {
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