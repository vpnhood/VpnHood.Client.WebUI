<script setup lang="ts">
import { AppConnectionState, FilterMode, Traffic } from '@/services/VpnHood.Client.Api';
import TunnelClientCountryDialog from '@/components/TunnelClientCountryDialog.vue';
import ProtocolDialog from '@/components/ProtocolDialog.vue';
import HomeAppBar from '@/components/HomeAppBar.vue';
import SuppressSnackbar from '@/components/SuppressSnackbar.vue';
import UpdateSnackbar from '@/components/UpdateSnackbar.vue';
import { ComponentRouteController } from '@/services/ComponentRouteController';
import { UiConstants } from '@/helpers/UiConstants';
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

// Return icon based on connection state
function stateIcon(): string | null {
  if (vhApp.data.state.connectionState === AppConnectionState.Connected && !bandwidthUsage())
    return 'mdi-check';
  if (vhApp.data.state.connectionState === AppConnectionState.None)
    return 'mdi-power-plug-off';
  if (vhApp.data.state.connectionState === AppConnectionState.Connecting)
    return 'mdi-power-plug';
  if (vhApp.data.state.connectionState === AppConnectionState.Diagnosing)
    return 'mdi-stethoscope';
  if (vhApp.data.state.connectionState === AppConnectionState.Waiting)
    return 'mdi-timer-sand';

  return null;
}

// Calculate user bandwidth usage
function bandwidthUsage(): { Used: string; Total: string } | null {
  if (!vhApp.data.state || !vhApp.data.state.sessionStatus || !vhApp.data.state.sessionStatus.accessUsage)
    return null;

  const accessUsage = vhApp.data.state.sessionStatus.accessUsage;
  if (!accessUsage.maxTraffic) return null;

  const mb = 1000000;
  const gb = 1000 * mb;
  const traffic: Traffic = vhApp.data.state.accountTraffic;

  const ret: {used: number, total: number} = {
    used: traffic.sent + traffic.received,
    total: accessUsage.maxTraffic
  };
  const total: string =
    ret.total >= gb
      ? Number((ret.total / gb).toFixed(1)).toString() + 'GB'
      : Number((ret.total / mb).toFixed(0)).toString() + 'MB';
  const used: string =
    ret.used >= gb
      ? Number((ret.used / gb).toFixed(1)).toString() + 'GB'
      : Number((ret.used / mb).toFixed(0)).toString() + 'MB';
  return { Used: used, Total: total };
}

