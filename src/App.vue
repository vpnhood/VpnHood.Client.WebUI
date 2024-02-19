<template>
  <v-app id="mainBg" :class="[$vpnHoodApp.data.uiState.isGoogleSignInSupported ? 'connect-app' : '']">
    <v-main>
      <router-view />
      <LoadingDialog v-model="$vpnHoodApp.data.uiState.showLoadingDialog"/>
      <!-- Global Alert Dialog -->
      <alert-dialog v-model="isAlertDialogVisible" :dialog-text="$vpnHoodApp.data.uiState.alertDialogText" />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import {useTheme} from "vuetify";
const theme = useTheme();
theme.global.name.value = "VpnHoodConnect";
</script>

<script lang="ts">
import { defineComponent } from 'vue'
import AlertDialog from "@/components/AlertDialog.vue";
import { ComponentRouteController } from './services/ComponentRouteController';
import {ClientApiFactory} from "@/services/ClientApiFactory";
import LoadingDialog from "@/components/LoadingDialog.vue";
export default defineComponent({
  name: 'App',
  components: {LoadingDialog, AlertDialog },
  async created() {
    const accountClient = ClientApiFactory.instance.createAccountClient();
    this.$vpnHoodApp.data.uiState.isGoogleSignInSupported = await accountClient.isSigninWithGoogleSupported();
    // If app is the VpnHoodConnect
    if (this.$vpnHoodApp.data.uiState.isGoogleSignInSupported){
      try {
        this.$vpnHoodApp.data.uiState.showLoadingDialog = true;
        await this.$vpnHoodApp.processUserAccount();
      }
      finally {
        this.$vpnHoodApp.data.uiState.showLoadingDialog = false;
      }
    }

  },
  computed: {
    isAlertDialogVisible: {
      get(): boolean {
        return ComponentRouteController.isShowComponent(this.$componentName.AlertDialog);
      },
      async set(value: boolean) {
        if (!value)
          await this.$vpnHoodApp.apiClient.clearLastError();
        await ComponentRouteController.showComponent(this.$componentName.AlertDialog, value);
      }
    }
  },
});
</script>

<style scoped>
#mainBg {
  background-image: linear-gradient(rgb(var(--v-theme-primary)), rgb(var(--v-theme-primary-darken-1)));
  position: relative;
}

#mainBg:before {
  content: "";
  position: absolute;
  bottom: 0;
  top: 0;
  right: 0;
  left: 0;
  background: url("/src/assets/images/body-bg.png") no-repeat center center fixed;
  background-size: cover;
}
#mainBg.connect-app:before {
  opacity: .3;
}

@media (max-width: 425px) {
  #mainBg:before {
    background-image: url("/src/assets/images/body-bg-mobile.png");
  }
}
</style>