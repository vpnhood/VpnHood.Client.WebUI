import {ClientApiFactory} from "@/services/ClientApiFactory";
import {
    AppConnectionState,
    AppFeatures,
    AppSettings,
    AppState,
    ClientProfileInfo,
    ClientProfileUpdateParams,
    DeviceAppInfo,
    SessionSuppressType,
} from "@/services/VpnHood.Client.Api";
import {AppClient} from "./VpnHood.Client.Api";
import {UiState} from "@/services/UiState";
import {UserState} from "@/services/UserState";
import {ComponentName} from "@/UiConstants";
import {ComponentRouteController} from "@/services/ComponentRouteController";
import {reactive} from "vue";
import i18n from "@/locales/i18n";

// VpnHoodAppData must be a separate class to prevents VpnHoodApp reactive
export class VpnHoodAppData {
    public readonly serverUrl: string | undefined = process.env["VUE_APP_CLIENT_API_BASE_URL"];
    public uiState: UiState = new UiState();
    public userState: UserState = new UserState();
    public state: AppState;
    public settings: AppSettings;
    public features: AppFeatures;
    public clientProfileInfos: ClientProfileInfo[];
    public constructor(state: AppState, setting: AppSettings, features: AppFeatures, clientProfileInfos: ClientProfileInfo[]) {
        this.state = state;
        this.settings = setting;
        this.features = features;
        this.clientProfileInfos = clientProfileInfos;
    }
}

export class VpnHoodApp {
    public data: VpnHoodAppData;
    public apiClient: AppClient;

    private constructor(apiClient: AppClient, appData: VpnHoodAppData) {
        this.data = reactive(appData);
        this.apiClient = apiClient;
        this.data.uiState.configTime = this.data.state.configTime;
    }

    public static async create(): Promise<VpnHoodApp> {
        const apiClient: AppClient = ClientApiFactory.instance.createAppClient();
        const config = await apiClient.getConfig();
        return new VpnHoodApp(apiClient, new VpnHoodAppData(config.state, config.settings, config.features, config.clientProfileInfos));
    }

    private async reloadSettings(): Promise<void> {
        const config = await this.apiClient.getConfig();

        this.data.features = config.features;
        this.data.settings = config.settings;
        this.data.clientProfileInfos = config.clientProfileInfos;
        if (config.clientProfileInfos.length === 0) {
            this.data.settings.userSettings.defaultClientProfileId = null;
        }
    }

    public async reloadState(): Promise<void> {

        this.data.state = await this.apiClient.getState();

        // Setting has change and must reload
        if (this.data.uiState.configTime.getTime() !== this.data.state.configTime.getTime()) {
            this.data.uiState.configTime = this.data.state.configTime;
            await this.reloadSettings();
        }

        // Show last error message if the user has not ignored
        if (this.data.state.lastError &&
            this.data.userState.userIgnoreLastErrorTime?.toString() !== this.data.state.connectRequestTime?.toString()) {
            this.data.userState.userIgnoreLastErrorTime = this.data.state.connectRequestTime;
            await this.showError(this.data.state.lastError);
        }

        // Show update message if the user has not ignored or more than 24 hours have passed
        if (this.data.state.lastPublishInfo?.packageUrl !== undefined) {
            this.data.uiState.showUpdateSnackbar = true;
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
            this.data.state.sessionStatus?.suppressedTo === SessionSuppressType.Other &&
            this.data.uiState.userIgnoreSuppressToTime?.toString() !== this.data.state.connectRequestTime?.toString()) {
            this.data.uiState.showSuppressSnackbar = true;
        }

        // Hide 'suppress' message
        if (this.data.state.sessionStatus?.suppressedBy === SessionSuppressType.None &&
            this.data.state.sessionStatus?.suppressedTo === SessionSuppressType.None){
            this.data.uiState.showSuppressSnackbar = false;
        }
    }

    public async connect(): Promise<void> {
        if (!this.data.settings.userSettings.defaultClientProfileId) {
            throw new Error(i18n.global.t("EMPTY_DEFAULT_CLIENT_PROFILE"));
        }

        // Find default client profile
        const defaultClientProfile: ClientProfileInfo | undefined = this.data.clientProfileInfos.find(
            x => x.clientProfileId === this.data.settings.userSettings.defaultClientProfileId);

        // If selected server is VpnHood public server
        if (defaultClientProfile?.tokenId === this.data.features.testServerTokenId && !ComponentRouteController.isShowComponent(ComponentName.PublicServerHintDialog)) {

            // Show public server hint
            if (localStorage.getItem("vh:DontShowPublicServerHint") !=="true"){
                await ComponentRouteController.showComponent(ComponentName.PublicServerHintDialog);
                return;
            }
        }
        await this.apiClient.connect();
    }

