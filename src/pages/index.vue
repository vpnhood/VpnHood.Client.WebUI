<script setup lang="ts">
import { AppConnectionState, FilterMode } from '@/services/VpnHood.Client.Api';
import TunnelClientCountryDialog from '@/components/TunnelClientCountryDialog.vue';
import UpdateSnackbar from '@/components/UpdateSnackbar.vue';
import { ComponentRouteController } from '@/services/ComponentRouteController';
import HomeConnectionInfo from '@/components/HomeConnectionInfo.vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import router from '@/services/router';
import { ConnectManager } from '@/helpers/ConnectManager';
import { ComponentName, UiConstants } from '@/helpers/UiConstants';
import { Util } from '@/helpers/Util';
import CountDown from '@/components/CountDown.vue';
import { computed, ref } from 'vue';
import UserReviewDialog from '@/components/UserReviewDialog.vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;
let lastConnectPressedTime = Date.now() - 1000;

async function onConnectButtonClick(): Promise<void> {

  // Prevent double click
  if (lastConnectPressedTime >= Date.now() - 1000)
    return;

  lastConnectPressedTime = Date.now();

  // Disconnect
  if (vhApp.data.state.canDisconnect && !vhApp.data.uiState.uiDisconnectInProgress) {
    await vhApp.disconnect();
    return;
  }

  // Connect
  if (vhApp.data.state.canConnect && !vhApp.data.uiState.uiConnectInProgress) {
    await ConnectManager.connect1(false);
  }
}

function udpProtocolButtonText(): string {
  const { dropQuic, useUdpChannel } = vhApp.data.settings.userSettings;
  if (vhApp.data.connectionState === AppConnectionState.Connected &&
    !vhApp.data.state.sessionInfo?.isUdpChannelSupported) {
    return dropQuic ? locale('PROTOCOL_DROP_QUIC') : locale('PROTOCOL_TCP');
  }
  return useUdpChannel ? locale('PROTOCOL_UDP') : (dropQuic ? locale('PROTOCOL_DROP_QUIC') : locale('PROTOCOL_TCP'));
}

function isShowCountdown(): boolean {
  if (!vhApp.data.features.isPremiumFlagSupported)
    return false;

  const hasExpireTime = !!vhApp.data.state.sessionStatus?.sessionExpirationTime;
  return !vhApp.isPremiumAccount() && hasExpireTime && vhApp.data.isConnected;
}

function getActiveServerNameOrLocation(): string {
  // App is VpnHoodClient
  if (!vhApp.isSingleServerMode() && !vhApp.isConnectApp())
    return (vhApp.data.state.clientProfile?.clientProfileName ?? i18n.global.t('NO_SERVER_SELECTED'));

  // App is VpnHoodCONNECT
  const serverLocationInfo = vhApp.getCurrentServerLocationInfo();

  if (!serverLocationInfo || vhApp.isLocationAutoSelected(serverLocationInfo.countryCode))
    return i18n.global.t('AUTO_SELECT');

  const text = vhApp.isLocationAutoSelected(serverLocationInfo.regionName)
    ? serverLocationInfo.countryName
    : serverLocationInfo.countryName + ' (' + serverLocationInfo.regionName + ')';

  return text.replace('United States (', 'USA (');
}

// Return text for connected button based on connection state
function connectButtonText(): string {
  if (!vhApp.data.state.canDiagnose &&
    (vhApp.data.connectionState === AppConnectionState.Connected
      || vhApp.data.connectionState === AppConnectionState.Connecting))
    return locale('STOP_DIAGNOSING');
  else
    switch (vhApp.data.connectionState) {
      case AppConnectionState.Initializing:
        return locale('CANCEL');
      case AppConnectionState.Disconnecting:
        return locale('DISCONNECTING');
      case AppConnectionState.Diagnosing:
        return locale('STOP_DIAGNOSING');
      case AppConnectionState.None:
        return locale('CONNECT');
      default:
        return locale('DISCONNECT');
    }
}

