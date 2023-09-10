import {VpnHoodApp} from "@/hood/VpnHoodApp";

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $clientApp: VpnHoodApp;
    }
}
