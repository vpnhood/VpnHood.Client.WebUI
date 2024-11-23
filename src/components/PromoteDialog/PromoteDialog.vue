<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import PremiumConnectButton from '@/components/PromoteDialog/PremiumConnectButton.vue';
import i18n from '@/locales/i18n';
import { computed } from 'vue';
import { PromoteDialogData } from '@/components/PromoteDialog/PromoteDialogData';
import { ConnectPlanId } from '@/services/VpnHood.Client.Api';
import { type MyConnectPlanId, MyPlanId } from '@/components/PromoteDialog/MyConnectPlanIds';
import router from '@/services/router';

const props = defineProps<{
  modelValue: boolean,
}>();

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;
const dialogData = computed<PromoteDialogData>(() => vhApp.data.uiState.promoteDialogData);

const dialogTitle = computed<string>(() => dialogData.value.isPremiumLocation
  ? locale('SELECTED_LOCATION_IS_PREMIUM') : locale('SELECTED_LOCATION_IS_FREE'));

async function actionByConnectPlan(planId: MyConnectPlanId): Promise<void> {
  // TODO check with trudy
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
  <v-dialog
    :modelValue="props.modelValue"
    @update:modelValue="$emit('update:modelValue',$event)"
    :persistent="true"
    fullscreen
    content-class="pa-3"
    class="bg-black"
  >
    <v-card class="justify-space-between primary-bg-grad border border-secondary border-opacity-50 text-white rounded-lg pb-3 h-100">
      <div class="mt-5">
        <h3 class="text-center" v-html="dialogTitle" />
      </div>

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
        <v-row v-if="!dialogData.isPremiumLocation" dense align="center"
               class="button-wrapper border border-secondary border-opacity-100 px-2 py-1 mx-0 rounded-lg">
          <v-col>
            <h4 class="text-capitalize">{{locale('SELECTED_FREE_SERVER')}}</h4>
            <p class="text-disabled text-caption" style="line-height: 1.3">{{ locale('SELECTED_FREE_SERVER_DESC') }}</p>
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
        <div v-if="!dialogData.isPremiumLocation" class="d-flex align-center justify-center my-3 mx-10">
          <div class="w-100 border-b border-secondary-lighten-1"></div>
          <span class="position-relative text-secondary-lighten-1 text-h6 h2 px-4">{{locale('OR')}}</span>
          <div class="w-100 border-b border-secondary-lighten-1"></div>
        </div>

        <!-- Watch rewarded ad -->
        <premium-connect-button
          v-if="dialogData.showRewardedAd"
          icon="mdi-play-box-lock-open-outline"
          :title="locale('WATCH_REWARDED_AD')"
          :description="locale('WATCH_REWARDED_AD_DESC', {minutes: dialogData.showRewardedAd})"
          :button-text="locale('CONNECT')"
          :button-action-plan="ConnectPlanId.PremiumByRewardedAd"
          @action-by-plan="actionByConnectPlan"
        />

        <!-- Try premium -->
        <premium-connect-button
          v-if="dialogData.showTryPremium"
          icon="mdi-timer-lock-open-outline"
          :title="locale('TRY_PREMIUM')"
          :description="locale('TRY_PREMIUM_DESC', {minutes: dialogData.showTryPremium})"
          :button-text="locale('CONNECT')"
          :button-action-plan="ConnectPlanId.PremiumByTrial"
          @action-by-plan="actionByConnectPlan"
        />

        <!-- Go premium -->
        <premium-connect-button
          v-if="dialogData.showGoPremium"
          icon="mdi-crown-circle-outline"
          :title="locale('GO_PREMIUM_2')"
          :description="locale('GO_PREMIUM_DESC')"
          :button-text="locale('UPGRADE')"
          :button-action-plan="MyPlanId.premiumByPurchase"
          @action-by-plan="actionByConnectPlan"
        />

        <!-- Back button -->
        <v-btn
          rounded="pill"
          variant="text"
          :ripple="false"
          color="secondary"
          prepend-icon="mdi-chevron-left"
          class="opacity-60 text-capitalize align-self-start px-0 mt-3"
          :text="locale('GO_BACK')"
          @click="$emit('update:modelValue', false)"
        />

      </div>

    </v-card>
  </v-dialog>
</template>
