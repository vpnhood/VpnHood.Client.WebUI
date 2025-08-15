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
  if (!dialogData.value.clientProfileId || !dialogData.value.serverLocation)
    throw new Error("Could not found required data.");

  // Open the PurchaseSubscription page
  if (planId === MyPlanId.premiumByPurchase || planId === MyPlanId.premiumByCode){
    await router.push({name: 'PURCHASE_SUBSCRIPTION'});
    return;
  }

  try {
    await vhApp.connect(dialogData.value.clientProfileId, dialogData.value.serverLocation,
      dialogData.value.isPremiumLocation, planId, false);
  }
  catch{
    // Ignore message
  }

}

</script>

<template>
  <v-sheet color="grad-bg-container-bg" class="pt-4">

    <v-card :class="Util.getSpecialPageCardClass()">

      <!-- Back button -->
      <tonal-icon-btn
        v-if="!vhApp.data.features.isTv"
        :icon="Util.getLocalizedLeftChevron()"
        class="ms-3 mt-3"
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
           v-ripple
           :autofocus="vhApp.data.features.isTv"
           align="center"
           class="px-2 py-1 mx-0 rounded-lg card-on-grad-bg"
           tabindex="1"
           @click="actionByConnectPlan(ConnectPlanId.Normal)"
        >
          <v-col>
            <h4 class="text-capitalize">{{locale('SELECTED_FREE_SERVER')}}</h4>
            <p class="text-white opacity-40 text-caption" style="line-height: 1.3">
              {{ dialogData.normal === 0 ? locale('SELECTED_FREE_SERVER_DESC')
              : locale('SELECTED_FREE_SERVER_UNLIMITED_DESC', {minutes: dialogData.normal}) }}
            </p>
          </v-col>
          <v-col cols="auto" class="pe-0 action-btn">
            <v-chip
              variant="flat"
              color="btn-style-2"
              class="font-weight-bold"
              size="small"
              tabindex="-1"
              :text="locale('CONNECT')"
            />
          </v-col>
        </v-row>

        <!-- Divider -->
        <div v-if="isFreeAvailable()" class="d-flex align-center justify-center w-50 my-5 mx-auto">
          <div class="w-100 border-b border-active"></div>
          <span class="position-relative text-active h3 px-2">{{locale('OR')}}</span>
          <div class="w-100 border-b border-active"></div>
        </div>

        <!-- Watch rewarded ad -->
        <promote-connect-button
          v-if="dialogData.showRewardedAd"
          tabindex="1"
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
          tabindex="1"
          icon="mdi-timer-lock-open-outline"
          :title="locale('TRY_PREMIUM')"
          :description="locale('TRY_PREMIUM_DESC', {minutes: dialogData.showTryPremium})"
          :button-text="locale('CONNECT')"
          :button-action-plan="ConnectPlanId.PremiumByTrial"
          @action-by-plan="actionByConnectPlan"
        />

        <!-- Go premium -->
        <promote-connect-button
          v-if="dialogData.premiumByPurchase || dialogData.premiumByCode"
          tabindex="1"
          icon="mdi-crown-circle-outline"
          :title="locale('GO_PREMIUM')"
          :description="locale('GO_PREMIUM_DESC')"
          :button-text="locale('UPGRADE')"
          :button-action-plan="MyPlanId.premiumByPurchase"
          @action-by-plan="actionByConnectPlan"
        />

      </div>

    </v-card>
  </v-sheet>
</template>
