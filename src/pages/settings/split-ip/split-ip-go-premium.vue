<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import { AppFeature } from '@/services/VpnHood.Client.Api';
import FeaturePageLayout from '@/components/FeaturePageLayout.vue';

const vhApp = VpnHoodApp.instance;

</script>

<template>
  <feature-page-layout
    title="SPLIT_IP_ADDRESSES_COLORED"
    description="SPLIT_IP_ADDRESSES_DESC"
    image="split-ip.webp"
    :is-premium="vhApp.data.isPremiumFeature(AppFeature.AdapterIpFilter)"
    :is-action-button-available="false"
  />
</template>


