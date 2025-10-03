<script lang="ts" setup>
import i18n from '@/locales/i18n';
import AppBar from '@/components/AppBar.vue';
import { AppFeature } from '@/services/VpnHood.Client.Api';
import { LanguagesCode } from '@/helpers/UiConstants';
import SettingsItem from '@/components/SettingsItem.vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import SettingsSectionTitle from '@/components/SettingsSectionTitle.vue';

const vhApp = VpnHoodApp.instance;

function isShowConnectivitySectionTitle(): boolean {
  return vhApp.data.intentFeatures.isQuickLaunchSupported ||
    vhApp.data.intentFeatures.isSystemAlwaysOnSettingsSupported || vhApp.data.intentFeatures.isSystemKillSwitchSettingsSupported
}
</script>

<template>
  <v-sheet>
    <app-bar/>

    <!-- APP SETTINGS SECTION -->
   <settings-section-title title="APP_SETTINGS"/>
    <!-- Language -->
    <settings-item
      title="APP_LANGUAGE"
      subtitle="APP_LANGUAGE_DESC"
      :isPremium=false
      :is-show="true"
      :selectedItem="vhApp.data.state.currentUiCultureInfo.nativeName"
      :click="{name: 'LANGUAGE'}"
      :languageMoreAction="i18n.global.locale.value !== LanguagesCode.English"
    />

    <!-- Notification -->
    <settings-item
      title="NOTIFICATIONS"
      subtitle="NOTIFICATIONS_DESC"
      :isPremium="false"
      :status="{
        state: vhApp.data.isNotificationEnabled,
        onText: 'ON',
        offText: 'OFF'
      }"
      :isShow="vhApp.data.intentFeatures.isAppSystemNotificationSettingsSupported"
      :click="{name: 'NOTIFICATIONS'}"
    />


    <!-- PRIVACY & SECURITY SECTION -->
    <settings-section-title title="PRIVACY_AND_SECURITY"/>
    <!-- Split IP -->
    <settings-item
      title="SPLIT_IP_ADDRESSES"
      subtitle="SPLIT_IP_ADDRESSES_DESC"
      :is-show="true"
      :isPremium="vhApp.data.isPremiumFeature(AppFeature.AppIpFilter)"
      :status="{
        state: vhApp.data.isSplitIpInUse,
        onText: 'ON',
        offText: 'OFF'
      }"
      :click="{name: 'SPLIT_IP'}"
    />

    <!-- Local network -->
    <settings-item
      title="ACCESS_LOCAL_NETWORK"
      subtitle="ACCESS_LOCAL_NETWORK_DESC"
      :isPremium=false
      :status="{
        state: !vhApp.data.userSettings.includeLocalNetwork,
        onText: 'ON',
        offText: 'OFF'
      }"
      :is-show="vhApp.data.features.isLocalNetworkSupported"
      :click="{name: 'ACCESS_LOCAL_NETWORK'}"
    />

    <!-- DNS -->
    <settings-item
      title="DNS"
      subtitle="DNS_DESC"
      :status="{
        state: vhApp.data.isDnsInUse,
        onText: 'CUSTOM',
        offText: 'DEFAULT'
      }"
      :isPremium="vhApp.data.isPremiumFeature(AppFeature.CustomDns)"
      :is-show="vhApp.data.intentFeatures.isSystemPrivateDnsSettingsSupported"
      :click="{name: 'DNS'}"
    />


    <!-- CONNECTIVITY SECTION -->
    <settings-section-title title="CONNECTIVITY" v-if="isShowConnectivitySectionTitle()"/>
    <!-- Quick launch -->
    <settings-item
      title="QUICK_LAUNCH"
      subtitle="QUICK_LAUNCH_DESC"
      :isPremium="vhApp.data.isPremiumFeature(AppFeature.QuickLaunch)"
      :is-show="vhApp.data.intentFeatures.isQuickLaunchSupported"
      :click="{name:'QUICK_LAUNCH'}"
    />

    <!-- Always on -->
    <settings-item
      title="ALWAYS_ON"
      subtitle="ALWAYS_ON_DESC"
      :isPremium="vhApp.data.isPremiumFeature(AppFeature.AlwaysOn)"
      :is-show="vhApp.data.intentFeatures.isSystemAlwaysOnSettingsSupported"
      :click="{name:'ALWAYS_ON'}"
    />

    <!-- Kill switch -->
    <settings-item
      title="KILL_SWITCH"
      subtitle="KILL_SWITCH_DESC"
      :isPremium="false"
      :is-show="vhApp.data.intentFeatures.isSystemKillSwitchSettingsSupported"
      :click="{name:'KILL_SWITCH'}"
    />
  </v-sheet>
</template>
