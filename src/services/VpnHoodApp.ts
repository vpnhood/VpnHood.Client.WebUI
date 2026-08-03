import {
  ApiException,
  AppClient,
  AppFeatures,
  ClientProfileClient,
  ClientProfileInfo,
  ClientProfileUpdateParams,
  ConfigParams,
  DeviceAppInfo,
  IntentsClient,
  PatchOfBoolean,
  PatchOfString,
  ProxyEndPointClient,
  SessionSuppressType,
} from '@/services/VpnHood.Client.Api';
import { ClientApiFactory } from '@/services/ClientApiFactory';
import { AppName, ComponentName } from '@/helpers/UiConstants';
import type { ShowErrorActions } from '@/helpers/ErrorHandler';
import { ComponentRouteController } from '@/services/ComponentRouteController';
import { reactive } from 'vue';
import i18n, { availableLocales } from '@/locales/i18n';
import router from '@/services/router';
import type { VhFirebaseApp } from '@/services/Firebase';
import { ErrorHandler } from '@/helpers/ErrorHandler';
import { VpnHoodAppData } from '@/services/VpnHoodAppData';
import { createDeferred, type Deferred } from '@/helpers/Deferred';
import { type ConnectParams } from '@/helpers/ConnectParams';

export class VpnHoodApp {
  public data: VpnHoodAppData;
  public appClient: AppClient;
  public clientProfileClient: ClientProfileClient;
  public intentsClient: IntentsClient;
  public proxyEndPointClient: ProxyEndPointClient;
  public vhFirebase: VhFirebaseApp | null;
  public confirmDialogDeferred: Deferred<boolean> | null = null;
  public errorDialogModel: ComponentRouteController;
  private lastReloadNumber: number = 0;
  private isSaving: boolean = false;

  private constructor(
    appClient: AppClient,
    clientProfileClient: ClientProfileClient,
    intentsClient: IntentsClient,
    proxyEndPointClient: ProxyEndPointClient,
    appData: VpnHoodAppData,
    vhFirebase: VhFirebaseApp | null,
  ) {
    if (VpnHoodApp._instance) throw new Error('VpnHoodApp has been already initialized.');

    this.data = reactive(appData);
    this.appClient = appClient;
    this.clientProfileClient = clientProfileClient;
    this.intentsClient = intentsClient;
    this.proxyEndPointClient = proxyEndPointClient;
    this.vhFirebase = vhFirebase;
    this.errorDialogModel = new ComponentRouteController(ComponentName.ErrorDialog);
    this.data.uiState.configTime = this.data.state.configTime;
    this.data.uiState.isReportSendingAvailable = vhFirebase !== null;
    VpnHoodApp._instance = this;
  }

  public static get instance(): VpnHoodApp {
    if (VpnHoodApp._instance == null) throw new Error('VpnHoodApp has not been initialized.');
    return VpnHoodApp._instance;
  }

  private static _instance: VpnHoodApp | null;

  public static async create(): Promise<VpnHoodApp> {
    const apiClient: AppClient = ClientApiFactory.instance.createAppClient();
    const clientProfileClient: ClientProfileClient = ClientApiFactory.instance.createClientProfileClient();
    const intentsClient: IntentsClient = ClientApiFactory.instance.createIntentClient();
    const proxyEndpointClient: ProxyEndPointClient = ClientApiFactory.instance.createProxyEndPointClient();
    // availableLocales, not i18n.global.availableLocales: only the fallback is loaded at this point,
    // so asking the i18n instance would report a single culture to the backend.
    const config = await apiClient.configure(new ConfigParams({ availableCultures: availableLocales }));
    const appData = new VpnHoodAppData(
      config.state,
      config.userSettings,
      config.features,
      config.intentFeatures,
      config.clientProfileInfos,
      config.availableCultureInfos,
    );

    const firebase = import.meta.env.DEV || !config.userSettings.allowAnonymousTracker
      ? null
      : await VpnHoodApp.createFirebase(config.features);

    return new VpnHoodApp(apiClient, clientProfileClient, intentsClient, proxyEndpointClient, appData, firebase);
  }

