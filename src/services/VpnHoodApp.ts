import {
  ApiException,
  AppClient,
  ClientProfileClient,
  ClientProfileInfo,
  ClientProfileUpdateParams,
  ConfigParams,
  ConnectPlanId,
  DeviceAppInfo, IntentsClient,
  PatchOfBoolean,
  PatchOfString,
  ServerLocationInfo,
  SessionSuppressType
} from '@/services/VpnHood.Client.Api';
import { ClientApiFactory } from '@/services/ClientApiFactory';
import { AppName, ComponentName, type ShowErrorActions } from '@/helpers/UiConstants';
import { ComponentRouteController } from '@/services/ComponentRouteController';
import { reactive } from 'vue';
import i18n from '@/locales/i18n';
import router from '@/services/router';
import { VhFirebaseApp } from '@/services/Firebase';
import { ErrorHandler } from '@/helpers/ErrorHandler';
import { VpnHoodAppData } from '@/services/VpnHoodAppData';

export class VpnHoodApp {
  public data: VpnHoodAppData;
  public apiClient: AppClient;
  public clientProfileClient: ClientProfileClient;
  public intentsClient: IntentsClient;
  public vhFirebase: VhFirebaseApp | null;
  private lastReloadNumber: number = 0;

  private constructor(apiClient: AppClient, clientProfileClient: ClientProfileClient, intentsClient: IntentsClient, appData: VpnHoodAppData, vhFirebase: VhFirebaseApp | null) {
    if (VpnHoodApp._instance)
      throw new Error('VpnHoodApp has been already initialized.');

    this.data = reactive(appData);
    this.apiClient = apiClient;
    this.clientProfileClient = clientProfileClient;
    this.intentsClient = intentsClient;
    this.vhFirebase = vhFirebase;
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
    const intentsClient: IntentsClient = ClientApiFactory.instance.createIntentClient();
    const config = await apiClient.configure(
      new ConfigParams({ availableCultures: i18n.global.availableLocales }));
    const appData = new VpnHoodAppData(
      config.state,
      config.userSettings,
      config.features,
      config.intentFeatures,
      config.clientProfileInfos,
      config.availableCultureInfos
    );

    let firebase: VhFirebaseApp | null = null;
    if (!import.meta.env.DEV)
      firebase = VhFirebaseApp.tryCreate(config.features.customData?.firebaseOptions, config.features.clientId);

    return new VpnHoodApp(apiClient, clientProfileClient, intentsClient, appData, firebase);
  }

  public async reloadState(): Promise<void> {
    // Only reload state for the last reload.
    this.lastReloadNumber++;
    const reloadNumber = this.lastReloadNumber;
    const state = await this.apiClient.getState();
    if (reloadNumber !== this.lastReloadNumber)
      return; // Discard old data
    this.data.state = state;

    // Setting has change and must reload
    if (this.data.uiState.configTime.getTime() !== this.data.state.configTime.getTime()) {
      this.data.uiState.configTime = this.data.state.configTime;
      await this.reloadSettings();
    }

    // Show the last error message if the user has not ignored
    if (this.data.state.lastError && this.data.uiState.stateLastErrorMessage !== this.data.state.lastError?.message) {
      this.data.uiState.stateLastErrorMessage = this.data.state.lastError.message;
      await this.processError(ApiException.fromApiError(this.data.state.lastError));
    }

    // Show the internal ad
    if (this.data.state.isWaitingForInternalAd)
      await router.replace({name: 'INTERNAL_AD'});
    // Show the Quick launch page if the internal ad is not shown
    else if (this.data.state.isQuickLaunchRecommended)
      await router.push({name: 'QUICK_LAUNCH'});

    // Show the update message if the user has not ignored or more than 24 hours have passed
    if (this.data.state.updaterStatus?.prompt)
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
    this.data.userSettings = config.userSettings;

    // Remove the built-in client profile if the user is premium
    this.data.clientProfileInfos = this.data.userState.userAccount?.subscriptionId
      ? config.clientProfileInfos.filter(x => x.clientProfileId !== config.features.builtInClientProfileId)
      : config.clientProfileInfos;

    if (config.clientProfileInfos.length === 0)
      this.data.userSettings.clientProfileId = null;
  }

