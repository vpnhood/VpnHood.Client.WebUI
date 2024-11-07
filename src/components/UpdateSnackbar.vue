<script setup lang="ts">
import { ref } from 'vue';
import {VersionStatus} from "@/services/VpnHood.Client.Api";
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const showAlternativeDownloadLink = ref<boolean>(false);

const props = defineProps<{
  modelValue: boolean,
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void,
}>();

async function ignoreUpdate() {
  await vhApp.postPoneUpdate();
  emit('update:modelValue', false);
}
</script>

<template>
  <v-snackbar
    :modelValue="props.modelValue"
    @update:modelValue="emit('update:modelValue',$event)"
    location="top"
    max-width="570px"
    :vertical="true"
    :timeout="-1"
    :color="vhApp.data.state.versionStatus === VersionStatus.Deprecated ? 'warning' : 'light-purple'"
  >
    <p class="text-subtitle-1 mb-3">
      {{vhApp.data.state.versionStatus === VersionStatus.Deprecated
      ? locale("VERSION_IS_DEPRECATED") : locale("VERSION_IS_OLD") }}
    </p>

    <!-- Direct link without google play -->
    <v-btn
      v-if="!vhApp.data.state.lastPublishInfo?.googlePlayUrl"
      :href="vhApp.data.state.lastPublishInfo?.installationPageUrl"
      color="primary"
      class="text-capitalize"
      block
      target="_blank"
      :text="locale('UPDATE_FROM_DIRECT_LINK')"
    >
    </v-btn>

    <!-- Update from google play -->
    <v-btn
      v-if="vhApp.data.state.lastPublishInfo?.googlePlayUrl"
      :href="vhApp.data.state.lastPublishInfo?.googlePlayUrl"
      color="primary"
      class="text-capitalize"
      block
      target="_blank"
      :text="locale('UPDATE_FROM_GOOGLE_PLAY')"
    >
    </v-btn>

    <!-- Do not access to google play question -->
    <v-btn
      v-if="vhApp.data.state.lastPublishInfo?.googlePlayUrl && !showAlternativeDownloadLink"
      class="mt-2 text-lowercase text-caption color-light-blue"
      @click="showAlternativeDownloadLink = true"
      variant="text"
      block
      :text="locale('DO_NOT_HAVE_ACCESS_TO_GOOGLE_PLAY')"
    >
    </v-btn>

    <div v-if="showAlternativeDownloadLink">
      <!-- Update from direct link -->
      <v-btn
        class="mt-2 text-capitalize"
        :href="vhApp.data.state.lastPublishInfo?.installationPageUrl"
        variant="tonal"
        block
        target="_blank"
        :text="locale('UPDATE_FROM_ALTERNATIVE_LINK')"
      >
      </v-btn>

      <!-- Direct link notice -->
      <p style="font-size: 0.8em;" class="text-center text-lowercase opacity-50">
        {{locale('UPDATE_FROM_ALTERNATIVE_LINK_NOTICE')}}
      </p>
    </div>

    <v-divider class="mt-3 mb-2"/>

    <div class="d-flex align-center justify-space-between">
      <!-- Compare versions -->
      <div class="text-caption">
        <p class="opacity-50"> {{ locale("CURRENT_VERSION") }} {{ vhApp.getAppVersion(true) }}</p>
        <p> {{ locale("NEW_VERSION") }} {{ vhApp.data.state.lastPublishInfo?.version }}</p>
      </div>

      <!-- Ignore button -->
      <v-btn
        variant="tonal"
        @click="ignoreUpdate"
        size="small"
        :text="locale('LATER')"
      >
      </v-btn>
    </div>
  </v-snackbar>
</template>
