<template>
  <v-snackbar
      :modelValue="modelValue" @update:modelValue="$emit('update:modelValue',$event)"
      location="top"
      max-width="570px"
      :vertical="true"
      :timeout="-1"
      :color="$vpnHoodApp.data.state.versionStatus === VersionStatus.Deprecated ? 'warning' : 'light-purple'"
  >
    <p class="text-subtitle-1 mb-2">
      {{
      $vpnHoodApp.data.state.versionStatus === VersionStatus.Deprecated ? $t("VERSION_IS_DEPRECATED") : $t("VERSION_IS_OLD")
      }}
    </p>

    <p> {{ $t("CURRENT_VERSION") }} {{ $vpnHoodApp.getAppVersion(true) }}</p>
    <p> {{ $t("NEW_VERSION") }} {{ $vpnHoodApp.data.state.lastPublishInfo?.version }}</p>

    <v-divider class="mt-4"/>

    <template v-slot:actions>

      <!-- Update button -->
      <v-btn
          :href="$vpnHoodApp.data.state.lastPublishInfo?.installationPageUrl"
          variant="tonal"
          target="_blank"
          :text="$t('UPDATE')"
      >
      </v-btn>

      <!-- Ignore button -->
      <v-btn
          variant="text"
          @click="ignoreUpdate"
          :text="$t('IGNORE')"
      >
      </v-btn>

    </template>
  </v-snackbar>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {VersionStatus} from "@/services/VpnHood.Client.Api";

export default defineComponent({
  name: "UpdateSnackbar",
  data() {
    return {
      VersionStatus
    }
  },
  props: {
    modelValue: Boolean,
  },
  emits: [
    "update:modelValue",
  ],
  methods: {
    ignoreUpdate() {
      this.$vpnHoodApp.data.uiState.userIgnoreUpdateTime = new Date().getTime();
      this.$emit('update:modelValue', false);
    }
  }
})
</script>