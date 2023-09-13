<template>
  <v-container class="d-flex flex-column justify-space-between pb-3 h-100">

    <!-- App bar & navigation drawer -->
    <div id="topSection">

      <!-- Navigation drawer -->
      <NavigationDrawer ref="navigationDrawer" @open-settings="$refs.settingsSheet.isShow = true" />

      <!-- App bar -->
      <v-app-bar
          color="transparent"
          elevation="0"
      >
        <!-- Navigation drawer button -->
        <template v-slot:prepend>
          <v-app-bar-nav-icon
              @click.stop="$refs.navigationDrawer.drawer = !$refs.navigationDrawer.drawer"></v-app-bar-nav-icon>
        </template>

        <!-- App name -->
        <v-spacer></v-spacer>
        <h6>{{ $t("APP_NAME") }}</h6>
        <v-spacer></v-spacer>

        <!-- App mini version -->
        <span class="opacity-30 txt-small-1 me-4">v {{ $vpnHoodApp.appVersion(false) }}</span>
      </v-app-bar>

    </div>

    <!-- Speed & Circle & Connect button -->
    <div id="middleSection" :class="'state-' + [$vpnHoodApp.state.connectionState.toLowerCase()]">

      <!-- Speed -->
      <v-row id="speedSection" align-content="center" justify="center"
             :class="[isConnected() ? 'opacity-100': 'opacity-0', 'mb-4']">
        <v-col cols="auto">
          <span class="color-sky-blue">{{ $t("downloadSpeed") }}:</span>
          <span class="px-2">{{ formatSpeed(this.$vpnHoodApp.state.speed.received) }}</span>
          <span class="color-light-purple">Mbps</span>
        </v-col>
        <v-col cols="auto">
          <span class="color-sky-blue">{{ $t("uploadSpeed") }}:</span>
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
      <v-col cols="12" class="text-center mt-3">
        <v-btn :class="[$vpnHoodApp.state.connectionState === 'None' ? 'grad-btn': 'blue-btn', 'btn text-uppercase']"
               @click="[$vpnHoodApp.state.connectionState === 'None' ? $vpnHoodApp.connect() : $vpnHoodApp.disconnect()]">
          {{ connectButtonText() }}
        </v-btn>
      </v-col>

    </div>

    <!-- Config buttons -->
    <div id="bottomSection" class="text-truncate">

      <!-- Country button -->
      <v-btn
          depressed
          block
          variant="text"
          prepend-icon="mdi-earth"
          class="config-item mb-2"
          @click="$refs.tunnelClientCountrySheet.isShow = true"
      >
        <span>{{ $t("IP_FILTER_STATUS_TITLE") }}</span>
        <v-icon>mdi-chevron-right</v-icon>
        <span class="text-capitalize color-light-purple">{{
            $vpnHoodApp.settings.userSettings.tunnelClientCountry ? $t("IP_FILTER_ALL") : $t("IP_FILTER_STATUS_EXCLUDE_CLIENT_COUNTRY")
          }}</span>
        <img v-if="!$vpnHoodApp.settings.userSettings.tunnelClientCountry"
             :src="require(`../assets/img/country_flags/${$vpnHoodApp.state.clientIpGroup.ipGroupId}.png`)"
             alt="country flag" width="24" class="ms-2"/>
      </v-btn>

      <!-- Protocol button -->
      <v-btn
          depressed
          block
          variant="text"
          prepend-icon="mdi-transit-connection-variant"
          class="config-item mb-2"
          @click="$refs.protocolSheet.isShow = true"
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
          @click="$refs.serverSheet.isShow = true"
      >
        <span>{{ $t("SELECTED_SERVER") }}</span>
        <v-icon>mdi-chevron-right</v-icon>
        <span class="text-capitalize color-light-purple">{{ getDefaultClientProfileName() }}</span>
      </v-btn>

    </div>

    <!-- Components -->
    <TunnelClientCountrySheet ref="tunnelClientCountrySheet"/>
    <ProtocolSheet ref="protocolSheet"/>
    <ServersSheet ref="serverSheet"/>
    <AddServerSheet ref="addServerSheet"/>
    <SettingSheet ref="settingsSheet"/>

  </v-container>

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

export default defineComponent({
  name: 'HomeView',
  components: {SettingSheet, NavigationDrawer, AddServerSheet, ServersSheet, ProtocolSheet, TunnelClientCountrySheet},
  data() {
    return {
      drawer: false,
    }
  },
  created() {
    setInterval(async () => {
      if (!document.hidden)
        await this.$vpnHoodApp.loadApp({withState: true, withSettings: true});
    }, 1000);
  },

  computed: {},

  methods: {

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

    stateIcon(): string | null {
      if (this.$vpnHoodApp.state.connectionState === AppConnectionState.Connected && !this.bandwidthUsage()) return "check";
      if (this.$vpnHoodApp.state.connectionState === AppConnectionState.None) return "power-plug-off";
      if (this.$vpnHoodApp.state.connectionState === AppConnectionState.Connecting) return "power-plug";
      if (this.$vpnHoodApp.state.connectionState === AppConnectionState.Diagnosing) return "speedometer";
      if (this.$vpnHoodApp.state.connectionState === AppConnectionState.Waiting) return "hourglass_top";
      return null;
    },

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

    formatSpeed(speed: number): string {
      return (speed * 10 / 1000000).toFixed(2);
    },

    isConnected(): boolean {
      return this.$vpnHoodApp.state.connectionState == AppConnectionState.Connected;
    },

    getDefaultClientProfileName(): string {
      const clientProfileItem = this.$vpnHoodApp.clientProfileItems.find(x => x.clientProfile.clientProfileId ===  this.$vpnHoodApp.settings.userSettings.defaultClientProfileId);
      if (!clientProfileItem || !clientProfileItem.clientProfile || !clientProfileItem.token.name){
        throw new Error("Could not find default client profile id");
      }
      return clientProfileItem.clientProfile.name ?? clientProfileItem.token.name;
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
