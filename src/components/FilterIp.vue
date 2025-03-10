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
      ? ipFilters.value.adapterIpFilterExcludes
      : ipFilters.value.appIpFilterExcludes;
  },
  set: (value: string) => {
    if (props.ipFilterType === IPFilterType.FilterByDevice)
      ipFilters.value.adapterIpFilterExcludes = value;
    else
    ipFilters.value.appIpFilterExcludes = value;
  }
})

const includeIpFilters = computed<string>({
  get: () => {
    return props.ipFilterType === IPFilterType.FilterByDevice
      ? ipFilters.value.adapterIpFilterIncludes
      : ipFilters.value.appIpFilterIncludes;
  },
  set: (value: string) => {
    if (props.ipFilterType === IPFilterType.FilterByDevice)
      ipFilters.value.adapterIpFilterIncludes = value;
    else
    ipFilters.value.appIpFilterIncludes = value;
  }
})

async function saveIpList(){
  if (vhApp.isConnected())
    await vhApp.disconnect();
  await vhApp.apiClient.setIpFilters(new IpFilters({
    adapterIpFilterExcludes: ipFilters.value.adapterIpFilterExcludes,
    adapterIpFilterIncludes: ipFilters.value.adapterIpFilterIncludes,
    appIpFilterExcludes: ipFilters.value.appIpFilterExcludes,
    appIpFilterIncludes: ipFilters.value.appIpFilterIncludes
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
      if (ipFilters.value.adapterIpFilterExcludes !== savedIps.adapterIpFilterExcludes ||
        ipFilters.value.adapterIpFilterIncludes !== savedIps.adapterIpFilterIncludes ||
        ipFilters.value.appIpFilterExcludes !== savedIps.appIpFilterExcludes ||
        ipFilters.value.appIpFilterIncludes !== savedIps.appIpFilterIncludes)
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
  <!-- Disconnecting alert -->
  <disconnect-required-alert />

  <v-defaults-provider :defaults="{
      'VChip':{
        'density': 'compact',
        'color': 'sample-ip-filter-bg',
        'size': 'small',
        'class': 'px-1 ms-1 border  border-opacity-25 text-sample-ip-filter-text',
        'style': 'border-radius: 3px; letter-spacing: 1px;',
        'variant': 'flat'
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
        }
      }"
  >

    <!-- Sample ip format -->
    <alert-info :title="locale('INFO')">
      <ul class="text-caption" style="list-style: none">
        <li>
          {{locale('SINGLE_IP')}}
          <v-chip text="192.168.1.1" tabindex="-1"/>
        </li>
        <li class="py-1">
          {{locale('RANGES_OF_IP')}}
          <v-chip text="192.168.1.1-192.168.1.255" tabindex="-1"/>
        </li>
        <li>
          {{locale('CIDR_NOTATION')}}
          <v-chip text="192.168.1.0/24"  tabindex="-1"/>
        </li>
      </ul>
    </alert-info>

    <!-- Describe remark -->
    <alert-note :title="locale('NOTE')" :text="locale('REMARK_IP_FILTER_DESC')" />

    <!-- Alert for number of IPs in the filter by device -->
    <alert-warning v-if="props.ipFilterType === IPFilterType.FilterByDevice"
                   :title="locale('WARNING')"
                   :text="locale('CAUTION_INCREASE_NUMBER_OF_IP')"
    />

    <config-card class="mt-4">
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
      <v-card-item v-if="showRevertButton">
        <btn-style-2
          block
          :text="locale('REVERT')"
          @click="revertCurrentChange()"
        />
      </v-card-item>

    </config-card>

  </v-defaults-provider>
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
