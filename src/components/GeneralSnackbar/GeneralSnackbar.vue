<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import { ref } from 'vue';
import type { GeneralSnackbarData } from '@/components/GeneralSnackbar/GeneralSnackbarData';
import i18n from '@/locales/i18n';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const props = defineProps<{
  modelValue: boolean,
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void,
}>();

const snackbarData = ref<GeneralSnackbarData>(VpnHoodApp.instance.data.uiState.generalSnackbarData);

function onCloseButton(){
  // Set ignore time by user for 'suppress to' to prevent showing up again until a new connection is created
  if (vhApp.data.state.sessionInfo?.suppressedTo && vhApp.data.state.connectRequestTime)
    vhApp.data.uiState.userIgnoreSuppressToTime = vhApp.data.state.connectRequestTime;

  emit('update:modelValue',false);
}
</script>

<template>
  <v-snackbar
    :modelValue="props.modelValue"
    @update:modelValue="$emit('update:modelValue',false)"
    location="top"
    class="pt-12 mx-10"
    rounded="xl"
    vertical
    :timer="snackbarData.isTimerAvailable ? 'rgba(255,255,255,0.5)' : false"
    :timeout="snackbarData.isTimerAvailable ? '10000' : '-1'"
    :content-class="`text-${snackbarData.textColor}`"
    :color="snackbarData.color"
    :text="snackbarData.message"
  >
    <template v-slot:actions>
      <v-btn :text="locale('CLOSE')" size="small" @click="onCloseButton" />
    </template>
  </v-snackbar>
</template>
