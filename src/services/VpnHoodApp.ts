import {ClientApiFactory} from "@/services/ClientApiFactory";
import {
    AppConnectionState,
    AppFeatures,
    AppSettings,
    AppState,
    ClientProfileInfo,
    ClientProfileUpdateParams, ConfigParams,
    DeviceAppInfo,
    SessionSuppressType, UiCultureInfo,
} from "@/services/VpnHood.Client.Api";
import {AppClient} from "./VpnHood.Client.Api";
import {UiState} from "@/services/UiState";
import {UserState} from "@/services/UserState";
import {AppName, ComponentName} from "@/UiConstants";
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
    public cultureInfos: UiCultureInfo[];

    public constructor(state: AppState, setting: AppSettings, features: AppFeatures, clientProfileInfos: ClientProfileInfo[], cultureInfos: UiCultureInfo[]) {
        this.state = state;
        this.settings = setting;
        this.features = features;
        this.clientProfileInfos = clientProfileInfos;
        this.cultureInfos = cultureInfos;
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
        const config = await apiClient.configure(new ConfigParams({availableCultures: i18n.global.availableLocales}));
        return new VpnHoodApp(apiClient, new VpnHoodAppData(config.state, config.settings, config.features, config.clientProfileInfos, config.availableCultureInfos));
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
            this.data.state.sessionStatus?.suppressedTo === SessionSuppressType.None) {
            this.data.uiState.showSuppressSnackbar = false;
        }
    }

    public async connect(): Promise<void> {
        if (!this.data.settings.userSettings.defaultClientProfileId)
            throw new Error(i18n.global.t("EMPTY_DEFAULT_CLIENT_PROFILE"));


        if (this.data.features.uiName !== AppName.VpnHoodConnect) {
            // Get current UTC date
            const currentDate = new Date();
            const currentUTCDate = Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate());

            // Define the comparison date
            const publicServerExpireDate = new Date("2024-05-01");
            const publicServerExpireUTCDate = Date.UTC(publicServerExpireDate.getUTCFullYear(), publicServerExpireDate.getUTCMonth(), publicServerExpireDate.getUTCDate());

            // Find default client profile
            const defaultClientProfile: ClientProfileInfo | undefined = this.data.clientProfileInfos.find(
                x => x.clientProfileId === this.data.settings.userSettings.defaultClientProfileId);

            if (currentUTCDate >= publicServerExpireUTCDate && defaultClientProfile?.tokenId === this.data.features.defaultAccessTokenId) {
                await this.deleteClientProfile(defaultClientProfile?.clientProfileId!);
                throw new Error("The VpnHood public servers has been migrated to the VpnHood CONNECT app.  Please install it to use VpnHood Public Servers.")
            }
            // If selected server is VpnHood public server
            if (defaultClientProfile?.tokenId === this.data.features.defaultAccessTokenId && !ComponentRouteController.isShowComponent(ComponentName.PublicServerHintDialog)) {
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

    public async deleteClientProfile(clientProfileId: string): Promise<void> {
        await this.apiClient.deleteClientProfile(clientProfileId);
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
        if (this.data.features.uiName === AppName.VpnHoodConnect && err === "Access Expired!")
            await this.refreshAccount();


        // Just for VpnHoodConnect
        if (this.data.features.uiName === AppName.VpnHoodConnect && err.statusCode === 401 && !this.data.userState.userAccount) {
            await this.showMessage(i18n.global.t("AUTHENTICATION_ERROR"));
            await this.signOut();
        } else
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

    public async postPoneUpdate(): Promise<void> {
        await this.apiClient.versionCheckPostpone();
    }

    public async checkForUpdate(): Promise<void> {
        await this.apiClient.versionCheck();
    }

    // Return current active server name
    public async getDefaultClientProfileName(): Promise<string> {
        let clientProfileInfo = this.data.clientProfileInfos.find(
            x => x.clientProfileId === this.data.settings.userSettings.defaultClientProfileId);

        // Just for VpnHoodConnect
        // Always set public server as default profile if user does not have a premium server or default selected server.
        if (!clientProfileInfo && this.data.features.uiName === AppName.VpnHoodConnect)
           clientProfileInfo = await this.setDefaultClientProfile();

        return clientProfileInfo === undefined ? i18n.global.t("NO_SERVER_SELECTED") : clientProfileInfo.clientProfileName;
    }

    //------------------------------------------
    // Just for VpnHoodConnect
    //------------------------------------------
    private async setDefaultClientProfile(): Promise<ClientProfileInfo> {
        const defaultServerClientProfile = this.data.clientProfileInfos.find(x => x.tokenId === this.data.features.defaultAccessTokenId);
        if (!defaultServerClientProfile) throw new Error(i18n.global.t("COULD_NOT_FOUND_PUBLIC_SERVER_PROFILE"));
        this.data.settings.userSettings.defaultClientProfileId = defaultServerClientProfile.clientProfileId;
        await this.saveUserSetting();
        return defaultServerClientProfile;
    }

    // Process user account and server key(s) status
    private async processUserAccount(): Promise<void> {
        const accountClient = ClientApiFactory.instance.createAccountClient();
        this.data.userState.userAccount = await accountClient.get();

        // User does not have an active subscription
        if (!this.data.userState.userAccount.subscriptionId) {
            console.log("User does not have an active subscription");
            await this.removePremiumClientProfile();
            return;
        }

        // User purchase has an active subscription
        console.log("User has an active subscription");
        if (this.data.state.connectionState === AppConnectionState.Connected)
            await this.disconnect();

        await this.removePremiumClientProfile();
        await this.getAndSaveSubscriptionAccessKeys(this.data.userState.userAccount.subscriptionId);
        await this.setPremiumClientProfileAsDefault();
    }

    // Remove all user premium client profile
    private async removePremiumClientProfile(): Promise<void> {
        const premiumClientProfiles = this.data.clientProfileInfos.filter(x => x.tokenId !== this.data.features.defaultAccessTokenId);
        for (const clientProfile of premiumClientProfiles) {
            await this.deleteClientProfile(clientProfile.clientProfileId);
        }
        const defaultServerProfile = this.data.clientProfileInfos.find(x => x.tokenId === this.data.features.defaultAccessTokenId);
        if (!defaultServerProfile) throw new Error(i18n.global.t("COULD_NOT_FOUND_PUBLIC_SERVER_PROFILE"));
        this.data.settings.userSettings.defaultClientProfileId = defaultServerProfile.clientProfileId;
        await this.saveUserSetting();
    }

    // Get subscription accessKey(s) and save as client profile
    private async getAndSaveSubscriptionAccessKeys(subscriptionId: string): Promise<void> {
        const accountClient = ClientApiFactory.instance.createAccountClient();
        const accessKeyList = await accountClient.getAccessKeys(subscriptionId);
        if (!accessKeyList) throw new Error("Could not found any access key for this subscription id. SubscriptionId: " + subscriptionId);

        for (const accessKey of accessKeyList) {
            await this.addAccessKey(accessKey);
        }
    }

    // Set one of the premium client profile as default
    private async setPremiumClientProfileAsDefault(): Promise<void> {
        const premiumServer = this.data.clientProfileInfos.find(x => x.tokenId !== this.data.features.defaultAccessTokenId);
        if (!premiumServer) {
            console.error(i18n.global.t("COULD_NOT_SET_PREMIUM_SERVER"));
            throw new Error(i18n.global.t("COULD_NOT_SET_PREMIUM_SERVER"));
        }
        this.data.settings.userSettings.defaultClientProfileId = premiumServer.clientProfileId;
        await this.saveUserSetting();
    }

    public async signIn(): Promise<void> {
        const accountClient = ClientApiFactory.instance.createAccountClient();
        await accountClient.signInWithGoogle();
        await this.refreshAccount();
    }

    public async signOut(): Promise<void> {
        const accountClient = ClientApiFactory.instance.createAccountClient();
        await accountClient.signOut();
        await this.removePremiumClientProfile();
        this.data.userState.userAccount = null;
    }

    public async refreshAccount(): Promise<void> {
        const accountClient = ClientApiFactory.instance.createAccountClient();
        await accountClient.refresh();
        await this.processUserAccount();
    }

    checkPremium(): boolean {
        return !!(this.data.features.uiName === AppName.VpnHoodConnect && this.data.userState.userAccount?.subscriptionId);
    }
}