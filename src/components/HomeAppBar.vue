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

async function saveDebugData() {
  await vhApp.saveUserSetting();
  isShowDebugDialog.value = false;
}
</script>

<template>
  <v-app-bar color="transparent" elevation="0" absolute>

    <!-- Navigation drawer button -->
    <v-app-bar-nav-icon @click="ComponentRouteController.showComponent(ComponentName.NavigationDrawer)" class="ms-0"/>

    <!-- App name -->
    <v-spacer></v-spacer>
    <h4 dir="ltr">
      {{ vhApp.isConnectApp() ? locale('VPN_HOOD_CONNECT_APP_NAME') : locale('VPN_HOOD_APP_NAME') }}
    </h4>
    <v-spacer></v-spacer>

    <!-- App mini version -->
    <span
      @click="openDebugDialog"
      tabindex="-1"
      :class="[vhApp.data.settings.userSettings.debugData1 !== null || vhApp.data.settings.userSettings.debugData2 !== null
         ? 'bg-warning border border-on-warning  text-black rounded-pill px-1' : 'text-disabled','text-caption me-3']"
    >
      {{ locale("ABBREVIATION_VERSION") }}
      {{vhApp.getAppVersion(false) }}
    </span>

  </v-app-bar>

  <v-dialog v-model="isShowDebugDialog" :persistent="true" max-width="600">
    <v-card rounded="lg" color="gray" class="py-0">
      <v-card-title>Only for developers</v-card-title>

      <v-card-item>

        <!-- Debug data-1 -->
        <v-combobox
          v-model="debugData1"
          clearable
          label="DebugData1"
          :items="vhApp.data.features.debugCommands"
          variant="filled"
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
        <v-btn
          color="secondary"
          block
          text="Open log"
          :href="vhApp.data.serverUrl + UiConstants.logFileLocation"
          target="_blank"
        />
      </v-card-item>

      <!-- Close button -->
      <v-divider class="border-opacity-25"></v-divider>
      <v-card-actions>
        <v-spacer/>
        <v-btn
          rounded="pill"
          variant="tonal"
          class="px-4"
          text="Close"
          @click="saveDebugData()"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
