<template>
  <div
      :id="isConnectApp ? 'connectionCircleIndicator' : 'circleOuter'"
      :class="determineClass()"
  >

    <div v-if="isConnectApp" class="position-absolute w-100 h-100">
      <div id="rotateCircle"></div>
    </div>
    <div v-else id="circle"></div>

    <div class="d-flex flex-column align-center justify-center position-relative h-100">

      <!-- Connection state text -->
      <span :class="[isConnectApp ? 'text-body-2' : 'text-body-1']">{{ connectionStateText }}</span>

      <!-- Usage -->
      <div class="d-flex flex-column align-center" v-if="isConnected && bandwidthTotal">
        <span class="text-body-1">{{ bandwidthUsed }} {{ $t("OF") }}</span>
        <span class="text-ui-tertiary">{{ bandwidthTotal }}</span>
      </div>

      <!-- Check -->
      <v-icon v-if="stateIcon" size="50" color="white">{{ stateIcon }}</v-icon>

      <!-- Access Key expire date -->
      <p v-if="!isConnectApp && expireDate"
         :class="[alertForExpire ? 'text-error' : 'text-purple-lighten-1', 'text-caption mt-2']">
        {{ $t("EXPIRE") + ": " + expireDate }}</p>

    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: "HomeConnectionInfo",
  data() {
    return {
      showConnectedAnimation: null as boolean | null,
    }
  },
  props: {
    isConnectApp: Boolean,
    isConnected: Boolean,
    alertForExpire: Boolean,
    connectionState: String,
    connectionStateText: String,
    stateIcon: String as () => String | null,
    expireDate: String as () => String | null,
    bandwidthUsed: String as () => String | null,
    bandwidthTotal: String as () => String | null,
  },
  emits: [
    "isConnectApp",
    "update:isConnected",
    "update:alertForExpire",
    "update:connectionState",
    "update:connectionStateText",
    "update:stateIcon",
    "update:expireDate",
    "update:bandwidthUsed",
    "update:bandwidthTotal",
  ],
  methods: {
    determineClass() {
      // VpnHoodCONNECT
      if (this.isConnectApp) {
        this.processConnectedAnimation();
        return this.connectionState?.toLowerCase() + ' my-3' + ' animation-' + (this.showConnectedAnimation === true).toString();
      }
      // VpnHoodClient
      return this.isConnected ? 'opacity-100' : 'opacity-30';
    },

    // Process connect animation state for VpnHoodCONNECT
    processConnectedAnimation(): void {
      if (!this.$vpnHoodApp.isConnected()) {
        this.showConnectedAnimation = false;
        return;
      }

      // It should not show animation if the previous state is null
      // If State is null, that means the page has been refreshed
      if (this.showConnectedAnimation === false)
        this.showConnectedAnimation = true;
    }
  }
})
</script>
