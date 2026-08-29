<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import { computed, ref } from 'vue';
import type { GeneralSnackbarState } from '@/helpers/ui-state/GeneralSnackbarState';
import i18n from '@/locales/i18n';
import vuetify from '@/theme/vuetify';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const props = defineProps<{
  modelValue: boolean,
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void,
}>();

const snackbarState = ref<GeneralSnackbarState>(VpnHoodApp.instance.data.uiState.generalSnackbarState);
const timeOut = computed(() => {
  if (snackbarState.value.hasTimer){
    return snackbarState.value.timeOut ?? 3000;
  }
  return -1;
});

function hasCloseButton(): boolean{
  if (snackbarState.value.hasCloseBtn !== null)
    return snackbarState.value.hasCloseBtn;

  return !snackbarState.value.hasTimer;
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
    :class="{'mt-5': !vuetify.display.smAndDown.value}"
    class="pt-2"
    :style="`margin-top: ${vhApp.data.edgeToEdgeTopHeight}px;`"
    rounded="lg"
    vertical
    :timer="snackbarState.hasTimer ?? false"
    timer-color="rgba(255,255,255,0.5)"
    :timeout="timeOut"
    :content-class="snackbarState.textColor ? `text-${snackbarState.textColor}` : ''"
    :color="snackbarState.bgColor"
    :text="snackbarState.message"
  >
    <template v-slot:actions v-if="hasCloseButton()">
      <v-btn :text="locale('CLOSE')" size="small" @click="onCloseButton" />
    </template>
  </v-snackbar>
</template>
