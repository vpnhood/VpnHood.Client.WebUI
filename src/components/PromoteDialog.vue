<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import router from '@/services/router';

const vhApp = VpnHoodApp.instance;

const props = defineProps<{
  modelValue: boolean,
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void,
}>();
</script>

<template>
  <v-dialog
    :modelValue="props.modelValue"
    @update:modelValue="emit('update:modelValue',$event)"
  >
    <tonal-icon-btn icon="mdi-close" variant="tonal" @click="emit('update:modelValue',false)" class="mb-4 mx-auto" />
    <v-img eager :src="vhApp.data.uiState.promoteImageUrl" rounded="lg" @click="router.replace({name: 'PURCHASE_SUBSCRIPTION'})"/>
  </v-dialog>
</template>
