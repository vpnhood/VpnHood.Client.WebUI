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
  <!-- Overlaid on top of the page content instead of participating in layout: showing the bar
       must not push the page (and the mobile footer) down. Anchors to v-main, which App.vue
       makes position-relative. -->
  <transition name="reconnect-alert">
    <v-alert
      v-if="vhApp.data.state.isReconnectRequired && vhApp.data.isConnected"
      closable
      :icon="false"
      density="compact"
      type="warning"
      class="text-body-small reconnect-alert-bar elevation-3"
      @click:close="dismiss()"
    >
      {{ locale('RECONNECT_REQUIRED_MSG') }}
      <a class="text-decoration-underline font-weight-bold" href="#" @click.prevent="reconnect()">
        {{ locale('RECONNECT') }}
      </a>
    </v-alert>
  </transition>
</template>

<style scoped>
/* Physical top/left/right rather than logical inset properties: their postcss transpilation is
   disabled for legacy browsers (see vite.config.ts), and the bar is symmetric so RTL is unaffected. */
.reconnect-alert-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 5;
}

.reconnect-alert-enter-active,
.reconnect-alert-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.reconnect-alert-enter-from,
.reconnect-alert-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}
</style>
