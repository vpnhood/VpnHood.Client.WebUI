<template>

  <!-- App bar -->
  <HomeAppBar/>

  <v-row align-content="space-between" justify="center" class="h-100 px-md-2 pb-3 ma-0">

    <v-col cols="12" class="text-center pt-0">
      <!-- Go Premium button Only for VpnHoodConnect -->
      <div v-if="$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect">
        <!-- Go Premium button for guest and normal user -->
        <v-btn
            v-if="!$vpnHoodApp.data.userState.userAccount?.subscriptionId"
            :flat="true"
            variant="outlined"
            color="tertiary"
            rounded="pill"
            size="small"
            height="35"
            @click="$router.push('/purchase-subscription')"
            class="ps-1 pe-3 text-capitalize"
        >
          <v-icon icon="mdi-crown" color="primary" size="25" class="bg-tertiary rounded-circle me-2"/>
          {{ $t("GO_PREMIUM") }}
        </v-btn>

        <!-- Go Premium Server button for premium user -->
        <v-chip
            v-else
            prepend-icon="mdi-crown"
            :text="$t('YOU_ARE_PREMIUM')"
            color="secondary-lighten-1"
            variant="tonal"
            tag="h6"
            @click="$router.push('/purchase-subscription')"
        />
      </div>
    </v-col>

    <!-- Speed & Circle & Connect button -->
    <v-col cols="12" :class="'py-0 text-center state-' + [$vpnHoodApp.data.state.connectionState.toLowerCase()]">

      <!-- Speed -->
      <v-row id="speedSection" align-content="center" justify="center"
             :class="[isConnected() ? 'opacity-100' : 'opacity-0', 'mb-2']">
        <v-col cols="auto d-inline-flex">
          <span class="text-ui-tertiary text-body-2">{{ $t("DOWNLOAD_SPEED") }}:</span>
          <span class="px-2 text-body-2" dir="ltr">{{ formatSpeed($vpnHoodApp.data.state.speed.received) }}</span>
          <span class="text-white opacity-50 text-caption">Mbps</span>
        </v-col>
        <v-col cols="auto d-inline-flex">
          <span class="text-ui-tertiary text-body-2">{{ $t("UPLOAD_SPEED") }}:</span>
          <span class="px-2 text-body-2" dir="ltr">{{ formatSpeed($vpnHoodApp.data.state.speed.sent) }}</span>
          <span class="text-white opacity-50 text-caption order-last">Mbps</span>
        </v-col>
      </v-row>

      <!-- Circle -->
      <HomeConnectionInfo
          :is-connect-app="$vpnHoodApp.isConnectApp()"
          :is-connected="isConnected"
          :alert-for-expire="alertForExpire"
          :connection-state="$vpnHoodApp.data.state.connectionState"
          :connection-state-text="$vpnHoodApp.getConnectionStateText()"
          :state-icon="stateIcon"
          :expire-date="getExpireDate"
          :bandwidth-used="bandwidthUsage()?.Used"
          :bandwidth-total="bandwidthUsage()?.Total"
      />

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
              $vpnHoodApp.isConnectApp()
              ? 'solid'
              : '']"
          @click="onConnectButtonClick"
      >
        {{ connectButtonText() }}
      </v-btn>

    </v-col>

    <!-- Config buttons -->
    <v-col cols="12" class="text-truncate">
      <v-row>

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
              @click="$router.push('/servers')"
          >
              <span>{{ $vpnHoodApp.isSingleServerMode() ? $t("LOCATION") : $t("SERVER") }}</span>
            <v-icon :icon="chevronIcon"/>
              <span class="text-capitalize text-caption text-white opacity-50 text-truncate" style="max-width: 195px;">
                {{ $vpnHoodApp.getActiveServerNameOrLocation() }}
              </span>

            <template v-slot:append v-if="$vpnHoodApp.data.state.serverLocationInfo">
              <v-chip
                  v-if="$vpnHoodApp.isLocationAutoSelected($vpnHoodApp.data.state.serverLocationInfo.countryCode)"
                  :text="$t('AUTO')"
                  size="small"
                  density="compact"
                  variant="tonal"
                  color="gray-lighten-3"
                  class="text-caption px-2"
              />
              <span v-else class="overflow-hidden d-inline-flex align-center justify-center ms-1" style="width: 23px; height: 15px;border-radius: 3px;">
                  <img :src="$vpnHoodApp.getCountryFlag($vpnHoodApp.data.state.serverLocationInfo.countryCode)" height="100%" alt="country flag"/>
              </span>
            </template>
          </v-btn>
        </v-col>

        <!-- Exclude country button -->
        <v-col cols="12" md="6" class="py-0 pa-md-1">
          <v-btn
              depressed
              block
              variant="outlined"
              size="small"
              prepend-icon="mdi-call-split"
              class="config-item mb-1"
              @click="ComponentRouteController.showComponent($componentName.TunnelClientCountryDialog)">
            <span>{{ $t("COUNTRIES") }}</span>
            <v-icon :icon="chevronIcon"/>
            <span class="text-capitalize text-caption text-white opacity-50">
              {{$vpnHoodApp.data.settings.userSettings.tunnelClientCountry
                    ? $t("IP_FILTER_ALL")
                    : $t("IP_FILTER_STATUS_EXCLUDE_CLIENT_COUNTRY")}}
            </span>
          </v-btn>
        </v-col>

        <!-- App filter button -->
        <v-col cols="12" md="6" class="py-0 pa-md-1">
          <v-btn
              v-if="$vpnHoodApp.data.features.isExcludeAppsSupported || $vpnHoodApp.data.features.isIncludeAppsSupported"
              depressed
              block
              variant="text"
              size="small"
              prepend-icon="mdi-call-split"
              class="config-item mb-1"
              to="/apps-filter"
          >
            <span>{{ $t("APPS") }}</span>
            <v-icon :icon="chevronIcon"/>
            <span class="text-capitalize text-caption text-white opacity-50">{{ appFilterStatus() }}</span>
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
              @click="ComponentRouteController.showComponent($componentName.ProtocolDialog)">
            <span>{{ $t("PROTOCOL_TITLE") }}</span>
            <v-icon :icon="chevronIcon"/>
            <span class="text-capitalize text-caption text-white opacity-50">{{ udpProtocolButtonText() }}</span>
          </v-btn>
        </v-col>

      </v-row>
    </v-col>
  </v-row>

  <!-- New server added toast -->
  <v-snackbar v-model="$vpnHoodApp.data.uiState.showNewServerAdded" location="top" :timeout="3000" color="secondary">
    {{ $t("NEW_SERVER_ADDED") }}
  </v-snackbar>

  <!-- Components -->
  <UpdateSnackbar v-model="$vpnHoodApp.data.uiState.showUpdateSnackbar"/>
  <SuppressSnackbar v-model="$vpnHoodApp.data.uiState.showSuppressSnackbar"/>
  <TunnelClientCountryDialog v-model="ComponentRouteController.create($componentName.TunnelClientCountryDialog).isShow"/>
  <ProtocolDialog v-model="ComponentRouteController.create($componentName.ProtocolDialog).isShow"/>

