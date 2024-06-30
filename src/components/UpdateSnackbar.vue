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

    <!-- Direct link without google play -->
    <v-btn
        v-if="!$vpnHoodApp.data.state.lastPublishInfo?.googlePlayUrl"
        :href="$vpnHoodApp.data.state.lastPublishInfo?.installationPageUrl"
        color="primary"
        class="text-capitalize"
        block
        target="_blank"
        :text="$t('UPDATE_FROM_DIRECT_LINK')"
    >
    </v-btn>

    <!-- Update from google play -->
    <v-btn
        v-if="$vpnHoodApp.data.state.lastPublishInfo?.googlePlayUrl"
        :href="$vpnHoodApp.data.state.lastPublishInfo?.googlePlayUrl"
        color="primary"
        class="text-capitalize"
        block
        target="_blank"
        :text="$t('UPDATE_FROM_GOOGLE_PLAY')"
    >
    </v-btn>

    <!-- Do not access to google play question -->
    <v-btn
        v-if="$vpnHoodApp.data.state.lastPublishInfo?.googlePlayUrl && !showAlternativeDownloadLink"
        class="mt-2 text-lowercase text-caption color-light-blue"
        @click="showAlternativeDownloadLink = true"
        variant="text"
        block
        :text="$t('DO_NOT_HAVE_ACCESS_TO_GOOGLE_PLAY')"
    >
    </v-btn>

    <div v-if="showAlternativeDownloadLink">
      <!-- Update from direct link -->
      <v-btn
          class="mt-2 text-capitalize"
          :href="$vpnHoodApp.data.state.lastPublishInfo?.installationPageUrl"
          variant="tonal"
          block
          target="_blank"
          :text="$t('UPDATE_FROM_ALTERNATIVE_LINK')"
      >
      </v-btn>

      <!-- Direct link notice -->
      <p style="font-size: 0.8em;" class="text-center text-lowercase opacity-50">
        {{$t('UPDATE_FROM_ALTERNATIVE_LINK_NOTICE')}}
      </p>
    </div>

    <v-divider class="mt-3 mb-2"/>

    <div class="d-flex align-center justify-space-between">
      <!-- Compare versions -->
      <div class="text-caption">
        <p class="opacity-50"> {{ $t("CURRENT_VERSION") }} {{ $vpnHoodApp.getAppVersion(true) }}</p>
        <p> {{ $t("NEW_VERSION") }} {{ $vpnHoodApp.data.state.lastPublishInfo?.version }}</p>
      </div>

      <!-- Ignore button -->
      <v-btn
          variant="tonal"
          @click="ignoreUpdate"
          size="small"
          :text="$t('LATER')"
      >
      </v-btn>
    </div>
  </v-snackbar>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {VersionStatus} from "@/services/VpnHood.Client.Api";

export default defineComponent({
  data() {
    return {
      VersionStatus,
      showAlternativeDownloadLink: false,
    }
  },
  props: {
    modelValue: Boolean,
  },
  emits: [
    "update:modelValue",
  ],
  methods: {
    async ignoreUpdate() {
      await this.$vpnHoodApp.postPoneUpdate();
      this.$emit('update:modelValue', false);
    }
  }
})
</script>