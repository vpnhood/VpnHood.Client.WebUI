import {VpnHoodApp} from "@/services/VpnHoodApp";
declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $vpnHoodApp: VpnHoodApp;
    }
}
