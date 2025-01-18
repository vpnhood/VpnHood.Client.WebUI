<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { IpFilters } from '@/services/VpnHood.Client.Api';
import DisconnectRequiredAlert from '@/components/DisconnectRequiredAlert.vue';
import { IPFilterType } from '@/helpers/UiConstants';
import { onBeforeRouteLeave } from 'vue-router';
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';

const vhApp = VpnHoodApp.instance
const locale = i18n.global.t;

const props = defineProps<{
  ipFilterType: IPFilterType
}>();

const isLoadingIP = ref<boolean>(true);
const ipFilters = ref<IpFilters>(new IpFilters());
const showRevertButton = ref<boolean>(false);
let savedIps: IpFilters;

const excludeIpFilters = computed<string>({
  get: () => {
    return props.ipFilterType === IPFilterType.FilterByDevice
      ? ipFilters.value.packetCaptureIpFilterExclude
      : ipFilters.value.appIpFilterExclude;
  },
  set: (value: string) => {
    if (props.ipFilterType === IPFilterType.FilterByDevice)
      ipFilters.value.packetCaptureIpFilterExclude = value;
    else
    ipFilters.value.appIpFilterExclude = value;
  }
})

const includeIpFilters = computed<string>({
  get: () => {
    return props.ipFilterType === IPFilterType.FilterByDevice
      ? ipFilters.value.packetCaptureIpFilterInclude
      : ipFilters.value.appIpFilterInclude;
  },
  set: (value: string) => {
    if (props.ipFilterType === IPFilterType.FilterByDevice)
      ipFilters.value.packetCaptureIpFilterInclude = value;
    else
    ipFilters.value.appIpFilterInclude = value;
  }
})

async function saveIpList(){
  if (vhApp.isConnected())
    await vhApp.disconnect();
  await vhApp.apiClient.setIpFilters(new IpFilters({
    packetCaptureIpFilterExclude: ipFilters.value.packetCaptureIpFilterExclude,
    packetCaptureIpFilterInclude: ipFilters.value.packetCaptureIpFilterInclude,
    appIpFilterExclude: ipFilters.value.appIpFilterExclude,
    appIpFilterInclude: ipFilters.value.appIpFilterInclude
  }));
  await vhApp.saveUserSetting();
}

onMounted(async () => {
  ipFilters.value = await vhApp.apiClient.getIpFilters();
  savedIps = new IpFilters(ipFilters.value);
  isLoadingIP.value = false;
})

onBeforeRouteLeave(
  async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    try {
      if (ipFilters.value.packetCaptureIpFilterExclude !== savedIps.packetCaptureIpFilterExclude ||
        ipFilters.value.packetCaptureIpFilterInclude !== savedIps.packetCaptureIpFilterInclude ||
        ipFilters.value.appIpFilterExclude !== savedIps.appIpFilterExclude ||
        ipFilters.value.appIpFilterInclude !== savedIps.appIpFilterInclude)
        await saveIpList();
      next();
    }
    catch (err: unknown){
      next(false);
      showRevertButton.value = true;
      await vhApp.processError(err);
    }
  }
);

function revertCurrentChange(): void{
  ipFilters.value = savedIps;
  showRevertButton.value = false;
}

</script>

<template>
  <v-sheet>
    <!-- Disconnecting alert -->
    <disconnect-required-alert class="mb-3"/>

    <v-defaults-provider :defaults="{
      'VChip':{
        'density': 'compact',
        'color': 'on-surface',
        'size': 'small',
        'class': 'px-1 py-0 ms-1 border border-primary-lighten-1 border-opacity-100',
        'style': 'border-radius: 3px'
        },
      'VTextarea':{
        'class': 'ipList',
        'dir': 'ltr',
        'density': 'compact',
        'rows': '3',
        'variant': 'outlined',
        'color': 'highlight',
        'loading': isLoadingIP,
        'placeholder': locale('IP_FILTER_PLACE_HOLDER'),
        'hideDetails': true
        },
    }">

      <!-- Sample ip format -->
      <InfoAlert>
        <ul class="text-caption" style="list-style: none">
          <li>
            {{locale('SINGLE_IP')}}
            <v-chip text="192.168.1.1" />
          </li>
          <li class="py-1">
            {{locale('RANGES_OF_IP')}}
            <v-chip text="192.168.1.1-192.168.1.255" />
          </li>
          <li>
            {{locale('CIDR_NOTATION')}}
            <v-chip text="192.168.1.0/24" />
          </li>
        </ul>
      </InfoAlert>

      <!-- Describe remark -->
      <NoteAlert :text="locale('REMARK_IP_FILTER_DESC')" />

      <!-- Alert for number of IPs in the filter by device -->
      <WarningAlert v-if="props.ipFilterType === IPFilterType.FilterByDevice"
        :text="locale('CAUTION_INCREASE_NUMBER_OF_IP')"
        class="mb-4"
      />


      <v-card>
        <!-- Exclude list -->
        <v-card-item>
          <p>{{locale('IPS_TO_EXCLUDE')}}</p>
          <v-textarea v-model="excludeIpFilters" />
        </v-card-item>

        <!-- Include list -->
        <v-card-item>
          <p>{{locale('IPS_TO_INCLUDE')}}</p>
          <v-textarea v-model="includeIpFilters" />
        </v-card-item>

        <!-- Revert button -->
        <v-btn v-if="showRevertButton"
               block
               variant="flat"
               color="secondary"
               :text="locale('REVERT')"
               rounded="pill"
               class="mt-4"
               @click="revertCurrentChange()"
        />

      </v-card>

    </v-defaults-provider>
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
