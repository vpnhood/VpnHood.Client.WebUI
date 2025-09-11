<script setup lang="ts">

import router from '@/services/router';
import DisconnectRequiredAlert from '@/components/DisconnectRequiredAlert.vue';
import AppBar from '@/components/AppBar.vue';
import { computed } from 'vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { Util } from '@/helpers/Util';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;


const useIpFilterByDevice = computed<boolean>({
  get: () => {
    return vhApp.data.userSettings.useVpnAdapterIpFilter;
  },
  set: async (value: boolean) => {
    vhApp.data.userSettings.useVpnAdapterIpFilter = value;
    await vhApp.saveUserSetting();
  }
});

const useIpFilterByApp = computed<boolean>({
  get: () => {
    return vhApp.data.userSettings.useAppIpFilter;
  },
  set: async (value: boolean) => {
    vhApp.data.userSettings.useAppIpFilter = value;
    await vhApp.saveUserSetting();
  }
});

</script>

<template>
  <v-sheet>
    <app-bar/>

    <!-- Disconnecting alert -->
    <disconnect-required-alert class="mb-4"/>

    <!-- Filter by device -->
    <config-card class="pb-2">

      <v-card-item>
        <!-- Switch button -->
        <div class="d-flex align-center justify-space-between">
          <span>{{ locale('FILTER_IPS_BY_ADAPTER') }}</span>
          <v-switch
            v-model="useIpFilterByDevice"
            :disabled="!vhApp.data.isFilterIpByAdapterAvailable"
          />
        </div>

        <!-- Alert for number of IPs in the filter by device -->
        <p class="text-caption text-disabled">{{locale("CAUTION_INCREASE_NUMBER_OF_IP") }}</p>
      </v-card-item>

      <!-- Manage IP button -->
      <v-card-item v-if="useIpFilterByDevice">
        <btn-style-4
          :text="locale('MANAGE_IP_ADDRESSES')"
          :append-icon="Util.getLocalizedRightChevron()"
          @click="router.push({name: 'SPLIT_IPS_BY_ADAPTER'})"
        />
      </v-card-item>

    </config-card>

    <!-- Filter by App -->
    <config-card>

      <v-card-item>
        <!-- Switch button -->
        <div class="d-flex align-center justify-space-between">
          <span>{{ locale('SPLIT_IPS_BY_APP') }}</span>
          <v-switch
            v-model="useIpFilterByApp"
            :disabled="!vhApp.data.isFilterIpByAppAvailable"
          />
        </div>
      </v-card-item>

      <!-- Manage IP button -->
      <v-card-item v-if="useIpFilterByApp" class="mb-2">
        <btn-style-4
          :text="locale('MANAGE_IP_ADDRESSES')"
          :append-icon="Util.getLocalizedRightChevron()"
          @click="router.push({name: 'SPLIT_IPS_BY_APP'})"
        />
      </v-card-item>

    </config-card>

  </v-sheet>
</template>

<style>
.ipList textarea{
  /*noinspection CssUnresolvedCustomProperty*/
  font-size: 14px;
  padding-top: 15px;
}
.ipList textarea::placeholder{
  font-size: 12px;
}
</style>
