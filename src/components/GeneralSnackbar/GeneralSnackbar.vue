<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import { ref } from 'vue';
import type { GeneralSnackbarData } from '@/components/GeneralSnackbar/GeneralSnackbarData';
import i18n from '@/locales/i18n';
import vuetify from '@/services/vuetify';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const props = defineProps<{
  modelValue: boolean,
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void,
}>();

const snackbarData = ref<GeneralSnackbarData>(VpnHoodApp.instance.data.uiState.generalSnackbarData);

function hasCloseButton(): boolean{
  if (snackbarData.value.hasCloseBtn !== null)
    return snackbarData.value.hasCloseBtn;

  return !snackbarData.value.hasTimer;
}
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
    :class="{'mt-5': vuetify.display.mdAndUp.value}"
    class="pt-2"
    rounded="lg"
    vertical
    :timer="snackbarData.hasTimer ? 'rgba(255,255,255,0.5)' : false"
    :timeout="snackbarData.timeOut ?? 3000"
    :content-class="snackbarData.textColor ? `text-${snackbarData.textColor}` : ''"
    :color="snackbarData.bgColor"
    :text="snackbarData.message"
  >
    <template v-slot:actions v-if="hasCloseButton()">
      <v-btn :text="locale('CLOSE')" size="small" @click="onCloseButton" />
    </template>
  </v-snackbar>
</template>
