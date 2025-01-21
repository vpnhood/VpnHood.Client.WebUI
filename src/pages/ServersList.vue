<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp'
import {ComponentRouteController} from "@/services/ComponentRouteController";
import AppBar from "@/components/AppBar.vue";
import i18n from '@/locales/i18n'
import ExpansionPanelList from '@/components/Servers/ExpansionPanelList.vue'
import LocationList from '@/components/Servers/LocationList.vue'
import { ComponentName } from '@/helpers/UiConstants';
import { computed } from 'vue';
import AddServerDialog from '@/components/Servers/AddServerDialog.vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const isShowAddServerDialog = computed<boolean>({
  get: () => {
    return ComponentRouteController.isShowComponent(ComponentName.AddServerDialog);
  },
  set: async (value: boolean) => {
    await ComponentRouteController.showComponent(ComponentName.AddServerDialog, value);
  }
})
// TODO: Check in the CLIENT app
</script>

<template>
  <!-- Page header -->
  <AppBar :page-title="locale('SERVERS')"/>

  <v-sheet>

    <!-- Add server button -->
    <v-btn
      v-if="vhApp.data.features.isAddAccessKeySupported"
      variant="flat"
      color="white"
      class="text-primary-darken-1 mt-1 mb-5 text-capitalize"
      rounded="pill"
      :text="locale('ADD_SERVER')"
      @click="isShowAddServerDialog = true"
    >
      <template v-slot:prepend>
        <v-icon icon="mdi-plus-circle" size="30"/>
      </template>
    </v-btn>

    <!-- Show alert, if user does not have any server -->
    <div v-if="vhApp.data.features.isAddAccessKeySupported && vhApp.data.clientProfileInfos.length === 0"
         class="text-start"
    >
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
      <LocationList :client-profile="vhApp.data.clientProfileInfos[0]" />
    </template>

    <!-- For VpnHoodCLIENT -->
    <!-- Multi server mode -->
    <template v-else>
      <ExpansionPanelList/>
    </template>

    <AddServerDialog v-model="isShowAddServerDialog" />
  </v-sheet>
</template>
