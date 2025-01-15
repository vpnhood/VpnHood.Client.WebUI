<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import {ComponentRouteController} from './services/ComponentRouteController';
import { ComponentName } from '@/helpers/UiConstants';
import ErrorDialog from "@/components/ErrorDialog/ErrorDialog.vue";
import LoadingDialog from "@/components/LoadingDialog.vue";
import PrivacyPolicyDialog from "@/components/PrivacyPolicyDialog.vue";
import NavigationDrawer from "@/components/NavigationDrawer.vue";
import GeneralSnackbar from '@/components/GeneralSnackbar/GeneralSnackbar.vue';

const vhApp = VpnHoodApp.instance;

const isShowErrorDialog = computed<boolean>({
  get: () => {
    return ComponentRouteController.isShowComponent(ComponentName.ErrorDialog)
  },
  set: async (value: boolean) => {
    if (value) return; // Already is Open
    await ComponentRouteController.showComponent(ComponentName.ErrorDialog, value);
    await vhApp.clearLastError();
  }
})

const isShowPrivacyPolicyDialog = ref<boolean>(vhApp.isConnectApp() && !vhApp.data.settings.userSettings.isLicenseAccepted);

onMounted(async () => {
  // Reload 'state' every 1 second if app window is focused.
  setInterval(async () => {
    if (!document.hidden)
      await vhApp.reloadState();
  }, 1000);

  // Get user account
  if (vhApp.data.features.isAccountSupported && !isShowPrivacyPolicyDialog.value)
    await vhApp.loadAccount();

})
</script>

<template>
  <v-app id="appContainer" :class="[vhApp.data.features.uiName, vhApp.data.settings.userSettings.cultureCode]">

    <!-- Navigation drawer -->
    <NavigationDrawer v-model="ComponentRouteController.create(ComponentName.NavigationDrawer).isShow"/>

    <v-main id="mainBg">

      <!-- Privacy policy dialog -->
      <PrivacyPolicyDialog v-model="isShowPrivacyPolicyDialog" v-if="isShowPrivacyPolicyDialog"/>

      <router-view v-else/>

      <!-- Global Loading dialog -->
      <LoadingDialog v-model="vhApp.data.uiState.showLoadingDialog"/>

      <!-- Global alert dialog -->
      <error-dialog v-model="isShowErrorDialog"/>

      <!-- Global snackbar -->
      <GeneralSnackbar v-model="vhApp.data.uiState.generalSnackbarData.isShow"/>

    </v-main>

  </v-app>
</template>


<!--suppress CssUnresolvedCustomProperty -->
<style scoped>
#mainBg {
  background-size: cover;
  background-repeat: no-repeat ;
  background-attachment: fixed;
  background-position: center center;
  width: 100%;
  /*DO NOT REMOVE 'height: 100%' to support legacy browsers*/
  height: 100%;
}

@media (max-width: 959px) {
  #mainBg {
    background-image: url("@/assets/images/body-bg-mobile.png"), linear-gradient(rgb(var(--v-theme-primary)), rgb(var(--v-theme-primary-darken-1)));
  }
  .VpnHoodConnect #mainBg{
    background-image: url("@/assets/images/body-bg-mobile.png"), linear-gradient(rgb(var(--v-theme-primary-darken-2)), rgb(var(--v-theme-primary-darken-2)));
  }
}

/************ Device is not mobile *************/
@media (min-width: 960px){
  #mainBg {
    background-image: url("@/assets/images/body-bg.png"), linear-gradient(rgb(var(--v-theme-primary)), rgb(var(--v-theme-primary-darken-1)));
    border: 1px rgba(var(--v-theme-secondary), .5) solid;
    max-width: 850px;
    box-shadow: 0 0 20px 9px #00000047;
    border-radius: 10px;
    margin: 10px auto;
  }
  .VpnHoodConnect #mainBg {
    background-image: url("@/assets/images/body-bg.png");
    background-color: rgb(var(--v-theme-primary-darken-2));
  }
  #appContainer {
    background: url('@/assets/images/body-blur-bg.png') rgb(var(--v-theme-primary-darken-2)) no-repeat center center fixed;
    background-size: cover;
  }
}
/************ End of Device is not mobile *************/
</style>
