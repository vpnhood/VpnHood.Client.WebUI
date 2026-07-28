<script setup lang="ts">
import i18n from '@/locales/i18n';
import { Util } from '@/helpers/Util';
import router from '@/services/router';
import { computed } from 'vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import { AppLeakCause } from '@/services/VpnHood.Client.Api';
import type { RouteLocationRaw } from 'vue-router';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const props = defineProps<{
  modelValue: boolean,
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void,
}>();

interface LeakCauseItem {
  title: string;
  description: string;
  pageLink: RouteLocationRaw;
}

// Each cause the app reported, with the page that turns it off. The server's own declarations have no
// page of their own: the user can not change them, only decide their fate on the Leak Protection page.
const causeItems = computed<LeakCauseItem[]>(() =>
  vhApp.data.state.leakCauses.map((cause: AppLeakCause) => {
    switch (cause) {
      case AppLeakCause.SplitApps:
        return { title: 'SPLIT_APPS', description: 'LEAK_CAUSE_SPLIT_APPS', pageLink: { name: 'SPLIT_APPS' } };
      case AppLeakCause.SplitCountry:
        return { title: 'SPLIT_COUNTRIES', description: 'LEAK_CAUSE_SPLIT_COUNTRY', pageLink: { name: 'SPLIT_COUNTRIES' } };
      case AppLeakCause.SplitIpViaApp:
        return { title: 'SPLIT_IPS_VIA_APP', description: 'LEAK_CAUSE_SPLIT_IP_VIA_APP', pageLink: { name: 'SPLIT_IPS_VIA_APP' } };
      case AppLeakCause.SplitIpViaDevice:
        return { title: 'SPLIT_IPS_VIA_DEVICE', description: 'LEAK_CAUSE_SPLIT_IP_VIA_DEVICE', pageLink: { name: 'SPLIT_IPS_VIA_DEVICE' } };
      case AppLeakCause.SplitDomain:
        return { title: 'SPLIT_DOMAINS', description: 'LEAK_CAUSE_SPLIT_DOMAIN', pageLink: { name: 'SPLIT_DOMAINS' } };
      case AppLeakCause.SplitLocalNetwork:
        return { title: 'SPLIT_LOCAL_NETWORK', description: 'LEAK_CAUSE_SPLIT_LOCAL_NETWORK', pageLink: { name: 'SPLIT_LOCAL_NETWORK' } };
      case AppLeakCause.ServerSplitTraffic:
        return { title: 'LEAK_CAUSE_SERVER_SPLIT_TRAFFIC', description: 'LEAK_CAUSE_SERVER_SPLIT_TRAFFIC_DESC', pageLink: { name: 'LEAK_PROTECTION' } };
    }
  })
);

async function navigateByRouter(to: RouteLocationRaw) {
  emit('update:modelValue', false);
  await router.push(to);
}
</script>

<template>
  <v-dialog
    :modelValue="props.modelValue"
    @update:modelValue="emit('update:modelValue',$event)"
  >
    <v-card :title="locale('LEAK_CAUSES')" color="general-dialog">

      <v-card-text class="text-disabled text-body-small">{{ locale('LEAK_CAUSES_DESC') }}</v-card-text>

      <v-list id="leakCauseList">
        <v-list-item
          v-for="(item, index) in causeItems"
          :key="index"
          :append-icon="Util.getLocalizedRightChevron()"
          :title="locale(item.title)"
          :subtitle="locale(item.description)"
          slim
          @click="navigateByRouter(item.pageLink)"
        />
      </v-list>

      <v-card-actions>
        <v-btn :text="locale('CLOSE')" @click="emit('update:modelValue', false)" />
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<style scoped>
/*noinspection CssUnresolvedCustomProperty,CssUnusedSymbol*/
#leakCauseList .v-list-item:not(:last-child) {
  border-bottom: 1px solid rgba(var(--v-theme-on-general-dialog),.1);
}
</style>
