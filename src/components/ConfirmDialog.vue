<script setup lang="ts">
import i18n from '@/locales/i18n';

const locale = i18n.global.t;

const props = defineProps<{
  modelValue: boolean,
  title: string,
  message: string,
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void,
  (e: 'confirm'): void,
  (e: 'cancel'): void,
}>();
</script>

<template>
    <v-dialog
      :modelValue="props.modelValue"
      @update:modelValue="emit('update:modelValue',$event)"
      :persistent="true"
      >
      <v-card
        :title="props.title"
        append-icon="mdi-alert-circle-outline"
        color="general-dialog"
      >
        <v-card-text class="text-general-dialog-text text-body-2">{{ props.message }}</v-card-text>

        <v-card-actions>

          <!-- Cancel -->
          <v-btn :text="locale('NO')" @click="emit('cancel'); emit('update:modelValue', false)" />

          <!-- Confirm -->
          <v-btn variant="plain" :text="locale('YES')" @click="emit('confirm'); emit('update:modelValue', false)" />

        </v-card-actions>
      </v-card>
    </v-dialog>
</template>
