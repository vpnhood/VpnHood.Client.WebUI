<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import { ComponentRouteController } from '@/services/ComponentRouteController';
import { ComponentName } from '@/helpers/UiConstants';
import { ref } from 'vue';

const vhApp = VpnHoodApp.instance;
const badgeDialogModel = ref(new ComponentRouteController(ComponentName.BadgeDialog));

interface FeatureIcon {
  icon: string,
  secondIcon?: string,
  isShow: boolean
}

const icons: FeatureIcon[] = [
  {
    icon: "mdi-call-split",
    secondIcon: "mdi-ip-outline",
    isShow: vhApp.data.isSplitIpInUse,
  },
  {
    icon: "mdi-call-split",
    secondIcon: "mdi-web",
    isShow: vhApp.data.isSplitDomainInUse,
  },
  {
    icon: "mdi-ip-network",
    isShow: vhApp.data.isCustomEndpointInUse,
  },
  {
    icon: "mdi-dns",
    isShow: vhApp.data.isDnsCustomized
  },
  {
    icon: "mdi-diversify",
    isShow: vhApp.data.state.isProxyEndPointActive
  }
]
</script>

<template>
<div
  v-if="icons.find(x => x.isShow)"
  class="d-flex flex-column align-center"
  style="position: absolute; top: 15px; right: 10px; z-index: 999"
>
  <template v-for="(item, index) in icons" :key="index">
    <v-btn
      v-if="item.isShow"
      icon
      size="small"
      variant="text"
      color="white"
      class="opacity-60 pb-1 position-relative"
      :class="{ 'twoIcon': item.secondIcon }"
      tabindex="-1"
      @click="badgeDialogModel.show()"
    >
      <template v-slot:default>
        <v-icon :icon="item.icon"/>
        <v-icon
          v-if="item.secondIcon"
          :icon="item.secondIcon"
          size="14"
          class="position-absolute"
          style="bottom: 9px;right:9px;"
        />
      </template>
    </v-btn>
  </template>
</div>
</template>

<style>
/*noinspection CssUnusedSymbol*/
.twoIcon .v-btn__content{
  margin-left: -5px;
}
</style>
