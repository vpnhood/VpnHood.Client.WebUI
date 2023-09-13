import {ClientApiFactory} from "@/hood/ClientApiFactory";
import {
    AddClientProfileParam,
    AppFeatures,
    AppSettings,
    AppState,
    ClientProfileItem,
    ConnectParam,
    LoadAppParam, RemoveClientProfileParam, SetClientProfileParam,
} from "@/hood/VpnHood.Client.Api";
import {ApiClient} from './VpnHood.Client.Api';
import {VpnHoodAlertProperty} from "@/hood/VpnHoodAlertProperty";
import i18n from "@/locales/i18n";

const apiClient: ApiClient = ClientApiFactory.instance.CreateApiClient();

export class VpnHoodApp {

    public alert: VpnHoodAlertProperty = new VpnHoodAlertProperty();

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
        if (!this.settings.userSettings.defaultClientProfileId) {
            throw new Error("Could not find default client profile id.");
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

    public async setClientProfile(clientProfileParam: SetClientProfileParam): Promise<void> {
        await apiClient.setClientProfile(clientProfileParam);
        await this.loadApp({withClientProfileItems: true});
    }

    public async removeClientProfile(clientProfileParam: RemoveClientProfileParam): Promise<void> {
        await apiClient.removeClientProfile(clientProfileParam);
        await this.loadApp({withClientProfileItems: true});
    }

    public async addAccessKey(accessKey: AddClientProfileParam): Promise<void> {
        await apiClient.addAccessKey(accessKey);
        await this.loadApp({withClientProfileItems: true});
    }

    public async diagnose(): Promise<void> {
        if (!this.settings.userSettings.defaultClientProfileId) {
            throw new Error("Could not find default client profile id.");
        }
        await apiClient.diagnose(new ConnectParam({clientProfileId: this.settings.userSettings.defaultClientProfileId}));
    }

    public showError(err: any): void {
        console.log(err);
        const errorMessage = this.state.lastError != null || undefined ? this.state.lastError : err;
        this.showMessage(errorMessage);
    }

    public showMessage(text: string): void {
        this.alert.showAlertDialog = true;
        this.alert.dialogText = text;
    }
}