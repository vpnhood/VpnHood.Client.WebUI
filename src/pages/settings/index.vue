<script lang="ts" setup>
import { LanguagesCode } from '@/helpers/UiConstants';
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

const useIpFilterByDevice = computed<boolean>({
  get: () => {
    return vhApp.data.settings.userSettings.useVpnAdapterIpFilter;
  },
  set: async (value: boolean) => {
    vhApp.data.settings.userSettings.useVpnAdapterIpFilter = value;
    await saveSetting();
  }
});

const useIpFilterByApp = computed<boolean>({
  get: () => {
    return vhApp.data.settings.userSettings.useAppIpFilter;
  },
  set: async (value: boolean) => {
    vhApp.data.settings.userSettings.useAppIpFilter = value;
    await saveSetting();
  }
});

async function saveSetting() {
  await vhApp.saveUserSetting();
}
function isFilterIpByDeviceAvailable(): boolean {
  if (vhApp.data.features.isPremiumFeaturesForced)
    return true;
  return vhApp.isPremiumAccount() || vhApp.data.settings.userSettings.useVpnAdapterIpFilter;
}
function isFilterIpByAppAvailable(): boolean {
  if (vhApp.data.features.isPremiumFeaturesForced)
    return true;
  return vhApp.isPremiumAccount() || vhApp.data.settings.userSettings.useAppIpFilter;
}
function isIncludeLocalNetworkAvailable(): boolean {
  if (!vhApp.data.features.isPremiumFlagSupported)
    return true;
  return vhApp.isPremiumAccount() || vhApp.data.settings.userSettings.includeLocalNetwork;
}
</script>

<template>
  <v-sheet>
    <app-bar/>

    <!-- Change language -->
    <config-card>
      <v-card-title>{{ locale('LANGUAGE') }}</v-card-title>
      <v-card-item>
        <btn-style-4 @click="router.push({ name: 'LANGUAGE'})">

          <span>{{ locale('APP_LANGUAGE') }}</span>

          <template v-slot:append>
            <!-- Active language name -->
            <span class="text-disabled text-caption text-capitalize me-1">
                {{ vhApp.data.state.currentUiCultureInfo.nativeName }}
              </span>

            <!-- Button icon -->
            <v-icon :icon="Util.getLocalizedRightChevron()" />
          </template>

        </btn-style-4>
      </v-card-item>

      <!-- Language contribute link -->
      <v-card-text v-if="i18n.global.locale.value !== LanguagesCode.English" class="text-caption">

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
      </v-card-text>

    </config-card>

    <!-- Exclude local network -->
    <config-card v-if="vhApp.data.features.isLocalNetworkSupported">

      <v-card-title>
        {{ locale('LOCAL_NETWORK') }}
        <premium-icon v-if="vhApp.data.features.isPremiumFlagSupported" :color="vhApp.premiumIconColor()"
        />
      </v-card-title>

      <v-card-subtitle>{{ locale('INCLUDE_LOCAL_NETWORK_DESC') }}</v-card-subtitle>

      <!-- Disconnecting alert -->
      <v-card-item v-if="vhApp.data.isConnected && isIncludeLocalNetworkAvailable()">
        <disconnect-required-alert />
      </v-card-item>

      <v-card-item @click="!isIncludeLocalNetworkAvailable() ? router.push({name: 'PURCHASE_SUBSCRIPTION'}) : null">
        <v-row class="align-center justify-space-between">
          <v-col>{{ locale('INCLUDE_LOCAL_NETWORK') }}</v-col>
          <v-col cols="auto">
            <v-switch v-model="includeLocalNetwork" :disabled="!isIncludeLocalNetworkAvailable()" />
          </v-col>
        </v-row>
      </v-card-item>
    </config-card>

    <!-- Exclude/Include IP ranges -->
    <config-card>

      <v-card-title>
        {{ locale('FILTER_IP_ADDRESSES') }}
        <premium-icon v-if="vhApp.data.features.isPremiumFlagSupported" :color="vhApp.premiumIconColor()" />
      </v-card-title>

      <v-card-subtitle>{{ locale('FILTER_IP_ADDRESSES_DESC') }}</v-card-subtitle>

      <!-- Disconnecting alert -->
      <v-card-item v-if="vhApp.data.isConnected && isFilterIpByDeviceAvailable()">
        <disconnect-required-alert />
      </v-card-item>

      <!-- Filter by device -->
      <v-card-item @click="!isFilterIpByDeviceAvailable() ? router.push({name: 'PURCHASE_SUBSCRIPTION'}) :  null ">
        <v-row class="align-center justify-space-between">
          <v-col>{{ locale('FILTER_IPS_BY_DEVICE') }}</v-col>
          <v-col cols="auto">
            <v-switch v-model="useIpFilterByDevice" :disabled="!isFilterIpByDeviceAvailable()" />
          </v-col>
        </v-row>

        <!-- Manage IP button -->
        <btn-style-4 v-if="useIpFilterByDevice"
                     :text="locale('MANAGE_IP_ADDRESSES')"
                     :append-icon="Util.getLocalizedRightChevron()"
                     @click="router.push({name: 'FILTER_IPS_BY_DEVICE'})"
        />

      </v-card-item>

      <v-divider />

      <!-- Filter by App -->
      <v-card-item @click="!isFilterIpByAppAvailable() ? router.push({name: 'PURCHASE_SUBSCRIPTION'}) :  null ">

        <v-row class="align-center justify-space-between">
          <v-col>{{ locale('FILTER_IPS_BY_APP') }}</v-col>
          <v-col cols="auto">
            <v-switch v-model="useIpFilterByApp" :disabled="!isFilterIpByAppAvailable()" />
          </v-col>
        </v-row>

        <!-- Manage IP button -->
        <btn-style-4 v-if="useIpFilterByApp"
                     :text="locale('MANAGE_IP_ADDRESSES')"
                     :append-icon="Util.getLocalizedRightChevron()"
                     @click="router.push({name: 'FILTER_IPS_BY_APP'})"
        />

      </v-card-item>

    </config-card>

  </v-sheet>
</template>