</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {AppConnectionState, FilterMode} from "@/services/VpnHood.Client.Api";
import TunnelClientCountryDialog from "@/components/TunnelClientCountryDialog.vue";
import ProtocolDialog from "@/components/ProtocolDialog.vue";
import HomeAppBar from "@/components/HomeAppBar.vue";
import SuppressSnackbar from "@/components/SuppressSnackbar.vue";
import UpdateSnackbar from "@/components/UpdateSnackbar.vue";
import {ComponentRouteController} from "@/services/ComponentRouteController";
import {AppName, UiConstants, SubscriptionPlansId} from "@/UiConstants";
import HomeConnectionInfo from "@/components/HomeConnectionInfo.vue";

export default defineComponent({
  name: 'HomePage',
  components: {
    HomeConnectionInfo,
    UpdateSnackbar,
    SuppressSnackbar,
    HomeAppBar,
    ProtocolDialog,
    TunnelClientCountryDialog
  },
  data() {
    return {
      AppName,
      AppConnectionState,
      ComponentRouteController,
      SubscriptionPlansId,
      lastConnectPressedTime: Date.now() - 1000,
      chevronIcon: this.$vuetify.locale.isRtl ? 'mdi-chevron-left' : 'mdi-chevron-right',
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
    async onConnectButtonClick(): Promise<void> {
      // Prevent double click
      if (this.lastConnectPressedTime >= (Date.now() - 1000))
        return;
      this.lastConnectPressedTime = Date.now();

      // Disconnect
      if (this.$vpnHoodApp.data.state.canDisconnect) {
        await this.$vpnHoodApp.disconnect();
        return;
      }

      // Show servers list if user has no selected server and want to connect
      if (!this.$vpnHoodApp.data.state.clientProfile) {
        this.$router.push('/servers');
        return;
      }

      if (this.$vpnHoodApp.data.state.canConnect)
        await this.$vpnHoodApp.connect();
    },

    // Return text for connect button based on connection state
    connectButtonText(): string {
      if (!this.$vpnHoodApp.data.state.canDiagnose &&
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

    alertForExpire(): boolean {
      if (!this.$vpnHoodApp.data.state.sessionStatus?.accessUsage?.expirationTime)
        return false;

      const expDate: any = this.$vpnHoodApp.data.state.sessionStatus.accessUsage.expirationTime;
      const currentDate = new Date().getTime();
      const diffTime = Math.abs(expDate - currentDate);
      const diffDays = Math.ceil(diffTime / UiConstants.daysOfDate);
      return diffDays <= 3;
    },

    udpProtocolButtonText(): string {
      if (this.$vpnHoodApp.data.state.connectionState === AppConnectionState.Connected &&
          this.$vpnHoodApp.data.state.isUdpChannelSupported === false)
        return this.$t('PROTOCOL_UDP_OFF');

      return this.$vpnHoodApp.data.settings.userSettings.useUdpChannel
          ? this.$t('PROTOCOL_UDP_ON')
          : this.$t('PROTOCOL_UDP_OFF')
    },
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
.VpnHoodConnect .config-item{
  /*noinspection CssUnresolvedCustomProperty*/
  background: rgba(var(--v-theme-primary-darken-1), 0.4);
}
</style>

<style>
/*noinspection CssUnusedSymbol*/
#serverButton .v-btn__content{
  flex-grow: 1;
  justify-content: start;
}
</style>
