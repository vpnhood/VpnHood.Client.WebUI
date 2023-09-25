<template>
  <!-- Navigation drawer -->
  <NavigationDrawer v-model="isShowNavigationDrawer" @open-settings="isShowSettingsSheet = true"/>

  <!-- App bar -->
  <AppBar @openNavigationDrawer="isShowNavigationDrawer = true"/>

  <v-container class="h-100">
    <v-row align-content="space-between" class="h-100 my-0">

      <!-- Go Premium Store Ad -->
      <v-col cols="12" class="text-center pt-0">
        <PremiumServerAd v-if="checkPremiumServerAdStatus()" v-model="$vpnHoodApp.vpnHoodGlobalProperty.showPremiumServerAd"/>
      </v-col>

      <!-- Speed & Circle & Connect button -->
      <v-col cols="12" :class="'py-0 text-center state-' + [$vpnHoodApp.state.connectionState.toLowerCase()]">

        <!-- Speed -->
        <v-row id="speedSection" align-content="center" justify="center"
               :class="[isConnected() ? 'opacity-100': 'opacity-0', 'mb-4']">
          <v-col cols="auto">
            <span class="color-sky-blue">{{ $t("DOWNLOAD_SPEED") }}:</span>
            <span class="px-2">{{ formatSpeed(this.$vpnHoodApp.state.speed.received) }}</span>
            <span class="color-light-purple">Mbps</span>
          </v-col>
          <v-col cols="auto">
            <span class="color-sky-blue">{{ $t("UPLOAD_SPEED") }}:</span>
            <span class="px-2">{{ formatSpeed(this.$vpnHoodApp.state.speed.sent) }}</span>
            <span class="color-light-purple">Mbps</span>
          </v-col>
        </v-row>

        <!-- Circle -->
        <div id="circleOuter" :class="[isConnected() ? 'opacity-100' : 'opacity-30']">
          <div id="circle">
            <div class="d-flex flex-column align-center justify-center">

              <!-- Connection state text -->
              <span class="txt-large-4">{{
                  $vpnHoodApp.state.connectionState === "None"
                      ? $t("DISCONNECTED")
                      : $t($vpnHoodApp.state.connectionState.toUpperCase())
                }}
            </span>

              <!-- Usage -->
              <div class="d-flex flex-column align-center" v-if="isConnected() && bandwidthUsage()">
                <span class="txt-large-3">{{ bandwidthUsage().used }} GB {{ $t("OF") }}</span>
                <span class="color-sky-blue h1">{{ bandwidthUsage().total }} GB</span>
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
            :class="[$vpnHoodApp.state.connectionState === 'None' ? 'grad-btn': 'blue-btn', 'btn text-uppercase mt-5']"
            @click="onConnectButtonClick">
          {{ connectButtonText() }}
        </v-btn>

      </v-col>

      <!-- Config buttons -->
      <v-col cols="12" class="text-truncate pb-0">

        <!-- Exclude country button -->
        <v-btn
            depressed
            block
            variant="text"
            prepend-icon="mdi-earth"
            class="config-item mb-2"
            @click="isShowTunnelCountrySheet = true"
        >
          <span>{{ $t("IP_FILTER_STATUS_TITLE") }}</span>
          <v-icon>mdi-chevron-right</v-icon>
          <span class="text-capitalize color-light-purple">{{
              $vpnHoodApp.settings.userSettings.tunnelClientCountry ? $t("IP_FILTER_ALL") : $t("IP_FILTER_STATUS_EXCLUDE_CLIENT_COUNTRY")
            }}</span>
          <img
              v-if="!$vpnHoodApp.settings.userSettings.tunnelClientCountry && $vpnHoodApp.state.clientIpGroup?.ipGroupId "
              :src="require(`../assets/images/country_flags/${$vpnHoodApp.state.clientIpGroup.ipGroupId}.png`)"
              alt="country flag" width="24" class="ms-2"/>
        </v-btn>

        <!-- App filter button -->
        <v-btn
               depressed
               block
               variant="text"
               prepend-icon="mdi-apps"
               class="config-item mb-2"
               @click="isShowAppFilterSheet = true"
        >
          <span>{{ $t("APP_FILTER_STATUS_TITLE") }}</span>
          <v-icon>mdi-chevron-right</v-icon>
          <span class="text-capitalize color-light-purple">{{ this.appFilterStatus() }}</span>
        </v-btn>

        <!-- Protocol button -->
        <v-btn
            depressed
            block
            variant="text"
            prepend-icon="mdi-transit-connection-variant"
            class="config-item mb-2"
            @click="isShowProtocolSheet = true"
        >
          <span>{{ $t("PROTOCOL_TITLE") }}</span>
          <v-icon>mdi-chevron-right</v-icon>
          <span class="text-capitalize color-light-purple">{{
              $vpnHoodApp.settings.userSettings.useUdpChannel ? $t('PROTOCOL_UDP_ON') : $t('PROTOCOL_UDP_OFF')
            }}</span>
        </v-btn>

        <!-- Servers button -->
        <v-btn
            depressed
            block
            variant="text"
            prepend-icon="mdi-dns"
            class="config-item mb-0"
            @click="isShowServersSheet = true"
        >
          <span>{{ $t("SELECTED_SERVER") }}</span>
          <v-icon>mdi-chevron-right</v-icon>
          <span class="text-capitalize color-light-purple">{{ getDefaultClientProfileName() }}</span>
        </v-btn>

      </v-col>
    </v-row>
  </v-container>

  <v-snackbar v-model="$vpnHoodApp.vpnHoodGlobalProperty.showNewServerAdded" location="top" :timeout="3000" color="success">
    {{ $t("NEW_SERVER_ADDED")}}
  </v-snackbar>

  <!-- Components -->
  <UpdateSnackbar v-model="$vpnHoodApp.vpnHoodGlobalProperty.showUpdateSnackbar"/>
  <SuppressSnackbar v-model="$vpnHoodApp.vpnHoodGlobalProperty.showSuppressSnackbar"/>
  <PublicServerHintDialog v-model="$vpnHoodApp.vpnHoodGlobalProperty.showPublicServerHint"/>
  <TunnelClientCountrySheet v-model="isShowTunnelCountrySheet"/>
  <ProtocolSheet v-model="isShowProtocolSheet"/>
  <AppFilterSheet v-model="isShowAppFilterSheet"/>
  <ServersSheet v-model="isShowServersSheet"/>
  <AddServerSheet v-model="isShowAddServerSheet"/>
  <SettingSheet v-model="isShowSettingsSheet"/>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {AppConnectionState} from "@/hood/VpnHood.Client.Api";
