import {VpnHoodApp} from "@/services/VpnHoodApp";
import {CompoenntName} from "@/UiConstants";

declare module '@vue/runtime-core' {
    // noinspection JSUnusedGlobalSymbols
    interface ComponentCustomProperties {
        $vpnHoodApp: VpnHoodApp;
        $componentName: CompoenntName;
    }
}
