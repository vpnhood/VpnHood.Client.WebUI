<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import { ComponentRouteController } from './services/ComponentRouteController';
import { ComponentName } from '@/helpers/UiConstants';
import ErrorDialog from "@/components/ErrorDialog/ErrorDialog.vue";
import LoadingDialog from "@/components/LoadingDialog.vue";
import PrivacyPolicy from "@/pages/privacy-policy.vue";
import NavigationDrawer from "@/components/NavigationDrawer.vue";
import GeneralSnackbar from '@/components/GeneralSnackbar/GeneralSnackbar.vue';
import vuetify from '@/theme/vuetify';
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog.vue';
import EngineErrorDialog from '@/components/EngineErrorDialog.vue';
import ReconnectRequiredAlert from '@/components/ReconnectRequiredAlert.vue';
import { AxiosError } from 'axios';

const vhApp = VpnHoodApp.instance;
const showEngineErrorDialog = ref(false);
const consecutiveConnectionRefusedCount = ref(0);
const errorDialogModel = ref(new ComponentRouteController(ComponentName.ErrorDialog));
const navigationDrawerModel = ref(new ComponentRouteController(ComponentName.NavigationDrawer));

const isShowErrorDialog = computed<boolean>({
  get: () => {
    return errorDialogModel.value.isVisible;
  },
  set: async (value: boolean) => {
    if (value) return; // Already is Open
    await errorDialogModel.value.show(value);
  }
})

const isShowPrivacyPolicyDialog = computed<boolean>({
  get: () => {
    if (!vhApp.isConnectApp())
      return false;

    return !vhApp.data.userSettings.isLicenseAccepted;
  },
  set: async (value: boolean) => {
    VpnHoodApp.instance.data.userSettings.isLicenseAccepted = value;
    await VpnHoodApp.instance.saveUserSetting();
  }
})

const isConnectionRefused = (error: unknown): boolean => {
  return error instanceof AxiosError && error.code === 'ERR_NETWORK';
}

onMounted(async () => {
  // Reload 'state' every 1 second if the app window is focused.
  setInterval(async () => {

    if (document.hidden)
      return;

    try {
      await vhApp.reloadState();
      vhApp.data.edgeToEdge();
      consecutiveConnectionRefusedCount.value = 0;
      showEngineErrorDialog.value = false;
    } catch (error: unknown) {
      if (isConnectionRefused(error)) {
        consecutiveConnectionRefusedCount.value++;
        showEngineErrorDialog.value = consecutiveConnectionRefusedCount.value >= 2;
      } else {
        consecutiveConnectionRefusedCount.value = 0;
      }
    }

  }, 1000);

  // Get the user account
  if (vhApp.data.features.isAccountSupported)
    await vhApp.loadAccount();
})
</script>

<template>
  <v-app :class="{ 'px-15': !vuetify.display.smAndDown.value }" class="bg-app-bg">

    <v-layout width="100%" :max-width="vhApp.data.uiState.maxWidthOnLargeScreen" full-height class="mx-auto"
      :class="{ 'border border-highlight border-opacity-50 elevation-3 rounded-lg my-5': !vuetify.display.smAndDown.value }">

      <NavigationDrawer v-model="navigationDrawerModel.isVisible" />

      <!-- DO NOT REMOVE 'full-height' to support legacy browsers -->
      <!-- position-relative anchors the overlaid reconnect-required bar to this element -->
      <v-main class="fill-height position-relative">

        <!-- Reconnect required bar -->
        <reconnect-required-alert />

        <!-- Privacy policy page -->
        <PrivacyPolicy v-if="isShowPrivacyPolicyDialog" @accept="isShowPrivacyPolicyDialog = true" />

        <!-- No 'out-in': that mode makes every navigation wait out the leave animation before the
             new page even starts, so the tap that triggered it reads as lag. The two pages overlap
             instead; see the leave rules below for what keeps the layout still while they do. -->
        <router-view v-else v-slot="{ Component, route }">
          <transition :name="route.meta.transition?.toString()">
            <component :is="Component" />
          </transition>
        </router-view>

      </v-main>

      <!-- Global Loading dialog -->
      <loading-dialog v-model="vhApp.data.uiState.showLoadingDialog" />

      <!-- Global alert dialog -->
      <error-dialog v-model="isShowErrorDialog" />

      <!-- Engine error dialog -->
      <engine-error-dialog v-model="showEngineErrorDialog" />

      <!-- Global snackbar -->
      <general-snackbar v-model="vhApp.data.uiState.generalSnackbarState.isShow" />

      <!-- General confirm dialog -->
      <confirm-dialog v-model="vhApp.data.uiState.confirmDialogState.isShow" />

    </v-layout>
  </v-app>
</template>

<!--suppress CssUnusedSymbol -->
<style>
/* Both pages are in the DOM together for the length of the animation, so the leaving one is taken
   out of the flow — left in it, it would sit above the entering page and the layout would visibly
   jump. v-main carries position-relative, which is what these offsets anchor to. */
.translate-with-fade-leave-active,
.short-translate-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

/* transform and opacity only, never 'all': 'all' makes the engine interpolate every property that
   differs between the two pages, which is what turns a viewport-sized transition into jank on a
   mid-range phone. Both are compositor-friendly. */
.translate-with-fade-enter-active,
.short-translate-enter-active {
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.translate-with-fade-leave-active,
.short-translate-leave-active {
  transition: transform 0.1s ease, opacity 0.1s ease;
}

.translate-with-fade-enter-from {
  opacity: 0;
  transform: translateY(50px);
}

.translate-with-fade-leave-to {
  opacity: 0;
}

.short-translate-enter-from {
  transform: translateY(-30px);
  opacity: 0;
}

.short-translate-leave-to {
  opacity: 0;
  transform: translateY(50px);
}
</style>
