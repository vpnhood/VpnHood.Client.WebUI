import {ClientApiFactory} from "@/hood/ClientApiFactory";
import {
    AddClientProfileParam,
    AppFeatures,
    AppSettings,
    AppState,
    ClientProfileItem,
    ConnectParam,
    LoadAppParam, RemoveClientProfileParam,
} from "@/hood/VpnHood.Client.Api";
import {ApiClient} from './VpnHood.Client.Api';

const apiClient: ApiClient = ClientApiFactory.instance.CreateApiClient();

export class VpnHoodApp {

    public state: AppState;
    public features: AppFeatures;
    public settings: AppSettings;
    public clientProfileItems: ClientProfileItem[];

    public constructor(
        apiClient: ApiClient,
        state: AppState,
        features: AppFeatures,
        settings: AppSettings,
        clientProfileItems: ClientProfileItem[]) {
        // Initialize
        this.state = state;
        this.features = features;
        this.settings = settings;
        this.clientProfileItems = clientProfileItems;
    }

    public static async create(): Promise<VpnHoodApp> {
        const result = await apiClient.loadApp(new LoadAppParam({
            withSettings: true,
            withState: true,
            withClientProfileItems: true,
            withFeatures: true,
        }));
        return new VpnHoodApp(apiClient, result.state!, result.features!, result.settings!, result.clientProfileItems!);
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
            this.features = loadApp.features;

        if (loadApp.state) {
            this.state = loadApp.state;
            this.state.connectionState = loadApp.state.connectionState;
        }
        if (loadApp.settings) {
            this.settings = loadApp.settings;
        }
        if (loadApp.clientProfileItems) {
            this.clientProfileItems = loadApp.clientProfileItems;
        }

    }
    public async connect(): Promise<void> {
        if (!this.settings.userSettings.defaultClientProfileId){
            throw new Error("Could not find default client profile id");
        }
        await apiClient.connect(new ConnectParam({clientProfileId: this.settings.userSettings.defaultClientProfileId}));
    }

    public async disconnect(): Promise<void> {
        await apiClient.disconnect();
    }

    public appVersion(isFull: boolean): string {
        return isFull ? this.features?.version : this.features?.version.split(".")[2];
    }

    public async saveUserSetting(): Promise<void> {
        await apiClient.setUserSettings(this.settings.userSettings);
    }

    public async removeClientProfile(clientProfileParam: RemoveClientProfileParam): Promise<void> {
        await apiClient.removeClientProfile(clientProfileParam);
        await this.loadApp({withClientProfileItems: true});
    }

    public async addAccessKey(accessKey: AddClientProfileParam): Promise<void> {
        await apiClient.addAccessKey(accessKey);
        await this.loadApp({withClientProfileItems: true});
    }

    public async diagnose(clientProfileId?: string): Promise<void>{
        if (!clientProfileId)
            await this.loadApp({withSettings: true});

        const selectedClientProfileId = clientProfileId ?? this.settings.userSettings.defaultClientProfileId;
        if (selectedClientProfileId)
            await apiClient.diagnose(new ConnectParam({clientProfileId: selectedClientProfileId}));

        else throw new Error("Could not found default client profile id");
    }
}