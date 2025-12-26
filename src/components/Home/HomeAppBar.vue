<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { computed, ref } from 'vue';
import { ComponentRouteController } from '@/services/ComponentRouteController';
import { ComponentName } from '@/helpers/UiConstants';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const openDebugDialogCounter = ref<number>(0);
const navigationDrawerModel = ref(new ComponentRouteController(ComponentName.NavigationDrawer));
const isDebugDataHasValue = computed<boolean>( () => {
  return vhApp.data.userSettings.debugData1 !== null || vhApp.data.userSettings.debugData2 !== null
});

function openDebugDialog() {
  openDebugDialogCounter.value++;

  if (isDebugDataHasValue.value || openDebugDialogCounter.value === 5)
    vhApp.data.uiState.isShowDeveloperDialog = true;

  // reset counter if no click within 5 second
  setTimeout(() => {
    openDebugDialogCounter.value = 0;
  }, 5000);
}
</script>

<template>
  <v-row class="align-center v-row--no-gutters mx-0">

    <!-- Navigation drawer button -->
    <v-col cols="3">
      <v-app-bar-nav-icon
        tabindex="1"
        color="home-app-bar"
        class="ms-n3 me-0"
        @click="navigationDrawerModel.show()"
      />
    </v-col>

    <!-- App name -->
    <v-col cols="6" class="text-center text-home-app-bar" tabindex="-1">
      <h4 dir="ltr" :class="{ 'mt-8': vhApp.data.features.isTv }">
        {{vhApp.data.features.appName}}
      </h4>
    </v-col>

    <!-- App mini version -->
    <v-col cols="3" class="text-end">
      <v-chip
        tabindex="-1"
        size="small"
        density="compact"
        :color="isDebugDataHasValue ? 'version-on-home-debug' : 'disabled'"
        :variant="isDebugDataHasValue ? 'flat' : 'text'"
        :class="[isDebugDataHasValue ? 'px-2' : 'px-0']"
        @click="openDebugDialog()"
      >
        <span :class="{ 'text-white opacity-40': !isDebugDataHasValue }">
          {{ locale('ABBREVIATION_VERSION') + ' ' + vhApp.getAppVersion(false) }}
        </span>
      </v-chip>
    </v-col>

  </v-row>
</template>
