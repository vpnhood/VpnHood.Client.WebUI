<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import { AppFeature } from '@/services/VpnHood.Client.Api';
import { computed } from 'vue';

const vhApp = VpnHoodApp.instance;

const props = defineProps<{
  isPremium: AppFeature | boolean
}>();

const shouldShowIcon = computed(() =>
  vhApp.data.features.isPremiumFlagSupported && !vhApp.data.isPremiumAccount &&
  (typeof props.isPremium === 'boolean'
    ? props.isPremium
    : vhApp.data.isPremiumFeature(props.isPremium))
);


</script>

<template>
  <v-icon
    v-if="shouldShowIcon"
    :color="vhApp.data.premiumIconColor"
    icon="mdi-crown"
    size="18"
  />
</template>
