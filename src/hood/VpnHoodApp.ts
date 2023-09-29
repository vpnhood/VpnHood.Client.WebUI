import {ClientApiFactory} from "@/hood/ClientApiFactory";
import {
    AddClientProfileParam,
    AppFeatures,
    AppSettings,
    AppState,
    ClientProfileItem,
    ConnectParam,
    DeviceAppInfo,
    LoadAppParam,
    RemoveClientProfileParam,
    SessionSuppressType,
    SetClientProfileParam,
} from "@/hood/VpnHood.Client.Api";
import {ApiClient} from './VpnHood.Client.Api';
import {UIState} from "@/hood/UIState";

// ApiClient prevents VpnHoodApp from being reactive when it is placed as a property in the class
const apiClient: ApiClient = ClientApiFactory.instance.CreateApiClient();

export class VpnHoodApp {
    public readonly serverUrl: string | undefined = process.env["VUE_APP_CLIENT_API_BASE_URL"];
    public uiState: UIState = new UIState();

    public state: AppState;
    public features: AppFeatures;
    public settings: AppSettings;
    public clientProfileItems: ClientProfileItem[];

    public constructor(
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
        return new VpnHoodApp(result.state!, result.features!, result.settings!, result.clientProfileItems!);
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
            }));

        if (loadApp.features)
            this.features = loadApp.features;

        if (loadApp.state) {
            this.state = loadApp.state;
            this.state.connectionState = loadApp.state.connectionState;
            // Show update snackbar
            // TODO Delete console
            console.log(this.state.lastPublishInfo);
            if (this.state.lastPublishInfo)
                this.uiState.showUpdateSnackbar = true;
        }
        if (loadApp.settings) {
            this.settings = loadApp.settings;
        }
        if (loadApp.clientProfileItems) {
            this.clientProfileItems = loadApp.clientProfileItems;
        }

        // TODO Delete console
        console.log(this.state.sessionStatus?.suppressedTo);


    }

    public async connect(): Promise<void> {

        if (!this.settings.userSettings.defaultClientProfileId) {
            throw new Error("Could not find default client profile id.");
        }

        // Find default client profile
        const defaultClientProfile: ClientProfileItem | undefined = this.clientProfileItems.find(
            x => x.clientProfile.clientProfileId === this.settings.userSettings.defaultClientProfileId);

        // If selected server is VpnHood public server
        if (defaultClientProfile?.token.name === "VpnHood Public Servers" && !this.uiState.showPremiumServerAd) {

            // Set user used public servers at least once
            localStorage.setItem("vh:isPublicServersUsedAtLeastOnce", "true");

            // Check is user set don't show public server hint
            const dontShowServerHintStatus: string | null = localStorage.getItem("vh:DontShowPublicServerHint");

            // Show public server hint
            if (dontShowServerHintStatus !== "true")
                this.uiState.showPublicServerHint = true;

            // Show premium server ad
            else
                this.uiState.showPremiumServerAd = true;

        } else {
            // Close Premium server Ad
            this.uiState.showPremiumServerAd = false;

            await apiClient.connect(new ConnectParam({clientProfileId: this.settings.userSettings.defaultClientProfileId}));

            // Show suppress snackbar
            if (this.state.sessionStatus?.suppressedTo !== SessionSuppressType.None || this.state.sessionStatus?.suppressedBy !== SessionSuppressType.None)
                this.uiState.showSuppressSnackbar = true;

            // TODO Check Suppress Snackbar
            console.log(this.state.sessionStatus?.suppressedTo, "JJJJJJ");
            console.log(this.uiState.showSuppressSnackbar);


        }
    }

    public async disconnect(): Promise<void> {
        await apiClient.disconnect();
        this.uiState.showSuppressSnackbar = false;
    }

    public getAppVersion(isFull: boolean): string {
        return isFull ? this.features.version : this.features.version.split(".")[2];
    }

    // Save any change by user
    public async saveUserSetting(): Promise<void> {
        await apiClient.setUserSettings(this.settings.userSettings);
        await this.loadApp({withSettings: true});
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

    public async addTestServer(): Promise<void> {
        await apiClient.addTestServer();
        await this.loadApp({withClientProfileItems: true, withState: true});
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
        this.uiState.showAlertDialog = true;
        this.uiState.dialogText = text;
    }

    // Get installed apps list on the user device
    public async getInstalledApps(): Promise<DeviceAppInfo[]> {
        return await apiClient.installedApps();
    }
}