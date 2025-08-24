<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { Util } from '@/helpers/Util';
import router from '@/services/router';
import { onMounted } from 'vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

onMounted(() => {
  if (!vhApp.data.userSettings.isTcpProxyPrompted){
    vhApp.data.userSettings.isTcpProxyPrompted = true;
    vhApp.saveUserSetting();
  }
})
</script>

<template>
  <v-sheet color="grad-bg-container-bg" class="pt-4">

    <v-card :class="Util.getSpecialPageCardClass()" class="px-3 pb-3">

      <!-- Back button -->
      <tonal-icon-btn
        v-if="!vhApp.data.features.isTv"
        :icon="Util.getLocalizedLeftChevron()"
        class="mt-3 "
        @click="router.go(-1)"
      />

      <!-- Title and Description -->
      <div class="text-center">
        <h3 class="mb-2" v-html="locale('CLOAK_MODE_COLORED')" />
      </div>

      <!-- Feature image -->
      <v-img
        :eager="true"
        :src="vhApp.getImageUrl('cloak-mode.webp')"
        alt="Symbol image"
        width="100%"
        max-width="500px"
        class="mx-auto"
      />

      <p v-html="locale('CLOAK_MODE_DESC_1')" style="line-height: 25px;" />
      <p class="mt-3" style="line-height: 25px;">{{locale('CLOAK_MODE_DESC_2')}}</p>

    </v-card>
  </v-sheet>
</template>