  public async connect(
    clientProfileId: string,
    serverLocation: string | undefined,
    isPremium: boolean,
    planId: ConnectPlanId,
    isDiagnose: boolean = false,
    goToHome: boolean = true
  ): Promise<void> {

    // Just for Development info
    console.log(`Final server location:  ${serverLocation}`);
    console.log(`Plan id:  ${planId}`);
    console.log(`Go to home:  ${goToHome}`);

    // Navigate to home page
    if (goToHome && router.currentRoute.value.name !== 'HOME')
      await router.replace({ name: 'HOME' });

    this.data.uiState.uiConnectInProgress = true;

    try {
      if (isDiagnose)
        await this.diagnose();
      else
        await this.apiClient.connect(clientProfileId, serverLocation, planId);

      // ClientProfile will be updated after connecting.
      await this.updateClientProfile(clientProfileId, new ClientProfileUpdateParams({
        isPremiumLocationSelected: new PatchOfBoolean({ value: isPremium }),
        selectedLocation: new PatchOfString({ value: serverLocation })
      }));
      this.data.userSettings.clientProfileId = clientProfileId;
      await this.saveUserSetting();
    }
    finally {
      // Reload to apply the latest clientProfileInfos updates
      await this.reloadSettings();
      this.data.uiState.uiConnectInProgress = false;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      this.data.uiState.uiDisconnectInProgress = true;
      await this.apiClient.disconnect();
    } finally {
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
    await this.apiClient.setUserSettings(this.data.userSettings);
    await this.reloadState();
  }

  // Select a profile by user
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
    if (!this.data.userSettings.clientProfileId) {
      await router.replace({ name: 'SERVERS' });
      return;
    }
    try {
      await this.apiClient.diagnose(this.data.userSettings.clientProfileId);
    } catch (err: unknown) {
      console.log(err);
    }
  }

  // Get the error message
  public async processError(err: unknown): Promise<void> {
    // For developer
    console.error(err);
    console.log('Error is typeof: ', typeof err);

    await ErrorHandler.processError(err);
  }

  // Show error dialog
  public async showErrorMessage(text: string, action?: ShowErrorActions): Promise<void> {
    const errorDialogData = this.data.uiState.errorDialogData;
    errorDialogData.message = text;
    errorDialogData.showLogButton = this.data.state.promptForLog;
    errorDialogData.showDiagnoseButton = (action?.showDiagnose && !this.data.state.hasDiagnoseRequested) ?? false;
    errorDialogData.showChangeServerToAutoButton = action?.showChangeServerToAuto ?? false;
    errorDialogData.showRemovePremium = action?.showRemovePremium ?? false;

    await ComponentRouteController.showComponent(ComponentName.ErrorDialog);
  }

  // Get the installed apps list on the user device
  public getInstalledApps(): Promise<DeviceAppInfo[]> {
    return this.apiClient.getInstalledApps();
  }

  public async postPoneUpdate(): Promise<void> {
    await this.apiClient.versionCheckPostpone();
  }

  public async checkForUpdate(): Promise<void> {
    await this.apiClient.versionCheck();
  }

  getCurrentServerLocationInfo(): ServerLocationInfo | null | undefined {
    if (this.data.isConnected) {
      return this.data.state.sessionInfo?.serverLocationInfo ??
        this.data.state.clientProfile?.selectedLocationInfo;
    } else {
      return this.data.state.clientProfile?.selectedLocationInfo;
    }
  }

