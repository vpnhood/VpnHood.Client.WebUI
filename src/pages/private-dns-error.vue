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

    <v-card :class="Util.getSpecialPageCardClass()">

      <!-- Back button -->
      <tonal-icon-btn
        v-if="!vhApp.data.features.isTv"
        icon="mdi-close"
        class="ms-3 mt-3 "
        @click="router.go(-1)"
      />

      <div class="px-3">
        <h3 class="text-center mb-2" v-html="locale('PRIVATE_DNS_COLORED')" />
        <p>{{locale("PRIVATE_DNS_DIALOG_MSG")}}</p>
      </div>

      <v-img
        :eager="true"
        :src="vhApp.getImageUrl('private-dns.webp')"
        alt="DNS Icon"
        width="100%"
        max-width="500px"
        class="mx-auto"
      />

      <div class="px-3">

        <!-- Continue as Free -->
        <v-row
           dense
           v-ripple
           :autofocus="vhApp.data.features.isTv"
           align="center"
           class="px-2 py-1 mx-0 rounded-lg card-on-grad-bg"
           tabindex="1"
           @click="router.push({name: 'TURN_OFF_PRIVATE_DNS'})"
        >
          <v-col>
            <div class="d-flex align-center">
              <v-icon icon="mdi-server-off" color="promote-premium-color-free" size="25" class="me-2" />
              <p class="text-white text-caption">{{ locale("TURN_OFF_PRIVATE_DNS_MSG") }}</p>
            </div>
          </v-col>
          <v-col cols="auto" class="pe-0 action-btn">
            <v-chip
              variant="flat"
              color="btn-style-2"
              class="font-weight-bold"
              size="small"
              tabindex="-1"
              :text="locale('TURN_OFF')"
            />
          </v-col>
        </v-row>

        <!-- Divider -->
        <div class="d-flex align-center justify-center w-50 my-5 mx-auto">
          <div class="w-100 border-b border-active"></div>
          <span class="position-relative text-active h3 px-2">{{locale('OR')}}</span>
          <div class="w-100 border-b border-active"></div>
        </div>

        <v-row
          dense
          v-ripple
          align="center"
          class="px-2 py-1 mx-0 mb-3 rounded-lg card-on-grad-bg"
          @click="router.push({name: 'PURCHASE_SUBSCRIPTION'})"
        >
          <v-col>
            <div class="d-flex align-center">
              <v-icon icon="mdi-crown" color="promote-premium-color-premium" size="25" class="me-2" />
              <p class="text-white text-caption">{{ locale("GO_PREMIUM_AND_UNLOCK_FEATURES") }}</p>
            </div>

          </v-col>
          <v-col cols="auto" class="action-btn pe-0">
            <v-chip
              variant="flat"
              color="promote-premium-color-premium"
              class="font-weight-bold"
              :text="locale('GO_PREMIUM')"
              size="small"
              tabindex="-1"
            />
          </v-col>
        </v-row>

      </div>
    </v-card>
  </v-sheet>
</template>
