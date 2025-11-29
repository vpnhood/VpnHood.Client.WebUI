<script setup lang="ts">
import i18n from '@/locales/i18n';
import { GooglePlayBillingSubscriptionPeriods } from '@/helpers/googlePlayBilling/GooglePlayBillingSubscriptionPeriods';
import { ApiException, PurchaseParams, SubscriptionPlan } from '@/services/VpnHood.Client.Api';
import { ClientApiFactory } from '@/services/ClientApiFactory';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import PendingDialog from '@/components/PurchaseSubscription/PendingDialog.vue';
import PurchaseCompleteDialog from '@/components/PurchaseSubscription/PurchaseCompleteDialog.vue';
import { ref } from 'vue';
import { Util } from '@/helpers/Util';
import router from '@/services/router';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;
const isShowPurchaseCompleteDialog = ref(false);
const isShowPendingDialog = ref(false);
const basePrice = ref(0);

const props = defineProps<{
  subscriptionPlans: SubscriptionPlan[],
}>();

const oneMonthPlan = props.subscriptionPlans.find(
  plan => plan.period === GooglePlayBillingSubscriptionPeriods.P1M
);

basePrice.value = oneMonthPlan?.basePrice ?? 0;
const selectedPlan = ref<SubscriptionPlan>(oneMonthPlan ?? props.subscriptionPlans[0]);

async function onPurchase(): Promise<void> {
  if (!vhApp.data.userState.userAccount) await vhApp.signIn(true);
  const purchaseParams = new PurchaseParams({ purchaseToken: selectedPlan.value.planToken, })
  await purchase(purchaseParams);
}

async function purchase(purchaseParams: PurchaseParams): Promise<void> {
  isShowPendingDialog.value = true;
  try {
    const billingClient = ClientApiFactory.instance.createBillingClient();
    await billingClient.purchase(purchaseParams);
    await vhApp.loadAccount();
    isShowPurchaseCompleteDialog.value = true;
  }
  catch (err){
    console.error(err);
    if (err instanceof ApiException && err.exceptionTypeName === 'AlreadyExistsException'){
      await router.replace({name: 'PREMIUM_USER'});
      await vhApp.showErrorMessage(locale('HAVE_ACTIVE_SUBSCRIPTION'));
      return;
    }
    throw err;
  }
  finally {
    isShowPendingDialog.value = false;
  }
}

function getPlanTitle(planPeriod: string) {
  switch (planPeriod) {
    case GooglePlayBillingSubscriptionPeriods.P1M: return "1_MONTH";
    case GooglePlayBillingSubscriptionPeriods.P6M: return "6_MONTHS";
    case GooglePlayBillingSubscriptionPeriods.P1Y: return "1_YEAR";
    default: return "UNKNOWN_ERROR";
  }
}

function getPlanPricePeriod(planPeriod: string): string {
  switch (planPeriod) {
    case GooglePlayBillingSubscriptionPeriods.P1M: return "PER_MONTH";
    case GooglePlayBillingSubscriptionPeriods.P6M: return "PER_6_MONTHS";
    case GooglePlayBillingSubscriptionPeriods.P1Y: return "PER_YEAR";
    default: return "UNKNOWN_ERROR";
  }
}

function calcBasePrice(planPeriod: string): number {
  if (!basePrice.value) return 0;
  switch (planPeriod) {
    case GooglePlayBillingSubscriptionPeriods.P6M: return basePrice.value * 6;
    case GooglePlayBillingSubscriptionPeriods.P1Y: return basePrice.value * 12;
    default: return basePrice.value;
  }
}

function calcDiscountPercentage(currentPrice: number, planPeriod: string): number {
  if (!basePrice.value) return 0;
  switch (planPeriod) {
    case GooglePlayBillingSubscriptionPeriods.P6M: return Util.calcPercentage(basePrice.value * 6, currentPrice);
    case GooglePlayBillingSubscriptionPeriods.P1Y: return Util.calcPercentage(basePrice.value * 12, currentPrice);
    default: return Util.calcPercentage(basePrice.value, currentPrice);
  }
}

function isShowDiscount(currentPrice: number, planPeriod: string): boolean {
  return !(planPeriod === GooglePlayBillingSubscriptionPeriods.P1M && currentPrice === basePrice.value);
}
</script>

<template>

    <v-list id="planList" mandatory bg-color="transparent">
      <!-- Plan item -->
      <v-list-item
        v-for="(plan, index) in props.subscriptionPlans"
        :key="index"
        :active="plan.planToken === selectedPlan.planToken"
        active-class="border-md border-opacity-100"
        @click="selectedPlan = plan"
        rounded="lg"
        class="border-white py-3 mb-2 border border-opacity-25"
      >

        <!-- Plan title -->
        <v-list-item-title class="d-flex align-center">
          <span>{{ locale(getPlanTitle(plan.period)) }}</span>

          <!-- Discount percentage -->
          <v-chip
            v-if="isShowDiscount(plan.currentPrice, plan.period)"
            :text="`-${calcDiscountPercentage(plan.currentPrice, plan.period)}%`"
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
              v-if="isShowDiscount(plan.currentPrice, plan.period)"
              class="text-decoration-line-through text-caption text-disabled"
              style="line-height: 1"
            >
              {{ plan.currencySymbol }}{{ calcBasePrice(plan.period) }}
            </span>

            <!-- Discounted price -->
            <span class="d-flex align-center text-subtitle-1" style="line-height: 1">
              {{ plan.currencySymbol }}{{ plan.currentPrice }}
              <span class="text-caption text-disabled ms-1">
                {{ locale(getPlanPricePeriod(plan.period)) }}
              </span>
            </span>

          </div>
        </template>
      </v-list-item>
    </v-list>

    <!-- Plan Descriptions -->
    <ul class="text-white opacity-40 ps-4 mb-3 mt-2 text-caption">
      <li>
        {{ locale('AUTO_RENEW_AT') }}
        {{ selectedPlan.currencySymbol }}{{ selectedPlan.basePrice }}{{
          locale(getPlanPricePeriod(selectedPlan.period ??
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
      :loading="!selectedPlan"
      :disabled="!selectedPlan"
      :text="locale('PURCHASE')"
      @click="onPurchase()"
    />

    <!-- Pending purchase process dialog -->
    <pending-dialog :model-value="isShowPendingDialog" />

    <!-- Purchase complete dialog -->
    <purchase-complete-dialog :model-value="isShowPurchaseCompleteDialog" />

</template>

<!--suppress CssUnusedSymbol -->
<style>
#planList .v-list-item--active > .v-list-item__overlay,
#planList .v-list-item[aria-haspopup=menu][aria-expanded=true] > .v-list-item__overlay{
  opacity: .08;
}
</style>
