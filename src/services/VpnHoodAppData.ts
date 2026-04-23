// VpnHoodAppData must be a separate class to prevent VpnHoodApp reactive
import { UiState } from '@/helpers/UiState';
import { UserState } from '@/helpers/UserState';
import {
  AppConnectionState,
  AppFeature,
  AppFeatures,
  DeviceIntentFeatures,
  AppState,
  ChannelProtocol,
  ClientProfileInfo,
  DnsMode,
  SplitCountryMode,
  UiCultureInfo,
  UserSettings,
  SplitAppMode
} from '@/services/VpnHood.Client.Api';
import i18n from '@/locales/i18n';

export class VpnHoodAppData {
  public readonly serverUrl: string | undefined = import.meta.env.VITE_API_BASE_URL;
  public uiState: UiState = new UiState();
  public userState: UserState = new UserState();
  public state: AppState;
  public userSettings: UserSettings;
  public features: AppFeatures;
  public intentFeatures: DeviceIntentFeatures;
  public clientProfileInfos: ClientProfileInfo[];
  public cultureInfos: UiCultureInfo[];
  public locale = i18n.global.t;

  public constructor(
    state: AppState,
    userSettings: UserSettings,
    features: AppFeatures,
    intentFeatures: DeviceIntentFeatures,
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
    switch (this.state.connectionState) {
      case AppConnectionState.None:
        return this.locale('DISCONNECTED');
      case AppConnectionState.Initializing:
        return this.locale('INITIALIZING');
      case AppConnectionState.Waiting:
        return this.locale('WAITING');
      case AppConnectionState.Diagnosing:
        return this.locale('DIAGNOSING');
      case AppConnectionState.ValidatingProxies:
        return this.locale('VALIDATING_PROXIES');
      case AppConnectionState.Connecting:
        return this.locale('CONNECTING');
      case AppConnectionState.Connected:
        return this.locale('CONNECTED');
      case AppConnectionState.Disconnecting:
        return this.locale('DISCONNECTING');
      case AppConnectionState.WaitingForAd:
        return this.locale('LOADING_AD');
      case AppConnectionState.FindingReachableServer:
        return this.locale('FINDING_NETWORK');
      case AppConnectionState.FindingBestServer:
        return this.locale('FINDING_BEST_SERVER');
      case AppConnectionState.Unstable:
        return this.locale('UNSTABLE');
    }
  }

  get isConnected(): boolean {
    return this.connectionState === AppConnectionState.Connected || this.connectionState === AppConnectionState.Unstable;
  }

  get isUnstable(): boolean {
    return this.state.connectionState === AppConnectionState.Unstable;
  }

  get premiumIconColor(): string {
    return (!this.features.isPremiumFlagSupported || this.isPremiumUser) ? 'enable-premium' : 'disable-premium';
  }

  get isSplitTunnelingActive(): boolean {
    const settingsActive = this.isSplitIpViaDeviceActive ||
      this.isSplitIpViaAppActive ||
      this.isSplitDomainActive ||
      this.userSettings.useSplitLocalNetwork ||
      this.isSplitAppsActive ||
      this.isSplitCountryActive;
    return settingsActive;
  }

  get isSplitDomainActive(): boolean {
    return this.userSettings.useSplitDomain && this.isPremiumFeatureAllowed(AppFeature.SplitDomain);
  }

  get isSplitIpViaDeviceActive(): boolean {
    return this.userSettings.useSplitIpViaDevice && this.isPremiumFeatureAllowed(AppFeature.SplitIpViaDevice);
  }

  get isSplitIpViaAppActive(): boolean {
    return this.userSettings.useSplitIpViaApp && this.isPremiumFeatureAllowed(AppFeature.SplitIpViaApp);
  }

  get isSplitAppsActive(): boolean {
    return this.userSettings.splitAppMode !== SplitAppMode.All;
  }

  get isSplitLocalNetworkActive(): boolean {
    return this.userSettings.useSplitLocalNetwork;
  }

  get isDnsCustomized(): boolean{
    if ( this.state.systemPrivateDns?.isActive)
      return true;

    return this.userSettings.dnsMode === DnsMode.AdapterDns && this.isPremiumFeatureAllowed(AppFeature.CustomDns);
  }


  get isCustomEndpointActive(): boolean {
    const customServerEndpoints = this.state.clientProfile?.customServerEndpoints;
    return !!customServerEndpoints && customServerEndpoints.length > 0;
  }

  get isPremiumUser(): boolean {
    return this.state.clientProfile?.isPremium == true;
  }
  get isAccessCodeFromAccount(): boolean{
    return this.state.clientProfile?.isAccessCodeFromAccount == true
  }