  getActiveServerCountryFlag(): string | null {
    const serverLocationInfo = this.getCurrentServerLocationInfo();
    return serverLocationInfo && !this.isLocationAutoSelected(serverLocationInfo.countryCode)
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

  public getAssetPath(fileName: string): string {
    return new URL(`../assets/images/${fileName}`, import.meta.url).href;
  }

  public isActiveClientProfile(clientProfileId: string): boolean {
    return clientProfileId === this.data.userSettings.clientProfileId;
  }

  public isConnectApp(): boolean {
    return this.data.features.uiName === AppName.VpnHoodConnect;
  }

  public isSingleServerMode(): boolean {
    return this.isConnectApp() && this.data.clientProfileInfos.length === 1;
  }

  public async clearLastError(): Promise<void> {
    this.data.uiState.stateLastErrorMessage = null;
    this.data.state.lastError = null;
    await this.apiClient.clearLastError();
    await this.reloadState();
  }

  public showGeneralSnackbar(message: string, bgColor?: string, hasTimer?: boolean, textColor?: string, hasCloseButton?: boolean): void {
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

  public async removePremium(): Promise<void> {
    if (this.data.clientProfileInfos.find(x => x.isForAccount))
      await this.removePremiumServerKey();
    else
      await this.removePremiumCode();
  }

  public async removePremiumServerKey(): Promise<void> {
    const premiumClientProfileId = this.data.clientProfileInfos.find(x => x.isForAccount)?.clientProfileId;
    if (!premiumClientProfileId)
      throw new Error('Could not find the premium server key.');

    await this.deleteClientProfile(premiumClientProfileId);
    await this.loadAccount(true);
  }

  public async removePremiumCode(): Promise<void> {
    const clientProfile = this.data.state.clientProfile;

    if (!clientProfile)
      throw new Error('Could not find the profile in the state for remove premium code.');

    if (!clientProfile.isPremiumAccount && !clientProfile.hasAccessCode)
      throw new Error('The profile is not for premium account or does not have premium code.');

    if (this.data.isConnected)
      await this.disconnect();

    await this.clientProfileClient.update(clientProfile.clientProfileId, new ClientProfileUpdateParams({
      accessCode: new PatchOfString({ value: null })
    }));
  }

  public premiumIconColor(): string {
    return (!this.data.features.isPremiumFlagSupported || this.isPremiumAccount()) ? 'enable-premium' : 'disable-premium';
  }

  public async signIn(onPurchase = false): Promise<void> {
    try {
      const accountClient = ClientApiFactory.instance.createAccountClient();
      await accountClient.signInWithGoogle();
      await this.loadAccount();
    } catch (err: unknown) {
      if (!(err instanceof ApiException)) throw err;

      const { exceptionTypeName, statusCode } = err;

      switch (exceptionTypeName) {
        case 'TaskCanceledException':
          if (onPurchase) {
            throw new Error(i18n.global.t('SIGN_IN_CANCELED_BY_USER'));
          }
          return; // Silent cancel if not a purchase

        case 'HttpRequestException':
          if (statusCode === 400) {
            throw new Error(i18n.global.t('LOGIN_CONNECTION_ERROR_MSG'));
          }

          // Just for VpnHoodConnect
          // When the SPA is signed in, but the app could not find the user account in the local storage.
          // Invalid credential.
          if (
            statusCode === 401 &&
            VpnHoodApp.instance.isConnectApp() &&
            !VpnHoodApp.instance.data.userState.userAccount
          ) {
            await VpnHoodApp.instance.signOut();
            throw new Error(i18n.global.t('AUTHENTICATION_ERROR'));
          }
          break;

        default:
          throw err;
      }
    }
  }

  public async signOut(): Promise<void> {
    const accountClient = ClientApiFactory.instance.createAccountClient();
    await accountClient.signOut();
    await this.loadAccount();
  }

  public async loadAccount(withRefresh: boolean = false): Promise<void> {
    const accountClient = ClientApiFactory.instance.createAccountClient();
    if (withRefresh)
      await accountClient.refresh();
    this.data.userState.userAccount = await accountClient.get();
    // For developer
    console.log('User Account: ', this.data.userState.userAccount);
    await this.reloadSettings();
  }

  public getEdgeToEdgeTopHeight(): number | null {
    let topHeight = this.data.state.systemBarsInfo.topHeight;
    if (topHeight > 0)
      topHeight = Math.ceil(topHeight / window.devicePixelRatio) + 3;

    return topHeight > 0 ? topHeight : null;
  }

  public getEdgeToEdgeBottomHeight(): number | null {
    let bottomHeight = this.data.state.systemBarsInfo.bottomHeight;
    if (bottomHeight > 0)
      bottomHeight = Math.ceil(bottomHeight / window.devicePixelRatio) + 3;

    return bottomHeight > 0 ? bottomHeight : null;
  }

  //Add padding to the pages for handle edge-to-edge feature
  public edgeToEdge(): void {
    const paddingTop = this.getEdgeToEdgeTopHeight();
    const paddingBottom = this.getEdgeToEdgeBottomHeight();

    if (paddingTop === this.data.uiState.edgeToEdgeTop && paddingBottom === this.data.uiState.edgeToEdgeBottom)
      return;

    this.data.uiState.edgeToEdgeTop = paddingTop;
    this.data.uiState.edgeToEdgeBottom = paddingBottom;

    // Unique ID for the injected style
    const styleId = 'edge-to-edge-style';

    // Find and remove existing style element
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = `
      .v-main > .v-sheet {
        ${paddingTop ? `padding-top: ${paddingTop}px !important;` : ''}
        ${paddingBottom ? `padding-bottom: ${paddingBottom}px !important;` : ''}
      }
    `;
    document.head.appendChild(styleElement);

  }

  public isLocationAutoSelected(value?: string): boolean {
    const autoSelectValues = ['*', '*/*'];
    const locationToCheck = value ?? this.data.state.clientProfile?.selectedLocationInfo?.serverLocation;

    return autoSelectValues.includes(locationToCheck ?? '');
  }

  public isFilterIpAvailable(): boolean {
    return this.isFilterIpByAdapterAvailable() || this.isFilterIpByAppAvailable();
  }
  public isFilterIpTurnOn(): boolean {
    return (this.data.userSettings.useVpnAdapterIpFilter && this.isFilterIpByAdapterAvailable()) ||
      (this.data.userSettings.useAppIpFilter && this.isFilterIpByAppAvailable());
  }
  public isFilterIpByAdapterAvailable(): boolean {
    if (!this.data.features.isPremiumFlagSupported)
      return true;
    return this.isPremiumAccount() || this.data.userSettings.useVpnAdapterIpFilter;
  }
  public isFilterIpByAppAvailable(): boolean {
    if (!this.data.features.isPremiumFlagSupported)
      return true;
    return this.isPremiumAccount() || this.data.userSettings.useAppIpFilter;
  }
  public isIncludeLocalNetworkAvailable(): boolean {
    const isLocalNetworkAllowed: boolean | undefined = this.data.state.sessionInfo?.isLocalNetworkAllowed;

    if (this.data.isConnected){
      if (!this.data.features.isPremiumFlagSupported || this.isPremiumAccount() || this.data.userSettings.includeLocalNetwork)
        return  isLocalNetworkAllowed !== undefined ? isLocalNetworkAllowed : true;

      return false;
    }
    else {
      return !this.data.features.isPremiumFlagSupported || this.isPremiumAccount() || this.data.userSettings.includeLocalNetwork;
    }
  }

}
