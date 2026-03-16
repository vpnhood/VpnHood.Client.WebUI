<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp'
import {ComponentRouteController} from "@/services/ComponentRouteController";
import i18n from '@/locales/i18n'
import ExpansionPanel from '@/components/Servers/ExpansionPanel.vue'
import LocationList from '@/components/Servers/LocationList.vue'
import { ComponentName } from '@/helpers/UiConstants';
import AddServerDialog from '@/components/Servers/AddServerDialog.vue';
import AppBar from '@/components/AppBar.vue';
import { ref } from 'vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;
const addServerDialogModel = ref(new ComponentRouteController(ComponentName.AddServerDialog));

</script>

<template>
  <v-sheet>
    <app-bar/>

    <!-- Add server button -->
    <btn-style-2
      v-if="vhApp.data.features.isAddAccessKeySupported"
      class="mb-5"
      block
      variant="tonal"
      min-height="40px"
      prepend-icon="mdi-plus-circle"
      :text="locale('ADD_SERVER')"
      @click="addServerDialogModel.show(true)"
    />

    <!-- Show alert, if user does not have any server -->
    <div v-if="vhApp.data.features.isAddAccessKeySupported && vhApp.data.clientProfileInfos.length === 0">
      <alert-warning :title="locale('WARNING')" :text="locale('NO_SERVER_AVAILABLE')" class="mb-4" />
      <config-card>
        <div v-html="locale('GET_SERVER_KEY_METHODS_DESC')" class="pa-4 text-caption"></div>
      </config-card>
    </div>

    <!-- Single profile mode -->
    <LocationList v-else-if="vhApp.isSingleProfileMode()" :client-profile="vhApp.data.clientProfileInfos[0]" />

    <!-- Multi profile mode -->
    <ExpansionPanel v-else/>

    <AddServerDialog v-model="addServerDialogModel.isVisible" />
  </v-sheet>
</template>
