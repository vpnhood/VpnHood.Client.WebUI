<script setup lang="ts">
import { AppConnectionState, FilterMode } from '@/services/VpnHood.Client.Api';
import TunnelClientCountryDialog from '@/components/TunnelClientCountryDialog.vue';
import ProtocolDialog from '@/components/ProtocolDialog.vue';
import HomeAppBar from '@/components/HomeAppBar.vue';
import UpdateSnackbar from '@/components/UpdateSnackbar.vue';
import { ComponentRouteController } from '@/services/ComponentRouteController';
import HomeConnectionInfo from '@/components/HomeConnectionInfo.vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import router from '@/services/router';
import { ConnectManager } from '@/helpers/ConnectManager';
import { ComponentName } from '@/helpers/UiConstants';
import { Util } from '@/helpers/Util';
import CountDown from '@/components/CountDown.vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;
let lastConnectPressedTime = Date.now() - 1000;

async function onConnectButtonClick(): Promise<void> {

  // Prevent double click
  if (lastConnectPressedTime >= Date.now() - 1000)
    return;

  lastConnectPressedTime = Date.now();

  // Disconnect
  if (vhApp.data.state.canDisconnect) {
    await vhApp.disconnect();
    return;
  }

  // Connect
  if (vhApp.data.state.canConnect){
    await ConnectManager.connect1(false);
  }
}
function udpProtocolButtonText(): string {
  const { dropQuic, useUdpChannel } = vhApp.data.settings.userSettings;
  if (vhApp.data.state.connectionState === AppConnectionState.Connected &&
    !vhApp.data.state.sessionInfo?.isUdpChannelSupported) {
    return dropQuic ? locale("PROTOCOL_DROP_QUIC") : locale("PROTOCOL_TCP");
  }
  return useUdpChannel ? locale('PROTOCOL_UDP') : (dropQuic ? locale("PROTOCOL_DROP_QUIC") : locale("PROTOCOL_TCP"));
}
function isShowCountdown(): boolean{
  const hasExpireTime = !!vhApp.data.state.sessionInfo?.accessInfo?.expirationTime;
  return !vhApp.isPremiumAccount() && hasExpireTime && vhApp.isConnected();
}
function getActiveServerNameOrLocation(): string {
  // App is VpnHoodClient
  if (!vhApp.isSingleServerMode() && !vhApp.isConnectApp())
    return (vhApp.data.state.clientProfile?.clientProfileName ?? i18n.global.t('NO_SERVER_SELECTED'));

  // App is VpnHoodCONNECT
  const serverLocationInfo = vhApp.data.state.sessionInfo?.serverLocationInfo ??
    vhApp.data.state.clientProfile?.selectedLocationInfo;
  if (!serverLocationInfo || Util.isLocationAutoSelected(serverLocationInfo.countryCode))
    return i18n.global.t('AUTO_SELECT');

  const text = Util.isLocationAutoSelected(serverLocationInfo.regionName)
    ? serverLocationInfo.countryName
    : serverLocationInfo.countryName + ' (' + serverLocationInfo.regionName + ')';

  return text.replace('United States (', 'USA (');
}

// Return text for connect button based on connection state
function connectButtonText(): string {
  if (!vhApp.data.state.canDiagnose &&
    (vhApp.data.state.connectionState === AppConnectionState.Connected
      || vhApp.data.state.connectionState === AppConnectionState.Connecting))
    return locale('STOP_DIAGNOSING');
  else
    switch (vhApp.data.state.connectionState) {
      case AppConnectionState.Initializing:
        return locale('INITIALIZING');
      case AppConnectionState.Connecting:
        return locale('DISCONNECT');
      case AppConnectionState.Waiting:
        return locale('DISCONNECT');
      case AppConnectionState.Connected:
        return locale('DISCONNECT');
      case AppConnectionState.Disconnecting:
        return locale('DISCONNECTING');
      case AppConnectionState.Diagnosing:
        return locale('STOP_DIAGNOSING');
      default:
        return locale('CONNECT');
    }
}

// Return connection download and upload speed based on Mbps
function formatSpeed(speed: number): string | void {
  return ((speed * 10) / 1000000).toFixed(2);
}

