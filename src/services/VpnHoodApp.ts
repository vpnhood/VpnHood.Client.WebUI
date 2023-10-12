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
    }

    public static async create(): Promise<VpnHoodApp> {
        const apiClient: ApiClient = ClientApiFactory.instance.CreateApiClient();
        const result = await apiClient.loadApp(new LoadAppParam({
            withSettings: true,
            withState: true,
            withClientProfileItems: true,
            withFeatures: true,
        }));
        return new VpnHoodApp(apiClient, new VpnHoodAppData(result.state!, result.settings!, result.features!, result.clientProfileItems!));
    }

    public async loadApp(options?: {
        withSettings?: boolean,
        withState?: boolean,
        withClientProfileItems?: boolean,
        withFeatures?: boolean
    }): Promise<void> {
        const loadApp = await this.apiClient.loadApp(
            new LoadAppParam({
                withSettings: options?.withSettings ?? false,
                withState: options?.withState ?? false,
                withClientProfileItems: options?.withClientProfileItems ?? false,
                withFeatures: options?.withFeatures ?? false,
            }));

        if (loadApp.features)
            this.data.features = loadApp.features;

        if (loadApp.state) {
            // The function is created based on IDE recommend
            this.data.state = loadApp.state;
            this.data.state.connectionState = loadApp.state.connectionState;
            this.processAppState();
        }

        if (loadApp.settings) {
            this.data.settings = loadApp.settings;
        }

        if (loadApp.clientProfileItems) {
            this.data.clientProfileItems = loadApp.clientProfileItems;
            if (loadApp.clientProfileItems.length === 0){
                this.data.settings.userSettings.defaultClientProfileId = null;
            }
        }
    }

    private processAppState(): void {

        // Show last error message if the user has not ignored
        if (this.data.state.lastError &&
            this.data.uiState.userIgnoreLastErrorTime?.toString() !== this.data.state.connectRequestTime?.toString()) {
            this.data.uiState.userIgnoreLastErrorTime = this.data.state.connectRequestTime;
            console.log("lastError", this.data.state.lastError);
            this.showError(this.data.state.lastError);
        }

        // Show update message if the user has not ignored or more than 24 hours have passed
        if (this.data.state.lastPublishInfo) {
            this.data.uiState.showUpdateSnackbar = this.data.uiState.userIgnoreUpdateTime == null ||
                (new Date().getTime() - this.data.uiState.userIgnoreUpdateTime) >= UiConstants.userIgnoreUpdateTime;
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

            await this.apiClient.connect(new ConnectParam({clientProfileId: this.data.settings.userSettings.defaultClientProfileId}));
        }
    }

    public async disconnect(): Promise<void> {
        await this.apiClient.disconnect();
        this.data.uiState.showSuppressSnackbar = false;
    }

    public getAppVersion(isFull: boolean): string {
        return isFull ? this.data.features.version : this.data.features.version.split(".")[2];
    }

    // Save any change by user
    public async saveUserSetting(): Promise<void> {
        await this.apiClient.setUserSettings(this.data.settings.userSettings);
        await this.loadApp({withSettings: true});
    }

    // Select profile by user
    public async setClientProfile(clientProfileParam: SetClientProfileParam): Promise<void> {
        await this.apiClient.setClientProfile(clientProfileParam);
        await this.loadApp({withClientProfileItems: true});
    }

    public async removeClientProfile(clientProfileParam: RemoveClientProfileParam): Promise<void> {
        await this.apiClient.removeClientProfile(clientProfileParam);
        await this.loadApp({withClientProfileItems: true});
    }

    public async addAccessKey(accessKey: AddClientProfileParam): Promise<void> {
        await this.apiClient.addAccessKey(accessKey);
        await this.loadApp({withClientProfileItems: true});
    }

    public async addTestServer(): Promise<void> {
        await this.apiClient.addTestServer();
        await this.loadApp({withClientProfileItems: true});
    }

    public async diagnose(): Promise<void> {
        if (!this.data.settings.userSettings.defaultClientProfileId) {
            throw new Error("Could not find default client profile id.");
        }
        await this.apiClient.diagnose(new ConnectParam({clientProfileId: this.data.settings.userSettings.defaultClientProfileId}));
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
        return await this.apiClient.installedApps();
    }
}