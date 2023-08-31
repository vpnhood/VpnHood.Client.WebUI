<template>
  <v-container
      :class="['d-flex flex-column justify-space-between pb-5 h-100 state-'+$clientApp.ConnectionState.toLowerCase()]">

    <div id="topSection">

    </div>

    <div id="middleSection">

      <!-- Speed -->
      <v-row id="speedSection" v-if="this.$clientApp.State" align-content="center" justify="center"
             :class="[isConnected() ? 'opacity-100': 'opacity-0', 'mb-4']">
        <v-col cols="auto">
          <span class="color-sky-blue">{{ $t("downloadSpeed") }}:</span>
          <span class="px-2">{{ formatSpeed(this.$clientApp.State.speed.received) }}</span>
          <span class="color-light-purple">Mbps</span>
        </v-col>
        <v-col cols="auto">
          <span class="color-sky-blue">{{ $t("uploadSpeed") }}:</span>
          <span class="px-2">{{ formatSpeed(this.$clientApp.State.speed.sent) }}</span>
          <span class="color-light-purple">Mbps</span>
        </v-col>
      </v-row>

      <!-- Circle -->
      <div id="circleOuter" :class="[isConnected() ? 'opacity-100' : 'opacity-30']">
        <div id="circle">
          <div class="d-flex flex-column align-center justify-center">

            <!-- Connection state text -->
            <span class="txt-large-4">{{ $t($clientApp.ConnectionState.toUpperCase()) }}</span>

            <!-- Usage -->
            <div class="d-flex flex-column align-center" v-if="isConnected() && bandwidthUsage()">
              <span class="txt-large-3">{{ bandwidthUsage().used }}GB of</span>
              <span class="color-sky-blue h1">{{ bandwidthUsage().total }}GB</span>
            </div>

            <!-- Check -->
            <v-icon v-if="stateIcon()" size="50" color="white">
              mdi-{{ stateIcon() }}
            </v-icon>

          </div>
        </div>
      </div>

      <!-- Connect buttons -->
      <v-col cols="12" class="text-center mt-3">
        <v-btn :class="[!isConnected() ? 'grad-btn': 'blue-btn', 'btn text-uppercase']"
               @click="[!isConnected() ? $clientApp.connect() : $clientApp.disconnect()]">
          {{ buttonText() }}
        </v-btn>
      </v-col>

    </div>

    <div id="bottomSection">
    </div>

  </v-container>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {AppConnectionState} from "@/hood/VpnHood.Client.Api";

export default defineComponent({
  name: 'HomeView',
  data() {
    return {
    }
  },
  created() {
    setInterval(async () => {
      if (!document.hidden)
        await this.$clientApp.loadApp({withState: true});
    }, 1000);
  },

  methods: {
    buttonText(): string {
      switch (this.$clientApp.ConnectionState) {
        case "Connecting":
          return this.$t('CONNECTING');
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
      if (this.$clientApp.ConnectionState === AppConnectionState.Connected && !this.bandwidthUsage()) return "check";
      if (this.$clientApp.ConnectionState === AppConnectionState.None) return "power-plug-off";
      if (this.$clientApp.ConnectionState === AppConnectionState.Connecting) return "power-plug";
      if (this.$clientApp.ConnectionState === AppConnectionState.Diagnosing) return "network_check";
      if (this.$clientApp.ConnectionState=== AppConnectionState.Waiting) return "hourglass_top";
      console.log(this.$clientApp.ConnectionState);
      return null;
    },

    bandwidthUsage(): {} | null {
      if (!this.$clientApp.State || !this.$clientApp.State.sessionStatus || !this.$clientApp.State.sessionStatus.accessUsage)
        return null;

      let accessUsage = this.$clientApp.State.sessionStatus.accessUsage;
      if (accessUsage.maxTraffic == 0)
        return null;

      let mb = 1000000;
      let gb = 1000 * mb;
      let traffic = this.$clientApp.State.accountTraffic;

      let ret = {used: traffic.sent + traffic.received, total: accessUsage.maxTraffic};
      ret.total = ret.total >= gb ? Number((ret.total / gb).toFixed(1)) : Number((ret.total / mb).toFixed(0));
      ret.used = ret.used >= gb ? Number((ret.used / gb).toFixed(1)) : Number((ret.used / mb).toFixed(0));
      return ret;
    },

    formatSpeed(speed: number): string {
      return (speed * 10 / 1000000).toFixed(2);
    },

    isConnected(): boolean{
      return this.$clientApp.ConnectionState == AppConnectionState.Connected;
    },
  }
});
</script>
