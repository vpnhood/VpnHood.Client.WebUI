<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import {ComponentRouteController} from './services/ComponentRouteController';
import { ComponentName } from '@/helpers/UiConstants';
import ErrorDialog from "@/components/ErrorDialog/ErrorDialog.vue";
import LoadingDialog from "@/components/LoadingDialog.vue";
import PrivacyPolicy from "@/pages/PrivacyPolicy.vue";
import NavigationDrawer from "@/components/NavigationDrawer.vue";
import GeneralSnackbar from '@/components/GeneralSnackbar/GeneralSnackbar.vue';
import { Util } from '@/helpers/Util';

const vhApp = VpnHoodApp.instance;

const isShowErrorDialog = computed<boolean>({
  get: () => {
    return ComponentRouteController.isShowComponent(ComponentName.ErrorDialog);
  },
  set: async (value: boolean) => {
    if (value) return; // Already is Open
    await ComponentRouteController.showComponent(ComponentName.ErrorDialog, value);
    await vhApp.clearLastError();
  }
})

const isShowPrivacyPolicyDialog = computed<boolean>({
  get: () => {
    if (!vhApp.isConnectApp())
      return false;

    return !vhApp.data.settings.userSettings.isLicenseAccepted;
  },
  set: async (value: boolean) => {
    VpnHoodApp.instance.data.settings.userSettings.isLicenseAccepted = value;
    await VpnHoodApp.instance.saveUserSetting();
  }
})

onMounted(async () => {
  // Reload 'state' every 1 second if app window is focused.
  setInterval(async () => {
    if (!document.hidden)
      await vhApp.reloadState();
  }, 1000);

  // Get user account
  if (vhApp.data.features.isAccountSupported)
    await vhApp.loadAccount();
})
</script>

<template>
  <v-app id="appContainer">

    <v-layout
      width="100%"
      max-width="850px"
      full-height
      :class="{'border border-highlight border-opacity-50 elevation-3 rounded-lg mx-auto my-5': !Util.isMobileDevice()}"
    >

      <NavigationDrawer v-model="ComponentRouteController.create(ComponentName.NavigationDrawer).isShow"/>

      <!-- DO NOT REMOVE 'full-height' to support legacy browsers -->
      <v-main class="fill-height">

        <!-- Privacy policy page -->
        <PrivacyPolicy v-if="isShowPrivacyPolicyDialog" @accept="isShowPrivacyPolicyDialog = true"/>

        <router-view v-else/>
<!--        <router-view v-else v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" :key="$route.path"/>
          </transition>
        </router-view>-->

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


<!--suppress CssUnresolvedCustomProperty, CssUnusedSymbol -->
<style scoped>
@media (min-width: 960px){
  #appContainer {
    background: url('@/assets/images/body-blur-bg.png'), rgb(var(--v-theme-app-bg)) no-repeat center top fixed;
    background-size: cover;
  }
}
/********* End of Device is not mobile **********/
#appContainer.grad-bg{
  background: rgb(var(--v-theme-grad-bg-container-bg)) !important;
}
</style>
<style>
.fade-enter-active,
.fade-leave-active{
  transition: opacity 0.3s ease;
}
.fade-enter,
.fade-leave-to{
  opacity: 0;
}
</style>