  // Firebase does analytics and report uploads. Loading it as its own chunk keeps the SDK out of
  // the startup bundle, but it stays best-effort: tryCreate already degrades to null on a bad
  // config, so a chunk that fails to load must degrade the same way rather than fail the launch.
  //
  // Only ever called once the user's allowAnonymousTracker consent is known to be granted. Merely
  // constructing the SDK contacts Google (installations + remote config) and stamps a persistent
  // per-install id via setUserId, so an opted-out user must not reach it at all — disabling
  // collection after the fact would be too late.
  private static async createFirebase(features: AppFeatures): Promise<VhFirebaseApp | null> {
    try {
      const { VhFirebaseApp } = await import('@/services/Firebase');

      return VhFirebaseApp.tryCreate(features.customData?.firebaseOptions, features.clientId);
    }
    catch (err: unknown) {
      console.error('Firebase: Failed to load the Firebase module.', err);
      return null;
    }
  }

  // The consent toggle can flip at any time from the settings page while the SDK was decided once at
  // startup, so neither direction may be left stale: withdrawing consent must silence a live SDK, and
  // granting it must not force a restart to take effect.
  private async syncAnalyticsConsent(): Promise<void> {
    if (import.meta.env.DEV) return;

    if (!this.data.userSettings.allowAnonymousTracker) {
      this.vhFirebase?.setCollectionEnabled(false);
      this.vhFirebase = null;
    }
    else if (this.vhFirebase) this.vhFirebase.setCollectionEnabled(true);
    else this.vhFirebase = await VpnHoodApp.createFirebase(this.data.features);

    this.data.uiState.isReportSendingAvailable = this.vhFirebase !== null;
  }

  public async reloadState(): Promise<void> {
    if (this.isSaving) return;

    // Only reload state for the last reload.
    this.lastReloadNumber++;
    const reloadNumber = this.lastReloadNumber;
    const state = await this.appClient.getState();

    if (reloadNumber !== this.lastReloadNumber) return; // Discard old data
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
    if (this.data.state.isWaitingForInternalAd) await router.replace({ name: 'INTERNAL_AD' });
    // Show the Quick launch page if the internal ad is not shown
    else if (this.data.state.isQuickLaunchRecommended) await router.push({ name: 'QUICK_LAUNCH' });

    // Show the update message if the user has not ignored or more than 24 hours have passed
    if (this.data.state.updaterStatus?.prompt) this.data.uiState.showUpdateSnackbar = true;

    // Show 'suppress to' message
    if (
      this.data.isConnected &&
      this.data.state.sessionInfo?.suppressedTo &&
      this.data.state.sessionInfo?.suppressedTo === SessionSuppressType.Other &&
      this.data.uiState.userIgnoreSuppressToTime?.toString() !== this.data.state.connectRequestTime?.toString() &&
      !this.data.uiState.generalSnackbarState.isShow
    ) {
      this.showGeneralSnackbar(
        i18n.global.t('SESSION_SUPPRESSED_TO_OTHER'),
        'suppress-snackbar',
        false,
        undefined,
        true,
      );
    }
  }

  private async reloadSettings(): Promise<void> {
    const config = await this.appClient.getConfig();
    this.data.features = config.features;
    this.data.userSettings = config.userSettings;

    // Remove the built-in client profile if the user is premium
    this.data.clientProfileInfos = config.clientProfileInfos;

    // userSettings just came back from the backend, so this is the one place that sees every change
    // to the analytics consent flag regardless of which page made it.
    await this.syncAnalyticsConsent();

    if (config.clientProfileInfos.length === 0) this.data.userSettings.clientProfileId = null;

    // select first profile if the current selected profile is not exist anymore after reload
    if (
      this.data.userSettings.clientProfileId &&
      !config.clientProfileInfos.some((p) => p.clientProfileId === this.data.userSettings.clientProfileId)
    )
      this.data.userSettings.clientProfileId = config.clientProfileInfos[0]?.clientProfileId ?? null;
  }

