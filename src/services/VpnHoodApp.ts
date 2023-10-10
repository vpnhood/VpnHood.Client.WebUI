import {ClientApiFactory} from "@/services/ClientApiFactory";
import {
    AddClientProfileParam,
    AppConnectionState,
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
} from "@/services/VpnHood.Client.Api";
import {ApiClient} from "./VpnHood.Client.Api";
import {UiState} from "@/services/UiState";
import {UiConstants} from "@/UiConstants";

// ApiClient prevents VpnHoodApp from being reactive when it is placed as a property in the class
const apiClient: ApiClient = ClientApiFactory.instance.CreateApiClient();

export class VpnHoodAppData {

}
export class VpnHoodApp {
    public readonly serverUrl: string | undefined = process.env["VUE_APP_CLIENT_API_BASE_URL"];
    public uiState: UiState = new UiState();

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
            // The function is created based on IDE recommend
            this.state = loadApp.state;
            this.state.connectionState = loadApp.state.connectionState;
            this.processAppState();
        }

        if (loadApp.settings) {
            this.settings = loadApp.settings;
        }

        if (loadApp.clientProfileItems) {
            this.clientProfileItems = loadApp.clientProfileItems;
        }
    }

    // TODO How to Private
    public processAppState():  void {

        if (this.state.lastError) {
            this.showError(this.state.lastError);
        }

        // Show update message if the user has not ignored or more than 24 hours have passed
        if (this.state.lastPublishInfo) {
            this.uiState.showUpdateSnackbar = this.uiState.userIgnoreUpdateTime == null ||
                (new Date().getTime() - this.uiState.userIgnoreUpdateTime) >= UiConstants.userIgnoreUpdateTime;
        }

        //console.log(this.state.sessionStatus?.suppressedBy !== SessionSuppressType.None);
        // Show 'suppress by' message
        if (this.state.connectionState === AppConnectionState.None &&
            this.state.sessionStatus?.suppressedBy &&
            this.state.sessionStatus?.suppressedBy !== SessionSuppressType.None) {
            this.uiState.showSuppressSnackbar = this.uiState.userIgnoreSuppressByTime === this.state.connectRequestTime;
        }

        // Show 'suppress to' message
        if (this.state.connectionState === AppConnectionState.Connected &&
            this.state.sessionStatus?.suppressedTo &&
            this.state.sessionStatus?.suppressedTo !== SessionSuppressType.None) {
            this.uiState.showSuppressSnackbar = this.uiState.userIgnoreSuppressToTime !== this.state.connectRequestTime;
        }
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
        this.uiState.showAlertDialog = true;
        this.uiState.alertDialogText = text;
    }

    // Get installed apps list on the user device
    public async getInstalledApps(): Promise<DeviceAppInfo[]> {
        return await apiClient.installedApps();
    }
}