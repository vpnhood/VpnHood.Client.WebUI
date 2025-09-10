<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import {ComponentRouteController} from './services/ComponentRouteController';
import { ComponentName } from '@/helpers/UiConstants';
import ErrorDialog from "@/components/ErrorDialog/ErrorDialog.vue";
import LoadingDialog from "@/components/LoadingDialog.vue";
import PrivacyPolicy from "@/pages/privacy-policy.vue";
import NavigationDrawer from "@/components/NavigationDrawer.vue";
import GeneralSnackbar from '@/components/GeneralSnackbar/GeneralSnackbar.vue';
import vuetify from '@/theme/vuetify';
import { initializeGlobalTheme, useTheme } from '@/composables/useTheme';

const vhApp = VpnHoodApp.instance;
const { getThemeClass } = useTheme();

const isShowErrorDialog = computed<boolean>({
  get: () => {
    return ComponentRouteController.isShowComponent(ComponentName.ErrorDialog);
  },
  set: async (value: boolean) => {
    if (value) return; // Already is Open
    await ComponentRouteController.showComponent(ComponentName.ErrorDialog, value);
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

// Computed class list for v-app
const appClasses = computed(() => {
  const classes = ['bg-app-bg', getThemeClass()];
  if (!vuetify.display.smAndDown.value) {
    classes.push('px-15');
  }
  return classes;
});

onMounted(async () => {
  // Initialize theme system
  initializeGlobalTheme();

  // Reload 'state' every 1 second if the app window is focused.
  setInterval(async () => {
    if (!document.hidden) {
      vhApp.edgeToEdge();
      await vhApp.reloadState();
    }
  }, 1000);

  // Get the user account
  if (vhApp.data.features.isAccountSupported)
    await vhApp.loadAccount();
})
</script>

<template>
  <v-app :class="appClasses">

    <v-layout
      width="100%"
      max-width="959px"
      full-height
      class="mx-auto"
      :class="{'border border-highlight border-opacity-50 elevation-3 rounded-lg my-5': !vuetify.display.smAndDown.value}"
    >

      <NavigationDrawer v-model="ComponentRouteController.create(ComponentName.NavigationDrawer).isShow"/>

      <!-- DO NOT REMOVE 'full-height' to support legacy browsers -->
      <v-main class="fill-height">
        <!-- Privacy policy page -->
        <PrivacyPolicy v-if="isShowPrivacyPolicyDialog" @accept="isShowPrivacyPolicyDialog = true"/>

        <router-view v-else v-slot="{ Component, route }">
          <transition :name="route.meta.transition?.toString()" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>

      </v-main>

      <!-- Global Loading dialog -->
      <LoadingDialog v-model="vhApp.data.uiState.showLoadingDialog"/>

      <!-- Global alert dialog -->
      <error-dialog v-model="isShowErrorDialog"/>

      <!-- Global snackbar -->
      <GeneralSnackbar v-model="vhApp.data.uiState.generalSnackbarData.isShow"/>

    </v-layout>
  </v-app>
</template>

<!--suppress CssUnusedSymbol -->
<style>
/* Theme-aware transitions and animations */
.theme-light .translate-with-fade-enter-from,
.theme-light .short-translate-leave-to {
  opacity: 0;
  transform: translateY(50px);
}

.theme-dark .translate-with-fade-enter-from,
.theme-dark .short-translate-leave-to {
  opacity: 0;
  transform: translateY(50px);
}

.translate-with-fade-enter-active,
.short-translate-leave-active{
  transition: all 0.2s ease;
}

.translate-with-fade-leave-active,
.short-translate-enter-active{
  transition: all 0.1s ease;
}

.translate-with-fade-leave-to{
  opacity: 0;
}

.short-translate-enter-from{
  transform: translateY(-30px);
  opacity: 0;
}

/* Theme-specific styling */
.theme-light {
  --scroll-track: rgb(var(--v-theme-scroll-track));
  --scroll-thumb: rgb(var(--v-theme-scroll-thumb));
  --scroll-thumb-hover: rgb(var(--v-theme-scroll-thumb-hover));
}

.theme-dark {
  --scroll-track: rgb(var(--v-theme-scroll-track));
  --scroll-thumb: rgb(var(--v-theme-scroll-thumb));
  --scroll-thumb-hover: rgb(var(--v-theme-scroll-thumb-hover));
}
</style>
