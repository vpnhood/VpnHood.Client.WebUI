import {
  ApiException,
  AppClient,
  ClientProfileClient,
  ClientProfileInfo,
  ClientProfileUpdateParams,
  ConfigParams,
  ConnectPlanId,
  DeviceAppInfo,
  PatchOfBoolean,
  PatchOfString,
  SessionSuppressType
} from '@/services/VpnHood.Client.Api';
import { ClientApiFactory } from '@/services/ClientApiFactory';
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
import { VpnHoodAppData } from '@/services/VpnHoodAppData';

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

    // Show 'suppress to' message
    if (this.data.isConnected && this.data.state.sessionInfo?.suppressedTo &&
      this.data.state.sessionInfo?.suppressedTo === SessionSuppressType.Other &&
      this.data.uiState.userIgnoreSuppressToTime?.toString() !== this.data.state.connectRequestTime?.toString() &&
      !this.data.uiState.generalSnackbarData.isShow) {
      this.showGeneralSnackbar(i18n.global.t('SESSION_SUPPRESSED_TO_OTHER'), 'suppress-snackbar', false, undefined, true);
    }
  }

  private async reloadSettings(): Promise<void> {
    const config = await this.apiClient.getConfig();
    this.data.features = config.features;
    this.data.settings = config.settings;

    // Remove built-in client profile if the user is premium
    this.data.clientProfileInfos = this.data.userState.userAccount?.subscriptionId
      ? config.clientProfileInfos.filter(x => x.clientProfileId !== config.features.builtInClientProfileId)
      : config.clientProfileInfos;

    if (config.clientProfileInfos.length === 0)
      this.data.settings.userSettings.clientProfileId = null;
  }

  public async connect(
    clientProfileId: string,
    serverLocation: string | undefined,
    isPremium: boolean,
    planId: ConnectPlanId,
    isDiagnose: boolean = false,
    goToHome: boolean = true
  ): Promise<void> {

    // Update client profile
    await this.updateClientProfile(clientProfileId, new ClientProfileUpdateParams({
      isPremiumLocationSelected: new PatchOfBoolean({ value: isPremium ?? false }),
      selectedLocation: new PatchOfString({ value: serverLocation })
    }));

    // Update user settings
    this.data.settings.userSettings.clientProfileId = clientProfileId;
    await this.saveUserSetting();

    // Just for Development info
    console.log(`Final server location:  ${serverLocation}`);
    console.log(`Plan id:  ${planId}`);
    console.log(`Go to home:  ${planId}`);

    try {
      // Navigate to home page
      if (goToHome && router.currentRoute.value.name !== 'HOME')
        await router.replace({name: 'HOME'});

      this.data.uiState.uiConnectInProgress = true;

      if (isDiagnose)
        await this.diagnose();
      else
        await this.apiClient.connect(clientProfileId, serverLocation, planId);
    }
    catch (err: unknown) {
      console.log(err);
    }
    finally {
      // Reload to apply latest clientProfileInfos updates
      await this.reloadSettings();
      this.data.uiState.uiConnectInProgress = false;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      this.data.uiState.uiDisconnectInProgress = true;
      await this.apiClient.disconnect();
    }
    finally {
      await this.reloadState();
      this.data.uiState.uiDisconnectInProgress = false;
    }
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
      await router.replace({name: 'SERVERS'});
      return;
    }
    try {
      await this.apiClient.diagnose(this.data.settings.userSettings.clientProfileId);
    }
    catch (err: unknown) {
      console.log(err);
    }
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
    errorDialogData.removePremiumCode = text === i18n.global.t('PREMIUM_ACCESS_EXPIRED') && this.isPremiumAccount(true);

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
    const serverLocationInfo = this.data.state.sessionInfo?.serverLocationInfo ??
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

  public async clearLastError(): Promise<void> {
    this.data.uiState.stateLastErrorMessage = null;
    await this.apiClient.clearLastError();
    await this.reloadState();
  }

  public showGeneralSnackbar(message: string, bgColor?: string, hasTimer?: boolean, textColor?: string, hasCloseButton?: boolean,): void {
    this.data.uiState.generalSnackbarData.message = message;
    this.data.uiState.generalSnackbarData.bgColor = bgColor ?? 'highlight';
    this.data.uiState.generalSnackbarData.hasTimer = hasTimer ?? true;
    this.data.uiState.generalSnackbarData.textColor = textColor ?? null;
    this.data.uiState.generalSnackbarData.hasCloseBtn = hasCloseButton ?? null;
    this.data.uiState.generalSnackbarData.isShow = true;
  }

  public isPremiumAccount(byPremiumCode: boolean = false): boolean {
    // User is premium by code
    if (byPremiumCode)
      return (this.data.state.clientProfile?.isPremiumAccount == true) && (this.data.state.clientProfile?.hasAccessCode == true);

    // User purchased subscription from Google Play
    return this.data.state.clientProfile?.isPremiumAccount == true;
  }

  public async removePremiumCode(): Promise<void> {
    const profileId = this.data.state.clientProfile?.clientProfileId;
    if (!profileId)
      throw new Error('Could not find the profile id that have a premium code.');

    if (this.data.isConnected)
      await this.disconnect();

    await this.clientProfileClient.update(profileId, new ClientProfileUpdateParams({
      accessCode: new PatchOfString({ value: null })
    }));
  }

  public premiumIconColor(): string {
    return (!this.data.features.isPremiumFlagSupported || this.isPremiumAccount()) ? 'enable-premium' : 'disable-premium';
  }

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
    console.log('User Account: ', this.data.userState.userAccount);
    await this.reloadSettings();
  }

  public getEdgeToEdgeTopHeight(): number | null{
    let topHeight  = this.data.state.systemBarsInfo.topHeight;
    if (topHeight > 0)
      topHeight = Math.ceil(topHeight / window.devicePixelRatio) + 3;

    return topHeight > 0 ? topHeight : null;
  }

  public getEdgeToEdgeBottomHeight(): number | null{
    let bottomHeight  = this.data.state.systemBarsInfo.bottomHeight;
    if (bottomHeight > 0)
      bottomHeight = Math.ceil(bottomHeight / window.devicePixelRatio) + 3;

    return bottomHeight > 0 ? bottomHeight : null;
  }

}