// Return connection download and upload speed based on Mbps
function formatSpeed(speed: number): string {
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

function getExpireDate(): string | null {
  if (!vhApp.data.state.clientProfile?.isPremiumAccount
    || vhApp.data.state.connectionState !== AppConnectionState.Connected
    || !vhApp.data.state.sessionStatus?.accessUsage?.expirationTime)
    return null;

  const expDate: Date = vhApp.data.state.sessionStatus.accessUsage.expirationTime;
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  // noinspection TypeScriptValidateJSTypes
  return expDate.toLocaleString('locales', options).replace(',', '');
}

function alertForExpire(): boolean {
  const expDate: Date | null | undefined = vhApp.data.state.sessionStatus?.accessUsage?.expirationTime;
  if (!expDate) return false;

  const currentDate: Date = new Date();
  const diffTime = expDate.getTime() - currentDate.getTime();
  const diffDays: number = Math.ceil(diffTime / UiConstants.millisecondPerDay);
  return diffDays <= 3;
}

function udpProtocolButtonText(): string {
  const { connectionState, isUdpChannelSupported } = vhApp.data.state;
  const { dropQuic, useUdpChannel } = vhApp.data.settings.userSettings;
  if (connectionState === AppConnectionState.Connected && !isUdpChannelSupported) {
    return dropQuic ? locale("PROTOCOL_DROP_QUIC") : locale("PROTOCOL_TCP");
  }
  return useUdpChannel ? locale('PROTOCOL_UDP') : (dropQuic ? locale("PROTOCOL_DROP_QUIC") : locale("PROTOCOL_TCP"));
}
function isShowCountdown(): boolean{
  const isPremiumAccount = vhApp.data.state.clientProfile?.isPremiumAccount;
  const hasExpireTime = !!vhApp.data.state.sessionStatus?.accessUsage?.expirationTime;
  return !isPremiumAccount && hasExpireTime;
}
</script>

<template>
  <!-- App bar -->
  <HomeAppBar />

  <v-row
    align-content="space-between"
    justify="center"
    class="h-100 px-md-2 pb-3 ma-0"
  >
    <!-- Go Premium or Countdown button -->
    <v-col cols="12" class="text-center pt-0">

      <!-- Countdown and extend session button -->
      <CountDown v-if="isShowCountdown() && vhApp.isConnected()"/>

      <!-- Go Premium button -->
      <div v-else-if="vhApp.data.features.isBillingSupported">

        <!-- Go Premium Server button for premium user -->
        <v-chip v-if="vhApp.data.state.clientProfile?.isPremiumAccount"
                prepend-icon="mdi-crown"
                :text="locale('YOU_ARE_PREMIUM')"
                color="secondary-lighten-1"
                variant="tonal"
                tag="h6"
                @click="router.push('/account')"
        />

        <!-- Go Premium button for guest and normal user -->
        <v-btn v-else
          :flat="true"
          variant="outlined"
          color="tertiary"
          rounded="pill"
          size="small"
          height="35"
          @click="router.push('/purchase-subscription')"
          class="ps-1 pe-3 text-capitalize"
        >
          <v-icon
            icon="mdi-crown"
            color="primary"
            size="25"
            class="bg-tertiary rounded-circle me-2"
          />
          {{ locale('GO_PREMIUM') }}
        </v-btn>

      </div>

    </v-col>

    <!-- Speed & Circle & Connect button -->
    <v-col cols="12" :class="'py-0 text-center state-' + [vhApp.data.state.connectionState.toLowerCase()]">
      <!-- Speed -->
      <v-row id="speedSection" align-content="center" justify="center"
        :class="[vhApp.isConnected() ? 'opacity-100' : 'opacity-0','mb-2']"
      >
        <v-col cols="auto d-inline-flex">
          <span class="text-ui-tertiary text-body-2">{{ locale('DOWNLOAD_SPEED') }}:</span>
          <span class="px-2 text-body-2" dir="ltr">{{ formatSpeed(vhApp.data.state.speed.received) }}</span>
          <span class="text-white opacity-50 text-caption">Mbps</span>
        </v-col>
        <v-col cols="auto d-inline-flex">
          <span class="text-ui-tertiary text-body-2">{{ locale('UPLOAD_SPEED') }}:</span>
          <span class="px-2 text-body-2" dir="ltr">{{ formatSpeed(vhApp.data.state.speed.sent) }}</span>
          <span class="text-white opacity-50 text-caption order-last">Mbps</span>
        </v-col>
      </v-row>

      <!-- Circle -->
      <HomeConnectionInfo
        :alert-for-expire="alertForExpire()"
        :state-icon="stateIcon()"
        :expire-date="getExpireDate()"
        :bandwidth-used="bandwidthUsage()?.Used"
        :bandwidth-total="bandwidthUsage()?.Total"
      />

      <!-- Connect button -->
      <v-btn
        height="40px"
        width="180px"
        rounded="pill"
        :disabled="
          vhApp.data.state.connectionState == AppConnectionState.Disconnecting ||
          vhApp.data.state.connectionState === AppConnectionState.Initializing
        "
        class="font-weight-bold mt-5"
        :class="[vhApp.data.state.connectionState === AppConnectionState.Connected ? 'secondary-btn' : 'master-btn',
          {'solid': vhApp.isConnectApp() }]"
        @click="onConnectButtonClick"
      >
        {{ connectButtonText() }}
      </v-btn>
    </v-col>

    <!-- Config buttons -->
    <v-col cols="12">
      <v-row>
        <!-- TODO restore click condition -->
        <!-- Servers button -->
        <v-col cols="12" md="6" class="py-0 pa-md-1">
          <v-btn
            depressed
            block
            id="serverButton"
            variant="text"
            size="small"
            prepend-icon="mdi-earth"
            class="config-item align-center mb-1"
            @click="!vhApp.data.features.isAddAccessKeySupported && vhApp.data.clientProfileInfos.length == 1
            && vhApp.data.clientProfileInfos[0].locationInfos.length < 2
            ? vhApp.showGeneralSnackbar(locale('NO_ADDITIONAL_LOCATION_AVAILABLE'))
            : router.push('/servers')"
          >
            <span tabindex="-1">{{ vhApp.isSingleServerMode() ? locale('LOCATION') : locale('SERVER') }}</span>
            <v-icon :icon="Util.getLocalizedRightChevron()" />
            <span
              class="text-capitalize text-caption text-white opacity-50 text-truncate limited-width-to-truncate"
              tabindex="-1"
            >
              {{ vhApp.getActiveServerNameOrLocation() }}
            </span>

            <template v-slot:append>
              <span
                v-if="vhApp.getActiveServerCountryFlag()"
                class="overflow-hidden d-inline-flex align-center justify-center ms-1"
                style="width: 23px; height: 15px; border-radius: 3px"
              >
                <img :src="vhApp.getActiveServerCountryFlag()!" height="100%" alt="country flag" />
              </span>
              <v-chip
                v-else
                :text="locale('AUTO')"
                size="small"
                density="compact"
                variant="tonal"
                color="gray-lighten-3"
                class="text-caption px-2"
              />
            </template>
          </v-btn>
        </v-col>

        <!-- Exclude country button -->
        <v-col cols="12" md="6" class="py-0 pa-md-1">
          <v-btn
            depressed
            block
            id="excludeCountryButton"
            variant="outlined"
            size="small"
            prepend-icon="mdi-call-split"
            class="config-item mb-1"
            @click="ComponentRouteController.showComponent(ComponentName.TunnelClientCountryDialog)"
          >
            <span>{{ locale('COUNTRIES') }}</span>
            <v-icon :icon="Util.getLocalizedRightChevron()" />
            <span class="text-capitalize text-caption text-white opacity-50 text-truncate limited-width-to-truncate">
              {{ vhApp.data.settings.userSettings.tunnelClientCountry
              ? locale('IP_FILTER_ALL') : locale('IP_FILTER_STATUS_EXCLUDE_CLIENT_COUNTRY') }}
            </span>
            <template v-if="!vhApp.data.settings.userSettings.tunnelClientCountry && vhApp.data.state.clientCountryCode"
              v-slot:append
            >
              <span
                class="overflow-hidden d-inline-flex align-center justify-center ms-1"
                style="width: 23px; height: 15px; border-radius: 3px"
              >
                <img :src="vhApp.getCountryFlag(vhApp.data.state.clientCountryCode)" height="100%" alt="country flag"/>
              </span>
            </template>
          </v-btn>
        </v-col>

        <!-- App filter button -->
        <v-col cols="12" md="6" class="py-0 pa-md-1">
          <v-btn
            v-if="vhApp.data.features.isExcludeAppsSupported || vhApp.data.features.isIncludeAppsSupported"
            depressed
            block
            variant="text"
            size="small"
            prepend-icon="mdi-call-split"
            class="config-item mb-1"
            to="/apps-filter"
          >
            <span>{{ locale('APPS') }}</span>
            <v-icon :icon="Util.getLocalizedRightChevron()" />
            <span class="text-capitalize text-caption text-white opacity-50 text-truncate limited-width-to-truncate">{{ appFilterStatus() }}</span>
          </v-btn>
        </v-col>

        <!-- Protocol button -->
        <v-col cols="12" md="6" class="py-0 pa-md-1">
          <v-btn
            depressed
            block
            variant="text"
            size="small"
            prepend-icon="mdi-transit-connection-variant"
            class="config-item"
            @click="ComponentRouteController.showComponent(ComponentName.ProtocolDialog)"
          >
            <span>{{ locale('PROTOCOL_TITLE') }}</span>
            <v-icon :icon="Util.getLocalizedRightChevron()" />
            <span class="text-capitalize text-caption text-white opacity-50 text-truncate limited-width-to-truncate">
              {{ udpProtocolButtonText() }}
            </span>
          </v-btn>
        </v-col>
      </v-row>
    </v-col>
  </v-row>

  <!-- Components -->
  <UpdateSnackbar v-model="vhApp.data.uiState.showUpdateSnackbar" />
  <SuppressSnackbar v-model="vhApp.data.uiState.showSuppressSnackbar" />
  <TunnelClientCountryDialog v-model="ComponentRouteController.create(ComponentName.TunnelClientCountryDialog).isShow"/>
  <ProtocolDialog v-model="ComponentRouteController.create(ComponentName.ProtocolDialog).isShow" />

</template>

<style scoped>
/*noinspection CssUnresolvedCustomProperty*/
.config-item {
  color: rgb(var(--v-theme-tertiary));
  background: rgba(var(--v-theme-primary-darken-1), 0.8);
  border: 1px rgba(var(--v-theme-tertiary), 0.3) solid;
  min-height: 40px;
  justify-content: start;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

.VpnHoodConnect .config-item {
  /*noinspection CssUnresolvedCustomProperty*/
  background: rgba(var(--v-theme-primary-darken-1), 0.4);
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
