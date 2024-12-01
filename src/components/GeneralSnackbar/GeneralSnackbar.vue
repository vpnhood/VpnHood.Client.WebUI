<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import { ref } from 'vue';
import type { GeneralSnackbarData } from '@/components/GeneralSnackbar/GeneralSnackbarData';

const props = defineProps<{
  modelValue: boolean,
}>();

const snackbarData = ref<GeneralSnackbarData>(VpnHoodApp.instance.data.uiState.generalSnackbarData);

</script>

<template>
  <v-snackbar
    :modelValue="props.modelValue"
    @update:modelValue="$emit('update:modelValue',false)"
    location="top"
    timer="rgba(255,255,255,0.3)"
    timeout="5000"
    class="pt-12"
    :content-class="`text-${snackbarData.textColor}`"
    close-on-content-click
    :color="snackbarData.color"
    :text="snackbarData.message"
  />
</template>
