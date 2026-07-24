<script setup lang="ts">
import SplitIpInput from '@/components/SplitTunneling/SplitIpInput.vue';
import AppBar from '@/components/AppBar.vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import { AppFeature, SplitIps } from '@/services/VpnHood.Client.Api';
import FeaturePageLayout from '@/components/Settings/FeaturePageLayout.vue';
import { computed, onMounted, ref } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import i18n from '@/locales/i18n';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

function createNormalizedSplitIps(value?: SplitIps | null): SplitIps {
  return new SplitIps({
    deviceExcludes: value?.deviceExcludes ?? '',
    deviceIncludes: value?.deviceIncludes ?? '',
    appExcludes: value?.appExcludes ?? '',
    appIncludes: value?.appIncludes ?? '',
    appBlocks: value?.appBlocks ?? ''
  });
}

const isLoading = ref<boolean>(true);
const splitIps = ref<SplitIps>(createNormalizedSplitIps());
const showRevertButton = ref<boolean>(false);
let savedIps = createNormalizedSplitIps();

const isEnabled = computed<boolean>({
  get: () => vhApp.data.userSettings.useSplitIpViaApp,
  set: async (value: boolean) => {
    vhApp.data.userSettings.useSplitIpViaApp = value;
    await vhApp.saveUserSetting();
  }
});

onMounted(async () => {
  splitIps.value = createNormalizedSplitIps(await vhApp.appClient.getSplitIps());
  savedIps = createNormalizedSplitIps(splitIps.value);
  isLoading.value = false;
});

async function saveIpList(): Promise<void> {
  // no disconnect: the app live-applies the new list to a running session
  await vhApp.appClient.setSplitIps(createNormalizedSplitIps(splitIps.value));
  await vhApp.saveUserSetting();
}

onBeforeRouteLeave(async (to, from, next) => {
  try {
    if (splitIps.value.appExcludes !== savedIps.appExcludes ||
      splitIps.value.appIncludes !== savedIps.appIncludes ||
      splitIps.value.appBlocks !== savedIps.appBlocks)
      await saveIpList();
    next();
  } catch (err: unknown) {
    next(false);
    showRevertButton.value = true;
    await vhApp.processError(err);
  }
});

function revertCurrentChange(): void {
  splitIps.value = createNormalizedSplitIps(savedIps);
  showRevertButton.value = false;
}
</script>

<template>
  <feature-page-layout
    v-if="!vhApp.data.isPremiumFeatureAllowed(AppFeature.SplitIpViaApp)"
    title="SPLIT_IPS_VIA_APP"
    description="SPLIT_IPS_VIA_APP_DESC"
    image="split-ip.webp"
    :is-premium="vhApp.data.isPremiumFeature(AppFeature.SplitIpViaApp)"
    :is-action-button-available="false"
  />

  <v-sheet v-else>
    <app-bar/>

    <config-card class="pb-2">
      <v-card-item>
        <div class="d-flex align-center justify-space-between">
          <span>{{ locale('SPLIT_IPS_VIA_APP') }}</span>
          <v-switch
            v-model="isEnabled"
            :disabled="!vhApp.data.isPremiumFeatureAllowed(AppFeature.SplitIpViaApp)"
            hide-details
          />
        </div>
        <p class="text-caption text-disabled">{{ locale('SPLIT_IPS_VIA_APP_SHORT_DESC') }}</p>
      </v-card-item>
    </config-card>
    <split-ip-input
      :excludes="splitIps.appExcludes"
      :includes="splitIps.appIncludes"
      :blocks="splitIps.appBlocks"
      :loading="isLoading"
      :disabled="!isEnabled"
      @update:excludes="splitIps.appExcludes = $event"
      @update:includes="splitIps.appIncludes = $event"
      @update:blocks="splitIps.appBlocks = $event"
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
