<script setup lang="ts">
import DisconnectRequiredAlert from '@/components/DisconnectRequiredAlert.vue';
import AppBar from '@/components/AppBar.vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { AppFeature } from '@/services/VpnHood.Client.Api';
import SmallFeatureImageAndDescription from '@/components/Settings/SmallFeatureImageAndDescription.vue';
import FeaturePageLayout from '@/components/Settings/FeaturePageLayout.vue';
import SettingsItem from '@/components/Settings/SettingsItem.vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;
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

    <small-feature-image-and-description image="split-ip.webp" :description="locale('SPLIT_IP_ADDRESSES_DESC')" />

    <disconnect-required-alert class="mb-4"/>

    <!-- Filter by device -->
    <settings-item
      :title="locale('SPLIT_IPS_USING_DEVICE')"
      :subtitle="locale('SPLIT_IPS_USING_DEVICE_DESC')"
      :is-premium="vhApp.data.isPremiumFeature(AppFeature.SplitByIpViaDevice)"
      :is-show="true"
      :status="{
        state: vhApp.data.userSettings.useSplitByIpViaDevice,
        onText: locale('ON'),
        offText: locale('OFF')
      }"
      :click="{name: 'SPLIT_IPS_USING_DEVICE'}"
    />

    <!-- Filter by App -->
    <settings-item
      :title="locale('SPLIT_IPS_USING_APP')"
      :subtitle="locale('SPLIT_IPS_USING_APP_DESC')"
      :is-premium="vhApp.data.isPremiumFeature(AppFeature.SplitByIpViaApp)"
      :is-show="true"
      :status="{
        state: vhApp.data.userSettings.useSplitByIpViaApp,
        onText: locale('ON'),
        offText: locale('OFF')
      }"
      :click="{name: 'SPLIT_IPS_USING_APP'}"
    />

    <!-- Local network -->
    <settings-item
      :title="locale('SPLIT_LOCAL_NETWORK')"
      :subtitle="locale('SPLIT_LOCAL_NETWORK_DESC')"
      :is-premium="false"
      :is-show="vhApp.data.features.isLocalNetworkSupported"
      :status="{
        state: !vhApp.data.userSettings.includeLocalNetwork,
        onText: locale('ON'),
        offText: locale('OFF')
      }"
      :click="{name: 'SPLIT_LOCAL_NETWORK'}"
    />

  </v-sheet>
</template>

