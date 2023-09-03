import {ClientApp} from "@/hood/ClientApp";
import {AppState} from "@/hood/VpnHood.Client.Api";

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $clientApp: ClientApp;
    }
}