  public async connect(connectParams: ConnectParams): Promise<void> {
    // Just for Development info
    console.debug(`connect. Serverlocation: ${connectParams.serverLocation}, Planid: ${connectParams.planId}, GoTohome: ${connectParams.goToHome}`);

    // Navigate to home page
    if ((connectParams.goToHome ?? true) && router.currentRoute.value.name !== 'HOME')
       await router.replace({ name: 'HOME' });

    this.data.uiState.uiConnectInProgress = true;

    try {
      if (connectParams.isDiagnose) await this.diagnose();
      else await this.appClient.connect(connectParams.clientProfileId, connectParams.serverLocation, connectParams.planId);

      // ClientProfile will be updated after connecting.
      await this.updateClientProfile(
        connectParams.clientProfileId,
        new ClientProfileUpdateParams({
          isPremiumLocationSelected: new PatchOfBoolean({ value: connectParams.isPremium }),
          selectedLocation: new PatchOfString({ value: connectParams.serverLocation }),
        }),
      );
      this.data.userSettings.clientProfileId = connectParams.clientProfileId;
      await this.saveUserSetting();
    } finally {
      // Reload to apply the latest clientProfileInfos updates
      await this.reloadSettings();
      this.data.uiState.uiConnectInProgress = false;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      this.data.uiState.uiDisconnectInProgress = true;
      await this.appClient.disconnect();
    } finally {
      await this.reloadState();
      this.data.uiState.uiDisconnectInProgress = false;
    }
  }

  public getAppVersion(isFull: boolean): string {
    const fullVersion: string = this.data.features.version;
    return isFull ? fullVersion.substring(0, fullVersion.lastIndexOf('.')) : fullVersion.split('.')[2];
  }

  // Save any change by user
  public async saveUserSetting(): Promise<void> {
    try {
      this.isSaving = true;
      await this.appClient.setUserSettings(this.data.userSettings);
    } finally {
      this.isSaving = false;
    }

    await this.reloadState();
  }

