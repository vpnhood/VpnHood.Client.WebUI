<script lang="ts" setup>
import AppBar from '@/components/AppBar.vue'
import { LanguagesCode } from '@/helpers/UiConstants'
import { computed } from 'vue'
import { VpnHoodApp } from '@/services/VpnHoodApp'
import i18n from '@/locales/i18n'
import router from '@/services/router';
import { Util } from '@/helpers/Util';
import DisconnectRequiredAlert from '@/components/DisconnectRequiredAlert.vue';

const vhApp = VpnHoodApp.instance
const locale = i18n.global.t;

const includeLocalNetwork = computed({
  get: () => vhApp.data.settings.userSettings.includeLocalNetwork,
  set: async (value: boolean) => {
    vhApp.data.settings.userSettings.includeLocalNetwork = value
    await vhApp.saveUserSetting()
  }
})

const useIpFilterByDevice = computed<boolean>({
  get: () => {
    return vhApp.data.settings.userSettings.usePacketCaptureIpFilter;
  },
  set: async (value: boolean) => {
    vhApp.data.settings.userSettings.usePacketCaptureIpFilter = value;
    await saveSetting();
  }
})

const useIpFilterByApp = computed<boolean>({
  get: () => {
    return vhApp.data.settings.userSettings.useAppIpFilter;
  },
  set: async (value: boolean) => {
    vhApp.data.settings.userSettings.useAppIpFilter = value;
    await saveSetting();
  }
})

async function saveSetting() {
  await vhApp.saveUserSetting();
}
function isFilterIpByDeviceAvailable(): boolean{
  if (isPremiumFeaturesAvailable())
    return true;

  return vhApp.data.settings.userSettings.usePacketCaptureIpFilter;
}
function isFilterIpByAppAvailable(): boolean{
  if (isPremiumFeaturesAvailable())
    return true;

  return vhApp.data.settings.userSettings.useAppIpFilter;
}
function isIncludeLocalNetworkAvailable(): boolean{
  if (isPremiumFeaturesAvailable())
    return true;
  return vhApp.data.settings.userSettings.includeLocalNetwork;
}
function isPremiumFeaturesAvailable(): boolean{
  if (!vhApp.data.features.isPremiumFlagSupported)
    return true;
  return vhApp.data.state.clientProfile?.isPremiumAccount === true;
}
</script>

<template>
  <!-- Page header -->
  <AppBar :page-title="locale('SETTINGS')" />

  <v-sheet>

    <v-defaults-provider :defaults="{
      'VCard':{'class': 'mb-4', 'color': 'card-bg'},
      'VCardTitle':{'class': 'pt-4 pb-0'},
      'VCardSubtitle':{'class': 'text-disabled text-wrap text-caption'},
      'VSwitch':{'class': 'px-2', 'color': 'highlight', 'density': 'compact', 'hideDetails': true},
      'VDivider':{'class':'mx-4'},
      'VBtn':{'variant':'tonal', 'color': 'highlight', 'class': 'justify-space-between text-transform-none mb-2',
              'block': true, 'text': locale('MANAGE_IP_ADDRESSES')},
    }">
      <!-- Change language -->
      <v-card>
        <v-card-title>{{ locale('LANGUAGE') }}</v-card-title>
        <v-card-item>
          <v-btn
            @click="router.push({ path: '/languages' })"
          >

            <span>
              {{ locale('APP_LANGUAGE') }}
            </span>

            <template v-slot:append>
              <!-- Active language name -->
              <span class="text-disabled text-caption text-capitalize me-1">
                {{ vhApp.data.state.currentUiCultureInfo.nativeName }}
              </span>

              <!-- Button icon -->
              <v-icon :icon="Util.getLocalizedRightChevron()" />
            </template>
          </v-btn>
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

      </v-card>

      <!-- Exclude local network -->
      <v-card v-if="vhApp.data.features.isLocalNetworkSupported">
        <!-- Section title -->
        <v-card-title class="d-flex justify-space-between align-center">
          {{ locale('LOCAL_NETWORK') }}
          <v-icon
            v-if="vhApp.data.features.isPremiumFlagSupported"
            :color="isPremiumFeaturesAvailable() ? 'enable-premium' : 'disable-premium'"
            icon="mdi-crown"
            size="18"
          />
        </v-card-title>
        <v-card-subtitle>{{ locale('INCLUDE_LOCAL_NETWORK_DESC') }}</v-card-subtitle>

        <!-- Disconnecting alert -->
        <v-card-item v-if="vhApp.isConnected()">
          <disconnect-required-alert/>
        </v-card-item>

        <v-card-item @click="!isIncludeLocalNetworkAvailable() ? router.push('/purchase-subscription') : ''">
          <v-row class="align-center justify-space-between">
            <v-col>{{ locale('INCLUDE_LOCAL_NETWORK') }}</v-col>
            <v-col cols="auto">
              <v-switch v-model="includeLocalNetwork" :disabled="!isIncludeLocalNetworkAvailable()"/>
            </v-col>
          </v-row>
        </v-card-item>
      </v-card>

      <!-- Exclude/Include IP ranges -->
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          {{locale("FILTER_IP_ADDRESSES")}}
          <PremiumIcon v-if="vhApp.data.features.isPremiumFlagSupported"/>

        </v-card-title>
        <v-card-subtitle>{{locale("FILTER_IP_ADDRESSES_DESC")}}</v-card-subtitle>

        <!-- Disconnecting alert -->
        <v-card-item v-if="vhApp.isConnected()">
          <disconnect-required-alert/>
        </v-card-item>

        <!-- Filter by device -->
        <v-card-item @click="!isFilterIpByDeviceAvailable() ? router.push('/purchase-subscription') :  null ">
          <v-row class="align-center justify-space-between">
            <v-col>{{locale("FILTER_IPS_BY_DEVICE")}}</v-col>
            <v-col cols="auto">
              <v-switch v-model="useIpFilterByDevice" :disabled="!isFilterIpByDeviceAvailable()" />
            </v-col>
          </v-row>

          <!-- Manage IP button -->
          <v-btn v-if="useIpFilterByDevice"
             :append-icon="Util.getLocalizedRightChevron()"
             @click="router.push({ path: '/filter-ips-by-device' })"
          />
        </v-card-item>

        <v-divider />

        <!-- Filter by App -->
        <v-card-item @click="!isFilterIpByAppAvailable() ? router.push('/purchase-subscription') :  null ">
          <v-row class="align-center justify-space-between">
            <v-col>{{locale("FILTER_IPS_BY_APP")}}</v-col>
            <v-col cols="auto">
              <v-switch v-model="useIpFilterByApp" :disabled="!isFilterIpByAppAvailable()" />
            </v-col>
          </v-row>

          <!-- Manage IP button -->
          <v-btn v-if="useIpFilterByApp"
             :append-icon="Util.getLocalizedRightChevron()"
             @click="router.push({ path: '/filter-ips-by-app' })"
          />
        </v-card-item>

      </v-card>
    </v-defaults-provider>

  </v-sheet>
</template>
