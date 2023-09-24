import {ClientApiFactory} from "@/hood/ClientApiFactory";
import {
    AddClientProfileParam,
    AppFeatures,
    AppSettings,
    AppState,
    ClientProfileItem,
    ConnectParam, DeviceAppInfo,
    LoadAppParam, RemoveClientProfileParam, SetClientProfileParam,
} from "@/hood/VpnHood.Client.Api";
import {ApiClient} from './VpnHood.Client.Api';
import {VpnHoodGlobalProperty} from "@/hood/VpnHoodGlobalProperty";

const apiClient: ApiClient = ClientApiFactory.instance.CreateApiClient();

export class VpnHoodApp {
    public readonly serverUrl: string | undefined = process.env.VUE_APP_CLIENT_API_BASE_URL;
    public vpnHoodGlobalProperty: VpnHoodGlobalProperty = new VpnHoodGlobalProperty();

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

        // Find default client profile
        const defaultClientProfile: ClientProfileItem | undefined = this.clientProfileItems.find(
            x => x.clientProfile.clientProfileId == this.settings.userSettings.defaultClientProfileId);

        // If selected server is VpnHood public server
        if(defaultClientProfile?.token.name === "VpnHood Public Servers" && !this.vpnHoodGlobalProperty.showPremiumServerAd){

            // Set user used public servers at least once
            localStorage.setItem("vh:isPublicServersUsedAtLeastOnce", "true");

            // Check is user set don't show public server hint
            const dontShowServerHintStatus: string | null = localStorage.getItem("vh:DontShowPublicServerHint");

            // Show public server hint
            if ( dontShowServerHintStatus !== "true" )
                this.vpnHoodGlobalProperty.showPublicServerHint = true;

            // Show premium server ad
            else
                this.vpnHoodGlobalProperty.showPremiumServerAd = true;

        }
        else{
            this.vpnHoodGlobalProperty.showPremiumServerAd = false;
            await apiClient.connect(new ConnectParam({clientProfileId: this.settings.userSettings.defaultClientProfileId}));

            // Show suppress snackbar
            if (this.state.sessionStatus?.suppressedTo !== 'None')
                this.vpnHoodGlobalProperty.showSuppressSnackbar = true;

            // Show update snackbar
            if (this.state.lastPublishInfo)
                this.vpnHoodGlobalProperty.showUpdateSnackbar = true;
        }
    }

    public async disconnect(): Promise<void> {
        await apiClient.disconnect();
    }

    public getAppVersion(isFull: boolean): string {
        return isFull ? this.features?.version : this.features?.version.split(".")[2];
    }

    // Save any change by user
    public async saveUserSetting(): Promise<void> {
        await apiClient.setUserSettings(this.settings.userSettings);
    }

    // Select profile by user
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

    // Get error message
    public showError(err: any): void {
        console.error(err);
        const errorMessage = this.state.lastError != null || undefined ? this.state.lastError : err.message;
        this.showMessage(errorMessage);
    }

    // Show error dialog
    public showMessage(text: string): void {
        this.vpnHoodGlobalProperty.showAlertDialog = true;
        this.vpnHoodGlobalProperty.dialogText = text;
    }

    // Get installed apps list on the user device
    public async getInstalledApps(): Promise<DeviceAppInfo[]> {
        return await apiClient.installedApps();
    }
}