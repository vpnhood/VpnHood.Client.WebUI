<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import { ComponentRouteController } from '@/services/ComponentRouteController';
import { ComponentName } from '@/helpers/UiConstants';

const vhApp = VpnHoodApp.instance;

interface FeatureIcon {
  icon: string,
  isShow: boolean
}

const icons: FeatureIcon[] = [
  {
    icon: "mdi-filter-cog-outline",
    isShow: vhApp.data.isSplitIpInUse,
  },
  {
    icon: "mdi-ip-network",
    isShow: vhApp.data.isCustomEndpointInUse,
  },
  {
    icon: "mdi-dns",
    isShow: vhApp.data.isDnsInUse
  },
]
</script>

<template>
<div class="d-flex flex-column align-center ga-3" style="position: absolute; top: 15px; right: 10px">
  <template v-for="(item, index) in icons" :key="index">
    <v-icon
      v-if="item.isShow"
      :icon="item.icon"
      size="17px"
      color="white"
      class="opacity-40 pb-1"
      tabindex="-1"
      @click="ComponentRouteController.showComponent(ComponentName.BadgeDialog)"
    />
  </template>
</div>
</template>

<style scoped>

</style>
