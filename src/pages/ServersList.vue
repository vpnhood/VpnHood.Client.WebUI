<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { VpnHoodApp } from '@/services/VpnHoodApp'
import { ClientProfileInfo, ServerLocationAccess } from "@/services/VpnHood.Client.Api";
import {ComponentRouteController} from "@/services/ComponentRouteController";
import AppBar from "@/components/AppBar.vue";
import ConnectServerLocationList from "@/components/ConnectServerLocationList.vue";
import {Util} from "@/services/Util";
import router from '@/plugins/router';
import i18n from '@/locales/i18n'
import ServerExpansionPanelList from '@/components/ExpansionPanelList.vue'

const VhApp = VpnHoodApp.instance;
const $t = i18n.global.t;
const expandedPanels = ref<number[]>([]);

onMounted(() => {
  // Create open state for each clientProfileInfo item
  expandedPanels.value = VhApp.data.clientProfileInfos.map(() => 0);
});

function createMockClientProfileInfo(clientProfileInfo: ClientProfileInfo): ClientProfileInfo {
  const locationInfo = clientProfileInfo.serverLocationInfos;

  for (let x = 0; x < 4; x++) {
    const randomNumber = Math.floor(Math.random() * (locationInfo.length - 1)) + 1;
    if (x < 2){
      locationInfo[randomNumber].serverLocationAccess = new ServerLocationAccess({
        normal: 0,
        premiumByPurchase: true,
        premiumByRewardedAd: 0,
        premiumByTrial: 0,
        prompt: false
      });
    }
    else {
      locationInfo[randomNumber].serverLocationAccess = new ServerLocationAccess({
        normal: 0,
        premiumByPurchase: false,
        premiumByRewardedAd: 0,
        premiumByTrial: 1,
        prompt: false
      });
    }
  }

  return clientProfileInfo;
}

// Connect or diagnose selected client profile
async function connect(clientProfileInfo: ClientProfileInfo, serverLocationInfo: string, isDiagnose: boolean = false): Promise<void> {

  // App is VpnHoodCONNECT and client profile have multi location, but user select server card instead location
  // Show snackbar message
  if (VhApp.isConnectApp() && serverLocationInfo === "" && !Util.isSingleLocation(clientProfileInfo.serverLocationInfos.length)){
    // TODO show snackbar message
    console.log("not implemented");
  }

  // App is VpnHoodClient and Client profile have multi location, but user select server card instead location
  // Do nothing because expansion panel has action collapse/expand
  if (serverLocationInfo === "" && !Util.isSingleLocation(clientProfileInfo.serverLocationInfos.length))
    return;

  await router.replace('/');
  VhApp.data.settings.userSettings.clientProfileId = clientProfileInfo.clientProfileId;
  // If the serverLocation is empty, it will be connected to Auto
  VhApp.data.settings.userSettings.serverLocation = serverLocationInfo === "" ? null : serverLocationInfo;
  await VhApp.saveUserSetting();

  if (isDiagnose) await VhApp.diagnose();
  else await VhApp.connect();
}
</script>

<template>
  <!-- Page header -->
  <AppBar :page-title="$t('SERVERS')"/>

  <v-sheet
    :color="VhApp.isConnectApp() ? 'primary-darken-2' : 'gray-lighten-6'"
    :class="[VhApp.isSingleServerMode() ? 'py-0 px-0' : 'pa-4','text-center']"
  >

    <!-- Add server button -->
    <v-btn
      v-if="VhApp.data.features.isAddAccessKeySupported"
      variant="flat"
      color="white"
      class="text-primary-darken-1 mt-1 mb-5 text-capitalize"
      rounded="pill"
      :text="$t('ADD_SERVER')"
      @click="ComponentRouteController.showComponent($componentName.AddServerDialog)"
    >
      <template v-slot:prepend>
        <v-icon icon="mdi-plus-circle" size="30"/>
      </template>
    </v-btn>

    <!-- Show alert, if user does not have any server -->
    <div v-if="VhApp.data.features.isAddAccessKeySupported && VhApp.data.clientProfileInfos.length === 0">
      <v-alert
        :text="$t('NO_SERVER_AVAILABLE')"
        density="compact"
        type="warning"
        class="mb-4"
      />
      <div
        v-html="$t('GET_SERVER_KEY_METHODS_DESC')"
        class="get-server-key-alert pa-4 text-subtitle-2"
      ></div>
    </div>


    <!-- For VpnHoodCONNECT -->
    <!-- Single server mode -->
    <template v-else-if="VhApp.isSingleServerMode()">
      <ConnectServerLocationList
        :client-profile-info="createMockClientProfileInfo(VhApp.data.clientProfileInfos[0])"
        :is-single-item="true"
        :is-active-profile="true"
        @connect="connect"
      />
    </template>

    <!-- For VpnHoodCLIENT -->
    <!-- Multi server mode -->
    <template v-else>
      <ServerExpansionPanelList :expanded-panels="expandedPanels"/>
    </template>

  </v-sheet>
</template>
