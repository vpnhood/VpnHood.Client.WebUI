<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import { ref } from 'vue';
import i18n from '@/locales/i18n';
import { AppConnectionState, Traffic } from '@/services/VpnHood.Client.Api';
import { UiConstants } from '@/helpers/UiConstants';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const showConnectedAnimation = ref<boolean | null>(null);

function getExpireDate(): string | null {
  if ((!vhApp.data.state.clientProfile?.isPremiumAccount && !vhApp.data.features.isPremiumFlagSupported)
    || vhApp.data.connectionState !== AppConnectionState.Connected
    || !vhApp.data.state.sessionInfo?.accessInfo?.expirationTime)
    return null;

  const expDate: Date = vhApp.data.state.sessionInfo?.accessInfo?.expirationTime;
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };
  // noinspection TypeScriptValidateJSTypes
  return expDate.toLocaleString('en-GB', options).replace(',', '');
}
function alertForExpire(): boolean {
  const expDate: Date | null | undefined = vhApp.data.state.sessionInfo?.accessInfo?.expirationTime;
  if (!expDate) return false;

  const currentDate: Date = new Date();
  const diffTime = expDate.getTime() - currentDate.getTime();
  const diffDays: number = Math.ceil(diffTime / UiConstants.millisecondPerDay);
  return diffDays <= 3;
}
function determineClass(): string {
  // VpnHoodCONNECT
  if (vhApp.isConnectApp()) {
    processConnectedAnimation();
    return vhApp.data.connectionState.toLowerCase() + ' my-3' + ' animation-' +
      (showConnectedAnimation.value === true).toString();
  }
  // VpnHoodClient
  return vhApp.data.isConnected ? 'opacity-100' : 'opacity-30';
}

// Return icon based on the connection state
function stateIcon(): string | null {
  if (vhApp.data.isUnstable)
    return null;

  switch (vhApp.data.connectionState) {
    case AppConnectionState.Connected:
      if (!bandwidthUsage())
        return 'mdi-check';
      return null;
    case AppConnectionState.None:
      return 'mdi-power-plug-off';
    case AppConnectionState.Connecting:
      return 'mdi-power-plug';
    case AppConnectionState.Diagnosing:
      return 'mdi-stethoscope';
    case AppConnectionState.Waiting:
      return 'mdi-timer-sand';
    default:
      return null;
  }
}

// Calculate user bandwidth usage
function bandwidthUsage(): { Used: string; Total: string } | null {
  if (!vhApp.data.state || !vhApp.data.state.sessionStatus || !vhApp.data.state.sessionInfo?.accessInfo)
    return null;

  const accessUsage = vhApp.data.state.sessionInfo?.accessInfo;
  if (!accessUsage?.maxTotalTraffic) return null;

  const mb = 1000000;
  const gb = 1000 * mb;
  const traffic: Traffic = vhApp.data.state.sessionStatus.sessionTraffic;

  const ret: {used: number, total: number} = {
    used: traffic.sent + traffic.received,
    total: accessUsage.maxTotalTraffic
  };
  const total: string =
    ret.total >= gb
      ? Number((ret.total / gb).toFixed(1)).toString() + 'GB'
      : Number((ret.total / mb).toFixed(0)).toString() + 'MB';
  const used: string =
    ret.used >= gb
      ? Number((ret.used / gb).toFixed(1)).toString() + 'GB'
      : Number((ret.used / mb).toFixed(0)).toString() + 'MB';
  return { Used: used, Total: total };
}

// Process connects animation state for VpnHoodCONNECT
function processConnectedAnimation(): void {
  if (!vhApp.data.isConnected) {
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
    :class="[(vhApp.data.isUnstable && !vhApp.isConnectApp()) ? 'unstable' : '', determineClass()]"
    class="text-white"
  >

    <div v-if="vhApp.isConnectApp()"
       class="position-absolute w-100 fill-height"
       :class="{'flasher': vhApp.data.isUnstable}"
       style="--duration: 2s;"
    >
      <div id="rotateCircle"></div>
    </div>


    <div v-else id="circle"></div>

    <div class="d-flex flex-column align-center justify-center position-relative fill-height">

      <!-- Connection state text -->
      <span class="text-body-2">{{ vhApp.data.connectionStateText }}</span>

      <!-- Usage -->
      <div class="d-flex flex-column align-center" v-if="vhApp.data.isConnected && bandwidthUsage()">
        <span class="text-body-1">{{ bandwidthUsage()?.Used }} {{ locale('OF') }}</span>
        <span class="text-total-bandwidth">{{ bandwidthUsage()?.Total }}</span>
      </div>

      <!-- Check -->
      <v-icon v-else-if="stateIcon()" size="50" color="white">{{ stateIcon() }}</v-icon>

      <!-- Access Key expire date -->
      <p v-if="getExpireDate()"
         :class="[alertForExpire() ? 'text-expire-date-warning' : 'text-expire-date-alert', 'text-caption mt-2']">
        {{ locale('EXPIRE') + ': ' + getExpireDate() }}</p>

    </div>
  </div>
</template>
