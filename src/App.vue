<template>
  <v-app id="mainBg" :class="$vpnHoodApp.data.features.uiName">
    <v-main>
      <router-view v-if="!isShowPrivacyPolicyDialog"/>

      <PrivacyPolicyDialog v-model="isShowPrivacyPolicyDialog" @accept-privacy-policy="vpnHoodConnectProcessAccount()"/>

      <!-- Loading dialog before each api call -->
      <LoadingDialog v-model="$vpnHoodApp.data.uiState.showLoadingDialog" v-if="!isShowPrivacyPolicyDialog"/>

      <!-- Global alert dialog -->
      <alert-dialog v-model="isAlertDialogVisible" :dialog-text="$vpnHoodApp.data.uiState.alertDialogText" />
    </v-main>

  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AlertDialog from "@/components/AlertDialog.vue";
import { ComponentRouteController } from './services/ComponentRouteController';
import {ClientApiFactory} from "@/services/ClientApiFactory";
import LoadingDialog from "@/components/LoadingDialog.vue";
import {AppName, LocalStorage} from "@/UiConstants";
import PrivacyPolicyDialog from "@/components/PrivacyPolicyDialog.vue";
export default defineComponent({
  name: 'App',
  components: {PrivacyPolicyDialog, LoadingDialog, AlertDialog },
  data(){
    return{
      AppName,
      isShowPrivacyPolicyDialog: false,
    };
  },
  async created() {
    // Show privacy policy if app is VpnHoodCONNECT
    if (this.$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect && localStorage.getItem(LocalStorage.acceptedPrivacyPolicy) !=="true"){
      this.isShowPrivacyPolicyDialog = true;
      return;
    }

    if (this.$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect)
      await this.vpnHoodConnectProcessAccount();

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
  methods:{
    // App is the VpnHoodConnect
    async vpnHoodConnectProcessAccount(){
      this.isShowPrivacyPolicyDialog = false;
      const accountClient = ClientApiFactory.instance.createAccountClient();
      this.$vpnHoodApp.data.uiState.isGoogleSignInSupported = await accountClient.isSigninWithGoogleSupported();
      this.$vpnHoodApp.data.userState.userAccount = await accountClient.get();
    }
  }
});
</script>

<style scoped>
#mainBg {
  /*noinspection CssUnresolvedCustomProperty*/
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
@media (max-width: 425px) {
  #mainBg:before {
    background-image: url("/src/assets/images/body-bg-mobile.png");
  }
}

/*** App is the VpnHoodConnect ***/
/*noinspection CssUnusedSymbol*/
#mainBg.VpnHoodConnect:before {
  opacity: .5;
}
</style>