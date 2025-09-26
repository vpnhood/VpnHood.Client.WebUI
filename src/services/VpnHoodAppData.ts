// VpnHoodAppData must be a separate class to prevent VpnHoodApp reactive
import { UiState } from '@/helpers/UiState';
import { UserState } from '@/helpers/UserState';
import {
  AppConnectionState, AppFeature,
  AppFeatures,
  AppIntentFeatures,
  AppState, ChannelProtocol,
  ClientProfileInfo, DnsMode,
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
  public locale = i18n.global.t;

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
    return (!this.features.isPremiumFlagSupported || this.isPremiumAccount) ? 'enable-premium' : 'disable-premium';
  }

  get isSplitIpInUse(): boolean {
    return this.userSettings.useVpnAdapterIpFilter || this.userSettings.useAppIpFilter;
  }

  get isDnsInUse(): boolean{
    return this.state.systemPrivateDns?.isActive || this.userSettings.dnsMode === DnsMode.AdapterDns;
  }

  get isCustomEndpointInUse(): boolean {
    const customServerEndpoints = this.state.clientProfile?.customServerEndpoints;
    return !!customServerEndpoints && customServerEndpoints.length > 0;
  }

  get isPremiumAccount(): boolean {
    return this.state.clientProfile?.isPremiumAccount == true;
  }

  get hasPremiumCode(): boolean{
    return this.state.clientProfile?.hasAccessCode == true
  }

  get getEdgeToEdgeTopHeight(): number | null {
    let topHeight = this.state.systemBarsInfo.topHeight;
    if (topHeight > 0)
      topHeight = Math.ceil(topHeight / window.devicePixelRatio) + 3;

    return topHeight > 0 ? topHeight : null;
  }

  get getEdgeToEdgeBottomHeight(): number | null {
    let bottomHeight = this.state.systemBarsInfo.bottomHeight;
    if (bottomHeight > 0)
      bottomHeight = Math.ceil(bottomHeight / window.devicePixelRatio) + 3;

    return bottomHeight > 0 ? bottomHeight : null;
  }

  get isNotificationEnabled(): boolean{
    return this.state.isNotificationEnabled === true
  }

  get getActiveProtocol(): ChannelProtocol{
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
    const paddingTop = this.getEdgeToEdgeTopHeight;
    const paddingBottom = this.getEdgeToEdgeBottomHeight;

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
    return this.isPremiumAccount;
  }
}
