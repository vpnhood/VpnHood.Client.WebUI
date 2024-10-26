<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { VpnHoodApp } from '@/services/VpnHoodApp'
import { ClientProfileInfo } from "@/services/VpnHood.Client.Api";
import {ComponentRouteController} from "@/services/ComponentRouteController";
import AppBar from "@/components/AppBar.vue";
import {Util} from "@/services/Util";
import router from '@/plugins/router';
import i18n from '@/locales/i18n'
import ExpansionPanelList from '@/components/Servers/ExpansionPanelList.vue'
import LocationList from '@/components/Servers/LocationList.vue'

const vhApp = VpnHoodApp.instance;
const $t = i18n.global.t;


const expandedPanels = ref<number[]>([]);

onMounted(() => {
  // Create open state for each clientProfileInfo item
  expandedPanels.value = vhApp.data.clientProfileInfos.map(() => 0);
});

// Connect or diagnose selected client profile
async function connect(clientProfileInfo: ClientProfileInfo, serverLocationInfo: string,
                       isDiagnose: boolean = false): Promise<void> {

  // App is VpnHoodCONNECT and client profile have multi location, but user select server card instead location
  // Show snackbar message
  if (vhApp.isConnectApp() && serverLocationInfo === "" && !Util.isSingleLocation(clientProfileInfo.serverLocationInfos.length)){
    // TODO show snackbar message
    console.log("not implemented");
  }

  // App is VpnHoodClient and Client profile have multi location, but user select server card instead location
  // Do nothing because expansion panel has action collapse/expand
  if (serverLocationInfo === "" && !Util.isSingleLocation(clientProfileInfo.serverLocationInfos.length))
    return;

  await router.replace('/');
  vhApp.data.settings.userSettings.clientProfileId = clientProfileInfo.clientProfileId;
  // If the serverLocation is empty, it will be connected to Auto
  vhApp.data.settings.userSettings.serverLocation = serverLocationInfo === "" ? null : serverLocationInfo;
  await vhApp.saveUserSetting();

  if (isDiagnose) await vhApp.diagnose();
  else await vhApp.connect();
}
</script>

<template>
  <!-- Page header -->
  <AppBar :page-title="$t('SERVERS')"/>

  <v-sheet
    :color="vhApp.isConnectApp() ? 'primary-darken-2' : 'gray-lighten-6'"
    :class="[vhApp.isSingleServerMode() ? 'py-0 px-0' : 'pa-4','text-center']"
  >

    <!-- Add server button -->
    <v-btn
      v-if="vhApp.data.features.isAddAccessKeySupported"
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
    <div v-if="vhApp.data.features.isAddAccessKeySupported && vhApp.data.clientProfileInfos.length === 0">
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
    <template v-else-if="vhApp.isSingleServerMode()">
      <LocationList :client-profile-info="vhApp.data.clientProfileInfos[0]" @connect="connect" />
    </template>

    <!-- For VpnHoodCLIENT -->
    <!-- Multi server mode -->
    <template v-else>
      <ExpansionPanelList :expanded-panels="expandedPanels" @connect="connect" />
    </template>

  </v-sheet>
</template>
