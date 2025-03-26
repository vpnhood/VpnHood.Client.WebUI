<script setup lang="ts">
import i18n from '@/locales/i18n';
import { VpnHoodApp } from '@/services/VpnHoodApp';
</script>

<template>
  <v-alert
    v-if="VpnHoodApp.instance.data.isConnected"
    :icon="false"
    :text="i18n.global.t('DISCONNECT_REQUIRED_TO_CHANGE_SETTING')"
    class="text-caption"
    density="compact"
    type="warning"
    color="disconnect-warning"
  />
</template>
