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
  get: () => VpnHoodApp.instance.data.settings.userSettings.includeLocalNetwork,
  set: async (value: boolean) => {
    vhApp.data.settings.userSettings.includeLocalNetwork = value
    await vhApp.saveUserSetting()
  }
})

const useIpFilterByDevice = computed<boolean>({
  get: () => {
    return VpnHoodApp.instance.data.settings.userSettings.usePacketCaptureIpFilter;
  },
  set: async (value: boolean) => {
    VpnHoodApp.instance.data.settings.userSettings.usePacketCaptureIpFilter = value;
    await saveSetting();
  }
})

const useIpFilterByApp = computed<boolean>({
  get: () => {
    return VpnHoodApp.instance.data.settings.userSettings.useAppIpFilter;
  },
  set: async (value: boolean) => {
    VpnHoodApp.instance.data.settings.userSettings.useAppIpFilter = value;
    await saveSetting();
  }
})

async function saveSetting() {
  await vhApp.saveUserSetting();
}
</script>

<template>
  <!-- Page header -->
  <AppBar :page-title="locale('SETTINGS')" />

  <v-sheet
    :color="vhApp.isConnectApp() ? 'primary-darken-2' : 'gray-lighten-6'"
    class="pa-4"
  >

    <v-defaults-provider :defaults="{
      'VCard':{'class': 'mb-4', 'color': vhApp.isConnectApp() ? 'background' : 'white'},
      'VCardTitle':{'class': 'pt-4 pb-0'},
      'VCardSubtitle':{'class': [vhApp.isConnectApp() ? 'text-disabled' : 'text-gray-lighten-2', 'text-wrap text-caption']},
      'VSwitch':{'class': 'px-2', 'color': 'secondary', 'density': 'compact'},
      'VDivider':{'class':'mx-4'},
      'VBtn':{'variant':'tonal', 'color': 'secondary', 'class': 'justify-space-between text-transform-none mb-2',
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
              <span
                :class="[vhApp.isConnectApp() ? 'text-disabled': 'text-gray-lighten-2']"
                class="text-caption text-capitalize me-1"
              >
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
          <p :class="[vhApp.isConnectApp() ? 'text-disabled': 'text-gray-lighten-2', 'mb-2']">
            {{ locale('CONTRIBUTE_EDIT_LANGUAGES_DESC') }}
          </p>

          <!-- Link -->
          <a
            class="text-secondary text-decoration-none"
            href="https://explore.transifex.com/vpnhood/vpnhood-client"
            target="_blank"
          >
            {{ locale('CONTRIBUTE_EDIT_LANGUAGES_Title') }}
            <v-icon icon="mdi-open-in-new" />
          </a>
        </v-card-text>

      </v-card>

      <!-- Exclude local network -->
      <v-card>
        <!-- Section title -->
        <v-card-title>{{ locale('LOCAL_NETWORK') }}</v-card-title>
        <v-card-subtitle>{{ locale('INCLUDE_LOCAL_NETWORK_DESC') }}</v-card-subtitle>

        <!-- Disconnecting alert -->
        <disconnect-required-alert/>

        <v-card-item>
          <v-row class="align-center justify-space-between">
            <v-col>{{ locale('INCLUDE_LOCAL_NETWORK') }}</v-col>
            <v-col cols="auto">
              <v-switch v-model="includeLocalNetwork" hide-details />
            </v-col>
          </v-row>
        </v-card-item>
      </v-card>

      <!-- Exclude/Include IP ranges -->
      <v-card>
        <v-card-title>{{locale("FILTER_IP_ADDRESSES")}}</v-card-title>
        <v-card-subtitle>{{locale("FILTER_IP_ADDRESSES_DESC")}}</v-card-subtitle>

        <!-- Disconnecting alert -->
        <v-card-text v-if="vhApp.isConnected()">
          <disconnect-required-alert/>
        </v-card-text>

        <!-- Filter by device -->
        <v-card-item>
          <v-row class="align-center justify-space-between">
            <v-col>{{locale("FILTER_IPS_BY_DEVICE")}}</v-col>
            <v-col cols="auto">
              <v-switch v-model="useIpFilterByDevice" hide-details/>
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
        <v-card-item>
          <v-row class="align-center justify-space-between">
            <v-col>{{locale("FILTER_IPS_BY_APP")}}</v-col>
            <v-col cols="auto">
              <v-switch v-model="useIpFilterByApp" hide-details/>
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
