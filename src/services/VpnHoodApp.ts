import {ClientApiFactory} from "@/services/ClientApiFactory";
import {
  ApiException,
  AppAccount,
  AppConnectionState,
  AppFeatures,
  AppSettings,
  AppState,
  ClientProfileInfo,
  ClientProfileUpdateParams, ClientServerLocationInfo, ConfigParams,
  DeviceAppInfo,
  SessionSuppressType, UiCultureInfo
} from '@/services/VpnHood.Client.Api'
import {AppClient} from "./VpnHood.Client.Api";
import {UiState} from "@/services/UiState";
import {UserState} from "@/services/UserState";
import {AppName, ComponentName, SubscriptionPlansId} from "@/UiConstants";
import {ComponentRouteController} from "@/services/ComponentRouteController";
import {reactive} from "vue";
import i18n from "@/locales/i18n";
import router from '@/plugins/router'
import {DialogConfig} from "@/components/ConfirmDialog/DialogConfig";
import {logEvent, setUserId} from "firebase/analytics";
import type {Analytics} from "firebase/analytics";
import {AnalyticsCustomEvent, FirebaseApp} from "@/services/Firebase";

// VpnHoodAppData must be a separate class to prevents VpnHoodApp reactive
export class VpnHoodAppData {
    public readonly serverUrl: string | undefined = import.meta.env.VITE_CLIENT_API_BASE_URL;
    public uiState: UiState = new UiState();
    public userState: UserState = new UserState();
    public state: AppState;
    public settings: AppSettings;
    public features: AppFeatures;
    public clientProfileInfos: ClientProfileInfo[];
    public cultureInfos: UiCultureInfo[];
    public confirmDialog: DialogConfig = new DialogConfig();

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
    public analytics: Analytics | null;

    private constructor(apiClient: AppClient, appData: VpnHoodAppData, analytics: Analytics | null) {
      if (VpnHoodApp._instance)
        throw new Error("VpnHoodApp has been already initialized.")

        this.data = reactive(appData);
        this.apiClient = apiClient;
        this.analytics = analytics;
        this.data.uiState.configTime = this.data.state.configTime;
        VpnHoodApp._instance = this;
    }

    public static get instance(): VpnHoodApp{
      if (VpnHoodApp._instance == null)
        throw new Error("VpnHoodApp has not been initialized.");
      return VpnHoodApp._instance;
    }

    private static _instance: VpnHoodApp | null;
    public static async create(): Promise<VpnHoodApp> {
        const apiClient: AppClient = ClientApiFactory.instance.createAppClient();
        const config = await apiClient.configure(new ConfigParams({availableCultures: i18n.global.availableLocales}));
        const appData = new VpnHoodAppData(config.state, config.settings, config.features, config.clientProfileInfos, config.availableCultureInfos);
        let analytics: Analytics | null = null;

        // Init firebase and analytics based on app name
        if (import.meta.env.MODE !== "development" || import.meta.env.VITE_CLIENT_IS_INIT_FIREBASE !== "false") {
            analytics = FirebaseApp.initialize(config.features.uiName === AppName.VpnHoodConnect);
            setUserId(analytics, config.settings.clientId);
        }

        if (!analytics)
            console.log("Firebase does not initialized because the current mode is development and 'env.IS_INIT_FIREBASE' is set to false, if you want to enable it on development, please refer to '.env.development' file");

        return new VpnHoodApp(apiClient, appData, analytics);
    }

    private async reloadSettings(): Promise<void> {
        const config = await this.apiClient.getConfig();
        this.data.features = config.features;
        this.data.settings = config.settings;

        // Reload and calc available client profiles
        this.data.clientProfileInfos = VpnHoodApp.getClientProfileInfos(this.isConnectApp(), config.clientProfileInfos,
            config.features.builtInClientProfileId, this.data.userState.userAccount);

        if (config.clientProfileInfos.length === 0)
            this.data.settings.userSettings.clientProfileId = null;
    }

