<template>
  <div class="h-100">
    <!-- Navigation drawer -->
    <NavigationDrawer v-model="ComponentRouteController.create($componentName.NavigationDrawer).isShow"/>

    <!-- App bar -->
    <AppBar/>

    <v-container class="h-100 pt-0">
      <v-row align-content="space-between" justify="center" class="h-100 my-0">

        <!-- Go Premium button Only for VpnHoodConnect -->
        <v-col  cols="12" class="text-center pt-0">
          <PurchaseSubscriptionDialog
              v-if="$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect"
              v-model="ComponentRouteController.create($componentName.PurchaseSubscriptionDialog).isShow"
          />
        </v-col>

        <!-- Speed & Circle & Connect button -->
        <v-col cols="12" :class="'py-0 text-center state-' + [$vpnHoodApp.data.state.connectionState.toLowerCase()]">

          <!-- Speed -->
          <v-row id="speedSection" align-content="center" justify="center"
                 :class="[isConnected() ? 'opacity-100' : 'opacity-0', 'mb-2']">
            <v-col cols="auto">
              <span class="text-ui-tertiary text-body-2">{{ $t("DOWNLOAD_SPEED") }}:</span>
              <span class="px-2 text-body-2">{{ formatSpeed($vpnHoodApp.data.state.speed.received) }}</span>
              <span class="text-white opacity-50 text-caption">Mbps</span>
            </v-col>
            <v-col cols="auto">
              <span class="text-ui-tertiary text-body-2">{{ $t("UPLOAD_SPEED") }}:</span>
              <span class="px-2 text-body-2">{{ formatSpeed($vpnHoodApp.data.state.speed.sent) }}</span>
              <span class="text-white opacity-50 text-caption">Mbps</span>
            </v-col>
          </v-row>

          <!--VpnHoodConnect Circle -->
          <div v-if="$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect" id="connectionCircleIndicator" :class="[$vpnHoodApp.data.state.connectionState.toLowerCase(), 'my-3']">
            <div class="position-absolute w-100 h-100">
              <div id="rotateCircle"></div>
            </div>
            <div class="d-flex flex-column align-center justify-center">

              <!-- Connection state text -->
              <span class="text-body-1">{{
                  $vpnHoodApp.data.state.connectionState === AppConnectionState.None ? $t("DISCONNECTED") : $t($vpnHoodApp.data.state.connectionState.toUpperCase())
                }}
              </span>

              <!-- Usage -->
              <div class="d-flex flex-column align-center" v-if="isConnected() && bandwidthUsage()">
                <span class="text-body-1">{{ bandwidthUsage()?.Used }} {{ $t("OF") }}</span>
                <span class="text-secondary">{{ bandwidthUsage()?.Total }}</span>
              </div>

              <!-- Check -->
              <v-icon v-if="stateIcon()" size="50" color="white">
                {{ stateIcon() }}
              </v-icon>

            </div>
          </div>

          <!--VpnHood Circle -->
          <div v-else id="circleOuter" :class="[isConnected() ? 'opacity-100' : 'opacity-30']">
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
                  <span class="text-tertiary">{{ bandwidthUsage()?.Total }}</span>
                </div>

                <!-- Check -->
                <v-icon v-if="stateIcon()" size="50" color="white">
                  {{ stateIcon() }}
                </v-icon>

                <!-- Access Key expire date -->
                <p v-if="getExpireDate()" :class="[alertForExpire() ? 'text-error' : 'text-purple-lighten-1', 'text-caption mt-2']">{{$t("EXPIRE") + ": " + getExpireDate()}}</p>
              </div>
            </div>
          </div>


          <!-- Connect button -->
          <v-btn
              height="40px"
              width="180px"
              rounded="pill"
              :disabled="$vpnHoodApp.data.state.connectionState === AppConnectionState.Disconnecting ||
              $vpnHoodApp.data.state.connectionState === AppConnectionState.Initializing"
              :class="[$vpnHoodApp.data.state.connectionState === AppConnectionState.Connected
              ? 'secondary-btn'
              : 'master-btn',
              'text-button mt-5',
              $vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect
              ? 'solid'
              : '']"
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
              variant="outlined"
              size="small"
              prepend-icon="mdi-earth"
              class="config-item mb-1"
              @click="ComponentRouteController.showComponent($componentName.TunnelClientCountryDialog)">
            <span>{{ $t("IP_FILTER_STATUS_TITLE") }}</span>
            <v-icon>mdi-chevron-right</v-icon>
            <span class="text-capitalize text-caption text-white opacity-50">{{
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
              class="config-item mb-1"
              to="/apps-filter"
          >
            <span>{{ $t("APP_FILTER_STATUS_TITLE") }}</span>
            <v-icon>mdi-chevron-right</v-icon>
            <span class="text-capitalize text-caption text-white opacity-50">{{ appFilterStatus() }}</span>
          </v-btn>

          <!-- Protocol button -->
          <v-btn
              depressed
              :block="true"
              variant="text"
              size="small"
              prepend-icon="mdi-transit-connection-variant"
              class="config-item mb-1"
              @click="ComponentRouteController.showComponent($componentName.ProtocolDialog)">
            <span>{{ $t("PROTOCOL_TITLE") }}</span>
            <v-icon>mdi-chevron-right</v-icon>
            <span class="text-capitalize text-caption text-white opacity-50">{{ udpProtocolButtonText() }}</span>
          </v-btn>

          <!-- Servers button -->
          <v-btn
              v-if="$vpnHoodApp.data.features.uiName !== AppName.VpnHoodConnect || $vpnHoodApp.data.clientProfileInfos.length > 2"
              depressed
              :block="true"
              variant="text"
              size="small"
              prepend-icon="mdi-dns"
              class="config-item"
              @click="showServers()"
          >
            <span>{{ $t("SELECTED_SERVER") }}</span>
            <v-icon>mdi-chevron-right</v-icon>
            <span class="text-capitalize text-caption text-white opacity-50">{{ getDefaultClientProfileName() }}</span>
          </v-btn>

        </v-col>
      </v-row>
    </v-container>

    <!-- New server added toast -->
    <v-snackbar v-model="$vpnHoodApp.data.uiState.showNewServerAdded" location="top" :timeout="3000" color="secondary">
      {{ $t("NEW_SERVER_ADDED") }}
    </v-snackbar>

    <!-- Components -->
    <UpdateSnackbar v-model="$vpnHoodApp.data.uiState.showUpdateSnackbar"/>
    <SuppressSnackbar v-model="$vpnHoodApp.data.uiState.showSuppressSnackbar"/>
    <TunnelClientCountryDialog v-model="ComponentRouteController.create($componentName.TunnelClientCountryDialog).isShow"/>
    <ProtocolDialog v-model="ComponentRouteController.create($componentName.ProtocolDialog).isShow"/>
    <ServersDialogForVpnHoodConnect  v-model="ComponentRouteController.create($componentName.ServersDialogForVpnHoodConnect).isShow"/>
    <MigratePublicServerDialog v-if="$vpnHoodApp.data.features.uiName !== AppName.VpnHoodConnect" v-model="ComponentRouteController.create($componentName.PublicServerHintDialog).isShow"/>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {AppConnectionState, FilterMode} from "@/services/VpnHood.Client.Api";
import TunnelClientCountryDialog from "@/components/TunnelClientCountryDialog.vue";
import ProtocolDialog from "@/components/ProtocolDialog.vue";
import NavigationDrawer from "@/components/NavigationDrawer.vue";
import PurchaseSubscriptionDialog from "@/components/PurchaseSubscriptionDialog.vue";
import AppBar from "@/components/AppBar.vue";
import SuppressSnackbar from "@/components/SuppressSnackbar.vue";
import UpdateSnackbar from "@/components/UpdateSnackbar.vue";
import {ComponentRouteController} from "@/services/ComponentRouteController";
import {UiConstants, AppName} from "@/UiConstants";
import ServersDialogForVpnHoodConnect from "@/components/ServersDialogForVpnHoodConnect.vue";
import MigratePublicServerDialog from "@/components/MigratePublicServerDialog.vue";
export default defineComponent({
  name: 'HomePage',
  components: {
    MigratePublicServerDialog,
    ServersDialogForVpnHoodConnect,
    UpdateSnackbar,
    SuppressSnackbar,
    AppBar,
    PurchaseSubscriptionDialog,
    NavigationDrawer,
    ProtocolDialog,
    TunnelClientCountryDialog
  },
  data() {
    return {
      AppName,
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

          // Just for VpnHoodConnect
          // Always set public server as default profile if user does not have a premium server or default selected server.
          if (this.$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect){
            const testServerProfile = this.$vpnHoodApp.data.clientProfileInfos.find(x => x.tokenId === this.$vpnHoodApp.data.features.testServerTokenId);
            if (!testServerProfile) throw new Error("Could not found public server profile.");
            this.$vpnHoodApp.data.settings.userSettings.defaultClientProfileId = testServerProfile?.clientProfileId;
            await this.$vpnHoodApp.saveUserSetting();
          }

          // Just for VpnHood
          else {
            this.$router.push("/servers");
            return;
          }
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
      if (!clientProfileInfo || !clientProfileInfo.clientProfileName)
        return this.$t("NO_SERVER_SELECTED");

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
    },

    showServers(): void{
      if (this.$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect)
        this.ComponentRouteController.showComponent(this.$componentName.ServersDialogForVpnHoodConnect);
      else
        this.$router.push('/servers');
    }
  }
});
</script>

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
</style>
