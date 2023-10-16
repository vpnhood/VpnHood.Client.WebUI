import {ClientApiFactory} from "@/services/ClientApiFactory";
import {
    AppConnectionState,
    AppFeatures,
    AppSettings,
    AppState,
    ClientProfileItem, ClientProfileUpdateParams,
    DeviceAppInfo,
    SessionSuppressType,
} from "@/services/VpnHood.Client.Api";
import {ApiClient} from "./VpnHood.Client.Api";
import {UiState} from "@/services/UiState";
import {UiConstants} from "@/UiConstants";
import {reactive} from "vue";

// VpnHoodAppData must be a separate class to prevents VpnHoodApp reactive
export class VpnHoodAppData {
    public readonly serverUrl: string | undefined = process.env["VUE_APP_CLIENT_API_BASE_URL"];
    public uiState: UiState = new UiState();
    public state: AppState;
    public settings: AppSettings;
    public features: AppFeatures;
    public clientProfileItems: ClientProfileItem[];

    public constructor(state: AppState, setting: AppSettings, features: AppFeatures, clientProfileItems: ClientProfileItem[]) {
        this.state = state;
        this.settings = setting;
        this.features = features;
        this.clientProfileItems = clientProfileItems;
    }
}

export class VpnHoodApp {
    public data: VpnHoodAppData;
    public apiClient: ApiClient;

    private constructor(apiClient: ApiClient, appData: VpnHoodAppData) {
        this.data = reactive(appData);
        this.apiClient = apiClient;
        this.data.uiState.configTime = this.data.state.configTime;
    }

    public static async create(): Promise<VpnHoodApp> {
        const apiClient: ApiClient = ClientApiFactory.instance.createApiClient();
        const config = await apiClient.getConfig();
        return new VpnHoodApp(apiClient, new VpnHoodAppData(config.state, config.settings, config.features, config.clientProfileItems));
    }

    private async reloadSettings(): Promise<void> {
        const config = await this.apiClient.getConfig();

        this.data.features = config.features;
        this.data.settings = config.settings;
        this.data.clientProfileItems = config.clientProfileItems;
        if (config.clientProfileItems.length === 0){
            this.data.settings.userSettings.defaultClientProfileId = null;
        }

    }

    public async reloadState(): Promise<void> {

        this.data.state = await this.apiClient.getState();

        // Setting has change and must reload
        if (this.data.uiState.configTime.getTime() !== this.data.state.configTime.getTime()){
            this.data.uiState.configTime = this.data.state.configTime;
            await this.reloadSettings();
        }

        // Show last error message if the user has not ignored
        if (this.data.state.lastError &&
            this.data.uiState.userIgnoreLastErrorTime?.toString() !== this.data.state.connectRequestTime?.toString()) {
            this.data.uiState.userIgnoreLastErrorTime = this.data.state.connectRequestTime;
            console.error(this.data.state.lastError);
            this.showError(this.data.state.lastError);
        }

        // Show update message if the user has not ignored or more than 24 hours have passed
        if (this.data.state.lastPublishInfo) {
            this.data.uiState.showUpdateSnackbar = this.data.uiState.userIgnoreUpdateTime == null ||
                (new Date().getTime()) - this.data.uiState.userIgnoreUpdateTime >= UiConstants.userIgnoreUpdateTime;
        }

        // Show 'suppress by' message
        // noinspection OverlyComplexBooleanExpressionJS
        if (this.data.state.connectionState === AppConnectionState.None &&
            this.data.state.sessionStatus?.suppressedBy &&
            this.data.state.sessionStatus?.suppressedBy !== SessionSuppressType.None &&
            this.data.uiState.userIgnoreSuppressByTime?.toString() !== this.data.state.connectRequestTime?.toString()) {
            this.data.uiState.showSuppressSnackbar = true;
        }

        // Show 'suppress to' message
        // noinspection OverlyComplexBooleanExpressionJS
        if (this.data.state.connectionState === AppConnectionState.Connected &&
            this.data.state.sessionStatus?.suppressedTo &&
            this.data.state.sessionStatus?.suppressedTo !== SessionSuppressType.None &&
            this.data.uiState.userIgnoreSuppressToTime?.toString() !== this.data.state.connectRequestTime?.toString()) {
            this.data.uiState.showSuppressSnackbar = true
        }
    }

