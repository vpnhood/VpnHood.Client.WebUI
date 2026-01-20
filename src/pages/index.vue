<script setup lang="ts">
import { AppConnectionState, FilterMode, SplitByCountryMode } from '@/services/VpnHood.Client.Api';
import UpdateSnackbar from '@/components/Home/UpdateSnackbar.vue';
import { ComponentRouteController } from '@/services/ComponentRouteController';
import HomeConnectionInfo from '@/components/Home/HomeConnectionInfo.vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import router from '@/services/router';
import { ConnectManager } from '@/helpers/ConnectManager';
import { ComponentName } from '@/helpers/UiConstants';
import { Util } from '@/helpers/Util';
import { computed, ref } from 'vue';
import UserReviewDialog from '@/components/Home/UserReviewDialog.vue';
import BadgeDialog from '@/components/Home/BadgeDialog.vue';
import HomeAppBar from '@/components/Home/HomeAppBar.vue';
import DeveloperDialog from '@/components/Home/DeveloperDialog.vue';
import GoPremiumButton from '@/components/Home/GoPremiumButton.vue';
import ConnectionInfo from '@/components/Home/ConnectionInfo.vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const badgeDialogModel = ref(new ComponentRouteController(ComponentName.BadgeDialog));
const isShowUserReview = computed((): boolean => vhApp.data.state.userReviewRecommended !== 0);
const splitCountryStatusText = computed((): string => {
  switch (vhApp.data.userSettings.splitByCountryMode){
    case SplitByCountryMode.ExcludeMyCountry:
      return "MY_COUNTRY";
    case SplitByCountryMode.ExcludeList:
      return "MANUAL"
    default:
      return "NO";
  }
});

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

function getActiveServerNameOrLocation(): string {
  // App is VpnHoodClient
  if (!vhApp.isSingleServerMode() && !vhApp.isConnectApp())
    return (vhApp.data.state.clientProfile?.clientProfileName ?? i18n.global.t('NO_SERVER_SELECTED'));

  // App is VpnHoodCONNECT
  const serverLocationInfo = vhApp.getCurrentServerLocationInfo();

  if (!serverLocationInfo || vhApp.data.isLocationAutoSelected(serverLocationInfo.countryCode))
    return i18n.global.t('AUTO_SELECT');

  const text = vhApp.data.isLocationAutoSelected(serverLocationInfo.regionName)
    ? serverLocationInfo.countryName
    : serverLocationInfo.countryName + ' (' + serverLocationInfo.regionName + ')';

  return text.replace('United States (', 'USA (');
}

