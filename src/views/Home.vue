<template>
  <v-container :class="['d-flex flex-column justify-space-between pb-5 h-100 state-'+connectionState().toLowerCase()]">

    <div id="topSection">

    </div>

    <div id="middleSection">
      <!-- Speed -->
      <v-row v-if="isConnected" id="speedSection" align-content="center" justify="center" class="mb-4">
        <v-col cols="auto">
          <span class="color-sky-blue">{{ $t("downloadSpeed") }}:</span>
          <span class="px-2">{{formatSpeed(loadAppResponse.state.speed.received)}}</span>
          <span class="color-light-purple">Mbps</span>
        </v-col>
        <v-col cols="auto">
          <span class="color-sky-blue">{{ $t("uploadSpeed") }}:</span>
          <span class="px-2">{{formatSpeed(loadAppResponse.state.speed.sent)}}</span>
          <span class="color-light-purple">Mbps</span>
        </v-col>
      </v-row>
      <!-- Circle -->
      <div id="circleOuter" class="">
        <div id="circle">
          <div id="circleContent" class="align-center">
            <span id="stateText">{{connectionState()}}</span>
            <!-- usage -->
            <div v-if="isConnected && this.bandwidthUsage()">
              <div id="bandwidthUsage">
                <span>{{ this.bandwidthUsage().used }}GB of</span>
              </div>
              <div id="bandwithTotal">
                <span>{{ this.bandwidthUsage().total }}GB</span>
              </div>
            </div>
            <!-- check -->
            <v-icon class="state-icon" v-if="stateIcon != null" size="50" color="white">{{ this.stateIcon }}
            </v-icon>
          </div>
        </div>
      </div>

    </div>

    <div id="bottomSection">

    </div>

  </v-container>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {LoadAppParam, LoadAppResponse} from "@/hood/VpnHood.Client.Api";
import {ClientApiFactory} from "@/hood/ClientApiFactory";

export default defineComponent({
  name: 'HomeView',
  data() {
    return {
      loadAppResponse: {} as LoadAppResponse,
      isConnected: false,
    }
  },
  created() {
    this.loadApp(
        new LoadAppParam({
          withSettings: true,
          withState: true,
          withClientProfileItems: true,
          withFeatures: true,
        })
    );
    setInterval(() => {
      if (!document.hidden)
        this.loadApp(
            new LoadAppParam({
              withSettings: false,
              withState: true,
              withClientProfileItems: false,
              withFeatures: false,
            })
        );
    }, 1000);
  },

  methods: {
    async loadApp(loadAppParam: LoadAppParam){
      this.loadAppResponse = await ClientApiFactory.instance.ApiClient().loadApp(loadAppParam);
      console.log(this.loadAppResponse);
    },

    connectionState(): string{
      const connectionState = this.loadAppResponse.state?.connectionState;
      if (connectionState){
        switch (connectionState) {
          case "Connecting": return this.$t('CONNECTING');
          case "Waiting": return this.$t('WAITING');
          case "Connected": this.isConnected = true; return this.$t('CONNECTED');
          case "Disconnecting": return this.$t('DISCONNECTING');
          case "Diagnosing": return this.$t('DIAGNOSING');
          default: return this.$t('DISCONNECTED');
        }
      }
      else {
        return this.$t('DISCONNECTED');
      }
    },

    bandwidthUsage(): {} | null {
      if (!this.loadAppResponse.state || !this.loadAppResponse.state.sessionStatus || !this.loadAppResponse.state.sessionStatus.accessUsage)
        return null;

      let accessUsage = this.loadAppResponse.state.sessionStatus.accessUsage;
      if (accessUsage.maxTraffic == 0)
        return null;

      let mb = 1000000;
      let gb = 1000 * mb;
      let traffic = this.loadAppResponse.state.accountTraffic;

      let ret = { used: traffic.sent + traffic.received, total: accessUsage.maxTraffic };
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
