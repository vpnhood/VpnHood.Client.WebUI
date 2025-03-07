<script setup lang="ts">
import router from '@/services/router';
import { Util } from '@/helpers/Util';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { computed } from 'vue';
import type { RouteLocationNormalizedLoaded } from 'vue-router';

const locale = i18n.global.t;
const vhApp = VpnHoodApp.instance;
const pageInfo = computed((): RouteLocationNormalizedLoaded => {
  return router.currentRoute.value;
})
</script>

<template>
  <!-- Page header -->
  <div
    :class="[!vhApp.isConnectApp() ?'elevation-1 bg-app-bar' : 'text-white', 'mb-3 mx-n4']"
    :style="(!vhApp.isConnectApp() && vhApp.getEdgeToEdgeTopHeight()) ?
    `padding-top: ${vhApp.getEdgeToEdgeTopHeight()}px !important; margin-top: -${vhApp.getEdgeToEdgeTopHeight()}px !important;`: ''"
  >
    <template v-if="!Util.isTvDevice()">
      <!-- Back button -->
      <v-btn :icon="Util.getLocalizedLeftChevron()" variant="text" @click="router.go(-1)" />

      <!-- Page title -->
      <span class="text-body-1">{{locale(pageInfo.name.toString())}}</span>
    </template>

  </div>
</template>
