<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import AndroidSystemSettingsLayout from '@/components/AndroidSystemSettingsLayout.vue';
import { AppFeature } from '@/services/VpnHood.Client.Api';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;
</script>

<template>
  <android-system-settings-layout
    title="PRIVATE_DNS_COLORED"
    description="PRIVATE_DNS_DESC"
    image="private-dns.webp"
    :list-step="[
      locale('PRIVATE_DNS_TURN_ON_STEP_1'),
      locale('PRIVATE_DNS_TURN_ON_STEP_2'),
      locale('PRIVATE_DNS_TURN_ON_STEP_3'),
      locale('PRIVATE_DNS_TURN_ON_STEP_4'),
      locale('PRIVATE_DNS_TURN_ON_STEP_5')
    ]"
    button-text="OPEN_SYSTEM_SETTINGS"
    :button-click="()=>vhApp.intentsClient.openSystemSettings()"
    :is-premium="vhApp.data.isPremiumFeature(AppFeature.CustomDns)"
    :is-action-button-available="vhApp.data.intentFeatures.isSystemPrivateDnsSettingsSupported"
  />
</template>