  // Select a profile by user
  public async updateClientProfile(
    clientProfileId: string,
    clientProfileUpdateParam: ClientProfileUpdateParams,
  ): Promise<void> {
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
    try {
      await this.appClient.diagnose(this.data.userSettings.clientProfileId);
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
    const errorDialogState = this.data.uiState.errorDialogState;
    errorDialogState.message = text;
    errorDialogState.showLogButton = this.data.state.promptForLog;
    errorDialogState.showDiagnoseButton = (action?.showDiagnose && !this.data.state.hasDiagnoseRequested) ?? false;
    errorDialogState.showChangeServerToAutoButton = action?.showChangeServerToAuto ?? false;
    errorDialogState.showRemovePremium = action?.showRemovePremium ?? false;
    errorDialogState.showTryPremium = action?.showTryPremium ?? false;

    await this.errorDialogModel.show(true);
  }

  // Get the installed apps list on the user device
  public getInstalledApps(): Promise<DeviceAppInfo[]> {
    return this.appClient.getInstalledApps();
  }

  public async postPoneUpdate(): Promise<void> {
    await this.appClient.versionCheckPostpone();
  }

  public async checkForUpdate(): Promise<void> {
    await this.appClient.versionCheck();
  }

  public getCountryFlag(countryCode: string | null | undefined): string {
    try {
      if (!countryCode || countryCode.trim() === '') {
        return new URL(`../assets/images/country_flags/no-flag.png`, import.meta.url).href;
      }
      return new URL(`../assets/images/country_flags/${countryCode.toLowerCase()}.png`, import.meta.url).href;
    } catch (error: unknown) {
      console.log(error);
      return new URL(`../assets/images/country_flags/no-flag.png`, import.meta.url).href;
    }
  }

  public isActiveClientProfile(clientProfileId: string): boolean {
    return clientProfileId === this.data.userSettings.clientProfileId;
  }

  public isConnectApp(): boolean {
    return this.data.features.uiName === AppName.VpnHoodConnect;
  }

  // Does this build collect anonymous data at all? isAnonymousTrackerSupported answers for the native
  // side — it is false when the tracker collapsed to a NullTracker — but this WebView has analytics of its
  // own, which a build enables by shipping firebaseOptions. Either engine makes the consent real; neither
  // means there is nothing to consent to, and the privacy page must not claim otherwise.
  public isAnonymousTrackerSupported(): boolean {
    return this.data.features.isAnonymousTrackerSupported ||
      !!this.data.features.customData?.firebaseOptions;
  }

  public isSingleProfileMode(): boolean {
    return this.isConnectApp();
  }

  public async clearLastError(): Promise<void> {
    this.data.uiState.stateLastErrorMessage = null;
    await this.appClient.clearLastError();
    this.data.state.lastError = null;
    await this.reloadState();
  }

  public showGeneralSnackbar(
    message: string,
    bgColor: string = 'highlight',
    hasTimer: boolean = true,
    textColor?: string,
    hasCloseButton?: boolean,
  ): void {
    this.data.uiState.generalSnackbarState.message = message;
    this.data.uiState.generalSnackbarState.bgColor = bgColor;
    this.data.uiState.generalSnackbarState.hasTimer = hasTimer;
    this.data.uiState.generalSnackbarState.textColor = textColor ?? null;
    this.data.uiState.generalSnackbarState.hasCloseBtn = hasCloseButton ?? null;
    this.data.uiState.generalSnackbarState.isShow = true;
  }

  public async removePremiumCode(): Promise<void> {
    const clientProfile = this.data.state.clientProfile;

    if (!clientProfile) throw new Error('Could not find the profile in the state for remove premium code.');

    if (!clientProfile.hasAccessCode) throw new Error('The profile does not have a premium code.');

    if (this.data.isConnected) await this.disconnect();

    await this.clientProfileClient.update(
      clientProfile.clientProfileId,
      new ClientProfileUpdateParams({
        accessCode: new PatchOfString({ value: null }),
      }),
    );

    if (this.data.userState.userAccount?.subscriptionId) await this.loadAccount(true);
  }

  public async signIn(onPurchase = false): Promise<void> {
    this.data.uiState.showLoadingDialog = true;
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
    } finally {
      this.data.uiState.showLoadingDialog = false;
    }
  }

  public async signOut(): Promise<void> {
    const result = await this.showConfirmDialog(
      i18n.global.t('CONFIRM_SIGN_OUT_TITLE'),
      i18n.global.t('CONFIRM_SIGN_OUT_DESC'),
    );
    if (!result) return;

    const accountClient = ClientApiFactory.instance.createAccountClient();
    await accountClient.signOut();
    await this.loadAccount();
    await router.replace({ name: 'HOME' });
  }

  public async loadAccount(withRefresh: boolean = false): Promise<void> {
    const accountClient = ClientApiFactory.instance.createAccountClient();
    if (withRefresh) await accountClient.refresh();
    this.data.userState.userAccount = await accountClient.get();
    // For developer
    console.debug(
      'IsPremiumUser: ',
      this.data.isPremiumUser,
      ' IsAccessCodeFromAccount: ',
      this.data.state.clientProfile?.isAccessCodeFromAccount,
      ' CanGoPremium: ',
      this.data.state.clientProfile?.canGoPremium,
      ' isPremiumFlagSupported: ',
      this.data.features.isPremiumFlagSupported,
      'User Account: ',
      this.data.userState.userAccount,
    );
    await this.reloadSettings();
  }

  public showConfirmDialog(title: string, message: string): Promise<boolean> {
    const confirmDialogState = this.data.uiState.confirmDialogState;
    confirmDialogState.isShow = true;
    confirmDialogState.title = title;
    confirmDialogState.message = message;

    this.confirmDialogDeferred = createDeferred<boolean>();
    return this.confirmDialogDeferred.promise;
  }
}
