<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import { ref } from 'vue';
import i18n from '@/locales/i18n';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const showConnectedAnimation = ref<boolean | null>(null);

const props = defineProps<{
  alertForExpire: boolean,
  stateIcon: string | null,
  expireDate: string | null,
  bandwidthUsed: string | undefined,
  bandwidthTotal: string | undefined,
}>();

function determineClass() {
  // VpnHoodCONNECT
  if (vhApp.isConnectApp()) {
    processConnectedAnimation();
    return vhApp.data.state.connectionState.toLowerCase() + ' my-3' + ' animation-' +
      (showConnectedAnimation.value === true).toString();
  }
  // VpnHoodClient
  return vhApp.isConnected() ? 'opacity-100' : 'opacity-30';
}

// Process connect animation state for VpnHoodCONNECT
function processConnectedAnimation(): void {
  if (vhApp.isConnected()) {
    showConnectedAnimation.value = false;
    return;
  }

  // It should not show animation if the previous state is null
  // If State is null, that means the page has been refreshed
  if (showConnectedAnimation.value === false)
    showConnectedAnimation.value = true;
}
</script>

<template>
  <div
    :id="vhApp.isConnectApp() ? 'connectionCircleIndicator' : 'circleOuter'"
    :class="determineClass()"
  >

    <div v-if="vhApp.isConnectApp()" class="position-absolute w-100 h-100">
      <div id="rotateCircle"></div>
    </div>
    <div v-else id="circle"></div>

    <div class="d-flex flex-column align-center justify-center position-relative h-100">

      <!-- Connection state text -->
      <span :class="[vhApp.isConnectApp() ? 'text-body-2' : 'text-body-1']">{{ vhApp.getConnectionStateText() }}</span>

      <!-- Usage -->
      <div class="d-flex flex-column align-center" v-if="vhApp.isConnected() && props.bandwidthTotal && props.bandwidthUsed">
        <span class="text-body-1">{{ props.bandwidthUsed }} {{ locale('OF') }}</span>
        <span class="text-ui-tertiary">{{ props.bandwidthTotal }}</span>
      </div>

      <!-- Check -->
      <v-icon v-if="props.stateIcon" size="50" color="white">{{ props.stateIcon }}</v-icon>

      <!-- Access Key expire date -->
      <p v-if="!vhApp.isConnectApp() && props.expireDate"
         :class="[props.alertForExpire ? 'text-error' : 'text-purple-lighten-1', 'text-caption mt-2']">
        {{ locale('EXPIRE') + ': ' + props.expireDate }}</p>

    </div>
  </div>
</template>
