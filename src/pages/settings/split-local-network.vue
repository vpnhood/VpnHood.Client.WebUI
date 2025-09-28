<script setup lang="ts">
import DisconnectRequiredAlert from '@/components/DisconnectRequiredAlert.vue';
import { computed } from 'vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import AppBar from '@/components/AppBar.vue';
import SmallFeatureImageAndDescription from '@/components/SmallFeatureImageAndDescription.vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const splitLocalNetwork = computed({
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

    <small-feature-image-and-description image="split-ip.webp" description="SPLIT_LOCAL_NETWORK_DESC" />

    <!-- Enforced by server alert -->
    <alert-warning v-if="!vhApp.data.isLocalNetworkAvailable" :text="locale('ENFORCED_BY_SERVER')" class="my-2" />

    <!-- Disconnecting alert -->
    <disconnect-required-alert class="my-2"/>

    <config-card class="pb-2">

      <v-card-item>
        <!-- Switch button -->
        <div class="d-flex align-center justify-space-between">
          <span>{{ locale('SPLIT_LOCAL_NETWORK') }}</span>
          <v-switch
            v-model="splitLocalNetwork"
            :disabled="!vhApp.data.isLocalNetworkAvailable"
          />
        </div>

        <!-- Alert for number of IPs in the filter by device -->
        <p class="text-caption text-disabled">{{locale("SPLIT_LOCAL_NETWORK_DESC") }}</p>
      </v-card-item>

    </config-card>
  </v-sheet>
</template>
