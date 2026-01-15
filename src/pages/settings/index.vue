<script lang="ts" setup>
import i18n from '@/locales/i18n';
import AppBar from '@/components/AppBar.vue';
import { AppFeature, AppProxyMode } from '@/services/VpnHood.Client.Api';
import { LanguagesCode } from '@/helpers/UiConstants';
import SettingsItem from '@/components/SettingsItem.vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import SettingsSectionTitle from '@/components/SettingsSectionTitle.vue';
import { ref } from 'vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;
const proxySelectedMode = ref(vhApp.data.userSettings.proxySettings?.mode);

function isShowConnectivitySectionTitle(): boolean {
  return vhApp.data.intentFeatures.isQuickLaunchSupported ||
    vhApp.data.intentFeatures.isAlwaysOnSettingsSupported ||
    vhApp.data.intentFeatures.isKillSwitchSettingsSupported;
}

</script>

<template>
  <v-sheet>
    <app-bar/>

    <!-- APP SETTINGS SECTION -->
   <settings-section-title :title="locale('APP_SETTINGS')"/>
    <!-- Language -->
    <settings-item
      :title="locale('LANGUAGE')"
      :subtitle="locale('APP_LANGUAGE_DESC')"
      :isPremium=false
      :is-show="true"
      :status="{
        state: vhApp.data.userSettings.cultureCode != null,
        onText: vhApp.data.state.currentUiCultureInfo.nativeName,
        offText: locale('SYSTEM_DEFAULT_LANGUAGE')
      }"
      :click="{name: 'LANGUAGE'}"
      :languageMoreAction="i18n.global.locale.value !== LanguagesCode.English"
    />

    <!-- Notification -->
    <settings-item
      :title="locale('NOTIFICATIONS')"
      :subtitle="locale('NOTIFICATIONS_DESC')"
      :isPremium="false"
      :status="{
        state: vhApp.data.isNotificationEnabled,
        onText: locale('ON'),
        offText: locale('OFF')
      }"
      :isShow="vhApp.data.intentFeatures.isAppNotificationSettingsSupported"
      :click="{name: 'NOTIFICATIONS'}"
    />


    <!-- PRIVACY & SECURITY SECTION -->
    <settings-section-title :title="locale('PRIVACY_AND_SECURITY')"/>
    <!-- Split IP -->
    <settings-item
      :title="locale('SPLIT_IP_ADDRESSES')"
      :subtitle="locale('SPLIT_IP_ADDRESSES_DESC')"
      :is-show="true"
      :isPremium="vhApp.data.isPremiumFeature(AppFeature.AppIpFilter)"
      :status="{
        state: vhApp.data.isSplitIpInUse,
        onText: locale('ON'),
        offText: locale('OFF')
      }"
      :click="{name: 'SPLIT_IP'}"
    />

    <!-- Local network -->
    <settings-item
      :title="locale('ACCESS_LOCAL_NETWORK')"
      :subtitle="locale('ACCESS_LOCAL_NETWORK_DESC')"
      :isPremium=false
      :status="{
        state: !vhApp.data.userSettings.includeLocalNetwork,
        onText: locale('ON'),
        offText: locale('OFF')
      }"
      :is-show="vhApp.data.features.isLocalNetworkSupported"
      :click="{name: 'ACCESS_LOCAL_NETWORK'}"
    />

    <!-- DNS -->
    <settings-item
      :title="locale('DNS')"
      :subtitle="locale('DNS_DESC')"
      :status="{
        state: vhApp.data.isDnsInUse,
        onText: locale('CUSTOM'),
        offText: locale('DEFAULT')
      }"
      :isPremium="vhApp.data.isPremiumFeature(AppFeature.CustomDns)"
      :is-show="true"
      :click="{name: 'DNS'}"
    />

    <!-- Proxies -->
    <settings-item
      :title="locale('PROXIES')"
      :subtitle="locale('PROXIES_DESC')"
      :isPremium="false"
      :is-show="true"
      :status="{
        state: proxySelectedMode != AppProxyMode.NoProxy,
        onText: proxySelectedMode === AppProxyMode.Device ? locale('PROXY_MODE_DEVICE') : locale('PROXY_MODE_MANUAL'),
        offText: locale('PROXY_MODE_NOPROXY')
      }"
      :click="{name:'PROXIES'}"
    />


    <!-- CONNECTIVITY SECTION -->
    <settings-section-title title="CONNECTIVITY" v-if="isShowConnectivitySectionTitle()"/>
    <!-- Quick launch -->
    <settings-item
      :title="locale('QUICK_LAUNCH')"
      :subtitle="locale('QUICK_LAUNCH_DESC')"
      :isPremium="vhApp.data.isPremiumFeature(AppFeature.QuickLaunch)"
      :is-show="vhApp.data.intentFeatures.isQuickLaunchSupported"
      :click="{name:'QUICK_LAUNCH'}"
    />

    <!-- Always on -->
    <settings-item
      :title="locale('ALWAYS_ON')"
      :subtitle="locale('ALWAYS_ON_DESC')"
      :isPremium="vhApp.data.isPremiumFeature(AppFeature.AlwaysOn)"
      :is-show="vhApp.data.intentFeatures.isAlwaysOnSettingsSupported"
      :click="{name:'ALWAYS_ON'}"
    />

    <!-- Kill switch -->
    <settings-item
      :title="locale('KILL_SWITCH')"
      :subtitle="locale('KILL_SWITCH_DESC')"
      :isPremium="false"
      :is-show="vhApp.data.intentFeatures.isKillSwitchSettingsSupported"
      :click="{name:'KILL_SWITCH'}"
    />
  </v-sheet>
</template>
