<script setup lang="ts">
import SplitIpInput from '@/components/Settings/SplitIpInput.vue';
import AppBar from '@/components/AppBar.vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import { SplitIps } from '@/services/VpnHood.Client.Api';
import { computed, onMounted, ref } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import i18n from '@/locales/i18n';
import { AppFeature } from '@/services/VpnHood.Client.Api';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const isLoading = ref<boolean>(true);
const ipFilters = ref<SplitIps>(new SplitIps());
const showRevertButton = ref<boolean>(false);
let savedIps: SplitIps;

const isEnabled = computed<boolean>({
  get: () => vhApp.data.userSettings.useSplitIpViaDevice,
  set: async (value: boolean) => {
    vhApp.data.userSettings.useSplitIpViaDevice = value;
    await vhApp.saveUserSetting();
  }
});

onMounted(async () => {
  ipFilters.value = await vhApp.appClient.getSplitIps();
  savedIps = new SplitIps(ipFilters.value);
  isLoading.value = false;
});

async function saveIpList(): Promise<void> {
  if (vhApp.data.isConnected)
    await vhApp.disconnect();
  await vhApp.appClient.setSplitIps(new SplitIps(ipFilters.value));
  await vhApp.saveUserSetting();
}

onBeforeRouteLeave(async (to, from, next) => {
  try {
    if (ipFilters.value.deviceExcludes !== savedIps.deviceExcludes ||
      ipFilters.value.deviceIncludes !== savedIps.deviceIncludes)
      await saveIpList();
    next();
  } catch (err: unknown) {
    next(false);
    showRevertButton.value = true;
    await vhApp.processError(err);
  }
});

function revertCurrentChange(): void {
  ipFilters.value = new SplitIps(savedIps);
  showRevertButton.value = false;
}
</script>

<template>
  <v-sheet>
    <app-bar/>

    <config-card class="pb-2">
      <v-card-item>
        <div class="d-flex align-center justify-space-between">
          <span>{{ locale('SPLIT_IPS_VIA_DEVICE') }}</span>
          <v-switch
            v-model="isEnabled"
            :disabled="!vhApp.data.isPremiumFeatureAllowed(AppFeature.SplitIpViaDevice)"
            hide-details
          />
        </div>
        <p class="text-caption text-disabled">{{ locale('SPLIT_IPS_VIA_DEVICE_SHORT_DESC') }}</p>
      </v-card-item>
    </config-card>
    <split-ip-input
      :excludes="ipFilters.deviceExcludes"
      :includes="ipFilters.deviceIncludes"
      :loading="isLoading"
      :disabled="!isEnabled"
      @update:excludes="ipFilters.deviceExcludes = $event"
      @update:includes="ipFilters.deviceIncludes = $event"
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
