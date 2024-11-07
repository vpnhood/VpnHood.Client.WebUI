<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { VpnHoodApp } from '@/services/VpnHoodApp'
import {ComponentRouteController} from "@/services/ComponentRouteController";
import AppBar from "@/components/AppBar.vue";
import i18n from '@/locales/i18n'
import ExpansionPanelList from '@/components/Servers/ExpansionPanelList.vue'
import LocationList from '@/components/Servers/LocationList.vue'
import { ComponentName } from '@/helper/UiConstants';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const expandedPanels = ref<number[]>([]);

onMounted(() => {
  // Create open state for each clientProfileInfo item
  expandedPanels.value = vhApp.data.clientProfileInfos.map(() => 0);
});
</script>

<template>
  <!-- Page header -->
  <AppBar :page-title="locale('SERVERS')"/>

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
      :text="locale('ADD_SERVER')"
      @click="ComponentRouteController.showComponent(ComponentName.AddServerDialog)"
    >
      <template v-slot:prepend>
        <v-icon icon="mdi-plus-circle" size="30"/>
      </template>
    </v-btn>

    <!-- Show alert, if user does not have any server -->
    <div v-if="vhApp.data.features.isAddAccessKeySupported && vhApp.data.clientProfileInfos.length === 0">
      <v-alert
        :text="locale('NO_SERVER_AVAILABLE')"
        density="compact"
        type="warning"
        class="mb-4"
      />
      <div
        v-html="locale('GET_SERVER_KEY_METHODS_DESC')"
        class="get-server-key-alert pa-4 text-subtitle-2"
      ></div>
    </div>

    <!-- For VpnHoodCONNECT -->
    <!-- Single server mode -->
    <template v-else-if="vhApp.isSingleServerMode()">
      <LocationList
        :client-profile-id="vhApp.data.clientProfileInfos[0].clientProfileId"
        :server-location-infos="vhApp.data.clientProfileInfos[0].serverLocationInfos"
      />
    </template>

    <!-- For VpnHoodCLIENT -->
    <!-- Multi server mode -->
    <template v-else>
      <ExpansionPanelList :expanded-panels="expandedPanels" />
    </template>

  </v-sheet>
</template>
