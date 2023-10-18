<template>
  <!-- Navigation drawer -->
  <NavigationDrawer v-model="isShowNavigationDrawer" @open-settings="isShowSettingsSheet = true"/>

  <!-- App bar -->
  <AppBar @openNavigationDrawer="isShowNavigationDrawer = true"/>

  <v-container class="h-100 pt-0">
    <v-row align-content="space-between" class="h-100 my-0">

      <!-- Go Premium Store Ad -->
      <v-col cols="12" class="text-center pt-0">
        <PremiumServerAd v-if="checkPremiumServerAdStatus()" v-model="$vpnHoodApp.data.uiState.showPremiumServerAd"/>
      </v-col>

      <!-- Speed & Circle & Connect button -->
      <v-col cols="12" :class="'py-0 text-center state-' + [$vpnHoodApp.data.state.connectionState.toLowerCase()]">

        <!-- Speed -->
        <v-row id="speedSection" align-content="center" justify="center"
               :class="[isConnected() ? 'opacity-100': 'opacity-0', 'mb-2']">
          <v-col cols="auto">
            <span class="color-sky-blue text-body-2">{{ $t("DOWNLOAD_SPEED") }}:</span>
            <span class="px-2 text-body-2">{{ formatSpeed($vpnHoodApp.data.state.speed.received) }}</span>
            <span class="color-light-purple text-caption">Mbps</span>
          </v-col>
          <v-col cols="auto">
            <span class="color-sky-blue text-body-2">{{ $t("UPLOAD_SPEED") }}:</span>
            <span class="px-2 text-body-2">{{ formatSpeed($vpnHoodApp.data.state.speed.sent) }}</span>
            <span class="color-light-purple text-caption">Mbps</span>
          </v-col>
        </v-row>

        <!-- Circle -->
        <div id="circleOuter" :class="[isConnected() ? 'opacity-100' : 'opacity-30']">
          <div id="circle">
            <div class="d-flex flex-column align-center justify-center">

              <!-- Connection state text -->
              <span class="text-body-1">{{$vpnHoodApp.data.state.connectionState === AppConnectionState.None ? $t("DISCONNECTED") : $t($vpnHoodApp.data.state.connectionState.toUpperCase()) }}
            </span>

              <!-- Usage -->
              <div class="d-flex flex-column align-center" v-if="isConnected() && bandwidthUsage()">
                <span class="text-body-1">{{ bandwidthUsage()?.used }} GB {{ $t("OF") }}</span>
                <span class="color-sky-blue">{{ bandwidthUsage()?.total }} GB</span>
              </div>

              <!-- Check -->
              <v-icon v-if="stateIcon()" size="50" color="white">
                mdi-{{ stateIcon() }}
              </v-icon>

            </div>
          </div>
        </div>

        <!-- Connect button -->
        <v-btn
            height="40px"
            width="190px"
            rounded="pill"
            :class="[$vpnHoodApp.data.state.connectionState === AppConnectionState.None ? 'grad-btn': '', 'btn text-button mt-5']"
            @click="onConnectButtonClick">
          {{ connectButtonText() }}
        </v-btn>

      </v-col>

      <!-- Config buttons -->
      <v-col cols="12" class="text-truncate pb-0">

        <!-- Exclude country button -->
        <v-btn
            depressed
            :block="true"
            variant="text"
            prepend-icon="mdi-earth"
            class="config-item mb-2"
            @click="isShowTunnelCountrySheet = true"
        >
          <span>{{ $t("IP_FILTER_STATUS_TITLE") }}</span>
          <v-icon>mdi-chevron-right</v-icon>
          <span class="text-capitalize text-caption color-light-purple">{{$vpnHoodApp.data.settings.userSettings.tunnelClientCountry ? $t("IP_FILTER_ALL") : $t("IP_FILTER_STATUS_EXCLUDE_CLIENT_COUNTRY") }}</span>
          <img
              v-if="!$vpnHoodApp.data.settings.userSettings.tunnelClientCountry && $vpnHoodApp.data.state.clientIpGroup?.ipGroupId "
              :src="require(`../assets/images/country_flags/${$vpnHoodApp.data.state.clientIpGroup.ipGroupId}.png`)"
              alt="country flag" width="24" class="ms-2"/>
        </v-btn>

        <!-- App filter button -->
        <v-btn
            v-if="$vpnHoodApp.data.features.isExcludeAppsSupported || $vpnHoodApp.data.features.isIncludeAppsSupported"
            depressed
            :block="true"
            variant="text"
            prepend-icon="mdi-apps"
            class="config-item mb-2"
            @click="isShowAppFilterSheet = true"
        >
          <span>{{ $t("APP_FILTER_STATUS_TITLE") }}</span>
          <v-icon>mdi-chevron-right</v-icon>
          <span class="text-capitalize text-caption color-light-purple">{{ appFilterStatus() }}</span>
        </v-btn>

        <!-- Protocol button -->
        <v-btn
            depressed
            :block="true"
            variant="text"
            prepend-icon="mdi-transit-connection-variant"
            class="config-item mb-2"
            @click="isShowProtocolSheet = true"
        >
          <span>{{ $t("PROTOCOL_TITLE") }}</span>
          <v-icon>mdi-chevron-right</v-icon>
          <span class="text-capitalize text-caption color-light-purple">{{$vpnHoodApp.data.settings.userSettings.useUdpChannel ? $t('PROTOCOL_UDP_ON') : $t('PROTOCOL_UDP_OFF') }}</span>
        </v-btn>

        <!-- Servers button -->
        <v-btn
            depressed
            :block="true"
            variant="text"
            prepend-icon="mdi-dns"
            class="config-item mb-0"
            @click="isShowServersSheet = true"
        >
          <span>{{ $t("SELECTED_SERVER") }}</span>
          <v-icon>mdi-chevron-right</v-icon>
          <span class="text-capitalize text-caption color-light-purple">{{ getDefaultClientProfileName() }}</span>
        </v-btn>

      </v-col>
    </v-row>
  </v-container>

  <!-- Show Toast on top of the page when a new server is added -->
  <v-snackbar v-model="$vpnHoodApp.data.uiState.showNewServerAdded" location="top" :timeout="3000" color="success">
    {{ $t("NEW_SERVER_ADDED") }}
  </v-snackbar>

  <!-- Components -->
  <UpdateSnackbar v-model="$vpnHoodApp.data.uiState.showUpdateSnackbar"/>
  <SuppressSnackbar v-model="$vpnHoodApp.data.uiState.showSuppressSnackbar"/>
  <PublicServerHintDialog v-model="$vpnHoodApp.data.uiState.showPublicServerHint"/>
  <TunnelClientCountrySheet v-model="isShowTunnelCountrySheet"/>
  <ProtocolSheet v-model="isShowProtocolSheet"/>
  <AppFilterSheet v-model="isShowAppFilterSheet"/>
  <ServersSheet v-model="isShowServersSheet"/>
  <SettingSheet v-model="isShowSettingsSheet"/>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {AppConnectionState, FilterMode} from "@/services/VpnHood.Client.Api";
