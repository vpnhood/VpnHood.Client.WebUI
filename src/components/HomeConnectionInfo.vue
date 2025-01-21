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
    || vhApp.data.state.connectionState !== AppConnectionState.Connected
    || !vhApp.data.state.sessionStatus?.accessUsage?.expirationTime)
    return null;

  const expDate: Date = vhApp.data.state.sessionStatus.accessUsage.expirationTime;
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };
  // noinspection TypeScriptValidateJSTypes
  return expDate.toLocaleString('en-GB', options).replace(',', '');
}
function alertForExpire(): boolean {
  const expDate: Date | null | undefined = vhApp.data.state.sessionStatus?.accessUsage?.expirationTime;
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
    return vhApp.data.state.connectionState.toLowerCase() + ' my-3' + ' animation-' +
      (showConnectedAnimation.value === true).toString();
  }
  // VpnHoodClient
  return vhApp.isConnected() ? 'opacity-100' : 'opacity-30';
}

// Return icon based on connection state
function stateIcon(): string | null {
  if (vhApp.data.state.connectionState === AppConnectionState.Connected && !bandwidthUsage())
    return 'mdi-check';
  if (vhApp.data.state.connectionState === AppConnectionState.None)
    return 'mdi-power-plug-off';
  if (vhApp.data.state.connectionState === AppConnectionState.Connecting)
    return 'mdi-power-plug';
  if (vhApp.data.state.connectionState === AppConnectionState.Diagnosing)
    return 'mdi-stethoscope';
  if (vhApp.data.state.connectionState === AppConnectionState.Waiting)
    return 'mdi-timer-sand';

  return null;
}

// Calculate user bandwidth usage
function bandwidthUsage(): { Used: string; Total: string } | null {
  if (!vhApp.data.state || !vhApp.data.state.sessionStatus || !vhApp.data.state.sessionStatus.accessUsage)
    return null;

  const accessUsage = vhApp.data.state.sessionStatus.accessUsage;
  if (!accessUsage.maxTraffic) return null;

  const mb = 1000000;
  const gb = 1000 * mb;
  const traffic: Traffic = vhApp.data.state.accountTraffic;

  const ret: {used: number, total: number} = {
    used: traffic.sent + traffic.received,
    total: accessUsage.maxTraffic
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

// Process connect animation state for VpnHoodCONNECT
function processConnectedAnimation(): void {
  if (!vhApp.isConnected()) {
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

    <div v-if="vhApp.isConnectApp()" class="position-absolute w-100 fill-height">
      <div id="rotateCircle"></div>
    </div>
    <div v-else id="circle"></div>

    <div class="d-flex flex-column align-center justify-center position-relative fill-height">

      <!-- Connection state text -->
      <span class="text-body-2">{{ vhApp.getConnectionStateText() }}</span>

      <!-- Usage -->
      <div class="d-flex flex-column align-center" v-if="vhApp.isConnected() && bandwidthUsage()">
        <span class="text-body-1">{{ bandwidthUsage()?.Used }} {{ locale('OF') }}</span>
        <span class="text-total-bandwidth">{{ bandwidthUsage()?.Total }}</span>
      </div>

      <!-- Check -->
      <v-icon v-if="stateIcon()" size="50" color="white">{{ stateIcon() }}</v-icon>

      <!-- Access Key expire date -->
      <p v-if="getExpireDate()"
         :class="[alertForExpire() ? 'text-expire-date-warning' : 'text-expire-date-alert', 'text-caption mt-2']">
        {{ locale('EXPIRE') + ': ' + getExpireDate() }}</p>

    </div>
  </div>
</template>
