<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import i18n from '@/locales/i18n';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import { ConnectManager } from '@/helpers/ConnectManager';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

// A connect-only setting changed while a session runs (see AppState.isReconnectRequired). Never
// shown while disconnected; the flag clears itself on connect/disconnect.
const isDismissed = ref(false);
const isShow = computed<boolean>(() =>
  vhApp.data.state.isReconnectRequired && vhApp.data.isConnected && !isDismissed.value);

// re-arm the dismiss when the flag clears, so the next change shows the bar again
watch(() => vhApp.data.state.isReconnectRequired, (value) => {
  if (!value) isDismissed.value = false;
});

async function reconnect(): Promise<void> {
  await vhApp.disconnect();
  await ConnectManager.connectWithCurrentProfile();
}
</script>

<template>
  <v-alert
    v-if="isShow"
    closable
    :icon="false"
    density="compact"
    type="warning"
    class="text-caption"
    @click:close="isDismissed = true"
  >
    {{ locale('RECONNECT_REQUIRED_MSG') }}
    <a class="text-decoration-underline font-weight-bold" href="#" @click.prevent="reconnect()">
      {{ locale('RECONNECT') }}
    </a>
  </v-alert>
</template>
