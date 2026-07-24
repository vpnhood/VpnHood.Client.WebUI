<script setup lang="ts">
import i18n from '@/locales/i18n';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import { ConnectManager } from '@/helpers/ConnectManager';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

// A connect-only setting changed while a session runs (see AppState.isReconnectRequired). The flag
// lives in the app: it clears itself on connect/disconnect, and dismissing acknowledges it away
// through the api (same pattern as clearLastError) — no local state to keep in sync.
async function dismiss(): Promise<void> {
  // update the local copy first so the bar hides instantly; the next state poll confirms it
  vhApp.data.state.isReconnectRequired = false;
  await vhApp.appClient.clearReconnectRequired();
}

async function reconnect(): Promise<void> {
  await vhApp.disconnect();
  await ConnectManager.connectWithCurrentProfile();
}
</script>

<template>
  <v-alert
    v-if="vhApp.data.state.isReconnectRequired && vhApp.data.isConnected"
    closable
    :icon="false"
    density="compact"
    type="warning"
    class="text-caption"
    @click:close="dismiss()"
  >
    {{ locale('RECONNECT_REQUIRED_MSG') }}
    <a class="text-decoration-underline font-weight-bold" href="#" @click.prevent="reconnect()">
      {{ locale('RECONNECT') }}
    </a>
  </v-alert>
</template>
