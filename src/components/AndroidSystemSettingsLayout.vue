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
  isActionButtonAvailable: boolean,
  isShowSkipBtn?: boolean
}>();
</script>

<template>
  <v-sheet color="grad-bg-container-bg" class="pt-4">

    <v-card :class="Util.getSpecialPageCardClass()" class="px-3 pb-3">

      <!-- Back button -->
      <tonal-icon-btn v-if="!vhApp.data.features.isTv"
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
      <card-on-grad v-if="!props.isPremium || vhApp.isPremiumAccount()" class="pb-2">

        <!-- Help steps -->
          <v-card-item>
          <ol class="ms-3 d-flex flex-column ga-2 text-caption" style="line-height: 20px">
              <li v-for="(item, index) in props.listStep" :key="index" v-html="item"/>
            </ol>
          </v-card-item>

        <!-- Open related settings button (If request with API is available) -->
        <v-card-item v-if="props.isActionButtonAvailable">
          <btn-style-1
           color="promote-premium-color-premium"
           :text="locale(props.buttonText)"
           block
           @click="props.buttonClick()"
          />
        </v-card-item>

        <!-- Skip button -->
        <v-card-item v-if="props.isShowSkipBtn">
          <btn-style-2
            :text="locale('SKIP')"
            block
            @click="router.go(-1)"
          />
        </v-card-item>

      </card-on-grad>

      <!-- Go premium button -->
      <card-on-grad v-else class="pb-2">

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

    </v-card>
  </v-sheet>
</template>


