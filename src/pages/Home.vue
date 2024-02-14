<template>
  <div class="h-100">
    <!-- Navigation drawer -->
    <NavigationDrawer v-model="ComponentRouteController.create($componentName.NavigationDrawer).isShow"/>

    <!-- App bar -->
    <AppBar/>

    <v-container class="h-100 pt-0">
      <v-row align-content="space-between" justify="center" class="h-100 my-0">

        <!-- Go Premium Store Ad -->
        <v-col cols="12" class="text-center pt-0">
          <PremiumServerAdDialog v-if="$vpnHoodApp.data.uiState.isGoogleSignInSupported && !$vpnHoodApp.data.userState.userAccount?.subscriptionPlanId"
                                 v-model="ComponentRouteController.create($componentName.PremiumServerAdDialog).isShow"/>
        </v-col>

        <!-- Speed & Circle & Connect button -->
        <v-col cols="12" :class="'py-0 text-center state-' + [$vpnHoodApp.data.state.connectionState.toLowerCase()]">

          <!-- Speed -->
          <v-row id="speedSection" align-content="center" justify="center"
                 :class="[isConnected() ? 'opacity-100' : 'opacity-0', 'mb-2']">
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
                <span class="text-body-1">{{
                    $vpnHoodApp.data.state.connectionState === AppConnectionState.None ? $t("DISCONNECTED") : $t($vpnHoodApp.data.state.connectionState.toUpperCase())
                  }}
              </span>

                <!-- Usage -->
                <div class="d-flex flex-column align-center" v-if="isConnected() && bandwidthUsage()">
                  <span class="text-body-1">{{ bandwidthUsage()?.Used }} {{ $t("OF") }}</span>
                  <span class="color-sky-blue">{{ bandwidthUsage()?.Total }}</span>
                </div>

                <!-- Check -->
                <v-icon v-if="stateIcon()" size="50" color="white">
                  {{ stateIcon() }}
                </v-icon>

                <!-- Access Key expire date -->
                <p v-if="getExpireDate()" :class="[alertForExpire() ? 'color-red' : 'color-light-purple', 'text-caption mt-2']">{{$t("EXPIRE") + ": " + getExpireDate()}}</p>
              </div>
            </div>
          </div>

          <!-- Connect button -->
          <v-btn
              id="connectBtn"
              height="40px"
              width="190px"
              rounded="pill"
              :disabled="$vpnHoodApp.data.state.connectionState === AppConnectionState.Disconnecting || $vpnHoodApp.data.state.connectionState === AppConnectionState.Initializing"
              :class="[$vpnHoodApp.data.state.connectionState === AppConnectionState.None ? 'grad-btn' : '', 'blue-btn text-button mt-5']"
              @click="onConnectButtonClick"
          >
            {{ connectButtonText() }}
          </v-btn>

        </v-col>

        <!-- Config buttons -->
        <v-col cols="12" md="8" lg="6" class="text-truncate pb-0">

          <!-- Exclude country button -->
          <v-btn
              depressed
              :block="true"
              variant="text"
              size="small"
              prepend-icon="mdi-earth"
              class="config-item mb-2"
              @click="ComponentRouteController.showComponent($componentName.TunnelClientCountryDialog)">
            <span>{{ $t("IP_FILTER_STATUS_TITLE") }}</span>
            <v-icon>mdi-chevron-right</v-icon>
            <span class="text-capitalize text-caption color-light-purple">{{
                $vpnHoodApp.data.settings.userSettings.tunnelClientCountry ? $t("IP_FILTER_ALL") : $t("IP_FILTER_STATUS_EXCLUDE_CLIENT_COUNTRY")
              }}</span>
            <img
                v-if="!$vpnHoodApp.data.settings.userSettings.tunnelClientCountry && $vpnHoodApp.data.state.clientIpGroup?.ipGroupId"
                :src="require(`../assets/images/country_flags/${$vpnHoodApp.data.state.clientIpGroup.ipGroupId}.png`)"
                alt="country flag" width="24" class="ms-2"/>
          </v-btn>

          <!-- App filter button -->
          <v-btn
              v-if="$vpnHoodApp.data.features.isExcludeAppsSupported || $vpnHoodApp.data.features.isIncludeAppsSupported"
              depressed
              :block="true"
              variant="text"
              size="small"
              prepend-icon="mdi-apps"
              class="config-item mb-2"
              to="/apps-filter"
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
              size="small"
              prepend-icon="mdi-transit-connection-variant"
              class="config-item"
              @click="ComponentRouteController.showComponent($componentName.ProtocolDialog)">
            <span>{{ $t("PROTOCOL_TITLE") }}</span>
            <v-icon>mdi-chevron-right</v-icon>
            <span class="text-capitalize text-caption color-light-purple">{{ udpProtocolButtonText() }}</span>
          </v-btn>

          <!-- Servers button -->
          <v-btn
              v-if="!$vpnHoodApp.data.uiState.isGoogleSignInSupported || $vpnHoodApp.data.clientProfileInfos.length > 0"
              depressed
              :block="true"
              variant="text"
              size="small"
              prepend-icon="mdi-dns"
              class="config-item mt-2 mb-0"
              to="/servers"
          >
            <span>{{ $t("SELECTED_SERVER") }}</span>
            <v-icon>mdi-chevron-right</v-icon>
            <span class="text-capitalize text-caption color-light-purple">{{ getDefaultClientProfileName() }}</span>
          </v-btn>

        </v-col>
      </v-row>
    </v-container>

    <!-- Show Toast on top of the page when a new server is added -->
    <v-snackbar v-model="$vpnHoodApp.data.uiState.showNewServerAdded" location="top" :timeout="3000" color="secondary">
      {{ $t("NEW_SERVER_ADDED") }}
    </v-snackbar>

    <!-- Components -->
    <UpdateSnackbar v-model="$vpnHoodApp.data.uiState.showUpdateSnackbar"/>
    <SuppressSnackbar v-model="$vpnHoodApp.data.uiState.showSuppressSnackbar"/>
    <PublicServerHintDialog v-model="ComponentRouteController.create($componentName.PublicServerHintDialog).isShow"/>
    <TunnelClientCountryDialog
        v-model="ComponentRouteController.create($componentName.TunnelClientCountryDialog).isShow"/>
    <ProtocolDialog v-model="ComponentRouteController.create($componentName.ProtocolDialog).isShow"/>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {AppConnectionState, FilterMode} from "@/services/VpnHood.Client.Api";