    public async disconnect(): Promise<void> {
        await this.apiClient.disconnect();
        if (this.data.state.sessionStatus?.suppressedTo &&
            this.data.state.sessionStatus?.suppressedTo !== SessionSuppressType.None &&
            this.data.state.sessionStatus?.suppressedBy === SessionSuppressType.None) {
            this.data.uiState.showSuppressSnackbar = false;
        }
    }

    public getAppVersion(isFull: boolean): string {
        const fullVersion: string = this.data.features.version;
        return isFull ? fullVersion.substring(0, fullVersion.lastIndexOf('.')) : fullVersion.split(".")[2];
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

    public async addAccessKey(accessKey: string): Promise<ClientProfileInfo> {
        const clientProfileInfo = await this.apiClient.addAccessKey(accessKey);
        await this.reloadSettings();
        return clientProfileInfo;
    }

    public async deleteClientProfile(clientProfileId: string): Promise<void>{
        await this.apiClient.deleteClientProfile(clientProfileId);
        await this.reloadSettings();
    }
    public async addTestServer(): Promise<void> {
        await this.apiClient.addTestServer();
        await this.reloadSettings();
    }

    public async diagnose(): Promise<void> {
        if (!this.data.settings.userSettings.defaultClientProfileId) {
            throw new Error(i18n.global.t("EMPTY_DEFAULT_CLIENT_PROFILE"));
        }
        await this.apiClient.diagnose(this.data.settings.userSettings.defaultClientProfileId);
    }

    public canDiagnose(): boolean {
        return this.data.state.connectionState === AppConnectionState.None || !this.data.state.hasDiagnoseStarted;
    }

    // Get error message
    public async showError(err: any): Promise<void> {
        console.error(err);

        if (err.statusCode === 401 && !this.data.userState.userAccount)
            await this.showMessage(i18n.global.t("AUTHENTICATION_ERROR"));

        else
            await this.showMessage(err.message ?? err);
    }

    // Show error dialog
    public async showMessage(text: string): Promise<void> {
        this.data.uiState.alertDialogText = text;
        await ComponentRouteController.showComponent(ComponentName.AlertDialog);
    }

    // Get installed apps list on the user device
    public getInstalledApps(): Promise<DeviceAppInfo[]> {
        return this.apiClient.getInstalledApps();
    }

    public async postPoneUpdate(): Promise<void>{
        await this.apiClient.versionCheckPostpone();
    }

    public async checkForUpdate(): Promise<void>{
        await this.apiClient.versionCheck();
    }

    public async signIn(): Promise<void>{
        const accountClient = ClientApiFactory.instance.createAccountClient();
        await accountClient.signInWithGoogle();
        await this.processUserAccount();
    }

    public async signOut(): Promise<void>{
        const accountClient = ClientApiFactory.instance.createAccountClient();
        await accountClient.signOut();
        await this.removePremiumClientProfile();
        this.data.userState.userAccount = null;
    }

    async processUserAccount(): Promise<void>{
        await this.removePremiumClientProfile();

        const accountClient = ClientApiFactory.instance.createAccountClient();
        this.data.userState.userAccount = await accountClient.get();

        if(this.data.userState.userAccount.subscriptionId)
            await this.getAndSaveSubscriptionAccessKeys(this.data.userState.userAccount.subscriptionId);
    }

    public async removePremiumClientProfile(): Promise<void> {
        const premiumClientProfiles = this.data.clientProfileInfos.filter(x => x.tokenId !== this.data.features.testServerTokenId);
        for (const clientProfile of premiumClientProfiles){
            await this.deleteClientProfile(clientProfile.clientProfileId);
        }
    }

    async getAndSaveSubscriptionAccessKeys(subscriptionId: string): Promise<void>{
        const accountClient = ClientApiFactory.instance.createAccountClient();
        const accessKeyList = await accountClient.getAccessKeys(subscriptionId);
        for (const accessKey of accessKeyList){
            await this.addAccessKey(accessKey);
        }
    }
}