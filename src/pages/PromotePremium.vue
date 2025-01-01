<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import PromoteConnectButton from '@/components/PromoteConnectButton.vue';
import i18n from '@/locales/i18n';
import { computed } from 'vue';
import { PromotePremiumData } from '@/helpers/PromotePremium/PromotePremiumData';
import { ConnectPlanId } from '@/services/VpnHood.Client.Api';
import { type MyConnectPlanId, MyPlanId } from '@/helpers/PromotePremium/MyConnectPlanIds';
import router from '@/services/router';
import { Util } from '@/helpers/Util';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;
const dialogData = computed<PromotePremiumData>(() => vhApp.data.uiState.promotePremiumData);

const dialogTitle = computed<string>(() => dialogData.value.isPremiumLocation
  ? locale('SELECTED_LOCATION_IS_PREMIUM') : locale('SELECTED_LOCATION_IS_FREE'));

function isFreeAvailable(){
  return !dialogData.value.isPremiumLocation && dialogData.value.normal !== null;
}

async function actionByConnectPlan(planId: MyConnectPlanId): Promise<void> {
  // TODO: check with trudy
  if (!dialogData.value.clientProfileId || !dialogData.value.serverLocation)
    throw new Error("Could not found required data.");

  // Open PurchaseSubscription page
  if (planId === MyPlanId.premiumByPurchase){
    await router.push('/purchase-subscription');
    return;
  }

  await vhApp.connect(dialogData.value.clientProfileId, dialogData.value.serverLocation,
    dialogData.value.isPremiumLocation, planId);
}

</script>

<template>
  <v-sheet class="pa-3 h-100" color="black">

    <v-card
      class="d-flex flex-column justify-space-between primary-bg-grad border border-secondary border-opacity-50 text-white rounded-lg pb-3 h-100">

      <!-- Back button -->
      <v-btn
        variant="tonal"
        size="30"
        color="secondary"
        :icon="Util.getLocalizedLeftChevron()"
        class="opacity-70 text-capitalize ms-3 mt-3"
        @click="router.go(-1)"
      />

      <h3 class="text-center mt-5" v-html="dialogTitle" />

      <v-img
        :eager="true"
        :src="vhApp.getImageUrl(dialogData.isPremiumLocation ? 'premium-servers.webp' : 'free-to-premium-servers.webp')"
        alt="Servers Icon"
        width="100%"
        max-width="500px"
        class="mx-auto"
      />

      <div class="px-3">

        <!-- Continue as Free -->
        <v-row v-if="isFreeAvailable()"
           dense
           align="center"
           class="button-wrapper border border-secondary border-opacity-100 px-2 py-1 mx-0 rounded-lg"
               style="background-color: rgba(var(--v-theme-primary-lighten-1), 0.3);"
        >
          <v-col>
            <h4 class="text-capitalize">{{locale('SELECTED_FREE_SERVER')}}</h4>
            <p class="text-disabled text-caption" style="line-height: 1.3">
              {{ dialogData.normal === 0 ? locale('SELECTED_FREE_SERVER_DESC')
              : locale('SELECTED_FREE_SERVER_UNLIMITED_DESC', {minutes: dialogData.normal}) }}
            </p>
          </v-col>
          <v-col cols="auto" class="action-btn">
            <v-btn
              :text="locale('CONNECT')"
              color="secondary"
              class="text-white px-2"
              size="small"
              rounded="pill"
              variant="flat"
              @click="actionByConnectPlan(ConnectPlanId.Normal)"
            />
          </v-col>
        </v-row>

        <!-- Divider -->
        <div v-if="isFreeAvailable()" class="d-flex align-center justify-center my-5 mx-10">
          <div class="w-100 border-b border-secondary-lighten-1"></div>
          <span class="position-relative text-secondary-lighten-1 h3 px-4">{{locale('OR')}}</span>
          <div class="w-100 border-b border-secondary-lighten-1"></div>
        </div>

        <!-- Watch rewarded ad -->
        <promote-connect-button
          v-if="dialogData.showRewardedAd"
          icon="mdi-play-box-lock-open-outline"
          :title="locale('WATCH_REWARDED_AD')"
          :description="locale('WATCH_REWARDED_AD_DESC', {minutes: dialogData.showRewardedAd})"
          :button-text="locale('CONNECT')"
          :button-action-plan="ConnectPlanId.PremiumByRewardedAd"
          @action-by-plan="actionByConnectPlan"
        />

        <!-- Try premium -->
        <promote-connect-button
          v-if="dialogData.showTryPremium"
          icon="mdi-timer-lock-open-outline"
          :title="locale('TRY_PREMIUM')"
          :description="locale('TRY_PREMIUM_DESC', {minutes: dialogData.showTryPremium})"
          :button-text="locale('CONNECT')"
          :button-action-plan="ConnectPlanId.PremiumByTrial"
          @action-by-plan="actionByConnectPlan"
        />

        <!-- Go premium -->
        <promote-connect-button
          v-if="dialogData.premiumByPurchase"
          icon="mdi-crown-circle-outline"
          :title="locale('GO_PREMIUM_2')"
          :description="locale('GO_PREMIUM_DESC')"
          :button-text="locale('UPGRADE')"
          :button-action-plan="MyPlanId.premiumByPurchase"
          @action-by-plan="actionByConnectPlan"
        />

      </div>

    </v-card>
  </v-sheet>
</template>