// Return status of filtered apps by user (Only in mobile)
function appFilterStatus(): string {
  let appFilters = vhApp.data.settings.userSettings.appFilters;
  if (!appFilters) appFilters = [];

  switch (vhApp.data.settings.userSettings.appFiltersMode) {
    case FilterMode.Exclude:
      return locale('APP_FILTER_STATUS_EXCLUDE', { x: appFilters.length });
    case FilterMode.Include:
      return locale('APP_FILTER_STATUS_INCLUDE', { x: appFilters.length });
    default:
      return locale('APP_FILTER_STATUS_ALL');
  }
}
</script>

<template>

  <!-- App bar -->
  <HomeAppBar />

  <v-row align-content="space-between" justify="center" class="fill-height v-row--no-gutters mx-3 pb-4">

    <!-- Go Premium or Countdown button -->
    <v-col cols="12" class="text-center">

      <!-- Countdown and extend session button -->
      <CountDown v-if="isShowCountdown()"/>

      <!-- You are premium button -->
      <v-chip v-else-if="vhApp.isPremiumAccount()"
              prepend-icon="mdi-crown"
              :text="locale('YOU_ARE_PREMIUM')"
              color="enable-premium"
              variant="tonal"
              tag="h6"
              @click="router.push('/premium-user')"
      />

      <!-- Go Premium button for guest user -->
      <v-btn
        v-else-if="vhApp.data.state.clientProfile?.selectedLocationInfo?.options.canGoPremium"
        :flat="true"
        variant="outlined"
        color="go-premium-btn"
        rounded="pill"
        size="small"
        height="35"
        @click="router.push('/purchase-subscription')"
        class="ps-1 pe-3 text-capitalize"
      >
        <v-icon
          icon="mdi-crown"
          size="25"
          class="bg-go-premium-btn rounded-circle me-2"
        />
        {{ locale('GO_PREMIUM') }}
      </v-btn>

    </v-col>

    <!-- Speed & Circle & Connect button -->
    <v-col cols="12" :class="'text-center state-' + [vhApp.data.state.connectionState.toLowerCase()]">
      <!-- Speed -->
      <v-row align-content="center" justify="center"
              :class="[vhApp.isConnected() ? 'opacity-100' : 'opacity-0','mb-2']">
        <v-col cols="auto d-inline-flex align-center">
          <v-icon color="active" size="small" icon="mdi-arrow-up-thin"/>
          <span class="pe-1 text-body-2 text-white" dir="ltr">
            {{formatSpeed(vhApp.data.state.sessionStatus?.speed.received ?? 1)}}
          </span>
          <span class="text-white opacity-40" style="font-size: 10px">Mbps</span>
        </v-col>
        <v-col cols="auto d-inline-flex align-center">
          <v-icon color="error" size="small" icon="mdi-arrow-down-thin"/>
          <span class="pe-1 text-body-2 text-white" dir="ltr">
            {{formatSpeed(vhApp.data.state.sessionStatus?.speed.sent ?? 1) }}
          </span>
          <span class="text-white opacity-40 order-last" style="font-size: 10px">Mbps</span>
        </v-col>
      </v-row>

      <!-- Circle -->
      <HomeConnectionInfo />

      <!-- Connect button -->
      <v-btn
        id="connectBtn"
        height="40px"
        min-width="180px"
        rounded="pill"
        :disabled="vhApp.data.state.connectionState == AppConnectionState.Disconnecting ||
          vhApp.data.state.connectionState === AppConnectionState.Initializing"
        class="font-weight-bold mt-5"
        :class="{'connected': vhApp.data.state.connectionState === AppConnectionState.Connected}"
        :text="connectButtonText()"
        @click="onConnectButtonClick"
      />

    </v-col>

    <!-- Config buttons -->
    <v-col cols="12">

      <!-- Servers button -->
      <home-config-btn
        id="serverButton"
        prepend-icon="mdi-earth"
        class="align-center mb-1"
        @click="!vhApp.data.features.isAddAccessKeySupported && vhApp.data.clientProfileInfos.length < 2
            && vhApp.data.clientProfileInfos[0].locationInfos.length < 2
            ? vhApp.showErrorMessage(locale('NO_ADDITIONAL_LOCATION_AVAILABLE'), false)
            : router.push('/servers')"
      >
        <span tabindex="-1">{{ vhApp.isSingleServerMode() ? locale('LOCATION') : locale('SERVER') }}</span>
        <v-icon :icon="Util.getLocalizedRightChevron()" />
        <v-chip tabindex="-1" :text="getActiveServerNameOrLocation()" class="px-0"/>

        <template v-slot:append>
          <span v-if="vhApp.getActiveServerCountryFlag()"
                class="overflow-hidden d-inline-flex align-center justify-center ms-1"
                style="width: 23px; height: 15px; border-radius: 3px"
          >
            <img :src="vhApp.getActiveServerCountryFlag()!" height="100%" alt="country flag" />
          </span>
          <v-chip v-else :text="locale('AUTO')" color="white" variant="tonal" />
        </template>
      </home-config-btn>

      <!-- Exclude country button -->
      <home-config-btn
        id="excludeCountryButton"
        prepend-icon="mdi-call-split"
        class="mb-1"
        @click="ComponentRouteController.showComponent(ComponentName.TunnelClientCountryDialog)"
      >
        <span>{{ locale('COUNTRIES') }}</span>
        <v-icon :icon="Util.getLocalizedRightChevron()" />
        <v-chip :text="vhApp.data.settings.userSettings.tunnelClientCountry
              ? locale('IP_FILTER_ALL') : locale('IP_FILTER_STATUS_EXCLUDE_CLIENT_COUNTRY')" class="px-0"/>
        <template v-if="!vhApp.data.settings.userSettings.tunnelClientCountry && vhApp.data.state.clientCountryCode" v-slot:append>
              <span
                class="overflow-hidden d-inline-flex align-center justify-center ms-1"
                style="width: 23px; height: 15px; border-radius: 3px"
              >
                <img :src="vhApp.getCountryFlag(vhApp.data.state.clientCountryCode)" height="100%" alt="country flag"/>
              </span>
        </template>
      </home-config-btn>

      <!-- App filter button -->
      <home-config-btn
        v-if="vhApp.data.features.isExcludeAppsSupported || vhApp.data.features.isIncludeAppsSupported"
        prepend-icon="mdi-call-split"
        class="mb-1"
        to="/apps-filter"
      >
        <span>{{ locale('APPS') }}</span>
        <v-icon :icon="Util.getLocalizedRightChevron()" />
        <v-chip :text="appFilterStatus()" class="px-0"/>
      </home-config-btn>

      <!-- Protocol button -->
      <home-config-btn
        prepend-icon="mdi-transit-connection-variant"
        @click="ComponentRouteController.showComponent(ComponentName.ProtocolDialog)"
      >
        <span>{{ locale('PROTOCOL_TITLE') }}</span>
        <v-icon :icon="Util.getLocalizedRightChevron()" />
        <v-chip :text="udpProtocolButtonText()" class="px-0" />
      </home-config-btn>

    </v-col>
  </v-row>

  <!-- Components -->
  <UpdateSnackbar v-model="vhApp.data.uiState.showUpdateSnackbar" />
  <TunnelClientCountryDialog v-model="ComponentRouteController.create(ComponentName.TunnelClientCountryDialog).isShow"/>
  <ProtocolDialog v-model="ComponentRouteController.create(ComponentName.ProtocolDialog).isShow" />

