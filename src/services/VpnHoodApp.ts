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
        if (this.data.state.lastError)
            await this.showError(this.data.state.lastError);

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
        if (!this.data.settings.userSettings.clientProfileId && this.data.features.isAddAccessKeySupported) {
            await router.replace("/servers");
            return;
        }
        if (!this.data.settings.userSettings.clientProfileId) {
            throw new Error(i18n.global.t("EMPTY_DEFAULT_CLIENT_PROFILE"));
        }
        await this.apiClient.diagnose(this.data.settings.userSettings.clientProfileId);
    }

    public canDiagnose(): boolean {
        return this.data.state.connectionState === AppConnectionState.None || !this.data.state.hasDiagnoseStarted;
    }

    // Get error message
    public async showError(err: any): Promise<void> {
        console.error(err);

        // Just for VpnHoodConnect
        if (this.data.features.uiName === AppName.VpnHoodConnect && err === "Session has been closed.")
            await this.signOut();

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
        await this.apiClient.clearLastError();
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

    //------------------------------------------
    // Just for VpnHoodConnect
    //------------------------------------------

    public async signIn(showLoading: boolean = true): Promise<void> {
        if(showLoading)
            this.data.uiState.showLoadingDialog = true;

        try {
            const accountClient = ClientApiFactory.instance.createAccountClient();
            await accountClient.signInWithGoogle();
            await this.loadAccount();

        } catch (err: any) {
            if (err.exceptionTypeName === "OperationCanceledException")
                throw new Error(i18n.global.t("SIGN_IN_CANCELED_BY_USER"));
            throw err;
        }
        finally {
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