<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { SplitByIps } from '@/services/VpnHood.Client.Api';
import { IPFilterType } from '@/helpers/UiConstants';
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { onBeforeRouteLeave } from 'vue-router';

const vhApp = VpnHoodApp.instance
const locale = i18n.global.t;

const props = defineProps<{
  ipFilterType: IPFilterType
}>();

const isLoadingIP = ref<boolean>(true);
const ipFilters = ref<SplitByIps>(new SplitByIps());
const showRevertButton = ref<boolean>(false);
let savedIps: SplitByIps;

const excludeIpFilters = computed<string>({
  get: () => {
    return props.ipFilterType === IPFilterType.FilterByDevice
      ? ipFilters.value.deviceExcludes
      : ipFilters.value.appExcludes;
  },
  set: (value: string) => {
    if (props.ipFilterType === IPFilterType.FilterByDevice)
      ipFilters.value.deviceExcludes = value;
    else
    ipFilters.value.appExcludes = value;
  }
})

const includeIpFilters = computed<string>({
  get: () => {
    return props.ipFilterType === IPFilterType.FilterByDevice
      ? ipFilters.value.deviceIncludes
      : ipFilters.value.appIncludes;
  },
  set: (value: string) => {
    if (props.ipFilterType === IPFilterType.FilterByDevice)
      ipFilters.value.deviceIncludes = value;
    else
    ipFilters.value.appIncludes = value;
  }
})

async function saveIpList(){
  if (vhApp.data.isConnected)
    await vhApp.disconnect();
  await vhApp.appClient.setSplitByIps(new SplitByIps({
    deviceExcludes: ipFilters.value.deviceExcludes,
    deviceIncludes: ipFilters.value.deviceIncludes,
    appExcludes: ipFilters.value.appExcludes,
    appIncludes: ipFilters.value.appIncludes
  }));
  await vhApp.saveUserSetting();
}

onMounted(async () => {
  ipFilters.value = await vhApp.appClient.getSplitByIps();
  savedIps = new SplitByIps(ipFilters.value);
  isLoadingIP.value = false;
})

onBeforeRouteLeave(
  async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    try {
      if (ipFilters.value.deviceExcludes !== savedIps.deviceExcludes ||
        ipFilters.value.deviceIncludes !== savedIps.deviceIncludes ||
        ipFilters.value.appExcludes !== savedIps.appExcludes ||
        ipFilters.value.appIncludes !== savedIps.appIncludes)
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
        'density': 'compact',
        'rows': '5',
        'variant': 'outlined',
        'color': 'highlight',
        'loading': isLoadingIP,
        'placeholder': locale('SPLIT_IP_PLACE_HOLDER'),
        'hideDetails': true,
        'clearable': true
        }
      }"
  >

    <!-- Sample ip format -->
   <config-card class="pa-4 mb-2">
     <ul class="text-caption text-disabled" style="list-style: none">
       <li>
         {{locale('SINGLE_IP')}}
         <v-chip text="192.168.1.1" tabindex="-1"/>
       </li>
       <li class="mt-2">
         {{locale('RANGES_OF_IP')}}
         <v-chip text="192.168.1.1-192.168.1.255" tabindex="-1"/>
       </li>
       <li class="mt-2">
         {{locale('CIDR_NOTATION')}}
         <v-chip text="192.168.1.0/24"  tabindex="-1"/>
       </li>
       <li class="mt-2">
         {{locale('COMMENT')}}
         <v-chip :text="locale('COMMENT_DESC')"  tabindex="-1"/>
       </li>
     </ul>
   </config-card>

    <!-- Exclude list -->
    <config-card class="pb-3 mt-4">
      <v-card-item>
        <p>{{locale('EXCLUDE_IPS')}}</p>
        <v-locale-provider :rtl="false">
          <v-textarea v-model="excludeIpFilters"/>
        </v-locale-provider>
      </v-card-item>
    </config-card>

    <!-- Include list -->
    <config-card class="pb-3 mt-4">
      <v-card-item>
        <p>{{locale('INCLUDE_IPS')}}</p>
        <v-locale-provider :rtl="false">
          <v-textarea v-model="includeIpFilters"/>
        </v-locale-provider>
      </v-card-item>
    </config-card>

    <!-- Revert button -->
    <btn-style-3
      v-if="showRevertButton"
      block
      class="mt-4"
      :text="locale('REVERT')"
      @click="revertCurrentChange()"
    />

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
