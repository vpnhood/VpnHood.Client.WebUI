import {ClientApiFactory} from "@/services/ClientApiFactory";
import {
    AppAccount,
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
import {AppName, ComponentName, LocalStorage} from "@/UiConstants";
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
        if (!this.data.settings.userSettings.defaultClientProfileId)
            throw new Error(i18n.global.t("EMPTY_DEFAULT_CLIENT_PROFILE"));


        if (this.data.features.uiName !== AppName.VpnHoodConnect){
            // Find default client profile
            const defaultClientProfile: ClientProfileInfo | undefined = this.data.clientProfileInfos.find(
                x => x.clientProfileId === this.data.settings.userSettings.defaultClientProfileId);

            // If selected server is VpnHood public server
            if (defaultClientProfile?.tokenId === this.data.features.testServerTokenId && !ComponentRouteController.isShowComponent(ComponentName.PublicServerHintDialog)) {
                // Show public server hint
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

        // Just for VpnHoodConnect
        if (err.statusCode === 401 && !this.data.userState.userAccount){
            await this.showMessage(i18n.global.t("AUTHENTICATION_ERROR"));
            await this.signOut();
        }

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

    //------------------------------------------
    // Just for VpnHoodConnect
    //------------------------------------------
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

    // Get user account info from the browser local storage
    getLocalUserAccount(): AppAccount | null{
        const localUserAccountInfo = localStorage.getItem(LocalStorage.userAccount);
        return localUserAccountInfo ? JSON.parse(localUserAccountInfo) : null;
    }

    // Save user account info to the browser local storage
    setLocalUserAccount(appAccount: AppAccount){
        localStorage.setItem(LocalStorage.userAccount, JSON.stringify(appAccount));
    }

    // Compare local user account info with store server user account info
    syncUserAccount(appAccount: AppAccount): boolean{
        const localUserAccountInfo = this.getLocalUserAccount();
        if (!localUserAccountInfo){
            this.setLocalUserAccount(appAccount);
            return false;
        }
        return localUserAccountInfo.subscriptionId === appAccount.subscriptionId
            && localUserAccountInfo.providerPlanId === appAccount.providerPlanId;
    }

    // Always call after launch app or sign-in
    async processUserAccount(): Promise<void>{
        const accountClient = ClientApiFactory.instance.createAccountClient();
        this.data.userState.userAccount = await accountClient.get();

        // User is guest
        if (!this.data.userState.userAccount){
            console.log("User is guest");
            return;
        }

        // User does not have an active subscription
        if (!this.data.userState.userAccount.subscriptionId){
            console.log("User does not have an active subscription");
            await this.disconnectFromPremiumServer();
            await this.removePremiumClientProfile();
            return;
        }

        const isUserAccountSynced =  this.syncUserAccount(this.data.userState.userAccount);

        // User has an active subscription and synced with previous local state
        if (isUserAccountSynced){
            console.log("User has active and synced subscription");
            return;
        }

        // User purchase a subscription or change previous subscription
        else {
            console.log("User purchase a subscription or change previous subscription");
            this.setLocalUserAccount(this.data.userState.userAccount);
            if (this.data.state.connectionState === AppConnectionState.Connected)
                await this.disconnect();

            await this.removePremiumClientProfile();
            await this.getAndSaveSubscriptionAccessKeys(this.data.userState.userAccount.subscriptionId);
            await this.setPremiumClientProfileAsDefault();
        }
    }

    // Remove all user premium client profile
    public async removePremiumClientProfile(): Promise<void> {
        const premiumClientProfiles = this.data.clientProfileInfos.filter(x => x.tokenId !== this.data.features.testServerTokenId);
        for (const clientProfile of premiumClientProfiles){
            await this.deleteClientProfile(clientProfile.clientProfileId);
        }
    }

    // Get subscription accessKey(s) and save as client profile
    async getAndSaveSubscriptionAccessKeys(subscriptionId: string): Promise<void>{
        const accountClient = ClientApiFactory.instance.createAccountClient();
        const accessKeyList = await accountClient.getAccessKeys(subscriptionId);
        if (!accessKeyList) throw new Error("Could not found any access key for this subscription id. SubscriptionId: " + subscriptionId);

        for (const accessKey of accessKeyList){
            await this.addAccessKey(accessKey);
        }
    }

    // Set one of the premium client profile as default
    async setPremiumClientProfileAsDefault(): Promise<void>{
        const premiumServer = this.data.clientProfileInfos.find(x => x.tokenId !== this.data.features.testServerTokenId);
        if (!premiumServer)
            throw new Error("Could not set premium server as default profile. Premium server is undefined");

        this.data.settings.userSettings.defaultClientProfileId = premiumServer.clientProfileId;
        await this.saveUserSetting();
    }

    // Disconnect Vpn if is connected with premium server
    async disconnectFromPremiumServer(): Promise<void>{
        if (this.data.state.connectionState === AppConnectionState.Connected){

            // Find default client profile
            const defaultClientProfile: ClientProfileInfo | undefined = this.data.clientProfileInfos.find(
                x => x.clientProfileId === this.data.settings.userSettings.defaultClientProfileId);

            if (defaultClientProfile?.tokenId !== this.data.features.testServerTokenId)
                await this.disconnect();
        }
    }
}