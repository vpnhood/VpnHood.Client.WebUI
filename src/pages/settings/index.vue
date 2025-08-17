<script lang="ts" setup>
import { computed, type WritableComputedRef } from 'vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import router from '@/services/router';
import { Util } from '@/helpers/Util';
import DisconnectRequiredAlert from '@/components/DisconnectRequiredAlert.vue';
import AppBar from '@/components/AppBar.vue';
import type { RouteLocationRaw } from 'vue-router';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

interface SettingsItem {
  title: string,
  subtitle: string,
  isPremium: boolean,
  click?: RouteLocationRaw,
  selectedItem?: string,
  status?: boolean
  isShow?: boolean,
  isDisconnectRequired?: boolean,
  model?: WritableComputedRef<boolean, boolean>,
}

const includeLocalNetwork = computed({
  get: () => vhApp.data.settings.userSettings.includeLocalNetwork,
  set: async (value: boolean) => {
    vhApp.data.settings.userSettings.includeLocalNetwork = value;
    await vhApp.saveUserSetting();
  }
});

const settingsItem: SettingsItem[] = [
  {
    title: "APP_LANGUAGE",
    subtitle: "APP_LANGUAGE_DESC",
    isPremium: false,
    selectedItem: vhApp.data.state.currentUiCultureInfo.nativeName,
    click: {name: 'LANGUAGE'}
  },
  {
    title: "LOCAL_NETWORK",
    subtitle: "INCLUDE_LOCAL_NETWORK_DESC",
    isPremium: false,
    isShow: vhApp.data.features.isLocalNetworkSupported,
    isDisconnectRequired: true,
    model: includeLocalNetwork
  },
  {
    title: "FILTER_IP_ADDRESSES",
    subtitle: "FILTER_IP_ADDRESSES_DESC",
    isPremium: true,
    status: vhApp.isFilterIpAvailable(),
    click: {name: 'FILTER_IP'}
  },
  {
    title: "NOTIFICATIONS",
    subtitle: "NOTIFICATIONS_DESC",
    isPremium: false,
    click: {name: 'NOTIFICATIONS'}
  },
  {
    title: "KILL_SWITCH",
    subtitle: "KILL_SWITCH_DESC",
    isPremium: false,
    click: {name: 'KILL_SWITCH'}
  },
  {
    title: "ALWAYS_ON",
    subtitle: "ALWAYS_ON_DESC",
    isPremium: true,
    click: {name: 'FILTER_IP'}
  },
  {
    title: "PRIVATE_DNS",
    subtitle: "PRIVATE_DNS_DESC",
    isPremium: true,
    click: {name: 'FILTER_IP'}
  },
  {
    title: "QUICK_LAUNCH",
    subtitle: "QUICK_LAUNCH_DESC",
    isPremium: true,
    click: {name: 'FILTER_IP'}
  }
]

</script>

<template>
  <v-sheet>
    <app-bar/>

    <template v-for="(item, index) in settingsItem" :key="index">

      <config-card
        v-if="item.isShow !== undefined ? item.isShow : true"
        class="pa-3"
        @click="item.click ? router.push(item.click) : null"
      >

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
            <v-chip v-else-if="item.status !== undefined"
              :text="item.status ? locale('ON') : locale('OFF')"
              size="small"
              variant="tonal"
              density="comfortable"
              :disabled="!item.status"
              :color="item.status ? 'enable-premium' : ''"
            />

          </div>

          <!-- Premium icon for premium features -->
          <premium-icon v-if="item.isPremium && vhApp.data.features.isPremiumFlagSupported" :color="vhApp.premiumIconColor()" />

        </div>

        <!-- Item description (Show chevron icon if the item does not have the model) -->
        <v-card-subtitle class="d-flex align-center justify-space-between ga-3 pa-0">
          {{ locale(item.subtitle) }}
          <v-icon v-if="item.model === undefined" :icon="Util.getLocalizedRightChevron()"/>
        </v-card-subtitle>

        <!-- Disconnecting alert -->
        <disconnect-required-alert v-if="item.isDisconnectRequired" class="my-2"/>

        <!-- If the item has a model (Direct action) -->
        <div v-if="item.model" class="d-flex align-center justify-space-between">
          <span>{{ locale('INCLUDE_LOCAL_NETWORK') }}</span>
          <v-switch v-model="includeLocalNetwork" :disabled="!vhApp.isIncludeLocalNetworkAvailable()" />
        </div>

      </config-card>
    </template>
  </v-sheet>
</template>
