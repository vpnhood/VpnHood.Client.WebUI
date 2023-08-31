import {createApp, reactive} from 'vue'
import App from './App.vue'
import router from './plugins/router'
import vuetify from './plugins/vuetify'
import i18n from './locales/i18n'
import './assets/css/override.css'
import './assets/css/general.css'
import {ClientApp} from "@/hood/ClientApp";


const app = createApp(App);
const clientApp: ClientApp = new ClientApp();
app.config.globalProperties.$clientApp = reactive(clientApp);

setInterval(async () => {
    if (!document.hidden)
        await clientApp.loadApp({withState: true});
}, 1000);

app.use(i18n)
    .use(router)
    .use(vuetify)
    .mount('#app')
