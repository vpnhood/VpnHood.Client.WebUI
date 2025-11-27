<script setup lang="ts">
import { PurchaseParams } from '@/services/VpnHood.Client.Api';
import { ClientApiFactory } from '@/services/ClientApiFactory';
import { onMounted } from 'vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import router from '@/services/router';
import { Util } from '@/helpers/Util';
import { GooglePlayBillingSubscriptionPeriods } from '@/helpers/googlePlayBilling/GooglePlayBillingSubscriptionPeriods';
import PremiumFeaturesCarousel from '@/components/PurchaseSubscription/PremiumFeaturesCarousel.vue';
import GooglePlayUnavailable from '@/components/PurchaseSubscription/GooglePlayUnavailable.vue';
import PremiumByCode from '@/components/PurchaseSubscription/PremiumByCode.vue';
import { PurchaseSubscriptionUtil } from '@/helpers/PurchaseSubscriptionUtil';
import PurchaseCompleteDialog from '@/components/PurchaseSubscription/PurchaseCompleteDialog.vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const {
  purchaseOptions,
  showPurchaseViaWeb,
  showPurchaseViaGoogle,
  isGoogleBillingAvailable,
  subscriptionPlans,
  purchaseCompleteDialogMessage,
  selectedPlan,
  basePrice,
  isShowProcessDialog,
} = PurchaseSubscriptionUtil


onMounted(async () => {
  // Check eligibility to purchase by Google
  if (vhApp.data.state.clientProfile?.selectedLocationInfo?.options.premiumByPurchase !== true){
    isGoogleBillingAvailable.value = false;
    showPurchaseViaGoogle.value = false;
    return;
  }

  // Get the purchase options
  const billingClient = ClientApiFactory.instance.createBillingClient();
  purchaseOptions.value = await billingClient.getPurchaseOptions();

  showPurchaseViaWeb.value = !!purchaseOptions.value.purchaseUrl;
  showPurchaseViaGoogle.value = !!purchaseOptions.value.storeName;
  isGoogleBillingAvailable.value = purchaseOptions.value.subscriptionPlans.length > 0;

  // Find 1-Month Plan
  const oneMonthPlan = purchaseOptions.value.subscriptionPlans.find(plan => plan.period === GooglePlayBillingSubscriptionPeriods.P1M);

  if (!isGoogleBillingAvailable.value || !oneMonthPlan)
    return;

  basePrice.value = oneMonthPlan.basePrice;
  selectedPlan.value = oneMonthPlan;
  subscriptionPlans.value = purchaseOptions.value.subscriptionPlans;
});

async function onPurchaseClick(): Promise<void> {

  if (!selectedPlan.value)
    throw new Error("Selected plan is not defined.");

  // Login if not logged in
  if (!vhApp.data.userState.userAccount)
    await vhApp.signIn(true);

  const purchaseParams = new PurchaseParams({
    purchaseToken: selectedPlan.value.planToken
  })
  // Start google billing flow
  await purchase(purchaseParams);
}

async function purchase(purchaseParams: PurchaseParams): Promise<void> {
  vhApp.data.uiState.showLoadingDialog = true;
  try {
    const billingClient = ClientApiFactory.instance.createBillingClient();
    // TODO: remove
    console.log(purchaseParams);
    await billingClient.purchase(purchaseParams);
    await vhApp.loadAccount();
    purchaseCompleteDialogMessage.value = locale('PURCHASE_AND_PROCESS_IS_COMPLETE_MESSAGE');
  }
  finally {
    vhApp.data.uiState.showLoadingDialog = false;
  }
}

</script>

