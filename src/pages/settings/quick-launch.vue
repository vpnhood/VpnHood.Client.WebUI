<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import AndroidSystemSettingsLayout from '@/components/AndroidSystemSettingsLayout.vue';
import { AppFeature } from '@/services/VpnHood.Client.Api';
import { onMounted } from 'vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const supportedRequestQuickLaunchSteps = [
  locale('QUICK_LAUNCH_HOW_TO_TURN_ON_STEP_1'),
  locale('QUICK_LAUNCH_HOW_TO_TURN_ON_STEP_2')
]
const unsupportedRequestQuickLaunchSteps = [
  locale('QUICK_LAUNCH_HOW_TO_TURN_ON_ALTERNATIVE_STEP_1'),
  locale('QUICK_LAUNCH_HOW_TO_TURN_ON_ALTERNATIVE_STEP_2'),
  locale('QUICK_LAUNCH_HOW_TO_TURN_ON_ALTERNATIVE_STEP_3',{appName: vhApp.data.features.appName}),
  locale('QUICK_LAUNCH_HOW_TO_TURN_ON_ALTERNATIVE_STEP_4'),
  locale('QUICK_LAUNCH_HOW_TO_TURN_ON_ALTERNATIVE_STEP_5')
]

onMounted(() => {
  if (!vhApp.data.userSettings.isQuickLaunchPrompted){
    vhApp.data.userSettings.isQuickLaunchPrompted = true;
    vhApp.saveUserSetting();
  }
})
</script>

<template>
  <android-system-settings-layout
    title="QUICK_LAUNCH_COLORED"
    description="QUICK_LAUNCH_DESC"
    image="quick-launch.webp"
    :list-step=" vhApp.data.intentFeatures.isRequestQuickLaunchSupported ? supportedRequestQuickLaunchSteps : unsupportedRequestQuickLaunchSteps"
    button-text="QUICK_LAUNCH_TURN_ON"
    :button-click="()=>vhApp.intentsClient.requestQuickLaunch()"
    :is-premium="vhApp.data.features.premiumFeatures.includes(AppFeature.QuickLaunch)"
    :is-action-button-available="vhApp.data.intentFeatures.isRequestQuickLaunchSupported"
  />
</template>