  get isPremiumByGoogle(): boolean{
    return this.isPremiumUser && this.isAccessCodeFromAccount;
  }
  get isPremiumByCode(): boolean{
    return this.isPremiumUser && !this.isAccessCodeFromAccount;
  }

  get canTryPremium(): boolean {
    return this.state.clientProfile?.canTryPremium == true;
  }
  get clientProfileId(): string | null{
    return this.state.clientProfile?.clientProfileId ?? this.userSettings.clientProfileId ?? null;
  }

  get edgeToEdgeTopHeight(): number | null {

    // Only available in the production mode.
    if (import.meta.env.DEV)
      return null;

    let topHeight = this.state.systemBarsInfo.topHeight;
    if (topHeight > 0)
      topHeight = Math.ceil(topHeight / window.devicePixelRatio) + 3;

    return topHeight > 0 ? topHeight : null;
  }

  get edgeToEdgeBottomHeight(): number | null {

    // Only available in the production mode.
    if (import.meta.env.DEV)
      return null;

    let bottomHeight = this.state.systemBarsInfo.bottomHeight;
    if (bottomHeight > 0)
      bottomHeight = Math.ceil(bottomHeight / window.devicePixelRatio) + 3;

    return bottomHeight > 0 ? bottomHeight : null;
  }

  get isNotificationEnabled(): boolean{
    return this.state.isNotificationEnabled === true
  }

  get activeProtocol(): ChannelProtocol{
    if (this.isConnected)
      return this.state.channelProtocol;
    return this.userSettings.channelProtocol;
  }

  public isProtocolEnabled(protocol: ChannelProtocol): boolean {
    if (this.state.sessionInfo)
      return this.state.sessionInfo.channelProtocols.includes(protocol);
    return this.isShowProtocol(protocol);
  }

  public isShowProtocol(protocol: ChannelProtocol): boolean {
    return this.features.channelProtocols.includes(protocol);
  }

  //Add padding to the pages for handle edge-to-edge feature
  public edgeToEdge(): void {

    // Only available in the production mode.
    if (import.meta.env.DEV)
      return;

    const paddingTop = this.edgeToEdgeTopHeight;
    const paddingBottom = this.edgeToEdgeBottomHeight;

    if (paddingTop === this.uiState.edgeToEdgeTop && paddingBottom === this.uiState.edgeToEdgeBottom)
      return;

    this.uiState.edgeToEdgeTop = paddingTop;
    this.uiState.edgeToEdgeBottom = paddingBottom;

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
    const locationToCheck = value ?? this.state.clientProfile?.selectedLocationInfo?.serverLocation;

    return autoSelectValues.includes(locationToCheck ?? '');
  }

  public isLocalNetworkAvailable(): boolean {
    if (!this.isConnected)
      return true;

    return this.state.sessionInfo?.isLocalNetworkAllowed === true;
  }

  public isPremiumFeature(appFeature: AppFeature): boolean {
    return this.features.premiumFeatures.includes(appFeature)
  }

  public isPremiumFeatureAllowed(appFeature : AppFeature): boolean {

    // not a premium feature
    if (!this.isPremiumFeature(appFeature))
      return true;

    // check if the current profile is premium
    return this.isPremiumUser;
  }

  get isSplitCountryActive(): boolean {
    return this.userSettings.splitCountryMode != SplitCountryMode.IncludeAll ||
          (this.userSettings.splitAppMode == SplitAppMode.Exclude && this.userSettings.splitApps.length > 0);
  }

  get splitCountryStatusText(): string {
    const mode = this.userSettings.splitCountryMode;
    const excludedCountries = this.userSettings.splitCountries ?? [];
    const allCountriesCount = this.uiState.allCountriesCount;
    const maxFlags = 3;

    if (mode === SplitCountryMode.IncludeAll)
      return this.locale('ALL');
    if (mode === SplitCountryMode.ExcludeMyCountry)
      return this.locale('EXCLUDE_MY_COUNTRY');
    if (mode === SplitCountryMode.ExcludeList) {
      const count = excludedCountries.length;
      if (count === 0) return this.locale('ALL');
      if (count < maxFlags) return this.locale('EXCLUDE');
      if (count < allCountriesCount / 2) return this.locale('ALL_EXCEPT_X', { x: count });
      return this.locale('ONLY_X', { x: allCountriesCount - count });
    }
    return this.locale('ALL');
  }

  get splitAppsStatusText(): string {
    const splitApps = this.userSettings.splitApps ?? [];
    switch (this.userSettings.splitAppMode) {
      case SplitAppMode.Exclude:
        return this.locale('ALL_EXCEPT_X', { x: splitApps.length });
      case SplitAppMode.Include:
        return this.locale('ONLY_X', { x: splitApps.length });
      default:
        return this.locale('ALL');
    }
  }
}
