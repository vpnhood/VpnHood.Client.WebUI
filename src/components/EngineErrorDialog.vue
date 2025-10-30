<script setup lang="ts">
import i18n from '@/locales/i18n';

const locale = i18n.global.t;

defineProps<{
  modelValue: boolean,
}>();


</script>

<template>
  <v-dialog
    color="rgba(0, 0, 0, 0.66)"
    :modelValue="modelValue"
    :persistent="true"
    class="d-flex flex-column align-center justify-center text-center"
    style="height: 100vh !important;"
  >
<v-card
      rounded="lg"
      class="pa-4 border-t-xl border-error border-opacity-100"
      color="#181818"
      max-width="600px"
    >
      <h2 class="mb-5">VpnHood!</h2>
      <div class="d-inline-block rounded-lg pa-2 mb-10" style="background-color: rgba(174, 7, 35, 0.17)">
        <v-icon size="80px" color="error" icon="mdi-emoticon-sad-outline"/>
      </div>

      <v-card-title class="text-error">{{locale("OOPS")}}</v-card-title>
      <v-card-text>{{locale('LOAD_APP_ERROR_DESC')}}</v-card-text>
      <v-card-actions>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
