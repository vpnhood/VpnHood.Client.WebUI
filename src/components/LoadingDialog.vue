<template>
  <v-dialog :modelValue="modelValue" :persistent="true" max-width="600">
    <v-card rounded="lg" color="secondary">
      <v-card-text class="text-center text-white">
        <v-progress-circular color="white" class="mb-2" :indeterminate="true" size="50" width="3"/>
        <p>{{$t("PLEASE_WAIT")}}</p>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">

import {defineComponent} from "vue";

export default defineComponent({
  props: {
    modelValue: Boolean,
  },
  emits: [
    "update:modelValue"
  ],
})
</script>