import TunnelClientCountrySheet from "@/components/TunnelClientCountrySheet.vue";
import ProtocolSheet from "@/components/ProtocolSheet.vue";
import ServersSheet from "@/components/ServersSheet.vue";
import AddServerSheet from "@/components/AddServerSheet.vue";
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
    AddServerSheet,
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
      isShowAddServerSheet: false,
      isShowSettingsSheet: false,
      isShowPublicServerHint: false,
    }
  },
  created() {
    // Reload state and setting every 1 second if app window is focused
    setInterval(async () => {
      if (!document.hidden)
        await this.$vpnHoodApp.loadApp({withState: true, withSettings: true});
    }, 1000);

    // TODO Show update in home page
    // Show update snackbar at the opening app if update is available
    if (this.$vpnHoodApp.state.lastPublishInfo)
      this.$vpnHoodApp.vpnHoodGlobalProperty.showUpdateSnackbar = true;
  },

  methods: {

    async onConnectButtonClick(){

      // If user has no server
      if (!this.$vpnHoodApp.state.defaultClientProfileId){
        this.isShowAddServerSheet = true;
        return;
      }

      this.$vpnHoodApp.state.connectionState === 'None'
          ? await this.$vpnHoodApp.connect()
          : await this.$vpnHoodApp.disconnect();
    },

    // Return text for connect button based on connection state
    connectButtonText(): string {
      switch (this.$vpnHoodApp.state.connectionState) {
        case "Connecting":
          return this.$t('DISCONNECT');
        case "Waiting":
          return this.$t('WAITING');
        case "Connected":
          return this.$t('DISCONNECT');
        case "Disconnecting":
          return this.$t('DISCONNECTING');
        case "Diagnosing":
          return this.$t('DIAGNOSING');
        default:
          return this.$t('CONNECT');
      }
    },

    // Return icon based on connection state
    stateIcon(): string | null {
      if (this.$vpnHoodApp.state.connectionState === AppConnectionState.Connected && !this.bandwidthUsage()) return "check";
      if (this.$vpnHoodApp.state.connectionState === AppConnectionState.None) return "power-plug-off";
      if (this.$vpnHoodApp.state.connectionState === AppConnectionState.Connecting) return "power-plug";
      if (this.$vpnHoodApp.state.connectionState === AppConnectionState.Diagnosing) return "speedometer";
      if (this.$vpnHoodApp.state.connectionState === AppConnectionState.Waiting) return "hourglass_top";
      return null;
    },

    // Calculate user bandwidth usage
    bandwidthUsage(): {} | null {
      if (!this.$vpnHoodApp.state || !this.$vpnHoodApp.state.sessionStatus || !this.$vpnHoodApp.state.sessionStatus.accessUsage)
        return null;

      let accessUsage = this.$vpnHoodApp.state.sessionStatus.accessUsage;
      if (accessUsage.maxTraffic == 0)
        return null;

      let mb = 1000000;
      let gb = 1000 * mb;
      let traffic = this.$vpnHoodApp.state.accountTraffic;

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
      return this.$vpnHoodApp.state.connectionState == AppConnectionState.Connected;
    },

    // Return current active server name
    getDefaultClientProfileName(): string {
      const clientProfileItem = this.$vpnHoodApp.clientProfileItems.find(x => x.clientProfile.clientProfileId === this.$vpnHoodApp.state.defaultClientProfileId);
      if (!clientProfileItem || !clientProfileItem.clientProfile || !clientProfileItem.token.name) {
        return this.$t("NO_SERVER_SELECTED");
      }
      return clientProfileItem.clientProfile.name ?? clientProfileItem.token.name;
    },

    // Return status of filtered apps by user (Only in mobile)
    appFilterStatus() {
      let appFilters = this.$vpnHoodApp.settings.userSettings.appFilters;
      if (!appFilters) appFilters = [];

      if (this.$vpnHoodApp.settings.userSettings.appFiltersMode == 'Exclude') return this.$t("APP_FILTER_STATUS_EXCLUDE", {x: appFilters.length});
      if (this.$vpnHoodApp.settings.userSettings.appFiltersMode == 'Include') return this.$t("APP_FILTER_STATUS_INCLUDE", {x: appFilters.length});
      return this.$t("APP_FILTER_STATUS_ALL");
    },

    // Checking whether to display the premium server ad or not
    checkPremiumServerAdStatus(): boolean{
      const isPublicServersUsedAtLeastOnce: string | null = localStorage.getItem("vh:isPublicServersUsedAtLeastOnce");
      const clientProfileItem = this.$vpnHoodApp.clientProfileItems.find(x => x.clientProfile.clientProfileId === this.$vpnHoodApp.settings.userSettings.defaultClientProfileId);
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
  height: 40px;
  justify-content: start;
}
</style>
