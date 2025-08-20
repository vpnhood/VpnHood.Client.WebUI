<script setup lang="ts">
import { Util } from '@/helpers/Util';
import router from '@/services/router';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const props = defineProps<{
  title: string,
  description: string,
  image: string,
  listStep:  string[],
  buttonText: string,
  buttonClick: ()=>void,
  isPremium: boolean,
}>();
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
        <h3 class="mb-2" v-html="locale(props.title)" />
        <p>{{locale(props.description)}}</p>
      </div>

      <!-- Feature image -->
      <v-img
        :eager="true"
        :src="vhApp.getImageUrl(props.image)"
        alt="Symbol image"
        width="100%"
        max-width="500px"
        class="mx-auto"
      />

      <!-- Tutorial steps -->
      <config-card v-if="!props.isPremium || vhApp.isPremiumAccount()" class="pb-2">
        <v-card-item>
          <ol class="ms-3 d-flex flex-column ga-2 text-caption" style="line-height: 20px">
            <li v-for="(item, index) in props.listStep" :key="index" v-html="item"/>
          </ol>
        </v-card-item>
        <v-card-item>
          <btn-style-1
            :text="locale(props.buttonText)"
            block
            @click="props.buttonClick()"
          />
        </v-card-item>
      </config-card>

      <!-- Go premium button -->
      <v-row v-else
        dense
        v-ripple
        align="center"
        class="px-2 py-1 mx-0 mb-3 rounded-lg card-on-grad-bg flex-grow-0"
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
    </v-card>
  </v-sheet>
</template>


