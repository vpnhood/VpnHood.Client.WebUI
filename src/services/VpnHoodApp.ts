import {
  ApiException,
  AppClient,
  AppConnectionState,
  AppFeatures,
  AppSettings,
  AppState,
  ClientProfileClient,
  ClientProfileInfo,
  ClientProfileUpdateParams,
  ConfigParams,
  ConnectPlanId,
  DeviceAppInfo,
  PatchOfBoolean,
  PatchOfString,
  SessionSuppressType,
  UiCultureInfo
} from '@/services/VpnHood.Client.Api';
import { ClientApiFactory } from '@/services/ClientApiFactory';
import { UiState } from '@/helpers/UiState';
import { UserState } from '@/helpers/UserState';
import { AppName, ComponentName } from '@/helpers/UiConstants';
import { ComponentRouteController } from '@/services/ComponentRouteController';
import { reactive } from 'vue';
import i18n from '@/locales/i18n';
import router from '@/services/router';
import type { Analytics } from 'firebase/analytics';
import { logEvent, setUserId } from 'firebase/analytics';
import { AnalyticsCustomEvent, FirebaseApp } from '@/services/Firebase';
import { ErrorHandler } from '@/helpers/ErrorHandler';
import { Util } from '@/helpers/Util';

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

  public constructor(
    state: AppState,
    setting: AppSettings,
    features: AppFeatures,
    clientProfileInfos: ClientProfileInfo[],
    cultureInfos: UiCultureInfo[]
  ) {
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
  public clientProfileClient: ClientProfileClient;
  public analytics: Analytics | null;

  private constructor(apiClient: AppClient, clientProfileClient: ClientProfileClient, appData: VpnHoodAppData, analytics: Analytics | null) {
    if (VpnHoodApp._instance)
      throw new Error('VpnHoodApp has been already initialized.');

    this.data = reactive(appData);
    this.apiClient = apiClient;
    this.clientProfileClient = clientProfileClient;
    this.analytics = analytics;
    this.data.uiState.configTime = this.data.state.configTime;
    VpnHoodApp._instance = this;
  }

  public static get instance(): VpnHoodApp {
    if (VpnHoodApp._instance == null)
      throw new Error('VpnHoodApp has not been initialized.');
    return VpnHoodApp._instance;
  }

  private static _instance: VpnHoodApp | null;

  public static async create(): Promise<VpnHoodApp> {
    const apiClient: AppClient = ClientApiFactory.instance.createAppClient();
    const clientProfileClient: ClientProfileClient = ClientApiFactory.instance.createClientProfileClient();
    const config = await apiClient.configure(
      new ConfigParams({ availableCultures: i18n.global.availableLocales }));
    const appData = new VpnHoodAppData(
      config.state,
      config.settings,
      config.features,
      config.clientProfileInfos,
      config.availableCultureInfos
    );
    let analytics: Analytics | null = null;

    // Init firebase and analytics based on app name
    if (import.meta.env.MODE !== 'development' || import.meta.env.VITE_CLIENT_IS_INIT_FIREBASE !== 'false') {
      analytics = FirebaseApp.initialize(config.features.uiName === AppName.VpnHoodConnect);
      setUserId(analytics, config.settings.clientId);
    }

    if (!analytics)
      console.log('Firebase does not initialized because the current mode is development and \'env.IS_INIT_FIREBASE\' is set to false, if you want to enable it on development, please refer to \'.env.development\' file');

    return new VpnHoodApp(apiClient, clientProfileClient, appData, analytics);
  }

  private async reloadSettings(): Promise<void> {
    const config = await this.apiClient.getConfig();
    this.data.features = config.features;
    this.data.settings = config.settings;

    // Remove built-in client profile if the user is premium
    this.data.clientProfileInfos = this.data.userState.userAccount?.subscriptionId
      ? config.clientProfileInfos.filter(x => x.clientProfileId !== config.features.builtInClientProfileId)
      : config.clientProfileInfos

    if (config.clientProfileInfos.length === 0)
      this.data.settings.userSettings.clientProfileId = null;
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
      await this.processError(ApiException.fromApiError(this.data.state.lastError));
    }

    // Show update message if the user has not ignored or more than 24 hours have passed
    if (this.data.state.lastPublishInfo?.packageUrl !== undefined)
      this.data.uiState.showUpdateSnackbar = true;

    // Show 'suppress by' message
    // noinspection OverlyComplexBooleanExpressionJS
    if (this.data.state.connectionState === AppConnectionState.None && this.data.state.sessionStatus?.suppressedBy &&
      this.data.state.sessionStatus?.suppressedBy !== SessionSuppressType.None &&
      this.data.uiState.userIgnoreSuppressByTime?.toString() !== this.data.state.connectRequestTime?.toString()) {
      this.data.uiState.showSuppressSnackbar = true;
    }

    // Show 'suppress to' message
    // noinspection OverlyComplexBooleanExpressionJS
    if (this.data.state.connectionState === AppConnectionState.Connected && this.data.state.sessionStatus?.suppressedTo &&
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

  public async connect(clientProfileId: string, serverLocation: string | undefined, isPremium: boolean, planId: ConnectPlanId,
                       isDiagnose: boolean = false): Promise<void> {

    // User select active item and already connected
    if (this.data.state.canDisconnect
      && clientProfileId === this.data.state.clientProfile?.clientProfileId
      && serverLocation === this.data.state.serverLocationInfo?.serverLocation) {
      this.showGeneralSnackbar(i18n.global.t('ALREADY_CONNECTED_TO_LOCATION'));
      return;
    }

    // Update client profile
    await this.updateClientProfile(clientProfileId, new ClientProfileUpdateParams({
      isPremiumLocationSelected: new PatchOfBoolean({ value: isPremium ?? false }),
      selectedLocation: new PatchOfString({ value: serverLocation })
    }));

    // Update user settings
    this.data.settings.userSettings.clientProfileId = clientProfileId;
    await this.saveUserSetting();

    // Just for Development info
    console.log(`Final Server location:  ${serverLocation}`);
    console.log(`PlanId:  ${planId}`);

    // Navigate to home page
    await router.replace('/');

    if (isDiagnose) await this.diagnose();
    else await this.apiClient.connect(clientProfileId, serverLocation, planId);
  }

  public async disconnect(): Promise<void> {
    await this.apiClient.disconnect();
    if (this.data.state.sessionStatus?.suppressedTo
      && this.data.state.sessionStatus?.suppressedTo !== SessionSuppressType.None
      && this.data.state.sessionStatus?.suppressedBy === SessionSuppressType.None)
      this.data.uiState.showSuppressSnackbar = false;
  }

  public getAppVersion(isFull: boolean): string {
    const fullVersion: string = this.data.features.version;
    return isFull
      ? fullVersion.substring(0, fullVersion.lastIndexOf('.'))
      : fullVersion.split('.')[2];
  }

  // Save any change by user
  public async saveUserSetting(): Promise<void> {
    await this.apiClient.setUserSettings(this.data.settings.userSettings);
  }

  // Select profile by user
  public async updateClientProfile(clientProfileId: string, clientProfileUpdateParam: ClientProfileUpdateParams): Promise<void> {
    await this.clientProfileClient.update(clientProfileId, clientProfileUpdateParam);
    await this.reloadSettings();
  }

  public async addAccessKey(accessKey: string): Promise<ClientProfileInfo> {
    const clientProfileInfo = await this.clientProfileClient.addByAccessKey(accessKey);
    await this.reloadSettings();
    return clientProfileInfo;
  }

  public async deleteClientProfile(clientProfileId: string): Promise<void> {
    await this.clientProfileClient.delete(clientProfileId);
    await this.reloadSettings();
  }

  public async diagnose(): Promise<void> {
    if (!this.data.settings.userSettings.clientProfileId) {
      await router.replace('/servers');
      return;
    }
    await this.apiClient.diagnose(
      this.data.settings.userSettings.clientProfileId
    );
  }

  public analyticsLogEvent(eventName: string, eventParams: object) {
    if (!this.analytics) return;
    try {
      logEvent(this.analytics, eventName, eventParams);
    } catch (err: unknown) {
      console.error(`An error occurred while logging event to Analytics. Error: ${err}`);
    }
  }

  // Get error message
  public async processError(err: unknown): Promise<void> {
    // For developer
    console.error(err);
    console.log('Error is typeof: ', typeof err);

    await ErrorHandler.processError(err);
  }

  // Show error dialog
  public async showErrorMessage(text: string, canDiagnose?: boolean): Promise<void> {
    // Send error message to analytics
    this.analyticsLogEvent(AnalyticsCustomEvent.AlertDialogEventName, { message: text });

    const errorDialogData = this.data.uiState.errorDialogData;
    errorDialogData.message = text;
    errorDialogData.canDiagnose = canDiagnose ?? this.data.state.canDiagnose;
    errorDialogData.promptForLog = this.data.state.promptForLog;
    errorDialogData.showChangeServerToAutoButton = text === i18n.global.t('UNREACHABLE_SERVER_LOCATION_MESSAGE_WITH_CHANGE_TO_AUTO');

    await ComponentRouteController.showComponent(ComponentName.ErrorDialog);
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
    const serverLocationInfo = this.data.state.serverLocationInfo ??
      this.data.state.clientProfile?.selectedLocationInfo;
    return serverLocationInfo && !Util.isLocationAutoSelected(serverLocationInfo.countryCode)
      ? this.getCountryFlag(serverLocationInfo.countryCode)
      : null;
  }

  public getCountryFlag(countryCode: string): string {
    try {
      return new URL(`../assets/images/country_flags/${countryCode.toLowerCase()}.png`, import.meta.url).href;
    } catch (error: unknown) {
      console.log(error);
      return new URL(`../assets/images/country_flags/no-flag.png`, import.meta.url).href;
    }
  }

  public getImageUrl(imageName: string): string {
    return new URL(`../assets/images/${imageName}`, import.meta.url).href;
  }

  public isActiveClientProfile(clientProfileId: string): boolean {
    return clientProfileId === this.data.settings.userSettings.clientProfileId;
  }

  public isConnectApp(): boolean {
    return this.data.features.uiName === AppName.VpnHoodConnect;
  }

  public isSingleServerMode(): boolean {
    return this.isConnectApp() && this.data.clientProfileInfos.length === 1;
  }

  public isConnected(): boolean {
    return this.data.state.connectionState === AppConnectionState.Connected;
  }

  public getConnectionStateText(): string {
    if (this.data.state.isWaitingForAd && this.data.state.connectionState !== AppConnectionState.Connected)
      return i18n.global.t('LOADING_AD');

    return this.data.state.connectionState === AppConnectionState.None
      ? i18n.global.t('DISCONNECTED')
      : i18n.global.t(this.data.state.connectionState.toUpperCase());
  }

  public async clearLastError(): Promise<void> {
    this.data.uiState.stateLastErrorMessage = null;
    await this.apiClient.clearLastError();
    await this.reloadState();
  }

  public showGeneralSnackbar(message: string, bgColor?: string, textColor?: string): void {
    if (bgColor)
      this.data.uiState.generalSnackbarData.color = bgColor;
    if (textColor)
      this.data.uiState.generalSnackbarData.textColor = textColor;
    this.data.uiState.generalSnackbarData.message = message;
    this.data.uiState.generalSnackbarData.isShow = true;
  }

  //------------------------------------------
  // Just for VpnHoodConnect
  //------------------------------------------

  public async signIn(showLoading: boolean = true): Promise<void> {
    if (showLoading) this.data.uiState.showLoadingDialog = true;

    try {
      const accountClient = ClientApiFactory.instance.createAccountClient();
      await accountClient.signInWithGoogle();
      await this.loadAccount();
    } catch (err: unknown) {
      if (err instanceof ApiException && err.exceptionTypeName === 'TaskCanceledException')
        throw new Error(i18n.global.t('SIGN_IN_CANCELED_BY_USER'));

      throw err;
    } finally {
      if (showLoading) this.data.uiState.showLoadingDialog = false;
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
    // For developer
    console.log(`User Account: ${this.data.userState.userAccount}`);
    await this.reloadSettings();
  }
}
