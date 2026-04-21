<script setup lang="ts">
import SplitDomainInput from '@/components/Settings/SplitDomainInput.vue';
import AppBar from '@/components/AppBar.vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import { AppFeature, SplitDomains, TcpProxyUsageReason } from '@/services/VpnHood.Client.Api';
import FeaturePageLayout from '@/components/Settings/FeaturePageLayout.vue';
import { computed, onMounted, ref } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import i18n from '@/locales/i18n';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const isLoading = ref<boolean>(true);
const domainFilters = ref<SplitDomains>(new SplitDomains());
const showRevertButton = ref<boolean>(false);
let savedDomains: SplitDomains;

const isDomainFilterAffectedByServer = computed<boolean>(
  () => vhApp.data.state.tcpProxyUsageReason === TcpProxyUsageReason.ServerRequiredOff
);

const isEnabled = computed<boolean>({
  get: () => vhApp.data.userSettings.useSplitDomain,
  set: async (value: boolean) => {
    vhApp.data.userSettings.useSplitDomain = value;
    await vhApp.saveUserSetting();
  }
});

onMounted(async () => {
  domainFilters.value = await vhApp.appClient.getSplitDomains();
  savedDomains = new SplitDomains(domainFilters.value);
  isLoading.value = false;
});

async function saveDomainList(): Promise<void> {
  if (vhApp.data.isConnected)
    await vhApp.disconnect();
  await vhApp.appClient.setSplitDomains(new SplitDomains(domainFilters.value));
  await vhApp.saveUserSetting();
}

onBeforeRouteLeave(async (to, from, next) => {
  try {
    if (domainFilters.value.excludes !== savedDomains.excludes ||
      domainFilters.value.includes !== savedDomains.includes ||
      domainFilters.value.blocks !== savedDomains.blocks)
      await saveDomainList();
    next();
  } catch (err: unknown) {
    next(false);
    showRevertButton.value = true;
    await vhApp.processError(err);
  }
});

function revertCurrentChange(): void {
  domainFilters.value = new SplitDomains(savedDomains);
  showRevertButton.value = false;
}
</script>

<template>
  <feature-page-layout
    v-if="!vhApp.data.isPremiumFeatureAllowed(AppFeature.SplitDomain)"
    title="SPLIT_DOMAINS"
    description="SPLIT_DOMAINS_DESC"
    image="split-ip.webp"
    :is-premium="vhApp.data.isPremiumFeature(AppFeature.SplitDomain)"
    :is-action-button-available="false"
  />

  <v-sheet v-else>
    <app-bar/>

    <config-card class="pb-2">
      <v-card-item>
        <div class="d-flex align-center justify-space-between">
          <span>{{ locale('SPLIT_DOMAINS') }}</span>
          <v-switch
            v-model="isEnabled"
            :disabled="!vhApp.data.isPremiumFeatureAllowed(AppFeature.SplitDomain)"
            hide-details
          />
        </div>
        <alert-warning v-if="isDomainFilterAffectedByServer" :text="locale('DOMAIN_FILTER_SERVER_NO_CLOAK')" class="mt-2" />
      </v-card-item>
    </config-card>
    <split-domain-input
      :excludes="domainFilters.excludes"
      :includes="domainFilters.includes"
      :blocks="domainFilters.blocks"
      :loading="isLoading"
      :disabled="!isEnabled"
      @update:excludes="domainFilters.excludes = $event"
      @update:includes="domainFilters.includes = $event"
      @update:blocks="domainFilters.blocks = $event"
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
