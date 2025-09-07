<script lang="ts" setup>
import { computed, type WritableComputedRef } from 'vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import router from '@/services/router';
import { Util } from '@/helpers/Util';
import DisconnectRequiredAlert from '@/components/DisconnectRequiredAlert.vue';
import AppBar from '@/components/AppBar.vue';
import type { RouteLocationRaw } from 'vue-router';
import { AppFeature, DnsMode } from '@/services/VpnHood.Client.Api';
import { LanguagesCode } from '@/helpers/UiConstants';
import PremiumIcon from '@/components/PremiumIcon.vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

interface SettingsItem {
  title: string,
  subtitle: string,
  isPremium: boolean,
  click?: RouteLocationRaw,
  premiumClick?: RouteLocationRaw,
  selectedItem?: string,
  status?: {
    state?: boolean,
    onText: string,
    offText: string,
  },
  isShow?: boolean,
  isDisconnectRequired?: boolean,
  isShowEnforcedByServerAlert?: boolean,
  isDisabled?: boolean,
  model?: WritableComputedRef<boolean, boolean>,
  languageMoreAction?: boolean
}

const includeLocalNetwork = computed({
  get: () => vhApp.data.userSettings.includeLocalNetwork,
  set: async (value: boolean) => {
    vhApp.data.userSettings.includeLocalNetwork = value;
    await vhApp.saveUserSetting();
  }
});

const settingsItem: SettingsItem[] = [
  {
    title: "APP_LANGUAGE",
    subtitle: "APP_LANGUAGE_DESC",
    isPremium: false,
    selectedItem: vhApp.data.state.currentUiCultureInfo.nativeName,
    click: {name: 'LANGUAGE'},
    languageMoreAction: i18n.global.locale.value !== LanguagesCode.English
  },
  {
    title: "LOCAL_NETWORK",
    subtitle: "INCLUDE_LOCAL_NETWORK_DESC",
    isPremium: false,
    isShow: vhApp.data.features.isLocalNetworkSupported,
    isDisconnectRequired: true,
    isDisabled: !vhApp.isIncludeLocalNetworkAvailable(),
    isShowEnforcedByServerAlert: vhApp.data.isConnected && !vhApp.data.state.sessionInfo?.isLocalNetworkAllowed,
    model: includeLocalNetwork
  },
  {
    title: "FILTER_IP_ADDRESSES",
    subtitle: "FILTER_IP_ADDRESSES_DESC",
    isPremium: vhApp.data.features.premiumFeatures.includes(AppFeature.AppIpFilter),
    status: {
      state: vhApp.isFilterIpTurnOn(),
      onText: locale('ON'),
      offText: locale('OFF')
    },
    click: {name: 'FILTER_IP'}
  },
  {
    title: "NOTIFICATIONS",
    subtitle: "NOTIFICATIONS_DESC",
    isPremium: false,
    status: {
      state: vhApp.data.state.isNotificationEnabled ?? undefined,
      onText: locale('ON'),
      offText: locale('OFF')
    },
    isShow: vhApp.data.intentFeatures.isAppSystemNotificationSettingsSupported,
    click: {name: 'NOTIFICATIONS'}
  },
  {
    title: "QUICK_LAUNCH",
    subtitle: "QUICK_LAUNCH_DESC",
    isPremium: vhApp.data.features.premiumFeatures.includes(AppFeature.QuickLaunch),
    isShow: vhApp.data.intentFeatures.isQuickLaunchSupported,
    click: {name: 'QUICK_LAUNCH'}
  },
  {
    title: "ALWAYS_ON",
    subtitle: "ALWAYS_ON_DESC",
    isPremium: vhApp.data.features.premiumFeatures.includes(AppFeature.AlwaysOn),
    isShow: vhApp.data.intentFeatures.isSystemAlwaysOnSettingsSupported,
    click: {name: 'ALWAYS_ON'}
  },
  {
    title: "KILL_SWITCH",
    subtitle: "KILL_SWITCH_DESC",
    isPremium: false,
    isShow: vhApp.data.intentFeatures.isSystemKillSwitchSettingsSupported,
    click: {name: 'KILL_SWITCH'}
  },
  {
    title: "DNS",
    subtitle: "DNS_DESC",
    status: {
      state: vhApp.data.state.systemPrivateDns?.isActive || vhApp.data.userSettings.dnsMode === DnsMode.AdapterDns,
      onText: locale('CUSTOM'),
      offText: locale('DEFAULT')
    },
    isPremium: vhApp.data.features.premiumFeatures.includes(AppFeature.CustomDns),
    click: {name: 'DNS'}
  }
]

</script>

<template>
  <v-sheet>
    <app-bar/>
    <template v-for="(item, index) in settingsItem" :key="index">

      <config-card v-if="item.isShow !== undefined ? item.isShow : true" class="pa-3">

        <div @click="item.click ? router.push(item.click) : null" >

          <!-- Title, selected item and status (If available) and premium icon (If available) -->
          <div class="d-flex align-center justify-space-between pb-1">

            <!-- Title, selected item and status (If available) -->
            <div class="d-flex align-center justify-space-between ga-2">
              <span>{{ locale(item.title) }}</span>

              <!-- Selected item if available -->
              <v-chip v-if="item.selectedItem"
                :text="item.selectedItem"
                size="small"
                variant="tonal"
                density="comfortable"
                color="switch-btn"
              />

              <!-- Status if available -->
              <v-chip v-else-if="item.status?.state !== undefined"
                :text="item.status.state ? item.status.onText : item.status.offText"
                size="small"
                variant="tonal"
                density="comfortable"
                :disabled="!item.status.state"
                :color="item.status.state ? 'enable-premium' : ''"
              />

            </div>

            <!-- Premium icon for premium features -->
            <premium-icon :is-premium="item.isPremium" />

          </div>

          <!-- Item description (Show chevron icon if the item does not have the model) -->
          <v-card-subtitle class="d-flex align-center justify-space-between ga-3 pa-0">
            {{ locale(item.subtitle) }}
            <v-icon v-if="item.model === undefined" :icon="Util.getLocalizedRightChevron()"/>
          </v-card-subtitle>

        </div>

        <!-- Enforced by server alert -->
        <alert-warning v-if="item.isShowEnforcedByServerAlert" :text="locale('ENFORCED_BY_SERVER')" class="my-2" />

        <!-- Disconnecting alert -->
        <disconnect-required-alert v-else-if="item.isDisconnectRequired" class="my-2"/>

        <!-- If the item has a model (Direct action) -->
        <div v-if="item.model" class="d-flex align-center justify-space-between">
          <span>{{ locale('INCLUDE_LOCAL_NETWORK') }}</span>
          <v-switch v-model="includeLocalNetwork" :disabled="item.isDisabled" />
        </div>

        <!-- Language contribute link -->
        <div v-if="item.languageMoreAction" class="text-caption">
          <v-divider class="my-3"/>

          <!-- Description -->
          <p class="text-disabled mb-2">{{ locale('CONTRIBUTE_EDIT_LANGUAGES_DESC') }}</p>

          <!-- Link -->
          <a
            class="text-highlight text-decoration-none"
            href="https://explore.transifex.com/vpnhood/vpnhood-client"
            target="_blank"
          >
            {{ locale('CONTRIBUTE_EDIT_LANGUAGES_Title') }}
            <v-icon icon="mdi-open-in-new" />
          </a>
        </div>

      </config-card>
    </template>
  </v-sheet>
</template>