import TunnelClientCountryDialog from "@/components/TunnelClientCountryDialog.vue";
import ProtocolDialog from "@/components/ProtocolDialog.vue";
import NavigationDrawer from "@/components/NavigationDrawer.vue";
import PremiumServerAdDialog from "@/components/PremiumServerAdDialog.vue";
import AppBar from "@/components/AppBar.vue";
import PublicServerHintDialog from "@/components/PublicServerHintDialog.vue";
import SuppressSnackbar from "@/components/SuppressSnackbar.vue";
import UpdateSnackbar from "@/components/UpdateSnackbar.vue";
import {ComponentRouteController} from "@/services/ComponentRouteController";
import {UiConstants} from "@/UiConstants";
export default defineComponent({
  name: 'HomePage',
  components: {
    UpdateSnackbar,
    SuppressSnackbar,
    PublicServerHintDialog,
    AppBar,
    PremiumServerAdDialog,
    NavigationDrawer,
    ProtocolDialog,
    TunnelClientCountryDialog
  },
  data() {
    return {
      AppConnectionState,
      ComponentRouteController,
    }
  },
  async created() {
    // Reload 'state' every 1 second if app window is focused.
    setInterval(async () => {
      if (!document.hidden)
        await this.$vpnHoodApp.reloadState();
    }, 1000);
  },

  methods: {
    async onConnectButtonClick() {
      // If user has no selected server and want to connect
      if (this.$vpnHoodApp.data.state.connectionState === AppConnectionState.None) {

        // Find selected server
        const clientProfileInfo = this.$vpnHoodApp.data.clientProfileInfos.find(
            x => x.clientProfileId === this.$vpnHoodApp.data.settings.userSettings.defaultClientProfileId);

        if (!clientProfileInfo || !clientProfileInfo.clientProfileName) {
          this.$router.push("/servers");
          return;
        }
      }

      this.$vpnHoodApp.data.state.connectionState === AppConnectionState.None
          ? await this.$vpnHoodApp.connect()
          : await this.$vpnHoodApp.disconnect();
    },

    // Return text for connect button based on connection state
    connectButtonText(): string {
      if (!this.$vpnHoodApp.canDiagnose() &&
          (this.$vpnHoodApp.data.state.connectionState === AppConnectionState.Connected ||
              this.$vpnHoodApp.data.state.connectionState === AppConnectionState.Connecting))
        return this.$t("STOP_DIAGNOSING");

      else
        switch (this.$vpnHoodApp.data.state.connectionState) {
          case AppConnectionState.Initializing:
            return this.$t('INITIALIZING');
          case AppConnectionState.Connecting:
            return this.$t('DISCONNECT');
          case AppConnectionState.Waiting:
            return this.$t('DISCONNECT');
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
      if (this.$vpnHoodApp.data.state.connectionState === AppConnectionState.Connected && !this.bandwidthUsage()) return "mdi-check";
      if (this.$vpnHoodApp.data.state.connectionState === AppConnectionState.None) return "mdi-power-plug-off";
      if (this.$vpnHoodApp.data.state.connectionState === AppConnectionState.Connecting) return "mdi-power-plug";
      if (this.$vpnHoodApp.data.state.connectionState === AppConnectionState.Diagnosing) return "mdi-stethoscope";
      if (this.$vpnHoodApp.data.state.connectionState === AppConnectionState.Waiting) return "mdi-timer-sand";
      return null;
    },

    // Calculate user bandwidth usage
    bandwidthUsage(): { Used: string, Total: string } | null {
      if (!this.$vpnHoodApp.data.state || !this.$vpnHoodApp.data.state.sessionStatus || !this.$vpnHoodApp.data.state.sessionStatus.accessUsage)
        return null;

      let accessUsage = this.$vpnHoodApp.data.state.sessionStatus.accessUsage;
      if (accessUsage.maxTraffic === 0)
        return null;

      let mb = 1000000;
      let gb = 1000 * mb;
      let traffic = this.$vpnHoodApp.data.state.accountTraffic;

      let ret = {used: traffic.sent + traffic.received, total: accessUsage.maxTraffic};
      const total = ret.total >= gb ? Number((ret.total / gb).toFixed(1)).toString() + "GB" : Number((ret.total / mb).toFixed(0)).toString() + "MB";
      const used = ret.used >= gb ? Number((ret.used / gb).toFixed(1)).toString() + "GB" : Number((ret.used / mb).toFixed(0)).toString() + "MB";
      return {Used: used, Total: total};
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
      const clientProfileInfo = this.$vpnHoodApp.data.clientProfileInfos.find(x => x.clientProfileId === this.$vpnHoodApp.data.settings.userSettings.defaultClientProfileId);
      if (!clientProfileInfo || !clientProfileInfo.clientProfileName) {
        return this.$t("NO_SERVER_SELECTED");
      }
      return clientProfileInfo.clientProfileName;
    },

    // Return status of filtered apps by user (Only in mobile)
    appFilterStatus(): string {
      let appFilters = this.$vpnHoodApp.data.settings.userSettings.appFilters;
      if (!appFilters) appFilters = [];

      if (this.$vpnHoodApp.data.settings.userSettings.appFiltersMode === FilterMode.Exclude) return this.$t("APP_FILTER_STATUS_EXCLUDE", {x: appFilters.length});
      if (this.$vpnHoodApp.data.settings.userSettings.appFiltersMode === FilterMode.Include) return this.$t("APP_FILTER_STATUS_INCLUDE", {x: appFilters.length});
      return this.$t("APP_FILTER_STATUS_ALL");
    },

    getExpireDate(): string | null {
      if (this.$vpnHoodApp.data.state.connectionState !== AppConnectionState.Connected || !this.$vpnHoodApp.data.state.sessionStatus?.accessUsage?.expirationTime)
        return null;

      const expDate: any = this.$vpnHoodApp.data.state.sessionStatus.accessUsage.expirationTime;
      const options = {year: 'numeric', month: '2-digit', day: '2-digit'};
      // noinspection TypeScriptValidateJSTypes
      return expDate.toLocaleString("locales", options).replace(',', '');
    },

    alertForExpire(): boolean{
      if (!this.$vpnHoodApp.data.state.sessionStatus?.accessUsage?.expirationTime)
        return false;

      const expDate: any = this.$vpnHoodApp.data.state.sessionStatus.accessUsage.expirationTime;
      const currentDate = new Date().getTime();
      const diffTime = Math.abs(expDate - currentDate);
      const diffDays = Math.ceil(diffTime / UiConstants.daysOfDate);
      return diffDays <= 3;
    },

    udpProtocolButtonText(): string{
      if (this.$vpnHoodApp.data.state.connectionState === AppConnectionState.Connected && this.$vpnHoodApp.data.state.isUdpChannelSupported === false)
        return this.$t('PROTOCOL_UDP_OFF');

      return this.$vpnHoodApp.data.settings.userSettings.useUdpChannel ? this.$t('PROTOCOL_UDP_ON') : this.$t('PROTOCOL_UDP_OFF')
    }
  }
});
</script>
<style scoped>
#connectBtn:disabled{
  color: rgba(255, 255, 255, 0.50);
}
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
