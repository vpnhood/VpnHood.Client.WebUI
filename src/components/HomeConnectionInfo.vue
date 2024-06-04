<template>
  <div
      :id="isConnectApp ? 'connectionCircleIndicator' : 'circleOuter'"
      :class="determineClass()"
  >

    <div v-if="isConnectApp" class="position-absolute w-100 h-100"><div id="rotateCircle"></div></div>
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
  methods:{
    determineClass(){
      if (this.isConnectApp)
        return  this.connectionState?.toLowerCase() + ' my-3' + ' animation-' + this.isShowConnectAnimation();
      else
        return this.isConnected ? 'opacity-100' : 'opacity-30';
    },
    isShowConnectAnimation(): boolean{
      return this.isConnected && this.$vpnHoodApp.data.state.connectRequestTime
          ? (Date.now() - this.$vpnHoodApp.data.state.connectRequestTime.getTime()) < 6000 : true;
    }
  }
})
</script>
