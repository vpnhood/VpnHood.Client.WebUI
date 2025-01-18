<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import router from '@/services/router';
import { ref } from 'vue';
import { ConnectPlanId } from '@/services/VpnHood.Client.Api';
import { type MyConnectPlanId, MyPlanId } from '@/helpers/PromotePremium/MyConnectPlanIds';
import PromoteConnectButton from '@/components/PromoteConnectButton.vue';
import { Util } from '@/helpers/Util';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const showLoadingAdDialog = ref<boolean>(false);

async function actionByConnectPlan(planId: MyConnectPlanId): Promise<void>{
  switch (planId) {
    case MyPlanId.premiumByPurchase:
      await router.push('/purchase-subscription');
      break;
    case ConnectPlanId.PremiumByRewardedAd:
      if (!vhApp.data.state.sessionStatus?.accessUsage?.canExtendByRewardedAd)
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
    await router.replace("/");
  }
  finally {
    showLoadingAdDialog.value = false;
  }
}
</script>

<template>

  <v-sheet color="colored-bg-dark">
    <v-card class="d-flex flex-column justify-space-between primary-bg-grad border border-highlight border-opacity-50 text-white rounded-lg pb-3 h-100">

      <!-- Back button -->
      <v-btn
        variant="tonal"
        size="30"
        color="highlight"
        :icon="Util.getLocalizedLeftChevron()"
        class="opacity-70 text-capitalize ms-3 mt-3"
        @click="router.go(-1)"
      />

      <h3 class="mt-5 text-center" v-html="locale('EXTEND_PREMIUM_SESSION')" />

      <v-img
        :eager="true"
        :src="vhApp.getImageUrl('extend-session.webp')"
        alt="Session Icon"
        width="100%"
        max-width="500px"
        class="mx-auto"
      />

      <div class="px-3">

        <!-- Watch rewarded ad -->
        <promote-connect-button
          :class="{'opacity-30': !vhApp.data.state.sessionStatus?.accessUsage?.canExtendByRewardedAd}"
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
          v-if="vhApp.data.features.isBillingSupported"
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
  <v-dialog v-model="showLoadingAdDialog" :persistent="true" max-width="320">
    <v-card rounded="lg" color="background">
      <v-card-text class="text-center">
        <v-progress-circular color="highlight" class="mb-2" :indeterminate="true" size="30" width="2"/>
        <p class="text-caption mb-5">{{locale("LOADING_AD")}}...</p>
        <v-alert
          :icon="false"
          :text="locale('EXTEND_BY_REWARDED_AD_NOTE')"
          class="text-caption text-start"
          density="compact"
          type="warning"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
