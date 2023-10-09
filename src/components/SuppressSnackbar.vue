<template>
  <v-snackbar
      :modelValue="modelValue" @update:modelValue="$emit('update:modelValue',$event)"
      close-on-content-click
      location="top"
      :timeout="-1"
      class="mt-12"
      color="deep-purple accent-4"

  >
    <!-- If 'suppressed to' is available and 'suppressed by' is none, because 'suppress by' has priority over 'suppress to' -->
    <span
        v-if="$vpnHoodApp.state.sessionStatus?.suppressedTo !== SessionSuppressType.None && $vpnHoodApp.state.sessionStatus?.suppressedBy === SessionSuppressType.None"
        class="text-justify"
    >
      {{ $t("SESSION_SUPPRESSED_TO_OTHER") }}
    </span>

    <!-- If suppressed by -->
    <span
        v-if="$vpnHoodApp.state.sessionStatus?.suppressedBy !== SessionSuppressType.None"
        class="text-justify"
    >
      {{ $t("SESSION_SUPPRESSED_BY_OTHER") }}
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
import {SessionSuppressType} from "@/services/VpnHood.Client.Api";
export default defineComponent({
  name: "SuppressSnackbar",
  data(){
    return{
      SessionSuppressType
    }
  },
  props:{
    modelValue: Boolean,
  },
  emits: [
    "update:modelValue",
  ],
})
</script>