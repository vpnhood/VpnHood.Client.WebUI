<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import { AppFeature } from '@/services/VpnHood.Client.Api';

const vhApp = VpnHoodApp.instance;

const props = defineProps<{
  isPremium: AppFeature | boolean
}>();

function checkIconVisibility(){
  let isPremium: boolean;
  if (typeof props.isPremium === 'boolean')
    isPremium = props.isPremium;
  else
    isPremium = vhApp.data.features.premiumFeatures.includes(props.isPremium)

  return isPremium;
}
</script>

<template>
  <v-icon
    v-if="checkIconVisibility()"
    :color="vhApp.premiumIconColor()"
    icon="mdi-crown"
    size="18"
  />
</template>
