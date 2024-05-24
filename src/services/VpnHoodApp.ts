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
import {AppName, ComponentName, SubscriptionPlansId} from "@/UiConstants";
import {ComponentRouteController} from "@/services/ComponentRouteController";
import {reactive} from "vue";
import i18n from "@/locales/i18n";
import router from '@/plugins/router'

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
            this.data.settings.userSettings.clientProfileId = null;
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
        if (this.data.state.lastError && this.data.uiState.stateLastError !== this.data.state.lastError){
            this.data.uiState.stateLastError = this.data.state.lastError;
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

    // Get error message
    public async processError(err: any): Promise<void> {
        console.error(err);

        // Just for VpnHoodConnect
        if (this.isConnectApp() && err === "Session has been closed.")
            await this.signOut();

        // Just for VpnHoodConnect
        if (this.isConnectApp() && err.statusCode === 401 && !this.data.userState.userAccount) {
            await this.showErrorMessage(i18n.global.t("AUTHENTICATION_ERROR"));
            await this.signOut();
        } else
            await this.showErrorMessage(err.message ?? err);
    }

    // Show error dialog
    private async showErrorMessage(text: string): Promise<void> {
        const errorDialogData = this.data.uiState.errorDialogData;
        errorDialogData.message = text;
        errorDialogData.canDiagnose = this.data.state.canDiagnose;
        errorDialogData.logExists = this.data.state.logExists;
        errorDialogData.isVisible = true;

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

    public getCountryFlag(countryCode: string): string {
        try {
            return require(`../assets/images/country_flags/${countryCode.toLowerCase()}.png`);
        } catch (error: any) {
            return require(`../assets/images/country_flags/no-flag.png`);
        }
    }

    public isLocationAutoSelected(countryCode: string): boolean {
        return countryCode === '*';
    }

    public isActiveClientProfile(clientProfileId: string): boolean {
        return clientProfileId === this.data.settings.userSettings.clientProfileId;
    }

    public isActiveLocation(serverLocation: string): boolean {
        return serverLocation === this.data.settings.userSettings.serverLocation;
    }

    public isConnectApp(): boolean {
        return this.data.features.uiName === AppName.VpnHoodConnect;
    }

    public isSingleServerMode(): boolean {
        return this.isConnectApp() && this.data.clientProfileInfos.length === 1;
    }

    public getClientProfileInfos(): ClientProfileInfo[] {
        if (!this.isConnectApp())
            return this.data.clientProfileInfos;

        if (this.data.userState.userAccount === null)
            return this.data.clientProfileInfos;

        if (this.data.userState.userAccount.providerPlanId === SubscriptionPlansId.GlobalServer ||
            this.data.userState.userAccount.providerPlanId === SubscriptionPlansId.BundleServers)
            return  this.data.clientProfileInfos.filter(x => x.clientProfileId !== this.data.features.builtInClientProfileId);

        return this.data.clientProfileInfos;
    }

    public getActiveServerNameOrLocation(): string{
        if (this.isSingleServerMode() && this.data.state.serverLocationInfo){
            return this.isLocationAutoSelected(this.data.state.serverLocationInfo.regionName)
                ? i18n.global.t('AUTO_SELECT')
                : this.data.state.serverLocationInfo.regionName
        }
        return this.data.state.clientProfile?.clientProfileName ?? i18n.global.t("NO_SERVER_SELECTED");
    }

    public getConnectionState(): string{
        if (this.data.state.isWaitingForAd)
            return i18n.global.t("LOADING_AD");

        return this.data.state.connectionState === AppConnectionState.None
            ? i18n.global.t("DISCONNECTED")
            : i18n.global.t(this.data.state.connectionState.toUpperCase());
    }

    public async clearLastError(): Promise<void>{
        this.data.uiState.stateLastError = null;
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

        } catch (err: any) {
            if (err.exceptionTypeName === "OperationCanceledException")
                throw new Error(i18n.global.t("SIGN_IN_CANCELED_BY_USER"));
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