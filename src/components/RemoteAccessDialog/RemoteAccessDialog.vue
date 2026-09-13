<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import i18n from '@/locales/i18n';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import vuetify from '@/theme/vuetify';
import { RemoteAccessHint } from '@/helpers/UiConstants';
import QrPlate from '@/components/OpenOnPhoneDialog/QrPlate.vue';
import { useDialogFocus } from '@/helpers/InitialFocus';
import type { RemoteAccessState } from '@/services/VpnHood.Client.Api';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;
const { target: closeBtnRef, onAfterEnter } = useDialogFocus();

const props = defineProps<{
  modelValue: boolean,
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void,
}>();

const dialogState = vhApp.data.uiState.remoteAccessDialogState;

// The stylesheet's shape rule (a landscape viewport, whatever the device), for the one thing CSS
// cannot set: the dialog's width is an inline style from Vuetify's max-width prop.
const isLandscape = computed(() =>
  vuetify.display.width.value >= 700 && vuetify.display.width.value > vuetify.display.height.value);

const remoteAccess = ref<RemoteAccessState | null>(null);
const url = computed(() => remoteAccess.value?.urls[0] ?? null);
const otherUrls = computed(() => remoteAccess.value?.urls.slice(1) ?? []);
const connectedDevices = computed(() => remoteAccess.value?.connectedDevices ?? []);

// A debug build or /remote-access: the app's own listener is on the LAN for the whole process,
// so this dialog only shows the address, and nothing here starts or stops anything.
const isAlwaysOn = computed(() => remoteAccess.value?.isAlwaysOn === true);

// Where on the phone to go next, for the entry points whose job cannot be done with a remote.
const hintText = computed(() => {
  switch (dialogState.hint) {
    case RemoteAccessHint.Servers: return locale('REMOTE_ACCESS_HINT_SERVERS');
    default: return null;
  }
});

// This dialog owns the listener: it starts it on opening and stops it on closing, and the app keeps
// it alive in between. Hidden counts as closed, because on Android the activity stays alive in the
// background with nothing on screen and the app cannot tell. Coming back starts it again, on the
// same port when it is free, so a phone already on the address just reconnects.
async function start(): Promise<void> {
  remoteAccess.value = await vhApp.appClient.startRemoteAccess();
}

async function stop(): Promise<void> {
  if (isAlwaysOn.value)
    return;

  await vhApp.appClient.stopRemoteAccess();
}

// The presence list, polled only while the dialog is open. Never before the first start answered:
// until then there is nothing to refresh.
async function refresh(): Promise<void> {
  if (document.hidden || remoteAccess.value === null)
    return;

  remoteAccess.value = await vhApp.appClient.getRemoteAccess();
}

function onVisibilityChange(): void {
  if (document.hidden)
    void stop();
  else
    void start();
}

// Unloaded, not hidden: a request started now would be cancelled with the page, and a beacon is
// the one request the browser promises to deliver. A POST with no body, which is all the endpoint
// takes. The base is the API's, which in the dev loop is not this page's origin.
function onPageHide(): void {
  if (isAlwaysOn.value)
    return;

  const apiBase = (vhApp.data.serverUrl ?? window.location.origin).replace(/\/+$/, '');
  navigator.sendBeacon(`${apiBase}/api/app/remote-access/stop`);
}

let refreshTimer = 0;

function onOpened(): void {
  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('pagehide', onPageHide);
  refreshTimer = window.setInterval(() => void refresh(), 2000);
  void start();
}

// Cleared after the stop, which reads isAlwaysOn off it; and cleared at all so the next opening
// shows the spinner until its own start answers, not last time's address on a port that may differ.
function onClosed(): void {
  document.removeEventListener('visibilitychange', onVisibilityChange);
  window.removeEventListener('pagehide', onPageHide);
  window.clearInterval(refreshTimer);
  void stop();
  remoteAccess.value = null;
}

