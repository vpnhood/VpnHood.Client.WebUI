<script setup lang="ts">
import { Util } from '@/helpers/Util';
import router from '@/services/router';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const props = defineProps<{
  title: string,
  description?: string,
  image: string,
  listStep?:  string[],
  buttonText?: string,
  buttonClick?: ()=>void,
  isPremium: boolean,
  isActionButtonAvailable: boolean,
  isShowSkipBtn?: boolean
}>();

function actionButtonClick(): void | null {
  return props.buttonClick ? props.buttonClick() : null;
}

</script>

<template>
  <grad-sheet>

    <div>
      <!-- Back button -->
      <tonal-icon-btn
        v-if="!vhApp.data.features.isTv"
        :icon="Util.getLocalizedLeftChevron()"
        @click="router.go(-1)"
        class="mt-3"
      />

      <!-- Title and Description -->
      <div class="text-center">
        <h3 class="mb-2" v-html="locale(props.title)" />
        <p v-if="props.description">{{locale(props.description)}}</p>
      </div>
    </div>

      <!-- Feature image -->
      <v-img
        :src="Util.getAssetPath(props.image)"
        alt="Symbol image"
        width="100%"
        max-height="240px"
        class="mx-auto my-4"
      />

    <!-- Cloak mode page -->
    <card-on-grad id="cloakMode" v-if="props.title === 'CLOAK_MODE_COLORED'">
      <v-card-item>
        <p v-html="locale('CLOAK_MODE_DESC_1')" style="line-height: 25px;" />
        <p class="mt-3" style="line-height: 25px;">{{locale('CLOAK_MODE_DESC_2')}}</p>
      </v-card-item>
    </card-on-grad>

    <!-- Private DNS error page -->
    <div v-else-if="props.title === 'PRIVATE_DNS_COLORED'">
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
            <p class="text-white text-caption">{{ locale("PRIVATE_DNS_TURN_OFF_MSG") }}</p>
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
      <div class="d-flex align-center justify-center w-50 my-3 mx-auto">
        <div class="w-100 border-b border-active border-opacity-25"></div>
        <span class="position-relative text-active h3 px-2">{{locale('OR')}}</span>
        <div class="w-100 border-b border-active border-opacity-25"></div>
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

    <!-- Tutorial steps -->
    <card-on-grad v-else-if="!props.isPremium || vhApp.data.isPremiumAccount" class="pb-2">

      <!-- Help steps -->
        <v-card-item v-if="props.listStep">
        <ol class="ms-3 d-flex flex-column ga-2 text-caption" style="line-height: 20px">
            <li
              v-for="(item, index) in props.listStep"
              :key="index"
              v-html="item"
              :class="{'border-b pb-2': index < props.listStep.length - 1}"
            />
          </ol>
        </v-card-item>

      <!-- Open related settings button (If request with API is available) -->
      <v-card-item v-if="props.isActionButtonAvailable">
        <btn-style-1
         :text="locale(props.buttonText ?? '')"
         block
         @click="actionButtonClick()"
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
          block
          :text="locale('GO_PREMIUM')"
          tabindex="0"
          @click="router.push({name: 'PURCHASE_SUBSCRIPTION'})"
        />
      </v-card-item>

    </card-on-grad>

  </grad-sheet>
</template>


