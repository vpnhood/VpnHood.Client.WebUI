<script setup lang="ts">
import i18n from '@/locales/i18n';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import { Util } from '@/helpers/Util';
import type { RouteLocationRaw } from 'vue-router';
import router from '@/services/router';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const props = defineProps<{
  modelValue: boolean,
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void,
}>();

interface Features {
  icon: string,
  title: string,
  pageLink: RouteLocationRaw,
  isInUse: boolean
}

const featuresList: Features[] = [
  {
    icon: "mdi-filter-cog-outline",
    title: "SPLIT_IP",
    pageLink: {name: "SPLIT_IP"},
    isInUse: vhApp.data.isSplitIpInUse
  },
  {
    icon: "mdi-ip-network",
    title: "CUSTOM_ENDPOINT",
    pageLink: {name: "SERVERS"},
    isInUse: vhApp.data.isCustomEndpointInUse
  },
  {
    icon: "mdi-dns",
    title: "DNS",
    pageLink: {name: "DNS"},
    isInUse: vhApp.data.isDnsInUse
  },
  {
    icon: "mdi-diversify",
    title: "PROXIES",
    pageLink: {name: "PROXIES"},
    isInUse: vhApp.data.state.isProxyEndPointActive
  }
]

async function navigateByRouter(to: RouteLocationRaw){
  await router.replace(to);
}
</script>

<template>
  <v-dialog
    :modelValue="props.modelValue"
    @update:modelValue="emit('update:modelValue',$event)"
  >
    <v-card :title="locale('IN_USE_FEATURES')" color="general-dialog">

      <v-card-text class="text-disabled text-caption">{{locale('IN_USE_FEATURES_DESC')}}</v-card-text>

      <v-list id="badgeList" >
        <template v-for="(feature, index) in featuresList" :key="index">
          <v-list-item
            v-if="feature.isInUse"
            :prepend-icon="feature.icon"
            :append-icon="Util.getLocalizedRightChevron()"
            :title="locale(feature.title)"
            slim
            @click="navigateByRouter(feature.pageLink)"
          />
        </template>
      </v-list>

      <v-card-actions>
        <!-- Cancel -->
        <v-btn :text="locale('CLOSE')" @click="emit('update:modelValue', false)" />
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<style scoped>
/*noinspection CssUnresolvedCustomProperty,CssUnusedSymbol*/
#badgeList .v-list-item:not(:last-child) {
  border-bottom: 1px solid rgba(var(--v-theme-on-general-dialog),.1);
}
</style>
