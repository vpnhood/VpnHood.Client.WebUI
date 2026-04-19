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

    <small-feature-image-and-description image="split-ip.webp" description="SPLIT_IP_ADDRESSES_DESC" />

    <disconnect-required-alert class="mb-4"/>

    <!-- Filter by device -->
    <settings-item
      :title="locale('SPLIT_IPS_BY_ADAPTER')"
      :subtitle="locale('SPLIT_IPS_BY_ADAPTER_DESC')"
      :is-premium="vhApp.data.isPremiumFeature(AppFeature.SplitByIpViaDevice)"
      :is-show="true"
      :status="{
        state: vhApp.data.userSettings.useSplitByIpViaDevice,
        onText: locale('ON'),
        offText: locale('OFF')
      }"
      :click="{name: 'SPLIT_IPS_BY_ADAPTER'}"
    />

    <!-- Filter by App -->
    <settings-item
      :title="locale('SPLIT_IPS_BY_APP')"
      :subtitle="locale('SPLIT_IPS_BY_APP_DESC')"
      :is-premium="vhApp.data.isPremiumFeature(AppFeature.SplitByIpViaApp)"
      :is-show="true"
      :status="{
        state: vhApp.data.userSettings.useSplitByIpViaApp,
        onText: locale('ON'),
        offText: locale('OFF')
      }"
      :click="{name: 'SPLIT_IPS_BY_APP'}"
    />

  </v-sheet>
</template>

