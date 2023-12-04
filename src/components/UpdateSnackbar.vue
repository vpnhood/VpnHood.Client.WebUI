<template>
  <v-snackbar
      :modelValue="modelValue" @update:modelValue="$emit('update:modelValue',$event)"
      location="top"
      max-width="570px"
      :vertical="true"
      :timeout="-1"
      :color="$vpnHoodApp.data.state.versionStatus === VersionStatus.Deprecated ? 'warning' : 'light-purple'"
  >
    <p class="text-subtitle-1 mb-3">
      {{
      $vpnHoodApp.data.state.versionStatus === VersionStatus.Deprecated ? $t("VERSION_IS_DEPRECATED") : $t("VERSION_IS_OLD")
      }}
    </p>

    <!-- Update from google play -->
    <v-btn
        :href="$vpnHoodApp.data.state.lastPublishInfo?.installationPageUrl"
        color="primary"
        class="text-capitalize"
        :block="true"
        target="_blank"
        :text="$t('UPDATE_FROM_GOOGLE_PLAY')"
    >
    </v-btn>

    <!-- Update from direct link -->
    <v-btn
        class="mt-2 text-capitalize"
        :href="$vpnHoodApp.data.state.lastPublishInfo?.packageUrl"
        variant="tonal"
        :block="true"
        target="_blank"
        :text="$t('UPDATE_FROM_DIRECT_LINK')"
    >
    </v-btn>
    <!-- Direct link notice -->
    <p style="font-size: 0.8em;" class="text-center text-lowercase opacity-50">
      {{$t('UPDATE_FROM_DIRECT_LINK_NOTICE')}}
    </p>

    <v-divider class="mt-3 mb-2"/>

    <div class="d-flex align-center justify-space-between">
      <!-- Compare versions -->
      <div class="text-caption">
        <p class="opacity-30"> {{ $t("CURRENT_VERSION") }} {{ $vpnHoodApp.getAppVersion(true) }}</p>
        <p class="opacity-50"> {{ $t("NEW_VERSION") }} {{ $vpnHoodApp.data.state.lastPublishInfo?.version }}</p>
      </div>

      <!-- Ignore button -->
      <v-btn
          variant="text"
          @click="ignoreUpdate"
          size="small"
          :text="$t('IGNORE')"
      >
      </v-btn>
    </div>
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