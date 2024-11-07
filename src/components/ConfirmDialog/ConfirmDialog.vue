<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { computed } from 'vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const isOpen = computed<boolean>({
  get: () => {
    return vhApp.data.confirmDialog.isOpen;
  },
  set: (value: boolean): void => {
    vhApp.data.confirmDialog.isOpen = value;
  }
})
</script>

<template>
  <v-dialog v-model="isOpen" :persistent="true" max-width="600">
    <v-card
      :color="vhApp.isConnectApp() ? 'primary-darken-2' : 'white'"
      :class="{'pa-3' : vhApp.isConnectApp()}"
    >
      <!-- Title -->
      <v-card-title :class="vhApp.isConnectApp() ? 'text-secondary' : 'bg-secondary'">
        <div class="d-flex align-center">
          <v-icon class="pe-3" icon="mdi-alert-circle-outline"/>
          <h3>{{ vhApp.data.confirmDialog.title }}</h3>
        </div>
        <v-divider v-if="vhApp.isConnectApp()" class="mt-3 border-opacity-25"></v-divider>
      </v-card-title>

      <!-- Message -->
      <v-card-text :class="[vhApp.isConnectApp() ? 'text-disabled' : 'text-gray-lighten-2']">
        {{ vhApp.data.confirmDialog.message }}
      </v-card-text>


      <!-- Buttons -->
      <v-card-actions>

        <!-- No -->
        <v-btn
          rounded="pill"
          variant="tonal"
          max-height="32px"
          min-width="70px"
          color="secondary"
          :text="locale('NO')"
          @click="vhApp.data.confirmDialog.closeDialog(false)"
        />

        <!-- Yes -->
        <v-btn
          rounded="pill"
          variant="text"
          max-height="32px"
          min-width="70px"
          color="secondary"
          :text="locale('YES')"
          @click="vhApp.data.confirmDialog.closeDialog(true)"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>
