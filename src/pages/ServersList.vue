<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp'
import {ComponentRouteController} from "@/services/ComponentRouteController";
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
</script>

<template>
  <v-sheet>

    <!-- Add server button -->
    <div v-if="vhApp.data.features.isAddAccessKeySupported" class="text-center">
      <btn-style-6
        class="mt-1 mb-5"
        :text="locale('ADD_SERVER')"
        @click="isShowAddServerDialog = true"
      >
        <template v-slot:prepend>
          <v-icon icon="mdi-plus-circle" size="30"/>
        </template>
      </btn-style-6>
    </div>

    <!-- Show alert, if user does not have any server -->
    <div v-if="vhApp.data.features.isAddAccessKeySupported && vhApp.data.clientProfileInfos.length === 0">
      <alert-warning :title="locale('WARNING')" :text="locale('NO_SERVER_AVAILABLE')" class="mb-4" />
      <config-card>
        <div
          v-html="locale('GET_SERVER_KEY_METHODS_DESC')"
          class="pa-4 text-caption"
        ></div>
      </config-card>
    </div>

    <!-- For VpnHoodCONNECT -->
    <!-- Single server mode -->
    <LocationList v-else-if="vhApp.isSingleServerMode()" :client-profile="vhApp.data.clientProfileInfos[0]" />

    <!-- For VpnHoodCLIENT -->
    <!-- Multi server mode -->
    <ExpansionPanelList v-else/>

    <AddServerDialog v-model="isShowAddServerDialog" />
  </v-sheet>
</template>