</template>

<!--suppress CssUnresolvedCustomProperty, CssUnusedSymbol -->
<style scoped>
#connectBtn {
  transition: all 0.4s ease;
  background-image: linear-gradient(to right, rgb(var(--v-theme-connect-btn-disconnected-grad-1)),
  rgb(var(--v-theme-connect-btn-disconnected-grad-2)) 90%) !important;
  color: rgb(var(--v-theme-on-connect-btn-disconnected));
}

#connectBtn.connected {
  background-image: linear-gradient(to right, rgb(var(--v-theme-connect-btn-connected)),
  rgb(var(--v-theme-connect-btn-connected)) 90%) !important;
  color: rgb(var(--v-theme-on-connect-btn-connected));
}

.config-item {
  color: rgb(var(--v-theme-on-config-btn-bg));
  background: rgba(var(--v-theme-config-btn-bg), 0.7);
  border: 1px rgba(var(--v-theme-on-config-btn-bg), 0.3) solid;
  min-height: 40px;
  justify-content: start;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

.limited-width-to-truncate{
  max-width: calc(100vw - 110px);
}
</style>

<!--suppress CssUnusedSymbol -->
<style>
.config-item > .v-btn__content {
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

#serverButton .v-btn__content,
#excludeCountryButton .v-btn__content {
  flex-grow: 1;
  justify-content: start;
}
</style>