function isIpFilterAvailable(): boolean {
  return vhApp.data.settings.userSettings.useVpnAdapterIpFilter || vhApp.data.settings.userSettings.useAppIpFilter;
}
function isCustomEndpointAvailable(): boolean {
  if (!vhApp.data.state.clientProfile?.customServerEndpoints) return false;
  return vhApp.data.state.clientProfile?.customServerEndpoints.length > 0;
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

const isShowDebugDialog = ref<boolean>(false);
const openDebugDialogCounter = ref<number>(0);

const debugData1 = computed<string[]>({
  get: () => {
    return vhApp.data.settings.userSettings.debugData1?.split(' ') ?? [];
  },
  set: (value: string[] | null) => {
    vhApp.data.settings.userSettings.debugData1 = value?.join(' ') || null;
  }
});

const debugData2 = computed<string | null>({
  get: () => {
    return vhApp.data.settings.userSettings.debugData2 ?? null;
  },
  set: (value: string | null) => {
    vhApp.data.settings.userSettings.debugData2 = value;
  }
});

function openDebugDialog() {
  openDebugDialogCounter.value++;
  if (vhApp.data.settings.userSettings.debugData1 || vhApp.data.settings.userSettings.debugData2)
    isShowDebugDialog.value = true;

  else if (openDebugDialogCounter.value === 5)
    isShowDebugDialog.value = true;

  // reset counter if no click within 1 second
  setTimeout(() => {
    openDebugDialogCounter.value = 0;
  }, 3000);
}
async function saveDebugDataSetting(): Promise<void> {
  await vhApp.saveUserSetting();
  isShowDebugDialog.value = false;
}
function isDebugDataHasValue(): boolean {
  return vhApp.data.settings.userSettings.debugData1 !== null || vhApp.data.settings.userSettings.debugData2 !== null;
}
</script>

<template>
  <v-sheet
    id="homeContainer"
    :class="[vhApp.data.features.isPremiumFlagSupported &&
                (vhApp.isPremiumAccount() ||(vhApp.data.state.sessionInfo?.isPremiumSession && vhApp.data.isConnected)) ?
                'premium-user' : '', vhApp.data.features.uiName, vhApp.data.settings.userSettings.cultureCode]"
  >

    <v-row :align-content="!vhApp.data.features.isTv ? 'space-between' : undefined" justify="center"
           class="fill-height v-row--no-gutters">

      <!-- Home page app bar & Go Premium or Countdown button -->
      <v-col cols="12">

        <!-- Home page app bar -->
        <v-row class="align-center v-row--no-gutters mx-0">

          <!-- Navigation drawer button -->
          <v-col cols="3">
            <v-app-bar-nav-icon
              tabindex="1"
              color="home-app-bar"
              class="ms-n3 me-0"
              @click="ComponentRouteController.showComponent(ComponentName.NavigationDrawer)"
            />
          </v-col>

          <!-- App name -->
          <v-col cols="6" class="text-center text-home-app-bar" tabindex="-1">
            <h4 dir="ltr" :class="{'mt-8': vhApp.data.features.isTv}">
              {{ vhApp.isConnectApp() ? locale('VPN_HOOD_CONNECT_APP_NAME') : locale('VPN_HOOD_APP_NAME') }}
            </h4>
          </v-col>

          <!-- App mini version -->
          <v-col cols="3" class="text-end">
            <v-chip
              tabindex="-1"
              size="small"
              density="compact"
              :color="isDebugDataHasValue() ? 'version-on-home-debug' : 'disabled'"
              :variant="isDebugDataHasValue() ? 'flat' : 'text'"
              :class="[isDebugDataHasValue() ? 'px-2' : 'px-0']"
              @click="openDebugDialog"
            >
              <span :class="{'text-white opacity-40': !isDebugDataHasValue()}">
                {{ locale('ABBREVIATION_VERSION') + ' ' + vhApp.getAppVersion(false) }}
              </span>
            </v-chip>
          </v-col>

        </v-row>

        <!-- Go Premium or Countdown button -->
        <v-row class="mt-0" align="center">
          <v-col cols="2"></v-col>
          <v-col cols="8" class="text-center">
            <!-- Countdown and extend session button -->
            <CountDown v-if="isShowCountdown()" tabindex="2"/>

            <!-- You are premium button -->
            <v-chip v-else-if="vhApp.data.features.isPremiumFlagSupported && vhApp.isPremiumAccount()"
                    prepend-icon="mdi-crown"
                    :text="locale('YOU_ARE_PREMIUM')"
                    color="enable-premium"
                    variant="tonal"
                    tabindex="2"
                    tag="h6"
                    @click="router.push({name: 'PREMIUM_USER'})"
            />

            <!-- Premium code -->
            <v-chip v-else-if="!vhApp.data.features.isPremiumFlagSupported &&
          vhApp.data.state.clientProfile?.hasAccessCode"
                    prepend-icon="mdi-key"
                    :text="locale('PREMIUM_CODE_IS_ACTIVE')"
                    color="active"
                    variant="tonal"
                    tag="h6"
                    tabindex="2"
                    @click="router.push({name: 'PREMIUM_USER'})"
            />

            <!-- Go Premium button -->
            <v-btn
              v-else-if="vhApp.data.features.isPremiumFlagSupported &&
        vhApp.data.state.clientProfile?.selectedLocationInfo?.options.canGoPremium"
              variant="outlined"
              color="go-premium-btn"
              rounded="pill"
              tabindex="2"
              size="small"
              height="35"
              @click="router.push({name: 'PURCHASE_SUBSCRIPTION'})"
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

          <!-- Show IP icon if IP-filter option is enabled -->
          <v-col cols="2" class="d-inline-flex justify-end ga-1">
            <v-icon v-if="isIpFilterAvailable()"
                    icon="mdi-filter-cog-outline"
                    size="17px"
                    color="white"
                    class="opacity-40 pb-1"
                    tabindex="-1"
            />
            <v-icon v-if="isCustomEndpointAvailable()"
                    icon="mdi-ip-network"
                    size="17px"
                    color="white"
                    class="opacity-40 pb-1"
                    tabindex="-1"
            />
          </v-col>

        </v-row>

      </v-col>

      <!-- Speed & Circle & Connect button -->
      <v-col cols="12" :class="'text-center state-' + [vhApp.data.connectionState.toLowerCase()]">

        <!-- Statistics & Speed -->
        <v-row
          align-content="center"
          justify="center"
          dir="ltr"
          :class="[vhApp.data.isConnected ? 'opacity-100' : 'opacity-0','mb-2']"
        >
          <!-- Statistics -->
          <v-col cols="12" class="d-flex justify-center align-center text-white text-body-2 opacity-40 pb-0">
            <v-btn
              :text="locale('STATISTICS')"
              :tabindex="vhApp.data.isConnected ? '3' : null"
              dir="auto"
              variant="text"
              rounded="pill"
              class="d-inline-flex"
              :append-icon="Util.getLocalizedRightChevron()"
              @click="vhApp.data.isConnected ? router.push({name: 'STATISTICS'}) : null"
            />
          </v-col>

          <!-- Download speed -->
          <v-col cols="auto" dir="ltr" class="d-inline-flex pt-1">
            <v-icon color="active" size="small" icon="mdi-arrow-down-thin" tabindex="-1" />
            <span class="pe-1 text-body-2 text-white">
            {{ formatSpeed(vhApp.data.state.sessionStatus?.speed.received ?? 1) }}
          </span>
            <span class="text-white opacity-40 align-self-center" style="font-size: 10px">Mbps</span>
          </v-col>

          <!-- Upload speed -->
          <v-col cols="auto" dir="ltr" class="d-inline-flex pt-1">
            <v-icon color="error" size="small" icon="mdi-arrow-up-thin" tabindex="-1" />
            <span class="pe-1 text-body-2 text-white">
            {{ formatSpeed(vhApp.data.state.sessionStatus?.speed.sent ?? 1) }}
          </span>
            <span class="text-white opacity-40 order-last align-self-center" style="font-size: 10px">Mbps</span>
          </v-col>
        </v-row>

        <!-- Circle -->
        <HomeConnectionInfo tabindex="-1" />

        <!-- Connect button -->
        <v-btn
          id="connectBtn"
          height="40px"
          min-width="180px"
          rounded="pill"
          :tabindex="vhApp.data.isConnected ? '4' : '3'"
          :disabled="vhApp.data.connectionState !== AppConnectionState.None && !vhApp.data.state.canDisconnect"
          class="font-weight-bold mt-5 mb-4"
          :class="[vhApp.isConnectApp() ? 'connect-app' : 'client-app',
          {'connected': vhApp.data.isConnected}, {'tv-device': vhApp.data.features.isTv}]"
          :text="connectButtonText()"
          @click="onConnectButtonClick()"
        />

      </v-col>

      <!-- Config buttons -->
      <v-col cols="12">

        <!-- Servers button -->
        <home-config-btn
          id="serverButton"
          prepend-icon="mdi-earth"
          tabindex="5"
          class="align-center mb-1"
          @click="!vhApp.data.features.isAddAccessKeySupported && vhApp.data.clientProfileInfos.length < 2
            && vhApp.data.clientProfileInfos[0].locationInfos.length < 2
            ? vhApp.showErrorMessage(locale('NO_ADDITIONAL_LOCATION_AVAILABLE'))
            : router.push({name: 'SERVERS'})"
        >
          <span tabindex="-1">{{ vhApp.isSingleServerMode() ? locale('LOCATION') : locale('SERVER') }}</span>
          <v-icon :icon="Util.getLocalizedRightChevron()" />
          <span class="text-white text-capitalize text-caption text-truncate limited-width-to-truncate opacity-50">
          {{ getActiveServerNameOrLocation() }}
        </span>

          <template v-slot:append>
            <!-- Country flag -->
            <span v-if="vhApp.getActiveServerCountryFlag()"
                  class="overflow-hidden d-inline-flex align-center justify-center ms-1"
                  style="width: 23px; height: 15px; border-radius: 3px"
            >
            <img :src="vhApp.getActiveServerCountryFlag()!" height="100%" alt="country flag" />
          </span>

            <!-- Auto server -->
            <v-chip v-else
                    :text="locale('AUTO')"
                    color="white"
                    variant="tonal"
                    size="small"
                    density="compact"
                    class="text-capitalize opacity-50 px-2"
                    tabindex="-1"
            />
          </template>

        </home-config-btn>

        <!-- Exclude country button -->
        <home-config-btn
          id="excludeCountryButton"
          prepend-icon="mdi-call-split"
          class="mb-1"
          tabindex="6"
          @click="ComponentRouteController.showComponent(ComponentName.TunnelClientCountryDialog)"
        >
          <span>{{ locale('COUNTRIES') }}</span>
          <v-icon :icon="Util.getLocalizedRightChevron()" />

          <!-- Text related to selected option -->
          <span class="text-white text-capitalize text-caption text-truncate limited-width-to-truncate opacity-50">
        {{ vhApp.data.settings.userSettings.tunnelClientCountry
            ? locale('IP_FILTER_ALL') : locale('IP_FILTER_STATUS_EXCLUDE_CLIENT_COUNTRY') }}
        </span>

          <!-- Client country flag -->
          <template v-if="!vhApp.data.settings.userSettings.tunnelClientCountry && vhApp.data.state.clientCountryCode"
                    v-slot:append>
              <span
                class="overflow-hidden d-inline-flex align-center justify-center ms-1"
                style="width: 23px; height: 15px; border-radius: 3px"
              >
                <img :src="vhApp.getCountryFlag(vhApp.data.state.clientCountryCode)" height="100%" alt="country flag" />
              </span>
          </template>
        </home-config-btn>

        <!-- App filter button -->
        <home-config-btn
          v-if="vhApp.data.features.isExcludeAppsSupported || vhApp.data.features.isIncludeAppsSupported"
          prepend-icon="mdi-call-split"
          class="mb-1"
          tabindex="7"
          @click="router.push({name: 'APP_FILTER'})"
        >
          <span>{{ locale('APPS') }}</span>
          <v-icon :icon="Util.getLocalizedRightChevron()" />

          <!-- Text related to selected option -->
          <span class="text-white text-capitalize text-caption text-truncate limited-width-to-truncate opacity-50">
          {{ appFilterStatus() }}
        </span>
        </home-config-btn>

        <!-- Protocol button -->
        <home-config-btn
          id="protocolButton"
          prepend-icon="mdi-transit-connection-variant"
          tabindex="8"
          @click="router.push({name: 'PROTOCOLS'})"
          class="align-center"
        >
          <span>{{ locale('PROTOCOL_TITLE') }}</span>
          <v-icon :icon="Util.getLocalizedRightChevron()" />
          <!-- Text related to selected option -->
          <span class="text-white text-capitalize text-caption text-truncate limited-width-to-truncate opacity-50">
            {{ udpProtocolButtonText() }}
          </span>

          <!-- Cloak mode -->
          <template v-if="vhApp.data.state.isTcpProxy" v-slot:append>
            <v-chip
                    :text="locale('CLOAK')"
                    color="white"
                    variant="tonal"
                    size="small"
                    density="compact"
                    class="text-capitalize opacity-50 px-2"
                    tabindex="-1"
            />
          </template>

        </home-config-btn>

      </v-col>

    </v-row>

    <!-- Components -->
    <UpdateSnackbar v-model="vhApp.data.uiState.showUpdateSnackbar" />
    <TunnelClientCountryDialog v-model="ComponentRouteController.create(ComponentName.TunnelClientCountryDialog).isShow" />
    <UserReviewDialog v-model="vhApp.data.state.isUserReviewRecommended" />

    <!-- Developer debug data dialog -->
    <v-dialog v-model="isShowDebugDialog" :persistent="true">
      <v-card color="background" title="Only developers" append-icon="mdi-bug-outline">

        <!-- Support id -->
        <template v-slot:subtitle>
          <p class="text-disabled text-caption">{{ 'Support ID: ' + vhApp.data.state.clientProfile?.supportId }}</p>
        </template>

        <v-card-item>
          <!-- Debug data-1 -->
          <v-combobox
            theme="dark"
            v-model="debugData1"
            clearable
            label="DebugData1"
            :items="vhApp.data.features.debugCommands"
            hide-details
            hide-selected
            chips
            closable-chips
            multiple
            class="mb-4"
          />

          <!-- Debug data-2 -->
          <v-combobox
            v-model="debugData2"
            clearable
            label="DebugData2"
            variant="filled"
            hide-details
            class="mb-4"
          />

          <!-- Open log file -->
          <btn-style-1
            block
            text="Open log"
            :href="vhApp.data.serverUrl + UiConstants.logFileLocation"
            target="_blank"
          />
        </v-card-item>

        <!-- Close button -->
        <v-card-actions>
          <v-btn text="Close" @click="saveDebugDataSetting()" />
        </v-card-actions>

      </v-card>
    </v-dialog>

  </v-sheet>
