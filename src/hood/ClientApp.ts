import {ClientApiFactory} from "@/hood/ClientApiFactory";
import {AppConnectionState, AppFeatures, AppState, ConnectParam, LoadAppParam} from "@/hood/VpnHood.Client.Api";

const apiClient = ClientApiFactory.instance.ApiClient();

export class ClientApp {

    public State: AppState | undefined;
    public ConnectionState: AppConnectionState | undefined ;
    public Features: AppFeatures | undefined;

    public async loadApp(options?: {withSettings?: boolean, withState?: boolean, withClientProfileItems?: boolean, withFeatures?: boolean}): Promise<void> {
        const loadApp = await apiClient.loadApp(
            new LoadAppParam({
                withSettings: options?.withSettings ?? false,
                withState: options?.withState ?? false,
                withClientProfileItems: options?.withClientProfileItems ?? false,
                withFeatures: options?.withFeatures ?? false,
            }))

        if (loadApp.features)
            this.Features = loadApp.features;

        if (loadApp.state){
            this.State = loadApp.state;
            this.ConnectionState = loadApp.state.connectionState;
        }

    }



    public async connect(): Promise<void> {
        const loadApp = await apiClient.loadApp(new LoadAppParam({
            withSettings: true,
            withState: false,
            withClientProfileItems: false,
            withFeatures: false,
        }))
        const defaultClientProfileId = loadApp.settings?.userSettings.defaultClientProfileId;
        if (defaultClientProfileId)
            await apiClient.connect(new ConnectParam({clientProfileId: defaultClientProfileId}))
    }

    public async disconnect(): Promise<void> {
        await apiClient.disconnect();
    }
    public appVersion(isFull: boolean): string | undefined {
        if (this.Features)
           return isFull ? this.Features?.version : this.Features?.version.split(".")[2];
    }
}