    public async connect(): Promise<void> {

        if (!this.data.settings.userSettings.defaultClientProfileId) {
            throw new Error("Could not find default client profile id.");
        }

        // Find default client profile
        const defaultClientProfile: ClientProfileItem | undefined = this.data.clientProfileItems.find(
            x => x.clientProfile.clientProfileId === this.data.settings.userSettings.defaultClientProfileId);

        // If selected server is VpnHood public server
        if (defaultClientProfile?.token.name === "VpnHood Public Servers" && !this.data.uiState.showPremiumServerAd) {

            // Set user used public servers at least once
            localStorage.setItem("vh:isPublicServersUsedAtLeastOnce", "true");

            // Check is user set don't show public server hint
            const dontShowServerHintStatus: string | null = localStorage.getItem("vh:DontShowPublicServerHint");

            // Show public server hint
            if (dontShowServerHintStatus !== "true")
                this.data.uiState.showPublicServerHint = true;

            // Show premium server ad
            else
                this.data.uiState.showPremiumServerAd = true;

        } else {
            // Close Premium server Ad
            this.data.uiState.showPremiumServerAd = false;

            await this.apiClient.connect(null);
        }
    }

    public async disconnect(): Promise<void> {
        await this.apiClient.disconnect();
        if (this.data.state.sessionStatus?.suppressedTo &&
            this.data.state.sessionStatus?.suppressedTo !== SessionSuppressType.None &&
            this.data.state.sessionStatus?.suppressedBy === SessionSuppressType.None){
            this.data.uiState.showSuppressSnackbar = false;
        }
    }

    public getAppVersion(isFull: boolean): string {
        return isFull ? this.data.features.version : this.data.features.version.split(".")[2];
    }

    // Save any change by user
    public async saveUserSetting(): Promise<void> {
        await this.apiClient.setUserSettings(this.data.settings.userSettings);
    }

    // Select profile by user
    public async updateClientProfile(clientProfileId: string, clientProfileUpdateParam: ClientProfileUpdateParams): Promise<void> {
        await this.apiClient.updateClientProfile(clientProfileId, clientProfileUpdateParam);
        await this.reloadSettings();
    }

    public async removeClientProfile(clientProfileId: string): Promise<void> {
        await this.apiClient.deleteClientProfile(clientProfileId);
        await this.reloadSettings();
    }

    public async addAccessKey(accessKey: string): Promise<void> {
        await this.apiClient.addAccessKey(accessKey);
        await this.reloadSettings();
    }

    public async addTestServer(): Promise<void> {
        await this.apiClient.addTestServer();
        await this.reloadSettings();
    }

    public async diagnose(): Promise<void> {
        if (!this.data.settings.userSettings.defaultClientProfileId) {
            throw new Error("Could not find default client profile id.");
        }
        await this.apiClient.diagnose(this.data.settings.userSettings.defaultClientProfileId);
    }

    public canDiagnose(): boolean {
        return this.data.state.connectionState === AppConnectionState.None || !this.data.state.hasDiagnoseStarted;
    }

    // Get error message
    public showError(err: any): void {
        console.error(err);
        this.showMessage(err.message ?? err);
    }

    // Show error dialog
    public showMessage(text: string): void {
        this.data.uiState.showAlertDialog = true;
        this.data.uiState.alertDialogText = text;
    }

    // Get installed apps list on the user device
    public async getInstalledApps(): Promise<DeviceAppInfo[]> {
        return await this.apiClient.getInstalledApps();
    }
}