// Opening and closing are the boundaries, however the close came - the Close button, Back, or a
// click outside. Immediate, for a dialog already open when the SPA loads: whether it is shown lives
// in the route, and a reload keeps the route.
watch(() => props.modelValue, (isOpen, wasOpen) => {
  if (isOpen)
    onOpened();
  else if (wasOpen)
    onClosed();
}, { immediate: true });

// Mounted once for the app's life (App.vue); this is for the day that changes.
onBeforeUnmount(() => {
  if (props.modelValue)
    onClosed();
});

// Emit rather than clear a flag: the route controller behind this model has a history entry to pop,
// and closing any other way would leave it stranded.
function onClose(): void {
  emit('update:modelValue', false);
}
</script>

<template>
  <!-- Opened by VpnHoodApp.showRemoteAccessDialog, from the TV UI only: a phone that opened the app
       over the LAN never sees an entry, and the app refuses it the calls anyway. -->
  <v-dialog :model-value="modelValue" :max-width="isLandscape ? 720 : 480" @update:model-value="onClose()" @after-enter="onAfterEnter">
    <v-card color="general-dialog" class="text-general-dialog-text">
      <v-card-title class="text-center text-wrap">{{ locale('REMOTE_ACCESS') }}</v-card-title>

      <!-- The code with its addresses on one side and every line of text on the other once the
           viewport is a landscape one, which a TV always is: stacked, the card is taller than a
           540px panel and scrolls, which a remote parked on Close cannot do. Portrait keeps the
           stack, code first. -->
      <v-card-text class="remote-access-body">
        <div class="remote-access-code">
          <template v-if="url">
            <qr-plate :url="url"/>
            <!-- A PC holds more than one address a phone could dial; a TV nearly never does. The
                 code encodes the first, and the rest are here for anyone whose phone did not reach
                 it. -->
            <p v-if="otherUrls.length" dir="ltr" class="text-body-small text-disabled mt-1">
              {{ locale('REMOTE_ACCESS_OTHER_ADDRESSES') }} {{ otherUrls.join('   ') }}
            </p>
          </template>
          <v-progress-circular v-else indeterminate class="my-8"/>
        </div>

        <div class="remote-access-text">
          <p class="text-body-medium">{{ locale('REMOTE_ACCESS_DESC') }}</p>

          <!-- Where on the phone to go next, and that the address dies with the dialog: boxed like
               the app's other notices, because on a panel read from the sofa a bare sentence under
               a code is just more text. -->
          <alert-info v-if="hintText" icon="mdi-cellphone" :text="hintText" class="mt-4"/>
          <alert-note v-if="!isAlwaysOn" :text="locale('REMOTE_ACCESS_KEEP_OPEN')" class="mt-2"/>

          <p class="text-body-small mt-3">
            {{ connectedDevices.length
              ? locale('REMOTE_ACCESS_CONNECTED_FROM', { address: connectedDevices.join(', ') })
              : locale('REMOTE_ACCESS_NO_DEVICE') }}
          </p>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer/>
        <!-- Focused on arrival, so a remote has something under it: this dialog is only ever raised
             on a device driven by a D-pad, which has no way to reach an unfocused control. -->
        <v-btn ref="closeBtnRef" :text="locale('CLOSE')" @click="onClose()"/>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.remote-access-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
}

.remote-access-code,
.remote-access-text {
  width: 100%;
  min-width: 0;
}

/* The same shape rule as the home page: a landscape viewport, whatever the device. */
@media (min-width: 700px) and (orientation: landscape) {
  .remote-access-body {
    flex-direction: row;
    text-align: start;
    gap: 24px;
  }

  /* As wide as its addresses need, up to half the card; the code sits centred over them. */
  .remote-access-code {
    flex: 0 1 auto;
    width: auto;
    max-width: 50%;
    text-align: center;
  }

  .remote-access-text {
    flex: 1 1 0;
  }
}
</style>
