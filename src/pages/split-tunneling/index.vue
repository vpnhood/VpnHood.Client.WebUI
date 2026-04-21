<script setup lang="ts">
import DisconnectRequiredAlert from '@/components/DisconnectRequiredAlert.vue';
import AppBar from '@/components/AppBar.vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { AppFeature } from '@/services/VpnHood.Client.Api';
import SmallFeatureImageAndDescription from '@/components/Settings/SmallFeatureImageAndDescription.vue';
import SettingsItem from '@/components/Settings/SettingsItem.vue';
import SettingsSectionTitle from '@/components/Settings/SettingsSectionTitle.vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;
</script>

<template>

  <v-sheet>
    <app-bar/>

    <small-feature-image-and-description image="split-ip.webp" :description="locale('SPLIT_TUNNELING_DESC')" />

    <disconnect-required-alert class="mb-4"/>

    <!-- Apps & Domains -->
    <settings-section-title :title="locale('APPS_AND_DOMAINS')"/>

    <!-- Split apps -->
    <settings-item
      :title="locale('SPLIT_APPS')"
      :subtitle="locale('SPLIT_APPS_SHORT_DESC')"
      :is-premium="false"
      :is-show="vhApp.data.features.isExcludeAppsSupported || vhApp.data.features.isIncludeAppsSupported"
      :selected-item="vhApp.data.splitAppsStatusText"
      :click="{name: 'SPLIT_APPS'}"
    />

    <!-- Split domains -->
    <settings-item
      :title="locale('SPLIT_DOMAINS')"
      :subtitle="locale('SPLIT_DOMAINS_SHORT_DESC')"
      :is-premium="vhApp.data.isPremiumFeature(AppFeature.SplitDomain)"
      :is-show="true"
      :status="{
        state: vhApp.data.userSettings.useSplitDomain,
        onText: locale('ON'),
        offText: locale('OFF')
      }"
      :click="{name: 'SPLIT_DOMAINS'}"
    />

    <!-- IP Addresses -->
    <settings-section-title :title="locale('IP_ADDRESSES')"/>

    <!-- Filter by device -->
    <settings-item
      :title="locale('SPLIT_IPS_VIA_DEVICE')"
      :subtitle="locale('SPLIT_IPS_VIA_DEVICE_SHORT_DESC')"
      :is-premium="vhApp.data.isPremiumFeature(AppFeature.SplitIpViaDevice)"
      :is-show="true"
      :status="{
        state: vhApp.data.userSettings.useSplitIpViaDevice,
        onText: locale('ON'),
        offText: locale('OFF')
      }"
      :click="{name: 'SPLIT_IPS_VIA_DEVICE'}"
    />

    <!-- Filter by App -->
    <settings-item
      :title="locale('SPLIT_IPS_VIA_APP')"
      :subtitle="locale('SPLIT_IPS_VIA_APP_SHORT_DESC')"
      :is-premium="vhApp.data.isPremiumFeature(AppFeature.SplitIpViaApp)"
      :is-show="true"
      :status="{
        state: vhApp.data.userSettings.useSplitIpViaApp,
        onText: locale('ON'),
        offText: locale('OFF')
      }"
      :click="{name: 'SPLIT_IPS_VIA_APP'}"
    />

    <!-- Location -->
    <settings-section-title :title="locale('LOCATIONS')"/>

    <!-- Local network -->
    <settings-item
      :title="locale('SPLIT_LOCAL_NETWORK')"
      :subtitle="locale('SPLIT_LOCAL_NETWORK_SHORT_DESC')"
      :is-show="true"
      :is-premium="false"
      
      :status="{
        state: !vhApp.data.userSettings.useSplitLocalNetwork,
        onText: locale('ON'),
        offText: locale('OFF')
      }"
      :click="{name: 'SPLIT_LOCAL_NETWORK'}"
    />

    <!-- Split countries -->
    <settings-item
      :title="locale('SPLIT_COUNTRIES')"
      :subtitle="locale('SPLIT_COUNTRIES_SHORT_DESC')"
      :is-premium="vhApp.data.isPremiumFeature(AppFeature.SplitCountry)"
      :is-show="true"
      :selected-item="vhApp.data.splitCountryStatusText"
      :click="{name: 'SPLIT_COUNTRIES'}"
    />

  </v-sheet>
</template>

