<template>
  <v-app :class="[$vpnHoodApp.data.features.uiName, $vpnHoodApp.data.settings.userSettings.cultureCode, 'bg-primary-darken-2']">

    <!-- Navigation drawer -->
    <NavigationDrawer v-model="ComponentRouteController.create($componentName.NavigationDrawer).isShow"/>

    <v-main
        id="mainBg"
        :class="[$vuetify.display.mdAndUp? 'not-mobile rounded-lg mx-auto my-10' : '','w-100']"
        :style="[$vuetify.display.mdAndUp ? 'max-width:850px;' : '']"
    >

      <router-view v-if="!isShowPrivacyPolicyDialog"/>

      <!-- Only for VpnHoodCONNECT -->
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
import {AppName, LocalStorage, UiConstants} from "@/UiConstants";
import PrivacyPolicyDialog from "@/components/PrivacyPolicyDialog.vue";
import NavigationDrawer from "@/components/NavigationDrawer.vue";

export default defineComponent({
  name: 'App',
  components: {PrivacyPolicyDialog, LoadingDialog, AlertDialog, NavigationDrawer },
  data(){
    return{
      AppName,
      UiConstants,
      ComponentRouteController,
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

      if(this.$vpnHoodApp.data.userState.userAccount?.subscriptionId){
        await this.$vpnHoodApp.refreshAccount();
      }
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

/*noinspection CssUnusedSymbol*/
#mainBg.not-mobile{
  /*noinspection CssUnresolvedCustomProperty*/
  border: 1px rgba(var(--v-theme-secondary), .5) solid;
  box-shadow: 0 0 20px 9px #00000047;
}

/*noinspection CssUnusedSymbol*/
#mainBg.not-mobile:before{
  border-radius: 8px;
}

@media (max-width: 425px) {
  #mainBg:before {
    background-image: url("/src/assets/images/body-bg-mobile.png");
  }
}

/*** App is the VpnHoodConnect ***/
/*noinspection CssUnusedSymbol*/
.VpnHoodConnect #mainBg:before {
  opacity: .5;
}
</style>