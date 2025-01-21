<script setup lang="ts">
import {SessionSuppressType} from "@/services/VpnHood.Client.Api";
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const props = defineProps<{
  modelValue: boolean,
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void,
}>();

function onCloseButton(){
  // Set ignore time by user for 'suppress by' to prevent showing up again until a new connection is created
  if (vhApp.data.state.sessionStatus?.suppressedBy && vhApp.data.state.connectRequestTime)
    vhApp.data.uiState.userIgnoreSuppressByTime = vhApp.data.state.connectRequestTime;

  // Set ignore time by user for 'suppress to' to prevent showing up again until a new connection is created
  if (vhApp.data.state.sessionStatus?.suppressedTo && vhApp.data.state.connectRequestTime)
    vhApp.data.uiState.userIgnoreSuppressToTime = vhApp.data.state.connectRequestTime;

  emit('update:modelValue',false);
}
</script>

<template>
  <v-snackbar
    :modelValue="props.modelValue"
    @update:modelValue="emit('update:modelValue',$event)"
    location="top"
    :timeout="-1"
    class="mt-11"
    color="suppress-snackbar"
    vertical
    rounded="xl"
  >
    <!-- If suppressed by -->
    <span v-if="vhApp.data.state.sessionStatus?.suppressedBy !== SessionSuppressType.None">
      {{ locale("SESSION_SUPPRESSED_BY_OTHER") }}
    </span>

    <!-- If 'suppressed to' is available and 'suppressed by' is none, because 'suppress by' has priority over 'suppress to' -->
    <span v-else-if="vhApp.data.state.sessionStatus?.suppressedTo !== SessionSuppressType.None">
      {{ locale("SESSION_SUPPRESSED_TO_OTHER") }}
    </span>

    <template v-slot:actions>
      <v-btn :text="locale('CLOSE')" size="small" @click="onCloseButton" />
    </template>
  </v-snackbar>
</template>
