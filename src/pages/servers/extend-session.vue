<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import router from '@/services/router';
import { computed, ref } from 'vue';
import { ConnectPlanId } from '@/services/VpnHood.Client.Api';
import { type MyConnectPlanId, MyPlanId } from '@/helpers/PromotePremium/MyConnectPlanIds';
import PromoteConnectButton from '@/components/PromoteConnectButton.vue';
import { Util } from '@/helpers/Util';
import { PromotePremiumData } from '@/helpers/PromotePremium/PromotePremiumData';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const showLoadingAdDialog = ref<boolean>(false);
const dialogData = computed<PromotePremiumData>(() => vhApp.data.uiState.promotePremiumData);
async function actionByConnectPlan(planId: MyConnectPlanId): Promise<void>{
  switch (planId) {
    case MyPlanId.premiumByPurchase:
      await router.push({name: 'PURCHASE_SUBSCRIPTION'});
      break;
    case ConnectPlanId.PremiumByRewardedAd:
      if (!vhApp.data.state.sessionStatus?.canExtendByRewardedAd)
        break;
      await showRewardedAd();
      break;
    default:
      throw new Error(`Plan is not supported. PlanId: ${planId}`);
  }
}
async function showRewardedAd(){
  try {
    showLoadingAdDialog.value = true;
    await vhApp.apiClient.extendByRewardedAd();
    vhApp.showGeneralSnackbar(locale("EXTEND_BY_REWARDED_AD_CONFIRM_MSG"), "active");
    await router.replace({name: 'HOME'});
  }
  finally {
    showLoadingAdDialog.value = false;
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

      <h3 class="mt-5 text-center" v-html="locale('EXTEND_PREMIUM_SESSION')" />

      <v-img
        :eager="true"
        :src="vhApp.getImageUrl('extend-session.webp')"
        alt="Session Icon"
        width="100%"
        max-width="400px"
        class="mx-auto"
      />

      <div class="px-3">

        <!-- Watch rewarded ad -->
        <promote-connect-button
          :class="{'opacity-30': !vhApp.data.state.sessionStatus?.canExtendByRewardedAd}"
          icon="mdi-play-box-lock-open-outline"
          :title="locale('WATCH_REWARDED_AD')"
          :description="locale('EXTEND_BY_REWARDED_AD_DESC', {minutes:
              vhApp.data.state.clientProfile?.selectedLocationInfo?.options.premiumByRewardedAd})"
          :button-text="locale('SHOW_AD')"
          :button-action-plan="ConnectPlanId.PremiumByRewardedAd"
          @action-by-plan="actionByConnectPlan"
        />

        <!-- Go premium -->
        <promote-connect-button
          v-if="dialogData.premiumByPurchase || dialogData.premiumByCode"
          icon="mdi-crown-circle-outline"
          :title="locale('GO_PREMIUM')"
          :description="locale('GO_PREMIUM_DESC')"
          :button-text="locale('UPGRADE')"
          :button-action-plan="MyPlanId.premiumByPurchase"
          @action-by-plan="actionByConnectPlan"
        />

      </div>
    </v-card>

    <!--TODO: Use general dialog-->
    <v-dialog v-model="showLoadingAdDialog" :persistent="true">
      <v-card color="general-dialog" :title="locale('LOADING_AD')">
        <v-card-text class="text-general-dialog-text text-body-2">
          {{locale('EXTEND_BY_REWARDED_AD_NOTE')}}
        </v-card-text>
        <v-card-item class="text-center pt-0">
          <v-progress-circular class="mb-3" :indeterminate="true" size="30" width="2"/>
        </v-card-item>
      </v-card>
    </v-dialog>

  </v-sheet>
</template>
