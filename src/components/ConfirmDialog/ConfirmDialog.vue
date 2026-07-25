<script setup lang="ts">
import i18n from '@/locales/i18n';
import { VpnHoodApp } from '@/services/VpnHoodApp';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const props = defineProps<{
  modelValue: boolean,
}>();

function onConfirm(): void{
  vhApp.confirmDialogDeferred?.resolve(true);
  vhApp.data.uiState.confirmDialogState.isShow = false;
}
function onCancel(): void{
  vhApp.confirmDialogDeferred?.resolve(false);
  vhApp.data.uiState.confirmDialogState.isShow = false;
}
</script>

<template>
    <v-dialog
      :modelValue="props.modelValue"
      :persistent="true"
      >
      <v-card
        :title="vhApp.data.uiState.confirmDialogState.title"
        append-icon="mdi-alert-circle-outline"
        color="general-dialog"
      >
        <v-card-text class="text-general-dialog-text text-body-medium">
          {{ vhApp.data.uiState.confirmDialogState.message }}
        </v-card-text>

        <v-card-actions>

          <!-- Cancel -->
          <v-btn :text="locale('NO')" @click="onCancel()" />

          <!-- Confirm -->
          <v-btn variant="plain" :text="locale('YES')" @click="onConfirm()" />

        </v-card-actions>
      </v-card>
    </v-dialog>
</template>
