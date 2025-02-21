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
import AppBar from '@/components/AppBar.vue';

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
// TODO: change background
</script>

<template>
  <v-app id="appContainer" :class="[vhApp.data.features.uiName, vhApp.data.settings.userSettings.cultureCode]">

    <v-layout
      id="pagesContainer"
      width="100%"
      max-width="850px"
      full-height
      class="mx-auto"
      :class="{'premium-user': (vhApp.data.features.isPremiumFlagSupported && vhApp.isPremiumAccount()) ||
      vhApp.data.state.sessionInfo?.isPremiumSession}"
    >

      <NavigationDrawer v-model="ComponentRouteController.create(ComponentName.NavigationDrawer).isShow"/>

      <AppBar v-if="!isShowPrivacyPolicyDialog"/>

      <!-- DO NOT REMOVE 'full-height' to support legacy browsers -->
      <v-main class="fill-height">

        <!-- Privacy policy page -->
        <PrivacyPolicy v-if="isShowPrivacyPolicyDialog" @accept="isShowPrivacyPolicyDialog = true"/>

        <router-view v-else/>

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
#pagesContainer {
  background-size: cover;
  background-repeat: no-repeat ;
  background-attachment: fixed;
  background-position: center center;
}

@media (max-width: 959px) {
  #pagesContainer {
    background-image: url("@/assets/images/body-bg-mobile.png"),
    linear-gradient(rgb(var(--v-theme-home-bg-grad-1)), rgb(var(--v-theme-home-bg-grad-2)));
  }
}

/************ Device is not mobile *************/
@media (min-width: 960px){
  #appContainer {
    background: url('@/assets/images/body-blur-bg.png') rgb(var(--v-theme-app-bg)) no-repeat center center fixed;
    background-size: cover;
  }
  #pagesContainer {
    background-image: url("@/assets/images/body-bg.png"),
    linear-gradient(rgb(var(--v-theme-home-bg-grad-1)), rgb(var(--v-theme-home-bg-grad-2)));
    border: 1px rgba(var(--v-theme-highlight), .5) solid;
    box-shadow: 0 0 20px 9px #00000047;
    border-radius: 10px;
    margin-top: 15px;
    margin-bottom: 15px;
  }
}
/********* End of Device is not mobile **********/

#pagesContainer.premium-user {
  background-image: none;
  background-color: rgb(var(--v-theme-home-bg-grad-2));
  position: relative;
  z-index: 0;
}
#pagesContainer.premium-user:before,
#pagesContainer.premium-user:after {
  position: absolute;
  content: '';
  right: 0;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: -1;
  background-size: contain;
  background-repeat: no-repeat;
  background-position-y: top;
}
#pagesContainer.premium-user:before {
  background-image: url("@/assets/images/premium-bg-left.webp");
  background-position-x: left;
}
#pagesContainer.premium-user:after {
  background-image: url("@/assets/images/premium-bg-right.webp");
  background-position-x: right;
}
</style>
