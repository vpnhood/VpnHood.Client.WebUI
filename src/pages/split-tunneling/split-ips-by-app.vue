<script setup lang="ts">
import SplitIpInput from '@/components/Settings/SplitIpInput.vue';
import AppBar from '@/components/AppBar.vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import { SplitByIps } from '@/services/VpnHood.Client.Api';
import { onMounted, ref } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import i18n from '@/locales/i18n';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const isLoading = ref<boolean>(true);
const ipFilters = ref<SplitByIps>(new SplitByIps());
const showRevertButton = ref<boolean>(false);
let savedIps: SplitByIps;

onMounted(async () => {
  ipFilters.value = await vhApp.appClient.getSplitByIps();
  savedIps = new SplitByIps(ipFilters.value);
  isLoading.value = false;
});

async function saveIpList(): Promise<void> {
  if (vhApp.data.isConnected)
    await vhApp.disconnect();
  await vhApp.appClient.setSplitByIps(new SplitByIps(ipFilters.value));
  await vhApp.saveUserSetting();
}

onBeforeRouteLeave(async (to, from, next) => {
  try {
    if (ipFilters.value.appExcludes !== savedIps.appExcludes ||
      ipFilters.value.appIncludes !== savedIps.appIncludes ||
      ipFilters.value.appBlocks !== savedIps.appBlocks)
      await saveIpList();
    next();
  } catch (err: unknown) {
    next(false);
    showRevertButton.value = true;
    await vhApp.processError(err);
  }
});

function revertCurrentChange(): void {
  ipFilters.value = new SplitByIps(savedIps);
  showRevertButton.value = false;
}
</script>

<template>
  <v-sheet>
    <app-bar/>
    <split-ip-input
      :excludes="ipFilters.appExcludes"
      :includes="ipFilters.appIncludes"
      :blocks="ipFilters.appBlocks"
      :loading="isLoading"
      @update:excludes="ipFilters.appExcludes = $event"
      @update:includes="ipFilters.appIncludes = $event"
      @update:blocks="ipFilters.appBlocks = $event"
    />
    <btn-style-3
      v-if="showRevertButton"
      block
      class="mt-4"
      :text="locale('REVERT')"
      @click="revertCurrentChange()"
    />
  </v-sheet>
</template>
