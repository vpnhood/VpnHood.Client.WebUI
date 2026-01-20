<script setup lang="ts">
import AddByUrl from '@/components/Proxies/Manual/AddByUrl.vue';
import ConnectionStatistics from '@/components/Proxies/Manual/ConnectionStatistics.vue';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { AppConnectionState, AppProxyEndPointInfo } from '@/services/VpnHood.Client.Api';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import SavedProxies from '@/components/Proxies/Manual/SavedProxies.vue';
import { ComponentRouteController } from '@/services/ComponentRouteController';
import { ComponentName } from '@/helpers/UiConstants';

const vhApp = VpnHoodApp.instance;

const proxies = ref<AppProxyEndPointInfo[]>([]);
const isLoading = ref<boolean>(false);
const isShowAddOrEditSheet = computed(() => new ComponentRouteController(ComponentName.AddOrEditProxySheet).isVisible);
const proxyStats = computed(() => vhApp.data.state.proxyEndPointManagerStatus);
const totalProxyCount = ref(0);
let refreshInterval: ReturnType<typeof setInterval> | null = null;

async function loadProxies(recordIndex = 0, recordCount = 10, showLoading = true): Promise<void> {
  try {
    if (!isLoading.value)
      isLoading.value = showLoading;

    const list = await vhApp.proxyEndPointClient.list(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      recordIndex,
      recordCount
    );
    proxies.value = list.items;
    totalProxyCount.value = list.totalCount;
  }
  finally {
    isLoading.value = false;
  }
}
async function startPeriodicRefresh(): Promise<void> {
  if (refreshInterval) return;
  refreshInterval = setInterval(async () => {
    if (!document.hidden && vhApp.data.connectionState != AppConnectionState.None && !isShowAddOrEditSheet.value) {
      await loadProxies(undefined, undefined,false); // Don't show loading indicator on periodic refresh
    }
  }, 3000);
}
function stopPeriodicRefresh(): void {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}
onMounted(async () => {
  await loadProxies(0, 10);
  await startPeriodicRefresh();
});
onUnmounted(() => {
  stopPeriodicRefresh();
});
</script>

<template>
  <add-by-url @load-proxies="loadProxies()" />

  <!-- Proxies Statistics -->
  <connection-statistics v-if="proxies.length > 5 && proxyStats" :proxy-stats="proxyStats" />

  <saved-proxies
    :is-loading="isLoading"
    :proxies="proxies"
    :total-proxy-count="totalProxyCount"
    @load-proxies="loadProxies"
  />

</template>
