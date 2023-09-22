<template>
  <v-snackbar
      :modelValue="modelValue" @update:modelValue="$emit('update:modelValue',$event)"
      location="top"
      vertical
      :timeout="-1"
      :color="$vpnHoodApp.state.versionStatus === 'Deprecated' ? 'warning' : 'sky-blue'"
      >

    <p class="text-subtitle-1 mb-2">{{ $vpnHoodApp.state.versionStatus === 'Deprecated' ? $t("VERSION_IS_DEPRECATED") : $t("VERSION_IS_OLD")}}</p>

    <p> {{ $t("CURRENT_VERSION") }} {{ $vpnHoodApp.getAppVersion(true) }}</p>
    <p> {{ $t("NEW_VERSION") }} {{ $vpnHoodApp.state.lastPublishInfo?.version }}</p>

    <v-divider class="mt-4"/>

    <template v-slot:actions>

      <!-- Update button -->
      <v-btn
          :href="$vpnHoodApp.state.lastPublishInfo?.installationPageUrl"
          variant="text"
          target="_blank"
          :text="$t('UPDATE')"
      >
      </v-btn>

      <!-- Ignore button -->
      <v-btn
          variant="text"
          @click="$emit('update:modelValue',false)"
          :text="$t('IGNORE')"
      >
      </v-btn>

    </template>
  </v-snackbar>
</template>

<script lang="ts">
import {defineComponent} from "vue";
export default defineComponent({
  name: "UpdateSnackbar",
  props:{
    modelValue: Boolean,
  },
  emits: [
    "update:modelValue",
  ],
})
</script>