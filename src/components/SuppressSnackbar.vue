<template>
  <v-snackbar
      :modelValue="modelValue" @update:modelValue="$emit('update:modelValue',$event)"
      close-on-content-click
      location="top"
      :timeout="-1"
      class="mt-12"
      color="deep-purple accent-4"

  >
    <!-- If suppressed by -->
    <span
        v-if="$vpnHoodApp.state.sessionStatus?.suppressedBy !== SessionSuppressType.None"
        class="text-justify"
    >
      {{ $t("SESSION_SUPPRESSED_BY_OTHER") }}
    </span>

    <!-- If 'suppressed to' is available and 'suppressed by' is none, because 'suppress by' has priority over 'suppress to' -->
    <span
        v-else-if="$vpnHoodApp.state.sessionStatus?.suppressedTo !== SessionSuppressType.None"
        class="text-justify"
    >
      {{ $t("SESSION_SUPPRESSED_TO_OTHER") }}
    </span>


    <template v-slot:actions>
      <v-btn
          icon="mdi-close"
          size="small"
          @click="onCloseButton"
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
  methods:{
    onCloseButton(){
      // Set ignore time by user for 'suppress by' to prevent showing up again until a new connection is created
      if (this.$vpnHoodApp.state.sessionStatus?.suppressedBy)
        this.$vpnHoodApp.uiState.userIgnoreSuppressByTime = new Date();

      // Set ignore time by user for 'suppress to' to prevent showing up again until a new connection is created
      if (this.$vpnHoodApp.state.sessionStatus?.suppressedTo && this.$vpnHoodApp.state.connectRequestTime)
        this.$vpnHoodApp.uiState.userIgnoreSuppressToTime = this.$vpnHoodApp.state.connectRequestTime;

      this.$emit('update:modelValue',false);
    }
  }
})
</script>