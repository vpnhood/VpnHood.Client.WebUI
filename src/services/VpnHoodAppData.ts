// VpnHoodAppData must be a separate class to prevents VpnHoodApp reactive
import { UiState } from '@/helpers/UiState';
import { UserState } from '@/helpers/UserState';
import {
  AppConnectionState,
  AppFeatures,
  AppSettings,
  AppState,
  ClientProfileInfo,
  UiCultureInfo
} from '@/services/VpnHood.Client.Api';
import i18n from '@/locales/i18n';

export class VpnHoodAppData {
  public readonly serverUrl: string | undefined = import.meta.env.VITE_API_BASE_URL;
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
    if (this.connectionState === AppConnectionState.WaitingForAd) {
      return i18n.global.t('LOADING_AD');
    }

    if (this.isUnstable) {
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
}
