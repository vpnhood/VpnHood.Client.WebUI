<script setup lang="ts">
import i18n from '@/locales/i18n';
import { defineAsyncComponent } from 'vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';

// The encoder is a few kilobytes that only a TV ever loads, and only at the moment someone opens a
// legal link there. As an async component it lands in its own chunk, fetched from the app's own
// spa.zip on first open, so every other build carries none of it. v-dialog does not render its
// content until it is opened, which is what makes the split actually pay: the request is not made
// on the page that merely CONTAINS the link.
const QrCode = defineAsyncComponent(() => import('@/components/OpenOnPhoneDialog/QrCode.vue'));

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

defineProps<{
  modelValue: boolean,
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void,
}>();

const dialogState = vhApp.data.uiState.openOnPhoneDialogState;

// Emit rather than clear a flag: the route controller behind this model has a history entry to pop,
// and closing any other way would leave it stranded.
function onClose(): void {
  emit('update:modelValue', false);
}
</script>

<template>
  <!-- Opened by VpnHoodApp.onExternalLinkClick, which is where the decision to show a code instead
       of following the link is made. Nothing else opens it, so it carries no props: the address and
       the heading come from the shared state that call set. -->
  <v-dialog :model-value="modelValue" max-width="480" @update:model-value="onClose()">
    <v-card color="general-dialog" class="text-general-dialog-text">

      <!-- text-wrap: v-card-title is single-line with an ellipsis by default, and a translated
           document name is routinely longer than the English one it came from. -->
      <v-card-title v-if="dialogState.title" class="text-center text-wrap">{{ dialogState.title }}</v-card-title>

      <v-card-text class="text-center">
        <p class="text-body-medium mb-4">{{ locale('SCAN_QR_TO_OPEN') }}</p>

        <div class="qr-plate mx-auto">
          <qr-code :value="dialogState.url"/>
        </div>

        <!-- The address stays on screen beside the code, not instead of it. Scanning is the fast
             path, not the only one: a user with no phone to hand can still type this, and a
             reviewer looking at a TV build has to be able to read where the link goes. Forced LTR
             like every other address the app prints, or an RTL locale reorders it into something
             that cannot be typed. -->
        <p dir="ltr" class="text-body-small mt-4 qr-address">{{ dialogState.url }}</p>
      </v-card-text>

      <v-card-actions>
        <v-spacer/>
        <!-- autofocus so a remote arrives with something under it: this dialog is only ever raised
             on a device driven by a D-pad, which has no way to reach an unfocused control. -->
        <v-btn autofocus :text="locale('CLOSE')" @click="onClose()"/>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<style scoped>
/* Sized against the viewport rather than in pixels because of where this appears: a TV is watched
   from two or three metres, and the working rule for a code that scans first time is a width of
   roughly a tenth of the viewing distance. The lower bound keeps it usable on a phone-sized window
   and the upper one keeps it from filling a desktop screen. */
.qr-plate {
  position: relative;
  width: clamp(160px, 40vh, 320px);
  /* Reserves the square before the encoder's chunk lands, so the dialog does not resize under the
     user - the old padding trick rather than aspect-ratio, which this app's oldest WebViews lack.
     White from the start, so what appears is the code filling in rather than a box appearing. */
  height: 0;
  padding-bottom: clamp(160px, 40vh, 320px);
  background: #ffffff;
  border-radius: 4px;
  overflow: hidden;
}

/* Individual sides rather than the inset shorthand: this app still supports old WebViews. */
.qr-plate > * {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

/* A URL offers no space to break at, so a long one would otherwise stretch the dialog. */
.qr-address {
  word-break: break-all;
}
</style>
