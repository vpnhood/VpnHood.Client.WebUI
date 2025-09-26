<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import { AppFeature } from '@/services/VpnHood.Client.Api';
import FeaturePageLayout from '@/components/FeaturePageLayout.vue';

const vhApp = VpnHoodApp.instance;

</script>

<template>
  <feature-page-layout
    title="DNS"
    description="DNS_DESC"
    image="private-dns.webp"
    :is-premium="vhApp.data.isPremiumFeature(AppFeature.CustomDns)"
    :is-action-button-available="false"
  />
</template>