// Return text for connected button based on connection state
function connectButtonText(): string {
  if (vhApp.data.state.isDiagnosing)
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

// Return status of filtered apps by user (Only in mobile)
function appFilterStatus(): string {
  const appFilters = vhApp.data.userSettings.appFilters ?? [];

  switch (vhApp.data.userSettings.appFiltersMode) {
    case FilterMode.Exclude:
      return locale('APP_FILTER_STATUS_EXCLUDE', { x: appFilters.length });
    case FilterMode.Include:
      return locale('APP_FILTER_STATUS_INCLUDE', { x: appFilters.length });
    default:
      return locale('ALL_APPS');
  }
}

</script>

<template>
  <v-sheet
    id="homeContainer"
    class="position-relative"
    :class="[{'premium-user': vhApp.data.features.isPremiumFlagSupported && (
      vhApp.data.isPremiumAccount ||
      (vhApp.data.state.sessionInfo?.isPremiumSession && vhApp.data.isConnected)
      )},
      vhApp.data.features.uiName, vhApp.data.userSettings.cultureCode]"
  >

    <v-row
      :align-content="!vhApp.data.features.isTv ? 'space-between' : undefined"
      justify="center"
      class="fill-height v-row--no-gutters">

      <!-- Home page app bar & Go Premium or Countdown button & home badge -->
      <v-col cols="12">
        <home-app-bar/>
        <go-premium-button/>
      </v-col>

      <!-- Speed & Circle & Connect button -->
      <v-col cols="12" :class="'text-center state-' + [vhApp.data.connectionState.toLowerCase()]">

        <!-- ConnectionStatistics & Speed -->
        <connection-info />

        <!-- Circle -->
        <home-connection-info tabindex="-1" />

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
          { 'connected': vhApp.data.isConnected },
          { 'tv-device': vhApp.data.features.isTv }
          ]"
          :text="connectButtonText()"
          @click="onConnectButtonClick()" />

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
          : router.push({ name: 'SERVERS' })"
        >
          <span class="config-btn-title" tabindex="-1">
            {{ vhApp.isSingleServerMode() ? locale('LOCATION') : locale('SERVER') }}
          </span>
          <v-icon :icon="Util.getLocalizedRightChevron()" />
          <span class="config-btn-value text-white text-capitalize text-caption text-truncate limited-width-to-truncate opacity-50">
            {{ getActiveServerNameOrLocation() }}
          </span>

          <template v-slot:append>
            <!-- Country flag -->
            <span
              v-if="vhApp.getActiveServerCountryFlag()"
              class="overflow-hidden d-inline-flex align-center justify-center ms-1"
              style="width: 23px; height: 15px; border-radius: 3px"
            >
              <img :src="vhApp.getActiveServerCountryFlag()!" height="100%" alt="country flag" />
            </span>

            <!-- Auto server -->
            <v-chip
              v-else
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

        <!-- Split countries -->
        <home-config-btn
          id="excludeCountryButton"
          prepend-icon="mdi-call-split"
          class="mb-1"
          tabindex="6"
          @click="router.push({ name: 'SPLIT_COUNTRIES' })"
        >
          <span class="config-btn-title">{{ locale('SPLIT_COUNTRIES') }}</span>
          <v-icon :icon="Util.getLocalizedRightChevron()" />

          <!-- Text related to selected option -->
          <span class="config-btn-value text-white text-capitalize text-caption text-truncate limited-width-to-truncate opacity-50">
            {{ locale(splitCountryStatusText) }}
          </span>

          <!-- Client country flag -->
          <template v-if="!vhApp.data.userSettings.tunnelClientCountry && vhApp.data.state.clientCountryCode" v-slot:append>
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
          @click="router.push({ name: 'SPLIT_APPS' })"
        >
          <span class="config-btn-title">{{ locale('SPLIT_APPS') }}</span>
          <v-icon :icon="Util.getLocalizedRightChevron()" />

          <!-- Text related to selected option -->
          <span class="config-btn-value text-white text-capitalize text-caption text-truncate limited-width-to-truncate opacity-50">
            {{ appFilterStatus() }}
          </span>
        </home-config-btn>

        <!-- Protocol button -->
        <home-config-btn
          id="protocolButton"
          prepend-icon="mdi-transit-connection-variant"
          tabindex="8"
          class="align-center"
          @click="router.push({ name: 'PROTOCOLS' })"
        >
          <span class="config-btn-title">{{ locale('PROTOCOL_TITLE') }}</span>
          <v-icon :icon="Util.getLocalizedRightChevron()" />

          <!-- Text related to selected option -->
          <span class="config-btn-value text-white text-capitalize text-caption text-truncate limited-width-to-truncate opacity-50">
            {{ locale(Util.protocolTitle(vhApp.data.getActiveProtocol)) }}
          </span>

          <!-- Cloak mode -->
          <template v-if="vhApp.data.userSettings.useTcpProxy" v-slot:append>
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
    <UserReviewDialog v-model="isShowUserReview" />
    <badge-dialog v-model="badgeDialogModel.isVisible" />
    <developer-dialog v-model="vhApp.data.uiState.isShowDeveloperDialog" />

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
#connectBtn.connect-app.tv-device:focus-visible {
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
#connectBtn.connect-app.connected.tv-device:focus-visible {
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

.config-btn-title,
.config-btn-value {
  padding-inline-start: 2px;
}
</style>

<!--suppress CssUnusedSymbol -->
<style>
.config-item>.v-btn__content {
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

#serverButton .v-btn__content,
#excludeCountryButton .v-btn__content,
#protocolButton .v-btn__content {
  flex-grow: 1;
  justify-content: start;
}
</style>
