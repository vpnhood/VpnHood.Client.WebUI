<script setup lang="ts">
import { AppProxyEndPointInfo } from '@/services/VpnHood.Client.Api';
import ProxyListItem from '@/components/Proxies/ProxyListItem.vue';
import { ref } from 'vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const deviceProxy = ref<AppProxyEndPointInfo>(await vhApp.proxyEndPointClient.getDevice());
</script>

<template>
  <config-card>

    <v-card-text v-if="!deviceProxy" class="text-disabled">
      {{ locale('NO_SYSTEM_PROXY') }}
    </v-card-text>

    <v-list v-else lines="three" bg-color="transparent">
      <ProxyListItem :proxy="deviceProxy" />
    </v-list>

  </config-card>
</template>

<style scoped>

</style>