    // Return available client profiles based on app name and user state
    private static getClientProfileInfos(isConnectApp: boolean, clientProfileInfos: ClientProfileInfo[],
                                         builtInClientProfileId: string | null = null, userAccount: AppAccount | null): ClientProfileInfo[] {
        // App is VpnHoodClient
        if (!isConnectApp) return clientProfileInfos;

        // App is VpnHoodCONNECT and user is guest or does not have active subscription
        if (userAccount === null || userAccount.subscriptionId === null) return clientProfileInfos;

        // App is VpnHoodCONNECT and user have active subscription
        if (userAccount.providerPlanId === SubscriptionPlansId.GlobalServer)
            return clientProfileInfos.filter(x => x.clientProfileId !== builtInClientProfileId);

        return clientProfileInfos;
    }

    public async reloadState(): Promise<void> {

        this.data.state = await this.apiClient.getState();
        // Setting has change and must reload
        if (this.data.uiState.configTime.getTime() !== this.data.state.configTime.getTime()) {
            this.data.uiState.configTime = this.data.state.configTime;
            await this.reloadSettings();
        }

        // Show last error message if the user has not ignored
        if (this.data.state.lastError && this.data.uiState.stateLastErrorMessage !== this.data.state.lastError?.message) {
            this.data.uiState.stateLastErrorMessage = this.data.state.lastError.message;
            await this.processError(this.data.state.lastError);
        }

        // Show update message if the user has not ignored or more than 24 hours have passed
        if (this.data.state.lastPublishInfo?.packageUrl !== undefined)
            this.data.uiState.showUpdateSnackbar = true;

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
        console.log("Connecting to " + this.data.state.clientProfile?.clientProfileName);
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
        if (!this.data.settings.userSettings.clientProfileId) {
            await router.replace("/servers");
            return;
        }
        await this.apiClient.diagnose(this.data.settings.userSettings.clientProfileId);
    }

    public analyticsLogEvent(eventName: string, eventParams: object) {
        if (!this.analytics)
            return;
        logEvent(this.analytics, eventName, eventParams);
    }

    // Get error message
    public async processError(err: unknown): Promise<void> {
        console.error(err);
        //TODO improve error handling

        if (typeof err === ApiException){
          // TODO show snackbar message if already connected to the selected profile
          // Show a message that the user can connect to the VPN but not to the selected server
          if (err.typeName === "UnreachableServerLocation" && !this.data.state.hasDiagnoseStarted &&
            this.data.settings.userSettings.serverLocation){
            await this.showErrorMessage(i18n.global.t("UNREACHABLE_SERVER_LOCATION_MESSAGE"), true);
          }
        }

        // Just for VpnHoodConnect
        if (this.isConnectApp() && err === "Session has been closed.")
            await this.signOut();

        // Just for VpnHoodConnect
        if (this.isConnectApp() && err.statusCode === 401 && !this.data.userState.userAccount) {

            // Send error message to analytics
            this.analyticsLogEvent(
                AnalyticsCustomEvent.AlertDialogEventName,
                {message: i18n.global.t("AUTHENTICATION_ERROR", 'en')}
            );

            await this.showErrorMessage(i18n.global.t("AUTHENTICATION_ERROR"));
            await this.signOut();
        } else
            await this.showErrorMessage(err.message ?? err);
    }

