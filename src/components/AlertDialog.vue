<template>
  <v-dialog
      :modelValue="modelValue"
      persistent
      width="auto">
    <v-card
        rounded="lg"
        color="master-green"
        class="pt-0 pb-3 notice position-relative text-white">
      <v-card-title>
        <v-icon class="pe-3">mdi-alert-circle-outline</v-icon>
        <span>{{$t("GLOBAL_CATCH_EXCEPTION_TITLE")}}</span>
      </v-card-title>
      <v-card-text class="pt-0">
        <p>{{ dialogText }}</p>
      </v-card-text>
      <v-divider class="mb-3 border-opacity-25"></v-divider>
      <v-card-actions>
        <v-btn
            rounded="pill"
            variant="flat"
            class="text-center px-10 mx-auto color-master-green"
            @click="this.$emit('update:modelValue',false)"
        >
          {{ $t("CLOSE") }}
        </v-btn>
        <v-btn
            v-if="!$vpnHoodApp.state.logExists && $vpnHoodApp.state.lastActiveClientProfileId"
            rounded="pill"
            variant="flat"
            class="text-center px-10 mx-auto color-master-green"
            @click="$vpnHoodApp.diagnose() && this.$emit('update:modelValue',false)"
        >
          {{ $t("DIAGNOSE") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: "AlertDialog",
  props: {
    modelValue: Boolean,
    dialogText: String,
  },
  emits: [
    "update:modelValue",
    "update:dialogText",
  ],
})
</script>
