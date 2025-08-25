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
    title="ALWAYS_ON_COLORED"
    description="ALWAYS_ON_DESC"
    image="always-on.webp"
    :list-step="[
      locale('ALWAYS_ON_HOW_TO_TURN_ON_STEP_1'),
      locale('ALWAYS_ON_HOW_TO_TURN_ON_STEP_2',{appName: vhApp.data.features.appName, icon: '⚙️'}),
      locale('ALWAYS_ON_HOW_TO_TURN_ON_STEP_3')
    ]"
    button-text="OPEN_SYSTEM_SETTINGS"
    :button-click="()=>vhApp.intentsClient.requestQuickLaunch()"
    :is-premium="vhApp.data.features.premiumFeatures.includes(AppFeature.AlwaysOn)"
    :is-action-button-available="true"
  />
</template>
