import {ClientApp} from "@/hood/ClientApp";

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $clientApp: ClientApp;
    }
}
