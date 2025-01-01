<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { IpFilters } from '@/services/VpnHood.Client.Api';
import AppBar from '@/components/AppBar.vue';
import DisconnectRequiredAlert from '@/components/DisconnectRequiredAlert.vue';

const vhApp = VpnHoodApp.instance
const locale = i18n.global.t;
const isContentChanged = ref<boolean>(false);
const isLoadingIP = ref<boolean>(true);

const ipFilters = ref<IpFilters>(new IpFilters());

const excludeIpFilters = computed<string>({
  get: () => {
    return ipFilters.value.packetCaptureIpFilterExclude;
  },
  set: (value: string) => {
    isContentChanged.value = true;
    ipFilters.value.packetCaptureIpFilterExclude = value;
  }
})

const includeIpFilters = computed<string>({
  get: () => {
    return ipFilters.value.packetCaptureIpFilterInclude;
  },
  set: (value: string) => {
    isContentChanged.value = true;
    ipFilters.value.packetCaptureIpFilterInclude = value;
  }
})

async function saveIpList(){
  await vhApp.disconnect();
  await vhApp.apiClient.setIpFilters(new IpFilters({
    packetCaptureIpFilterExclude: ipFilters.value.packetCaptureIpFilterExclude,
    packetCaptureIpFilterInclude: ipFilters.value.packetCaptureIpFilterInclude,
    appIpFilterExclude: ipFilters.value.appIpFilterExclude,
    appIpFilterInclude: ipFilters.value.appIpFilterInclude
  }));
  isContentChanged.value = false;
}

onMounted(async () => {
  ipFilters.value = await vhApp.apiClient.getIpFilters();
  isLoadingIP.value = false;
})
</script>

<template>
  <!-- Page header -->
  <AppBar :page-title="locale('FILTER_IPS_BY_DEVICE')" />

  <v-sheet
    :color="vhApp.isConnectApp() ? 'primary-darken-2' : 'gray-lighten-6'"
    class="pa-4"
  >
    <!-- Disconnecting alert -->
    <disconnect-required-alert/>

    <!-- Sample ip input -->
    <p>{{locale('SUPPORTED_IP_TYPE')}}</p>
    <ul class="text-disabled text-caption ms-4 mb-2">
      <li>
        {{locale('SINGLE_IP')}}
        <v-chip
          density="compact"
          color="on-surface"
          size="small"
          class="px-1 py-0 border border-primary-lighten-1 border-opacity-100"
          style="border-radius: 3px"
          text="192.168.1.1"
        />
      </li>
      <li class="py-1">
        {{locale('RANGES_OF_IP')}}
        <v-chip
          density="compact"
          color="on-surface"
          size="small"
          class="px-1 py-0 border border-primary-lighten-1 border-opacity-100"
          style="border-radius: 3px"
          text="192.168.1.1-192.168.1.255"
        />
      </li>
      <li>
        {{locale('CIDR_NOTATION')}}
        <v-chip
          density="compact"
          color="on-surface"
          size="small"
          class="px-1 py-0 border border-primary-lighten-1 border-opacity-100"
          style="border-radius: 3px"
          text="192.168.1.0/24"
        />
      </li>
    </ul>

    <!-- Describe remark -->
    <p class="text-disabled text-caption">
      <strong class="text-white">{{locale('NOTE')}} :</strong>
      {{locale('REMARK_IP_FILTER_DESC')}}
    </p>


    <v-alert
      :icon="false"
      :text="locale('CAUTION_INCREASE_NUMBER_OF_IP')"
      class="text-caption my-4"
      density="compact"
      type="warning"
    />

    <!-- Exclude list -->
    <v-textarea
      v-model="excludeIpFilters"
      :loading="isLoadingIP"
      :placeholder="locale('IP_FILTER_PLACE_HOLDER')"
      :label="locale('IPS_TO_EXCLUDE')"
      class="ipList my-5"
      dir="ltr"
      bg-color="primary-darken-1"
      density="compact"
      variant="outlined"
      rows="6"
      color="secondary"
      hide-details
      no-resize
    />

    <!-- Include list -->
    <v-textarea
      v-model="includeIpFilters"
      :loading="isLoadingIP"
      :placeholder="locale('IP_FILTER_PLACE_HOLDER')"
      :label="locale('IPS_TO_INCLUDE')"
      class="ipList mb-5"
      dir="ltr"
      bg-color="primary-darken-1"
      density="compact"
      variant="outlined"
      rows="6"
      color="secondary"
      hide-details
      no-resize
    />

    <!-- Save button -->
    <v-btn
      :disabled="!isContentChanged"
      :text="locale('SAVE')"
      color="secondary"
      variant="tonal"
      rounded="pill"
      @click="saveIpList()"
    />
  </v-sheet>
</template>

<style>
.ipList textarea{
  /*noinspection CssUnresolvedCustomProperty*/
  color: rgb(var(--v-theme-secondary)) !important;
  font-size: 14px;
  padding-top: 15px;
}
.ipList textarea::placeholder{
  font-size: 12px;
  color: white;
}
</style>
