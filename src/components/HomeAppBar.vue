<script setup lang="ts">
import { computed, ref } from 'vue';
import {ComponentRouteController} from "@/services/ComponentRouteController";
import { ComponentName, UiConstants } from '@/helpers/UiConstants';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;
const isShowDebugDialog = ref<boolean>(false);
const openDebugDialogCounter = ref<number>(0);

const debugData1 = computed<string[]>({
  get: () => {
    return vhApp.data.settings.userSettings.debugData1?.split(" ") ?? [];
  },
  set: (value: string[] | null) => {
    vhApp.data.settings.userSettings.debugData1 = value?.join(" ") || null;
  }
});

const debugData2 = computed<string | null>({
  get: () => {
    return vhApp.data.settings.userSettings.debugData2 ?? null;
  },
  set: (value: string | null) => {
    vhApp.data.settings.userSettings.debugData2 = value;
  }
});

function openDebugDialog(){
  openDebugDialogCounter.value++;
  if (vhApp.data.settings.userSettings.debugData1 || vhApp.data.settings.userSettings.debugData2)
    isShowDebugDialog.value = true;

  else if(openDebugDialogCounter.value === 5)
    isShowDebugDialog.value = true;

  // reset counter if no click within 1 second
  setTimeout(()=>{
    openDebugDialogCounter.value = 0;
  },3000)
}

async function saveSetting(): Promise<void> {
  await vhApp.saveUserSetting();
  isShowDebugDialog.value = false;
}

function isDebugDataHasValue(): boolean{
  return vhApp.data.settings.userSettings.debugData1 !== null || vhApp.data.settings.userSettings.debugData2 !== null
}
function isIpFilterAvailable(): boolean{
 return vhApp.data.settings.userSettings.usePacketCaptureIpFilter || vhApp.data.settings.userSettings.useAppIpFilter
}
</script>

<template>
  <v-app-bar color="transparent" elevation="0" theme="dark" absolute>
    <v-row class="align-center mx-0" >

      <!-- Navigation drawer button -->
      <v-col cols="3" class="ps-0">
        <v-app-bar-nav-icon
          color="home-app-bar"
          class="mx-0"
          @click="ComponentRouteController.showComponent(ComponentName.NavigationDrawer)"
        />
      </v-col>

      <!-- App name -->
      <v-col cols="6" class="text-center text-home-app-bar">
        <h4 dir="ltr">{{ vhApp.isConnectApp() ? locale('VPN_HOOD_CONNECT_APP_NAME') : locale('VPN_HOOD_APP_NAME') }}</h4>
      </v-col>

      <!-- App mini version -->
      <v-col cols="3" class="text-end">
        <v-chip
          tabindex="-1"
          size="small"
          density="compact"
          :color="isDebugDataHasValue() ? 'warning' : 'disabled'"
          :variant="isDebugDataHasValue() ? 'flat' : 'text'"
          :class="[{'text-decoration-underline': isIpFilterAvailable()}, isDebugDataHasValue() ? 'px-2' : 'px-0']"
          :text="locale('ABBREVIATION_VERSION') + ' ' + vhApp.getAppVersion(false)"
          @click="openDebugDialog"
        />
      </v-col>

    </v-row>
  </v-app-bar>

  <v-dialog v-model="isShowDebugDialog" :persistent="true" max-width="600">
    <v-card color="background" title="Only developers" append-icon="mdi-bug-outline">

      <v-card-item>

        <!-- Debug data-1 -->
        <v-combobox
          theme="dark"
          v-model="debugData1"
          clearable
          label="DebugData1"
          :items="vhApp.data.features.debugCommands"
          hide-details
          hide-selected
          chips
          closable-chips
          multiple
          class="mb-4"
        />

        <!-- Debug data-2 -->
        <v-combobox
          v-model="debugData2"
          clearable
          label="DebugData2"
          variant="filled"
          hide-details
          class="mb-4"
        />

        <!-- Open log file -->
        <btn-style-1
          block
          text="Open log"
          :href="vhApp.data.serverUrl + UiConstants.logFileLocation"
          target="_blank"
        />
      </v-card-item>

      <!-- Close button -->
      <v-card-actions>
        <v-btn text="Close" @click="saveSetting()" />
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>
