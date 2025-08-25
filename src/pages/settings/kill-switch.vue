<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import AndroidSystemSettingsLayout from '@/components/AndroidSystemSettingsLayout.vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;
</script>

<template>
  <android-system-settings-layout
    title="KILL_SWITCH_COLORED"
    description="KILL_SWITCH_DESC"
    image="kill-switch.webp"
    :list-step="[
      locale('KILL_SWITCH_HOW_TO_TURN_ON_STEP_1'),
      locale('KILL_SWITCH_HOW_TO_TURN_ON_STEP_2',{appName: vhApp.data.features.appName, icon: '⚙️'}),
      locale('KILL_SWITCH_HOW_TO_TURN_ON_STEP_3')
    ]"
    button-text="KILL_SWITCH_TURN_ON"
    :button-click="()=>vhApp.intentsClient.openSystemKillSwitchSettings()"
    :is-premium="false"
    :is-action-button-available="true"
  />
</template>
