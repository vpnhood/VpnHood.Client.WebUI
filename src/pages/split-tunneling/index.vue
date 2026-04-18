<script setup lang="ts">
import router from '@/services/router';
import DisconnectRequiredAlert from '@/components/DisconnectRequiredAlert.vue';
import AppBar from '@/components/AppBar.vue';
import { computed } from 'vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { Util } from '@/helpers/Util';
import { AppFeature } from '@/services/VpnHood.Client.Api';
import SmallFeatureImageAndDescription from '@/components/Settings/SmallFeatureImageAndDescription.vue';
import FeaturePageLayout from '@/components/Settings/FeaturePageLayout.vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;


const useSplitByIpViaDevice = computed<boolean>({
  get: () => vhApp.data.userSettings.useSplitByIpViaDevice,
  set: async (value: boolean) => {
    vhApp.data.userSettings.useSplitByIpViaDevice = value;
    await vhApp.saveUserSetting();
  }
});

const useSplitByIpViaApp = computed<boolean>({
  get: () => vhApp.data.userSettings.useSplitByIpViaApp,
  set: async (value: boolean) => {
    vhApp.data.userSettings.useSplitByIpViaApp = value;
    await vhApp.saveUserSetting();
  }
});

</script>

<template>

  <feature-page-layout
    v-if="!vhApp.data.isPremiumFeatureAllowed(AppFeature.SplitByIpViaDevice)"
    title="SPLIT_IP_ADDRESSES_COLORED"
    description="SPLIT_IP_ADDRESSES_DESC"
    image="split-ip.webp"
    :is-premium="vhApp.data.isPremiumFeature(AppFeature.SplitByIpViaDevice)"
    :is-action-button-available="false"
  />

  <v-sheet v-else>
    <app-bar/>

    <small-feature-image-and-description image="split-ip.webp" description="SPLIT_IP_ADDRESSES_DESC" />

    <!-- Disconnecting alert -->
    <disconnect-required-alert class="mb-4"/>

    <!-- Filter by device -->
    <config-card class="pb-2">

      <v-card-item>
        <!-- Switch button -->
        <div class="d-flex align-center justify-space-between">
          <span>{{ locale('SPLIT_IPS_BY_ADAPTER') }}</span>
          <v-switch
            v-model="useSplitByIpViaDevice"
            :disabled="!vhApp.data.isPremiumFeatureAllowed(AppFeature.SplitByIpViaDevice)"
          />
        </div>

        <!-- Alert for number of IPs in the filter by device -->
        <p class="text-caption text-disabled">{{locale("CAUTION_INCREASE_NUMBER_OF_IP") }}</p>
      </v-card-item>

      <!-- Manage IP button -->
      <v-card-item v-if="useSplitByIpViaDevice">
        <btn-style-4
          :text="locale('MANAGE_IP_ADDRESSES')"
          :append-icon="Util.getLocalizedRightChevron()"
          @click="router.push({name: 'SPLIT_IPS_BY_ADAPTER'})"
        />
      </v-card-item>

    </config-card>

    <!-- Filter by App -->
    <config-card>

      <v-card-item>
        <!-- Switch button -->
        <div class="d-flex align-center justify-space-between">
          <span>{{ locale('SPLIT_IPS_BY_APP') }}</span>
          <v-switch
            v-model="useSplitByIpViaApp"
            :disabled="!vhApp.data.isPremiumFeatureAllowed(AppFeature.SplitByIpViaApp)"
          />
        </div>
      </v-card-item>

      <!-- Manage IP button -->
      <v-card-item v-if="useSplitByIpViaApp" class="mb-2">
        <btn-style-4
          :text="locale('MANAGE_IP_ADDRESSES')"
          :append-icon="Util.getLocalizedRightChevron()"
          @click="router.push({name: 'SPLIT_IPS_BY_APP'})"
        />
      </v-card-item>

    </config-card>

  </v-sheet>
</template>

<style>
.ipList textarea{
  /*noinspection CssUnresolvedCustomProperty*/
  font-size: 14px;
  padding-top: 15px;
}
.ipList textarea::placeholder{
  font-size: 12px;
}
</style>
