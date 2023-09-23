<template>
  <v-snackbar
      :modelValue="modelValue" @update:modelValue="$emit('update:modelValue',$event)"
      close-on-content-click
      location="top"
      :timeout="-1"
      color="deep-purple accent-4"
  >
    <!-- If suppressed to -->
    <span
        v-if="$vpnHoodApp.state.sessionStatus?.suppressedTo !== 'None'"
        class="text-justify"
    >
      {{ $t("SESSION_SUPPRESSED_BY_OTHER") }}
    </span>

    <!-- If suppressed by -->
    <span
        v-if="$vpnHoodApp.state.sessionStatus?.suppressedBy !== 'None'"
        class="text-justify"
    >
      {{ $t("SESSION_SUPPRESSED_TO_OTHER") }}
    </span>


    <template v-slot:actions>
      <v-btn
          icon="mdi-close"
          size="small"
          @click="$emit('update:modelValue',false)"
      >
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script lang="ts">
import {defineComponent} from "vue";
export default defineComponent({
  name: "SuppressSnackbar",
  props:{
    modelValue: Boolean,
  },
  emits: [
    "update:modelValue",
  ],
})
</script>