import TunnelClientCountrySheet from "@/components/TunnelClientCountrySheet.vue";
import ProtocolSheet from "@/components/ProtocolSheet.vue";
import ServersSheet from "@/components/ServersSheet.vue";
import NavigationDrawer from "@/components/NavigationDrawer.vue";
import SettingSheet from "@/components/SettingsSheet.vue";
import AppFilterSheet from "@/components/AppFilterSheet.vue";
import PremiumServerAd from "@/components/PremiumServerAd.vue";
import AppBar from "@/components/AppBar.vue";
import PublicServerHintDialog from "@/components/PublicServerHintDialog.vue";
import SuppressSnackbar from "@/components/SuppressSnackbar.vue";
import UpdateSnackbar from "@/components/UpdateSnackbar.vue";

export default defineComponent({
  name: 'HomeView',
  components: {
    UpdateSnackbar,
    SuppressSnackbar,
    PublicServerHintDialog,
    AppBar,
    PremiumServerAd,
    AppFilterSheet,
    SettingSheet,
    NavigationDrawer,
    ServersSheet,
    ProtocolSheet,
    TunnelClientCountrySheet
  },
  data() {
    return {
      isShowNavigationDrawer: false,
      isShowTunnelCountrySheet: false,
      isShowAppFilterSheet: false,
      isShowProtocolSheet: false,
      isShowServersSheet: false,
      isShowSettingsSheet: false,
      isShowPublicServerHint: false,
      /*** VpnHood Api enums ***/
      AppConnectionState
    }
  },
  created() {

    // Reload 'state' and 'setting' every 1 second if app window is focused.
    setInterval(async () => {
      if (!document.hidden)
        await this.$vpnHoodApp.reloadState();
    }, 1000);
  },

  methods: {

    async onConnectButtonClick() {

      // If user has no selected server and want to connect
      if (this.$vpnHoodApp.data.state.connectionState === AppConnectionState.None){

        // Find selected server
        const clientProfileItem = this.$vpnHoodApp.data.clientProfileItems.find(
            x => x.clientProfile.clientProfileId === this.$vpnHoodApp.data.settings.userSettings.defaultClientProfileId);

        if (!clientProfileItem || !clientProfileItem.clientProfile || !clientProfileItem.token.name) {
          this.isShowServersSheet = true;
          return;
        }
      }

      this.$vpnHoodApp.data.state.connectionState === AppConnectionState.None
          ? await this.$vpnHoodApp.connect()
          : await this.$vpnHoodApp.disconnect();
    },

    // Return text for connect button based on connection state
    connectButtonText(): string {
      if(!this.$vpnHoodApp.canDiagnose() && this.$vpnHoodApp.data.state.connectionState === AppConnectionState.Connected)
        return this.$t("STOP_DIAGNOSING");

      else
        switch (this.$vpnHoodApp.data.state.connectionState) {
          case AppConnectionState.Connecting:
            return this.$t('DISCONNECT');
          case AppConnectionState.Waiting:
            return this.$t('WAITING');
          case AppConnectionState.Connected:
            return this.$t('DISCONNECT');
          case AppConnectionState.Disconnecting:
            return this.$t('DISCONNECTING');
          case AppConnectionState.Diagnosing:
            return this.$t('STOP_DIAGNOSING');
          default:
            return this.$t('CONNECT');
        }
    },

    // Return icon based on connection state
    stateIcon(): string | null {
      if (this.$vpnHoodApp.data.state.connectionState === AppConnectionState.Connected && !this.bandwidthUsage()) return "check";
      if (this.$vpnHoodApp.data.state.connectionState === AppConnectionState.None) return "power-plug-off";
      if (this.$vpnHoodApp.data.state.connectionState === AppConnectionState.Connecting) return "power-plug";
      if (this.$vpnHoodApp.data.state.connectionState === AppConnectionState.Diagnosing) return "speedometer";
      if (this.$vpnHoodApp.data.state.connectionState === AppConnectionState.Waiting) return "hourglass_top";
      return null;
    },

    // Calculate user bandwidth usage
    bandwidthUsage(): { used: number, total: number } | null {
      if (!this.$vpnHoodApp.data.state || !this.$vpnHoodApp.data.state.sessionStatus || !this.$vpnHoodApp.data.state.sessionStatus.accessUsage)
        return null;

      let accessUsage = this.$vpnHoodApp.data.state.sessionStatus.accessUsage;
      if (accessUsage.maxTraffic === 0)
        return null;

      let mb = 1000000;
      let gb = 1000 * mb;
      let traffic = this.$vpnHoodApp.data.state.accountTraffic;

      let ret = {used: traffic.sent + traffic.received, total: accessUsage.maxTraffic};
      ret.total = ret.total >= gb ? Number((ret.total / gb).toFixed(1)) : Number((ret.total / mb).toFixed(0));
      ret.used = ret.used >= gb ? Number((ret.used / gb).toFixed(1)) : Number((ret.used / mb).toFixed(0));
      return ret;
    },

    // Return connection download and upload speed based on Mbps
    formatSpeed(speed: number): string {
      return (speed * 10 / 1000000).toFixed(2);
    },

    isConnected(): boolean {
      return this.$vpnHoodApp.data.state.connectionState === AppConnectionState.Connected;
    },

    // Return current active server name
    getDefaultClientProfileName(): string {
      const clientProfileItem = this.$vpnHoodApp.data.clientProfileItems.find(x => x.clientProfile.clientProfileId === this.$vpnHoodApp.data.settings.userSettings.defaultClientProfileId);
      if (!clientProfileItem || !clientProfileItem.clientProfile || !clientProfileItem.token.name) {
        return this.$t("NO_SERVER_SELECTED");
      }
      return clientProfileItem.clientProfile.name ?? clientProfileItem.token.name;
    },

    // Return status of filtered apps by user (Only in mobile)
    appFilterStatus(): string {
      let appFilters = this.$vpnHoodApp.data.settings.userSettings.appFilters;
      if (!appFilters) appFilters = [];

      if (this.$vpnHoodApp.data.settings.userSettings.appFiltersMode === FilterMode.Exclude) return this.$t("APP_FILTER_STATUS_EXCLUDE", {x: appFilters.length});
      if (this.$vpnHoodApp.data.settings.userSettings.appFiltersMode === FilterMode.Include) return this.$t("APP_FILTER_STATUS_INCLUDE", {x: appFilters.length});
      return this.$t("APP_FILTER_STATUS_ALL");
    },

    // Checking whether to display the premium server ad or not
    checkPremiumServerAdStatus(): boolean {
      const isPublicServersUsedAtLeastOnce: string | null = localStorage.getItem("vh:isPublicServersUsedAtLeastOnce");
      const clientProfileItem = this.$vpnHoodApp.data.clientProfileItems.find(x => x.clientProfile.clientProfileId === this.$vpnHoodApp.data.settings.userSettings.defaultClientProfileId);
      return !!(isPublicServersUsedAtLeastOnce && clientProfileItem?.token.name === "VpnHood Public Servers");

    },

  }
});
</script>
<style scoped>
.config-item {
  color: var(--sky-blue);
  background: #132a7ac9;
  border: 1px rgba(22, 163, 254, 0.3) solid;
  min-height: 40px;
  justify-content: start;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}
</style>
