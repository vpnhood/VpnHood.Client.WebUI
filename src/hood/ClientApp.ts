import {ClientApiFactory} from "@/hood/ClientApiFactory";
import {AppFeatures, AppSettings, AppState, ConnectParam, LoadAppParam, UserSettings} from "@/hood/VpnHood.Client.Api";
import {ApiClient} from './VpnHood.Client.Api';

const apiClient: ApiClient = ClientApiFactory.instance.ApiClient();

export class ClientApp {

    public State: AppState;
    public Features: AppFeatures;
    public Settings: AppSettings;

    public constructor(
        apiClient: ApiClient,
        state: AppState,
        features: AppFeatures,
        settings: AppSettings) {
        // Initialize
        this.State = state;
        this.Features = features;
        this.Settings = settings;
    }

    public static async create(): Promise<ClientApp> {

        const result = await apiClient.loadApp(new LoadAppParam({
            withSettings: true,
            withState: true,
            withClientProfileItems: true,
            withFeatures: true,
        }));
        return new ClientApp(apiClient,result.state!, result.features!, result.settings!);
    }

    public async loadApp(options?: {
        withSettings?: boolean,
        withState?: boolean,
        withClientProfileItems?: boolean,
        withFeatures?: boolean
    }): Promise<void> {
        const loadApp = await apiClient.loadApp(
            new LoadAppParam({
                withSettings: options?.withSettings ?? false,
                withState: options?.withState ?? false,
                withClientProfileItems: options?.withClientProfileItems ?? false,
                withFeatures: options?.withFeatures ?? false,
            }))

        if (loadApp.features)
            this.Features = loadApp.features;

        if (loadApp.state) {
            this.State = loadApp.state;
            this.State.connectionState = loadApp.state.connectionState;
        }
        if (loadApp.settings) {
            this.Settings = loadApp.settings;
        }

    }

    public async connect(): Promise<void> {
        await this.loadApp({withSettings: true});
        const defaultClientProfileId = this.Settings.userSettings.defaultClientProfileId;
        if (defaultClientProfileId)
            await apiClient.connect(new ConnectParam({clientProfileId: defaultClientProfileId}));
        else throw new Error("Could not found default client profile id");
    }

    public async disconnect(): Promise<void> {
        await apiClient.disconnect();
    }

    public appVersion(isFull: boolean): string {
        if (this.Features)
            return isFull ? this.Features?.version : this.Features?.version.split(".")[2];
        else throw new Error("Could not found app version");
    }

    public async setUserSetting(userSetting: UserSettings): Promise<void> {
        await apiClient.setUserSettings(userSetting);
    }
}