    // Show error dialog
    private async showErrorMessage(text: string, showChangeServerToAuto: boolean = false): Promise<void> {

        // Send error message to analytics
        this.analyticsLogEvent(AnalyticsCustomEvent.AlertDialogEventName, {message: text});

        const errorDialogData = this.data.uiState.errorDialogData;
        errorDialogData.message = text;
        errorDialogData.canDiagnose = this.data.state.canDiagnose;
        errorDialogData.logExists = this.data.state.logExists;
        errorDialogData.isVisible = true;
        errorDialogData.showChangeServerToAutoButton = showChangeServerToAuto;

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

    getActiveServerCountryFlag(): string | null {
        const serverLocationInfo = this.data.state.serverLocationInfo ?? this.data.state.clientServerLocationInfo;
        return serverLocationInfo && !this.isLocationAutoSelected(serverLocationInfo.countryCode)
            ? this.getCountryFlag(serverLocationInfo.countryCode) : null;
    }

    public getCountryFlag(countryCode: string): string {
        try {
            return new URL(`../assets/images/country_flags/${countryCode.toLowerCase()}.png`, import.meta.url).href;
        } catch (error: unknown) {
          console.log(error);
          return new URL(`../assets/images/country_flags/no-flag.png`, import.meta.url).href;
        }
    }

    public isLocationAutoSelected(value: string): boolean {
        return value === '*';
    }

    public isActiveClientProfile(clientProfileId: string): boolean {
        return clientProfileId === this.data.settings.userSettings.clientProfileId;
    }

    public isActiveLocation(serverLocationInfo: ClientServerLocationInfo): boolean {
        return this.data.settings.userSettings.serverLocation
            ? serverLocationInfo.serverLocation === this.data.settings.userSettings.serverLocation
            : serverLocationInfo.isDefault;
    }

    public isConnectApp(): boolean {
        return this.data.features.uiName === AppName.VpnHoodConnect;
    }

    public isSingleServerMode(): boolean {
        return this.isConnectApp() && this.data.clientProfileInfos.length === 1;
    }

    public getActiveServerNameOrLocation(): string {
        // App is VpnHoodClient
        if (!this.isSingleServerMode())
            return this.data.state.clientProfile?.clientProfileName ?? i18n.global.t("NO_SERVER_SELECTED");

        // App is VpnHoodCONNECT
        const serverLocationInfo = this.data.state.serverLocationInfo ?? this.data.state.clientServerLocationInfo;
        if (!serverLocationInfo || this.isLocationAutoSelected(serverLocationInfo.countryCode))
            return i18n.global.t('AUTO_SELECT');

        const text = this.isLocationAutoSelected(serverLocationInfo.regionName)
            ? serverLocationInfo.countryName
            : serverLocationInfo.countryName + " (" + serverLocationInfo.regionName + ")";

        return text.replace("United States (", "USA (");
    }

    public isConnected(): boolean {
        return this.data.state.connectionState === AppConnectionState.Connected;
    }

    public getConnectionStateText(): string {
        if (this.data.state.isWaitingForAd)
            return i18n.global.t("LOADING_AD");

        return this.data.state.connectionState === AppConnectionState.None
            ? i18n.global.t("DISCONNECTED")
            : i18n.global.t(this.data.state.connectionState.toUpperCase());
    }

    public async clearLastError(): Promise<void> {
        this.data.uiState.stateLastErrorMessage = null;
        this.data.uiState.errorDialogData.isVisible = false;
        await this.apiClient.clearLastError();
        await this.reloadState();
    }

    //------------------------------------------
    // Just for VpnHoodConnect
    //------------------------------------------

    public async signIn(showLoading: boolean = true): Promise<void> {
        if (showLoading)
            this.data.uiState.showLoadingDialog = true;

        try {
            const accountClient = ClientApiFactory.instance.createAccountClient();
            await accountClient.signInWithGoogle();
            await this.loadAccount();

        } catch (err: unknown) {
            if (err.exceptionTypeName === "TaskCanceledException")
                throw new Error(i18n.global.t("SIGN_IN_CANCELED_BY_USER"));
            else
                throw err;
        } finally {
            if (showLoading)
                this.data.uiState.showLoadingDialog = false;
        }
    }

    public async signOut(): Promise<void> {
        const accountClient = ClientApiFactory.instance.createAccountClient();
        await accountClient.signOut();
        await this.loadAccount();
    }

    public async loadAccount(): Promise<void> {
        const accountClient = ClientApiFactory.instance.createAccountClient();
        this.data.userState.userAccount = await accountClient.get();
    }
}
