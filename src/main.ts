import {createApp, reactive} from 'vue'
import App from './App.vue'
import router from './plugins/router'
import vuetify from './plugins/vuetify'
import i18n from './locales/i18n'
import './assets/css/override.css'
import './assets/css/general.css'
import {ClientApiFactory} from "@/hood/ClientApiFactory";
import {LoadAppParam} from "@/hood/VpnHood.Client.Api";


const app = createApp(App);
app.config.globalProperties.$loadApp = async () => {
    await ClientApiFactory.instance.ApiClient().loadApp(
        new LoadAppParam({
            withSettings: true,
            withState: true,
            withClientProfileItems: true,
            withFeatures: true,
        })
    );
};

app.use(i18n)
    .use(router)
    .use(vuetify)
    .mount('#app')
