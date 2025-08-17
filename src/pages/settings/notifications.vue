<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import router from '@/services/router';
import { Util } from '@/helpers/Util';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;
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

      <div class="text-center">
        <h3 class="mb-2" v-html="locale('APP_NOTIFICATIONS_COLORED')" />
        <p>{{locale("NOTIFICATIONS_DESC")}}</p>
      </div>

      <v-img
        :eager="true"
        :src="vhApp.getImageUrl('notifications.webp')"
        alt="DNS Icon"
        width="100%"
        max-width="500px"
        class="mx-auto"
      />

      <config-card class="pb-2">
        <v-card-item>
          <p>{{locale("NOTIFICATION_HOW_TO_TURN_ON")}}</p>
        </v-card-item>
        <v-card-item>
          <btn-style-1
            :text="locale('TURN_ON_NOTIFICATION')"
            block
            @click="vhApp.intentsClient.openAppSystemNotificationSettings()"
          />
        </v-card-item>
      </config-card>

    </v-card>
  </v-sheet>
</template>
