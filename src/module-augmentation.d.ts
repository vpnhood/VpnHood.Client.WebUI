import {VpnHoodApp} from "@/services/VpnHoodApp";
import {CompoenntName} from "@/UiConstants";
import router from '@/plugins/router'

declare module 'vue' {
    // noinspection JSUnusedGlobalSymbols
    interface ComponentCustomProperties {
        $vpnHoodApp: VpnHoodApp;
        $componentName: CompoenntName;
        $router: router;
    }
}
