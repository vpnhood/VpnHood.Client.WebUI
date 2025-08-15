<script lang="ts" setup>
import { type SettingsItem } from '@/helpers/UiConstants';
import { computed } from 'vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import router from '@/services/router';
import { Util } from '@/helpers/Util';
import DisconnectRequiredAlert from '@/components/DisconnectRequiredAlert.vue';
import AppBar from '@/components/AppBar.vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

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
    status: false,

  },
  {
    title: "KILL_SWITCH",
    subtitle: "KILL_SWITCH_DESC",
    isPremium: false,

  },
  {
    title: "ALWAYS_ON",
    subtitle: "ALWAYS_ON_DESC",
    isPremium: true,

  },
  {
    title: "PRIVATE_DNS",
    subtitle: "PRIVATE_DNS_DESC",
    isPremium: true,

  },
  {
    title: "QUICK_LAUNCH",
    subtitle: "QUICK_LAUNCH_DESC",
    isPremium: true,

  }
]

</script>

<template>
  <v-sheet>
    <app-bar/>

      <!-- Exclude local network -->
      <config-card v-if="vhApp.data.features.isLocalNetworkSupported">

        <v-card-title>
          {{ locale('LOCAL_NETWORK') }}
          <premium-icon v-if="vhApp.data.features.isPremiumFlagSupported" :color="vhApp.premiumIconColor()"
          />
        </v-card-title>

        <v-card-subtitle>{{ locale('INCLUDE_LOCAL_NETWORK_DESC') }}</v-card-subtitle>

        <!-- Disconnecting alert -->
        <v-card-item v-if="vhApp.data.isConnected && vhApp.isIncludeLocalNetworkAvailable()">
          <disconnect-required-alert />
        </v-card-item>

        <v-card-item @click="!vhApp.isIncludeLocalNetworkAvailable() ? router.push({name: 'PURCHASE_SUBSCRIPTION'}) :
         null">
          <v-row class="align-center justify-space-between">
            <v-col>{{ locale('INCLUDE_LOCAL_NETWORK') }}</v-col>
            <v-col cols="auto">
              <v-switch v-model="includeLocalNetwork" :disabled="!vhApp.isIncludeLocalNetworkAvailable()" />
            </v-col>
          </v-row>
        </v-card-item>
      </config-card>


    <config-card
      v-for="(item, index) in settingsItem"
      :key="index"
      class="pa-3"
      @click="item.click ? router.push(item.click) : null"
    >
      <div class="d-flex align-center justify-space-between pb-1">
        <div class="d-flex align-center justify-space-between ga-2">
          <span>{{ locale(item.title) }}</span>
          <v-chip v-if="item.selectedItem"
            :text="item.selectedItem"
            size="small"
            variant="tonal"
            density="comfortable"
            color="switch-btn"
          />
          <v-chip v-else-if="item.status !== undefined"
            :text="item.status ? locale('ON') : locale('OFF')"
            size="small"
            variant="tonal"
            density="comfortable"
            :disabled="!item.status"
            :color="item.status ? 'enable-premium' : ''"
          />
        </div>
        <premium-icon
          v-if="item.isPremium && vhApp.data.features.isPremiumFlagSupported"
          :color="vhApp.premiumIconColor()"
        />
      </div>
      <v-card-subtitle class="d-flex align-center justify-space-between ga-3 pa-0">
        {{ locale(item.subtitle) }}
        <v-icon :icon="Util.getLocalizedRightChevron()"/>
      </v-card-subtitle>
    </config-card>

  </v-sheet>
</template>