<template>
  <grad-sheet>

      <!-- Back button -->
      <tonal-icon-btn
        v-if="!vhApp.data.features.isTv"
        :icon="Util.getLocalizedLeftChevron()"
        class="position-absolute mt-3"
        style="z-index: 999"
        @click="router.go(-1)"
      />

      <!-- Features Carousel -->
      <div class="d-flex align-center justify-center flex-grow-1">
        <premium-features-carousel/>
      </div>


      <!-- Premium by google and by code buttons -->
      <div class="mt-4">

        <!-- Purchase by google -->
        <template v-if="isGoogleBillingAvailable">

          <!-- Show skeleton loader till to load google play info -->
          <v-skeleton-loader
           v-if="subscriptionPlans.length === 0"
           color="rgba(var(--v-theme-card-on-grad-bg), 0.3)"
           type="heading, subtitle"
           class="mb-4"
           height="125px"
          />

          <template v-else-if="showPurchaseViaGoogle">
            <v-list id="planList" mandatory bg-color="transparent">
              <!-- Plan item -->
              <v-list-item
                v-for="(plan, index) in subscriptionPlans"
                :key="index"
                :active="plan.planToken === selectedPlan?.planToken"
                active-class="border-md border-opacity-100"
                @click="selectedPlan = plan"
                rounded="lg"
                class="border-white py-3 mb-2 border border-opacity-25"
              >

                <!-- Plan title -->
                <v-list-item-title class="d-flex align-center">
                  <span>{{ locale(PurchaseSubscriptionUtil.getPlanTitle(plan.period)) }}</span>

                  <!-- Discount percentage -->
                  <v-chip
                    v-if="PurchaseSubscriptionUtil.isShowDiscount(plan.currentPrice, plan.period)"
                    :text="`-${PurchaseSubscriptionUtil.calcDiscountPercentage(plan.currentPrice, plan.period)}%`"
                    size="small"
                    density="comfortable"
                    variant="flat"
                    color="enable-premium"
                    class="ms-3"
                  />
                </v-list-item-title>

                <!-- Plan price -->
                <template v-slot:append>
                  <div class="d-flex flex-column align-end">

                    <!-- Base price -->
                    <span
                      v-if="PurchaseSubscriptionUtil.isShowDiscount(plan.currentPrice, plan.period)"
                      class="text-decoration-line-through text-caption text-disabled"
                      style="line-height: 1"
                    >
                      {{ plan.currencySymbol }}{{ PurchaseSubscriptionUtil.calcBasePrice(plan.period) }}
                    </span>

                    <!-- Discounted price -->
                    <span class="d-flex align-center text-subtitle-1" style="line-height: 1">
                      {{ plan.currencySymbol }}{{ plan.currentPrice }}
                      <span class="text-caption text-disabled ms-1">
                        {{locale(PurchaseSubscriptionUtil.getPlanPricePeriod(plan.period)) }}
                      </span>
                    </span>

                  </div>
                </template>
              </v-list-item>
            </v-list>

            <!-- Plan Descriptions -->
            <ul class="text-white opacity-40 ps-4 mb-3 mt-2 text-caption">
              <li>
                {{locale('AUTO_RENEW_AT')}}
                {{ selectedPlan?.currencySymbol }}{{ selectedPlan?.basePrice }}{{
                  locale(PurchaseSubscriptionUtil.getPlanPricePeriod(selectedPlan?.period ??
                    GooglePlayBillingSubscriptionPeriods.P1M)) }}
              </li>
              <li>{{ locale('CANCEL_ANYTIME_ON_GOOGLE_PLAY') }}</li>
            </ul>

            <v-btn
              variant="flat"
              rounded="pill"
              color="purchase-subscription-btn"
              class="text-transform-none font-weight-bold mt-1"
              block
              height="40px"
              :loading="!subscriptionPlans[0]?.planToken"
              :disabled="!subscriptionPlans[0]?.planToken"
              :text="locale('PURCHASE')"
              @click="onPurchaseClick()"
            />
          </template>
        </template>

        <!-- Google Play unavailable -->
        <google-play-unavailable v-else/>

        <!-- Purchase Via Web -->
        <btn-style-1
          v-if="showPurchaseViaWeb && purchaseOptions?.purchaseUrl"
          class="mt-4 text-premium-code-btn"
          block
          rounded="pill"
          height="40px"
          color="rgba(var(--v-theme-card-on-grad-bg), 0.3)"
          prepend-icon="mdi-web"
          :text="locale('PURCHASE_VIA_WEB')"
          target="_blank"
          :href="purchaseOptions.purchaseUrl"
        />

        <!-- Input premium code -->
        <premium-by-code />
      </div>


    <!-- Pending purchase process dialog -->
    <v-dialog :model-value="isShowProcessDialog" :persistent="true">
      <v-card color="general-dialog">
        <v-card-text class="text-general-dialog-text text-body-2">
          {{ locale('WAITING_TO_COMPLETE_ORDER_PROCESS') }}
          <v-progress-linear :indeterminate="true" height="2" rounded="true" class="my-3" />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Purchase complete dialog -->
    <purchase-complete-dialog :model-value="purchaseCompleteDialogMessage != null" />

  </grad-sheet>
</template>

<style scoped>
#activationInfo > li {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

<!--suppress CssUnusedSymbol -->
<style>
#planList .v-list-item--active > .v-list-item__overlay,
#planList .v-list-item[aria-haspopup=menu][aria-expanded=true] > .v-list-item__overlay{
  opacity: .08;
}
</style>
