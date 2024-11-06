<script setup lang="ts">
import { computed, ref } from 'vue';
import {ComponentRouteController} from "@/services/ComponentRouteController";
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;
const isShowDebugDialog = ref<boolean>(false);
const openDebugDialogCounter = ref<number>(0);

const debugData1 = computed<string | null | undefined>({
  get: () => {
    return vhApp.data.settings.userSettings.debugData1;
  },
  set: (value: string | null | undefined) => {
    vhApp.data.settings.userSettings.debugData1 = value === "" ? null : value;
  }
});

const debugData2 = computed<string | null | undefined>({
  get: () => {
    return vhApp.data.settings.userSettings.debugData2;
  },
  set: (value: string | null | undefined) => {
    vhApp.data.settings.userSettings.debugData2 = value === "" ? null : value;
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
    <v-app-bar-nav-icon @click="ComponentRouteController.showComponent($componentName.NavigationDrawer)" class="ms-0"/>

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

      <v-card-item class="mb-8">
        <v-text-field v-model="debugData1" clearable hide-details label="DebugData1" class="mb-4"/>
        <v-text-field v-model="debugData2" clearable hide-details label="DebugData2"/>
      </v-card-item>

      <v-divider class="border-opacity-25"></v-divider>
      <v-card-actions>
        <v-spacer/>
        <!-- Save and closeDialog -->
        <v-btn
          rounded="pill"
          variant="text"
          class="px-4"
          text="Ok"
          @click="saveDebugData()"
        />

        <!-- Cancel -->
        <v-btn
          rounded="pill"
          variant="tonal"
          class="px-4"
          text="Cancel"
          @click="isShowDebugDialog = false"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
