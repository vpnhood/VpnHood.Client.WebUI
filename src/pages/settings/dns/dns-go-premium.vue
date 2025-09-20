<script setup lang="ts">
import { Util } from '@/helpers/Util';
import router from '@/services/router';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

</script>

<template>
  <v-sheet :class="Util.getSpecialPageCardClass()">

      <div>
        <!-- Back button -->
        <tonal-icon-btn v-if="!vhApp.data.features.isTv"
          :icon="Util.getLocalizedLeftChevron()"
          @click="router.go(-1)"
        />

        <!-- Title and Description -->
        <div class="text-center">
          <h3 class="mb-2 text-promote-premium-color-premium" >{{locale('DNS')}}</h3>
          <p>{{locale('DNS_DESC')}}</p>
        </div>
      </div>

      <!-- Feature image -->
      <v-img
        eager
        :src="Util.getAssetPath('private-dns.webp')"
        alt="Symbol image"
        width="100%"
        max-height="250px"
        class="mx-auto"
      />

      <!-- Go premium button -->
      <card-on-grad class="pb-2">

        <!-- Description -->
        <v-card-item>
          <p class="text-white">{{ locale("GO_PREMIUM_AND_UNLOCK_FEATURES") }}</p>
        </v-card-item>

        <!-- Button -->
        <v-card-item>
          <btn-style-1
            prepend-icon="mdi-crown"
            color="promote-premium-color-premium"
            block
            :text="locale('GO_PREMIUM')"
            tabindex="0"
            @click="router.push({name: 'PURCHASE_SUBSCRIPTION'})"
          />
        </v-card-item>

      </card-on-grad>

  </v-sheet>
</template>


