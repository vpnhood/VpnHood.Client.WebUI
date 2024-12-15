<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import Vuetify from '@/services/vuetify';
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

const isShowPrivacyPolicyDialog = ref<boolean>(false);

onMounted(async () => {
  // Reload 'state' every 1 second if app window is focused.
  setInterval(async () => {
    if (!document.hidden)
      await vhApp.reloadState();
  }, 1000);

  // Show privacy policy if app is VpnHoodCONNECT
  if (vhApp.isConnectApp() && !vhApp.data.settings.userSettings.isLicenseAccepted) {
    isShowPrivacyPolicyDialog.value = true;
    return;
  }

  if (vhApp.data.features.isAccountSupported)
    await vhApp.loadAccount();
})
</script>

<template>
  <v-app id="appContainer"
         :class="[vhApp.data.features.uiName, vhApp.data.settings.userSettings.cultureCode,
         'bg-primary-darken-2 position-relative']"
  >

    <!-- Navigation drawer -->
    <NavigationDrawer v-model="ComponentRouteController.create(ComponentName.NavigationDrawer).isShow"/>

    <!-- DO NOT REMOVE 'fill-height' class to support legacy browsers -->
    <v-main
      id="mainBg"
      :class="[Vuetify.display.mdAndUp.value? 'not-mobile rounded-lg mx-auto my-10' : '','w-100 fill-height']"
      :style="[Vuetify.display.mdAndUp.value ? 'max-width:850px;' : '']"
    >

      <router-view v-if="!isShowPrivacyPolicyDialog"/>

      <!-- Only for VpnHoodCONNECT -->
      <PrivacyPolicyDialog v-model="isShowPrivacyPolicyDialog" v-if="isShowPrivacyPolicyDialog"/>

      <!-- Loading dialog before each api call -->
      <LoadingDialog v-else v-model="vhApp.data.uiState.showLoadingDialog"/>

      <!-- Global alert dialog -->
      <error-dialog v-model="isShowErrorDialog" v-if="isShowErrorDialog"/>

      <!-- Global snackbar -->
      <GeneralSnackbar v-model="vhApp.data.uiState.generalSnackbarData.isShow"
        v-if="vhApp.data.uiState.generalSnackbarData.isShow" />


    </v-main>
  </v-app>
</template>

<style scoped>
#mainBg {
  /*noinspection CssUnresolvedCustomProperty*/
  background-image: linear-gradient(rgb(var(--v-theme-primary)), rgb(var(--v-theme-primary-darken-1)));
  position: relative;
  z-index: 0;
}

#mainBg:before {
  content: "";
  position: absolute;
  bottom: 0;
  top: 0;
  right: 0;
  left: 0;
  background: url("@/assets/images/body-bg.png") no-repeat center center fixed;
  background-size: cover;
  z-index: -1;
}

/*noinspection CssUnusedSymbol*/
#mainBg.not-mobile {
  /*noinspection CssUnresolvedCustomProperty*/
  border: 1px rgba(var(--v-theme-secondary), .5) solid;
  box-shadow: 0 0 20px 9px #00000047;
}

/*noinspection CssUnusedSymbol*/
#mainBg.not-mobile:before {
  border-radius: 8px;
}

@media (max-width: 425px) {
  #mainBg:before {
    background-image: url('@/assets/images/body-bg-mobile.png');
  }
}

/*** Android TV background ***/
#appContainer:before {
  content: "";
  position: absolute;
  bottom: 0;
  top: 0;
  right: 0;
  left: 0;
  background: url('@/assets/images/body-bg.png') no-repeat center center fixed;
  background-size: cover;
  filter: blur(14px);
}

/*** App is the VpnHoodConnect ***/
/*noinspection CssUnusedSymbol*/
.VpnHoodConnect #mainBg {
  /*noinspection CssUnresolvedCustomProperty*/
  background-image: linear-gradient(rgb(var(--v-theme-primary-darken-2)), rgb(var(--v-theme-primary-darken-2)));
}
.VpnHoodConnect #mainBg:before,
.VpnHoodConnect #appContainer:before {
  opacity: .5;
}
</style>
