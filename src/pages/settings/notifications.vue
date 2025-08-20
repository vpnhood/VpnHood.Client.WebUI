<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import AndroidSystemSettingsLayout from '@/components/AndroidSystemSettingsLayout.vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;
</script>

<template>
  <android-system-settings-layout
    title="APP_NOTIFICATIONS_COLORED"
    description="NOTIFICATIONS_DESC"
    image="notifications.webp"
    :list-step="[
    locale('NOTIFICATION_HOW_TO_TURN_ON_STEP_1'),
    locale('NOTIFICATION_HOW_TO_TURN_ON_STEP_2')
    ]"
    button-text="TURN_ON_NOTIFICATION"
    :button-click="()=>vhApp.intentsClient.openAppSystemNotificationSettings()"
    :is-premium="false"
  />
</template>
