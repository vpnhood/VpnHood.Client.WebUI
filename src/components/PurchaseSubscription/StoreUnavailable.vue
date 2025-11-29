<script setup lang="ts">
import i18n from '@/locales/i18n';
import { VpnHoodApp } from '@/services/VpnHoodApp';
const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const props = defineProps<{
  errorMessage: string,
}>();
</script>

<template>
  <v-card
    class="py-3 px-3 rounded-lg text-white mb-4 border border-error border-opacity-100"
    color="rgba(var(--v-theme-card-on-grad-bg), 0.3)"
  >
    <v-icon class="pe-3" color="error" icon="mdi-alert-circle-outline" />
    <span class="text-error text-caption">{{ locale('ONLINE_PURCHASE_IS_NOT_AVAILABLE') }}</span>
    <v-btn
      :text="locale('MORE_INFO')"
      color="error"
      variant="tonal"
      rounded="pill"
      size="small"
      block
      class="text-lowercase mt-2"
      @click="vhApp.showErrorMessage(props.errorMessage)"
    />
  </v-card>
</template>
