<template>
  <v-app id="appContainer"
         :class="[$vpnHoodApp.data.features.uiName, $vpnHoodApp.data.settings.userSettings.cultureCode, 'bg-primary-darken-2 position-relative']">

    <!-- Navigation drawer -->
    <NavigationDrawer v-model="ComponentRouteController.create($componentName.NavigationDrawer).isShow"/>

    <v-main
        id="mainBg"
        :class="[$vuetify.display.mdAndUp? 'not-mobile rounded-lg mx-auto my-10' : '','w-100']"
        :style="[$vuetify.display.mdAndUp ? 'max-width:850px;' : '']"
    >

      <router-view v-if="!isShowPrivacyPolicyDialog"/>

      <!-- Only for VpnHoodCONNECT -->
      <PrivacyPolicyDialog v-model="isShowPrivacyPolicyDialog"/>

      <!-- Loading dialog before each api call -->
      <LoadingDialog v-model="$vpnHoodApp.data.uiState.showLoadingDialog" v-if="!isShowPrivacyPolicyDialog"/>

      <!-- Global alert dialog -->
      <alert-dialog v-model="isAlertDialogVisible"/>

      <!-- Global async confirm dialog -->
      <ConfirmDialog/>

    </v-main>
  </v-app>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import {ComponentRouteController} from './services/ComponentRouteController';
import {AppName, LocalStorage, UiConstants} from "@/UiConstants";
import AlertDialog from "@/components/AlertDialog.vue";
import LoadingDialog from "@/components/LoadingDialog.vue";
import PrivacyPolicyDialog from "@/components/PrivacyPolicyDialog.vue";
import NavigationDrawer from "@/components/NavigationDrawer.vue";
import ConfirmDialog from "@/components/ConfirmDialog/DialogComponent.vue";

export default defineComponent({
  name: 'App',
  components: {PrivacyPolicyDialog, LoadingDialog, AlertDialog, NavigationDrawer, ConfirmDialog},
  data() {
    return {
      AppName,
      UiConstants,
      ComponentRouteController,
      isShowPrivacyPolicyDialog: false,
    };
  },
  async created() {
    // Show privacy policy if app is VpnHoodCONNECT
    if (this.$vpnHoodApp.isConnectApp() && !localStorage.getItem(LocalStorage.acceptedPrivacyPolicy)) {
      this.isShowPrivacyPolicyDialog = true;
      return;
    }

    if (this.$vpnHoodApp.data.features.isAccountSupported)
      await this.$vpnHoodApp.loadAccount();

  },
  computed: {
    isAlertDialogVisible: {
      get(): boolean {
        return ComponentRouteController.isShowComponent(this.$componentName.AlertDialog) &&
            this.$vpnHoodApp.data.uiState.errorDialogData.isVisible;
      },
      async set(value: boolean) {
        if (value) return; // Already is Open
        await ComponentRouteController.showComponent(this.$componentName.AlertDialog, value);
        await this.$vpnHoodApp.clearLastError();
      }
    }
  },
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
    background-image: url("/src/assets/images/body-bg-mobile.png");
  }
}

#appContainer:before {
  content: "";
  position: absolute;
  bottom: 0;
  top: 0;
  right: 0;
  left: 0;
  background: url("/src/assets/images/body-bg.png") no-repeat center center fixed;
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