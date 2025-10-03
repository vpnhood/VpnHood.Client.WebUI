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
  <div class="d-flex align-center justify-center position-relative text-white mb-5 pt-6 pb-3">
    <template v-if="!vhApp.data.features.isTv">
      <!-- Back button -->
      <v-btn
        :icon="Util.getLocalizedLeftChevron()"
        variant="text"
        width="43px"
        height="43px"
        position="absolute"
        style="border-radius: 18px; border: 1px solid #ffffff2e; inset-inline-start: 0;"
        @click="router.go(-1)"
      />

      <!-- Page title -->
      <p class="text-capitalize text-body-1">{{locale(pageInfo.name.toString())}}</p>
    </template>

  </div>
</template>
