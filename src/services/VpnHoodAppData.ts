// VpnHoodAppData must be a separate class to prevent VpnHoodApp reactive
import { UiState } from '@/helpers/UiState';
import { UserState } from '@/helpers/UserState';
import {
  AppConnectionState,
  AppFeatures,
  AppIntentFeatures,
  AppState,
  ClientProfileInfo,
  UiCultureInfo,
  UserSettings
} from '@/services/VpnHood.Client.Api';
import i18n from '@/locales/i18n';

export class VpnHoodAppData {
  public readonly serverUrl: string | undefined = import.meta.env.VITE_API_BASE_URL;
  public uiState: UiState = new UiState();
  public userState: UserState = new UserState();
  public state: AppState;
  public userSettings: UserSettings;
  public features: AppFeatures;
  public intentFeatures: AppIntentFeatures;
  public clientProfileInfos: ClientProfileInfo[];
  public cultureInfos: UiCultureInfo[];

  public constructor(
    state: AppState,
    userSettings: UserSettings,
    features: AppFeatures,
    intentFeatures: AppIntentFeatures,
    clientProfileInfos: ClientProfileInfo[],
    cultureInfos: UiCultureInfo[]
  ) {
    this.state = state;
    this.userSettings = userSettings;
    this.features = features;
    this.intentFeatures = intentFeatures;
    this.clientProfileInfos = clientProfileInfos;
    this.cultureInfos = cultureInfos;
  }

  get connectionState(): AppConnectionState {
    const orgConnectionState = this.state.connectionState;

    if (this.uiState.uiConnectInProgress && orgConnectionState === AppConnectionState.None) {
      return AppConnectionState.Connecting;
    }

    if (this.uiState.uiDisconnectInProgress && (
      orgConnectionState === AppConnectionState.Connected ||
      orgConnectionState === AppConnectionState.Connecting ||
      orgConnectionState === AppConnectionState.Initializing ||
      orgConnectionState === AppConnectionState.Waiting ||
      orgConnectionState === AppConnectionState.Unstable
    )) {
      return AppConnectionState.None;
    }

    return orgConnectionState === AppConnectionState.Unstable ? AppConnectionState.Connected : orgConnectionState;
  }

  get connectionStateText(): string {
    switch (this.connectionState) {
      case AppConnectionState.WaitingForAd:
        return i18n.global.t('LOADING_AD');
      case AppConnectionState.FindingReachableServer:
        return i18n.global.t('FINDING_REACHABLE_SERVER');
      case AppConnectionState.FindingBestServer:
        return i18n.global.t('FINDING_BEST_SERVER');
      case AppConnectionState.Unstable:
        return i18n.global.t('UNSTABLE');
    }

    return this.connectionState === AppConnectionState.None
      ? i18n.global.t('DISCONNECTED')
      : i18n.global.t(this.connectionState.toUpperCase());
  }

  get isConnected(): boolean {
    return this.connectionState === AppConnectionState.Connected || this.connectionState === AppConnectionState.Unstable;
  }

  get isUnstable(): boolean {
    return this.state.connectionState === AppConnectionState.Unstable;
  }

  get isPremiumFeatureAvailable(): boolean {
    return !this.features.isPremiumFlagSupported || this.isPremiumAccount();
  }

  get premiumIconColor(): string {
    return this.isPremiumFeatureAvailable ? 'enable-premium' : 'disable-premium';
  }

  // TODO: optimize this methods
  get isFilterIpAvailable(): boolean {
    return this.isFilterIpByAdapterAvailable || this.isFilterIpByAppAvailable;
  }
  get isFilterIpTurnOn(): boolean {
    return (this.userSettings.useVpnAdapterIpFilter && this.isFilterIpByAdapterAvailable) ||
      (this.userSettings.useAppIpFilter && this.isFilterIpByAppAvailable);
  }
  get isFilterIpByAdapterAvailable(): boolean {
    if (!this.features.isPremiumFlagSupported)
      return true;
    return this.isPremiumAccount() || this.userSettings.useVpnAdapterIpFilter;
  }
  get isFilterIpByAppAvailable(): boolean {
    if (!this.features.isPremiumFlagSupported)
      return true;
    return this.isPremiumAccount() || this.userSettings.useAppIpFilter;
  }

  public isLocalNetworkAvailable(): boolean {
    if (!this.isConnected)
      return true;

    return this.state.sessionInfo?.isLocalNetworkAllowed ?? true;
  }

  public isPremiumAccount(byPremiumCode: boolean = false): boolean {
    // User is premium by code
    if (byPremiumCode)
      return (this.state.clientProfile?.isPremiumAccount == true) && (this.state.clientProfile?.hasAccessCode == true);

    // User purchased subscription from Google Play
    return this.state.clientProfile?.isPremiumAccount == true;
  }
}
