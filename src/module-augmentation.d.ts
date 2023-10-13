import {VpnHoodApp} from "@/services/VpnHoodApp";

declare module '@vue/runtime-core' {
    // noinspection JSUnusedGlobalSymbols
    interface ComponentCustomProperties {
        $vpnHoodApp: VpnHoodApp;
    }
}
