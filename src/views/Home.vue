<template>
  <v-container
      :class="['d-flex flex-column justify-space-between pb-5 h-100 state-'+this.connectionState().toLowerCase()]">

    <div id="topSection">

    </div>

    <div id="middleSection">
      <!-- Speed -->
      <v-row id="speedSection" align-content="center" justify="center"
             :class="[this.isConnected ? 'opacity-100': 'opacity-0', 'mb-4']">
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
      <div id="circleOuter" :class="[isConnected ? 'opacity-100' : 'opacity-30']">
        <div id="circle">
          <div id="circleContent" class="align-center op">
            <span id="stateText">{{ this.connectionState() }}</span>
            <!-- usage -->
            <div v-if="isConnected && this.bandwidthUsage()">
              <div id="bandwidthUsage">
                <span>{{ this.bandwidthUsage().used }}GB of</span>
              </div>
              <div id="bandwidthTotal">
                <span>{{ this.bandwidthUsage().total }}GB</span>
              </div>
            </div>
            <!-- check -->
            <v-icon class="state-icon" v-if="this.stateIcon() && !this.bandwidthUsage()" size="50" color="white">
              mdi-{{ this.stateIcon() }}
            </v-icon>
          </div>
        </div>
      </div>

      <!-- Connect buttons -->
      <v-col cols="12" order-sm="12" align-self="start" class="text-center">
        <!-- Connect Button -->
        <v-btn :class="[!isConnected ? 'grad-btn': 'blue-btn', 'btn']"
               @click="[!isConnected ? this.$clientApp.connect() : this.$clientApp.disconnect()]">
          {{ this.$clientApp.ConnectionState }}
        </v-btn>
      </v-col>
    </div>

    <div id="bottomSection">

    </div>

  </v-container>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'HomeView',
  data() {
    return {
      isConnected: this.connectionState() === "Connected",
    }
  },
  async created() {
    await this.$clientApp.loadApp({
      withState: true,
      withFeatures: true,
      withSettings: true,
      withClientProfileItems: true
    });
    setInterval(async () => {
      if (!document.hidden)
        await this.$clientApp.loadApp({withState: true});
      console.log(this.$clientApp.ConnectionState);
      console.log(this.$clientApp.State?.speed);
      console.log(this.isConnected);
      console.log(this.connectionState());

    }, 1000);

  },

  computed: {},

  methods: {
    connectionState(): string {
      switch (this.$clientApp.ConnectionState) {
        case "Connecting":
          return this.$t('CONNECTING');
        case "Waiting":
          return this.$t('WAITING');
        case "Connected":
          return this.$t('CONNECTED');
        case "Disconnecting":
          return this.$t('DISCONNECTING');
        case "Diagnosing":
          return this.$t('DIAGNOSING');
        default:
          return this.$t('DISCONNECTED');
      }
    },

    stateIcon(): string | null {
      if (this.connectionState() === "Connected") return "check";
      if (this.connectionState() === 'None' || this.connectionState() === 'Disconnected') return "power-plug-off";
      if (this.connectionState() === 'Connecting') return "power";
      if (this.connectionState() === 'Diagnosing') return "network_check";
      if (this.connectionState() === 'Waiting') return "hourglass_top";
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
  }
});
</script>
