<script setup lang="ts">
import AddByUrl from '@/components/Proxies/AddByUrl.vue';
import ProxiesStatistics from '@/components/Proxies/ProxiesStatistics.vue';
import { onMounted, ref } from 'vue';
import { AppProxyEndPointInfo } from '@/services/VpnHood.Client.Api';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import ProxyList from '@/components/Proxies/ProxyList.vue';

const vhApp = VpnHoodApp.instance;

const proxies = ref<AppProxyEndPointInfo[]>([]);
const isLoading = ref<boolean>(false);

async function loadProxies(showLoading = true): Promise<void> {
  try {
    isLoading.value = showLoading;
    proxies.value = await vhApp.proxyEndPointClient.list();
  }
  finally {
    isLoading.value = false;
  }
}

onMounted(async () => {
  await loadProxies();
});
</script>

<template>
  <add-by-url @load-proxies="loadProxies()" />

  <!-- Proxies Statistics -->
  <proxies-statistics v-if="proxies.length > 5" />

  <proxy-list
    :is-loading="isLoading"
    :proxies="proxies"
    @load-proxies="loadProxies()"
  />

</template>
