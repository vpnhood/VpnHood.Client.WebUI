<script setup lang="ts">
import AppBar from '@/components/AppBar.vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import { computed } from 'vue';
import i18n from '@/locales/i18n';
import DisconnectRequiredAlert from '@/components/DisconnectRequiredAlert.vue';
import SmallFeatureImageAndDescription from '@/components/Settings/SmallFeatureImageAndDescription.vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const isEnabled = computed<boolean>({
  get: () => !vhApp.data.userSettings.includeLocalNetwork,
  set: async (value: boolean) => {
    vhApp.data.userSettings.includeLocalNetwork = !value;
    await vhApp.saveUserSetting();
  }
});
</script>

<template>
  <v-sheet>
    <app-bar/>

    <small-feature-image-and-description image="access-local-network.webp"  />

    <!-- Enforced by server alert -->
    <alert-warning v-if="!vhApp.data.isLocalNetworkAvailable" :text="locale('ENFORCED_BY_SERVER')" class="mb-4" />

    <!-- Disconnecting alert -->
    <disconnect-required-alert class="mb-4"/>

    <config-card class="pb-2">
      <v-card-item>
        <div class="d-flex align-center justify-space-between">
          <span>{{ locale('SPLIT_LOCAL_NETWORK') }}</span>
          <v-switch
            v-model="isEnabled"
            :disabled="!vhApp.data.isLocalNetworkAvailable"
            hide-details
          />
        </div>
        <p class="text-caption text-disabled">{{ locale('SPLIT_LOCAL_NETWORK_DESC') }}</p>
      </v-card-item>
    </config-card>
  </v-sheet>
</template>