</template>

<!--suppress CssUnresolvedCustomProperty, CssUnusedSymbol -->
<style scoped>
#homeContainer {
  background: url("@/assets/images/body-bg.png"),
  linear-gradient(rgb(var(--v-theme-home-bg-grad-1)), rgb(var(--v-theme-home-bg-grad-2))), no-repeat, center top, fixed;
  background-size: cover;
  position: relative;
  z-index: 0;
}
#homeContainer:before,
#homeContainer:after {
  position: absolute;
  content: '';
  right: 0;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: -1;
  background-size: contain;
  background-repeat: no-repeat;
  background-position-y: top;
  opacity: 0;
  transition: opacity 1s linear;
}
#homeContainer:before {
  background-image: url("@/assets/images/premium-bg-left.webp");
  background-position-x: left;
}
#homeContainer:after {
  background-image: url("@/assets/images/premium-bg-right.webp");
  background-position-x: right;
}
#homeContainer.premium-user {
  background-image: none;
  background-color: rgb(var(--v-theme-home-bg-grad-2));
}
#homeContainer.premium-user:before,
#homeContainer.premium-user:after {
  opacity: 1;
  transition-duration: 2s;
}
/*-------------------------- Connect button -------------------------*/
/*----------- Disconnected state ----------*/
#connectBtn {
  transition: all 0.4s ease;
  color: rgb(var(--v-theme-on-connect-btn-disconnected));
}
/*---- Client app ----*/
#connectBtn.client-app {
  background-image: linear-gradient(to right, rgb(var(--v-theme-connect-btn-disconnected-grad-1)),
  rgb(var(--v-theme-connect-btn-disconnected-grad-2)) 90%) !important;
}
/*---- Connect app ----*/
#connectBtn.connect-app {
  background: rgb(var(--v-theme-connect-btn-disconnected-grad-1)) !important;
}
/*---- Connect app only on TV ----*/
#connectBtn.connect-app.tv-device:focus-visible{
  box-shadow: rgb(253 251 155 / 64%) 0 0 18px 0;
  border: rgba(255, 255, 255, 0.38) 1px solid;
  background: #ffd4a8 !important;
}
/*----------- Connected state ----------*/
#connectBtn.connected {
  color: rgb(var(--v-theme-on-connect-btn-connected));
}
/*---- Client app ----*/
#connectBtn.client-app.connected {
  background-image: linear-gradient(to right, rgb(var(--v-theme-connect-btn-connected)),
  rgb(var(--v-theme-connect-btn-connected)) 90%) !important;
}
/*---- Connect app ----*/
#connectBtn.connect-app.connected {
  background: rgb(var(--v-theme-connect-btn-connected)) !important;
}
/*---- Connect app only on TV ----*/
#connectBtn.connect-app.connected.tv-device:focus-visible{
  box-shadow: #a4a3ff 0 0 18px 0;
  border: rgba(255, 255, 255, 0.38) 1px solid;
  background: rgb(162 162 255) !important;
}
/*-------------------------- End of connect button -------------------------*/

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
.limited-width-to-truncate {
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
#excludeCountryButton .v-btn__content,
#protocolButton .v-btn__content{
  flex-grow: 1;
  justify-content: start;
}
</style>
