<script setup lang="ts">
import AppBar from '@/components/AppBar.vue';
import { SubscriptionPlansId } from '@/helper/UiConstants';
import { BillingPurchaseState, SubscriptionPlan } from '@/services/VpnHood.Client.Api';
import { ClientApiFactory } from '@/services/ClientApiFactory';
import { onMounted, ref } from 'vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import router from '@/services/router';
import vuetify from '@/services/vuetify';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const subscriptionPlans = ref<SubscriptionPlan[]>([]);
const selectedPlanId = ref<string>('');
const planTitle = ref<string>('');
const planDetails = ref<string>('');
const showPurchaseCompleteDialog = ref<boolean>(false);
const showPlanDetailsDialog = ref<boolean>(false);

onMounted(async () => {
  vhApp.data.uiState.showLoadingDialog = true;

  // Get products list from Google and sort based on plan prices
  try {
    const billingClient = ClientApiFactory.instance.createBillingClient();
    const cloneSubscriptionPlans = await billingClient.getSubscriptionPlans();
    cloneSubscriptionPlans.sort(
      (a, b) => Number((a.planPrice).replace(/\D/g, '')) -
        Number((b.planPrice).replace(/\D/g, '')));
    subscriptionPlans.value = cloneSubscriptionPlans;
  } catch (err: unknown) {
    await router.replace('/');
    throw err;
  } finally {
    vhApp.data.uiState.showLoadingDialog = false;
  }
});

function showPlanDetails(planId: string): void {
  if (vhApp.data.userState.userAccount?.providerPlanId === planId)
    return;

  // Defined plan title and details to show in the dialog
  switch (planId) {
    case SubscriptionPlansId.GlobalServer:
      planTitle.value = 'GLOBAL_SERVERS';
      planDetails.value = 'GLOBAL_SERVERS_NOTICE';
      break;
  }

  // Save user selected plan id for continue purchase
  selectedPlanId.value = planId;
  showPlanDetailsDialog.value = true;
}

async function onBuyClick(): Promise<void> {
  showPlanDetailsDialog.value = false;
  if (!vhApp.data.userState.userAccount)
    await vhApp.signIn();

  if (vhApp.data.userState.userAccount?.providerPlanId === selectedPlanId.value)
    throw new Error(locale('SELECTED_PLAN_ALREADY_SUBSCRIBED'));

  await purchase(selectedPlanId.value);
}

async function purchase(planId: string): Promise<void> {
  const billingClient = ClientApiFactory.instance.createBillingClient();
  await billingClient.purchase(planId);
  await vhApp.loadAccount();
  showPurchaseCompleteDialog.value = true;
}

async function closeOnPurchaseComplete(): Promise<void> {
  showPurchaseCompleteDialog.value = false;
  await router.replace('/');
}

</script>

<template>

  <!-- Page header -->
  <AppBar :page-title="locale('PURCHASE_SUBSCRIPTION')" />

  <v-sheet class="pa-4" color="primary-darken-2">

    <v-card color="transparent" flat v-if="subscriptionPlans.length > 0">
      <!-- Products list -->
      <v-card-item class="bg-primary-darken-2 border border-tertiary border-opacity-50 rounded-xl pa-3 mb-3 w-100">
        <!-- Image -->
        <v-img :eager="true" :src="vhApp.getImageUrl('ad-icon.png')" :alt="locale('PREMIUM_SERVER_AD_TITLE')"
               max-width="150px"
               class="mx-auto" />

        <!-- Title -->
        <h3 class="title-bold text-tertiary text-uppercase text-center pb-2 mb-2">
          {{ locale('PREMIUM_SERVER_AD_TITLE') }}</h3>

        <!-- Description -->
        <ul id="subscriptionFeaturesList">
          <li>
            <span class="feature-title"></span>
            <h4 class="text-center text-white opacity-60">{{ locale('FREE') }}</h4>
            <h4 class="text-center text-secondary-lighten-1">{{ locale('PREMIUM') }}</h4>
          </li>
          <li>
            <span class="feature-title">{{ locale('SPEED') }}</span>
            <span class="free-feature">{{ locale('UNLIMITED') }}</span>
            <span class="free-feature">{{ locale('UNLIMITED') }}</span>
          </li>
          <li>
            <span class="feature-title">{{ locale('TRAFFIC') }}</span>
            <span class="free-feature">{{ locale('UNLIMITED') }}</span>
            <span class="free-feature">{{ locale('UNLIMITED') }}</span>
          </li>
          <li>
            <span class="feature-title">{{ locale('NO_ADS') }}</span>
            <span class="free-feature"><v-icon icon="mdi-closeDialog" /></span>
            <span class="premium-feature"><v-icon icon="mdi-check" /></span>
          </li>
          <li>
            <span class="feature-title">{{ locale('ALWAYS_ON') }}</span>
            <span class="free-feature"><v-icon icon="mdi-closeDialog" /></span>
            <span class="premium-feature"><v-icon icon="mdi-check" /></span>
          </li>
          <li>
            <span class="feature-title">{{ locale('SUPPORT') }}</span>
            <span class="free-feature"><v-icon icon="mdi-closeDialog" /></span>
            <span class="premium-feature"><v-icon icon="mdi-check" /></span>
          </li>
        </ul>
      </v-card-item>

      <!-- Plans list -->
      <v-card-item class="pa-0 w-100">

        <!-- Multi Plans -->
        <v-list v-if="subscriptionPlans.length > 1" bg-color="transparent">
          <!-- Plan item -->
          <v-list-item
            v-for="plan in subscriptionPlans"
            :key="plan.subscriptionPlanId"
            color="white"
            rounded="lg"
            base-color="primary-darken-2"
            variant="flat"
            :class="[vhApp.data.userState.userAccount?.providerPlanId === plan.subscriptionPlanId
            ? 'border-secondary-lighten-1 border-opacity-100 py-2'
            : 'border-secondary border-opacity-25 py-3', 'mb-3 pe-2 border']"
            @click="showPlanDetails(plan.subscriptionPlanId)"
          >

            <!-- Plan title -->
            <v-list-item-title class="d-flex align-center">
              <span v-if="plan.subscriptionPlanId === SubscriptionPlansId.GlobalServer">
                {{ locale('GLOBAL_SERVERS') }}
              </span>
            </v-list-item-title>

            <!-- Already subscribed -->
            <v-list-item-subtitle
              v-if="vhApp.data.userState.userAccount?.providerPlanId === plan.subscriptionPlanId"
              class="text-caption text-secondary-lighten-1"
            >
              {{ locale('ALREADY_SUBSCRIBED') }}
            </v-list-item-subtitle>

            <!-- Plan price -->
            <template v-slot:append>
              <div class="text-end text-subtitle-2 text-secondary">
                <span>{{ plan.planPrice }}</span>
                <span>{{ locale('PER_MONTH') }}</span>
              </div>
              <!--suppress NestedConditionalExpressionJS -->
              <v-icon
                :icon="vhApp.data.userState.userAccount?.providerPlanId === plan.subscriptionPlanId
                      ? 'mdi-check-decagram'
                      : vuetify.locale.isRtl.value? 'mdi-chevron-left' : 'mdi-chevron-right'"
                :color="vhApp.data.userState.userAccount?.providerPlanId === plan.subscriptionPlanId
                      ? 'secondary-lighten-1'
                      : 'tertiary'"
                class="ms-2"
              />
            </template>
          </v-list-item>
        </v-list>

        <!-- Single Plan -->
        <v-list v-else bg-color="transparent">

          <v-list-item
            v-for="plan in subscriptionPlans"
            :key="plan.subscriptionPlanId"
            color="white"
            rounded="lg"
            base-color="primary-darken-2"
            variant="flat"
            :class="[vhApp.data.userState.userAccount?.providerPlanId === plan.subscriptionPlanId
            ? 'border-secondary-lighten-1 border-opacity-100 py-2'
            : 'border-secondary border-opacity-25 py-3', 'mb-3 pe-2 border']"
            @click="showPlanDetails(plan.subscriptionPlanId)"
          >

            <!-- Plan title -->
            <v-list-item-title class="d-flex align-center">
              <span v-if="plan.subscriptionPlanId === SubscriptionPlansId.GlobalServer">
                {{ locale('GLOBAL_SERVERS') }}
              </span>
            </v-list-item-title>

            <!-- Already subscribed -->
            <v-list-item-subtitle
              v-if="vhApp.data.userState.userAccount?.providerPlanId === plan.subscriptionPlanId"
              class="text-caption text-secondary-lighten-1"
            >
              {{ locale('ALREADY_SUBSCRIBED') }}
            </v-list-item-subtitle>

            <!-- Plan price -->
            <template v-slot:append>
              <div class="text-end text-subtitle-2 text-secondary">
                <span>{{ plan.planPrice }}</span>
                <span>{{ locale('PER_MONTH') }}</span>
              </div>
              <!--suppress NestedConditionalExpressionJS -->
              <v-icon
                :icon="vhApp.data.userState.userAccount?.providerPlanId === plan.subscriptionPlanId
                      ? 'mdi-check-decagram'
                      : vuetify.locale.isRtl.value? 'mdi-chevron-left' : 'mdi-chevron-right'"
                :color="vhApp.data.userState.userAccount?.providerPlanId === plan.subscriptionPlanId
                      ? 'secondary-lighten-1'
                      : 'tertiary'"
                class="ms-2"
              />
            </template>
          </v-list-item>
        </v-list>

      </v-card-item>


      <ul class="text-white opacity-30 text-caption ps-4">
        <li>{{ locale('PLANS_ARE_AUTOMATICALLY_RENEWED') }}</li>
        <li>{{ locale('CANCEL_ANYTIME_ON_GOOGLE_PLAY') }}</li>
      </ul>
    </v-card>

  </v-sheet>

  <!-- Plan details dialog on purchase subscription -->
  <v-dialog v-model="showPlanDetailsDialog" max-width="600">
    <v-card color="primary-darken-2">

      <!-- Plan title -->
      <v-card-title class="text-secondary d-flex">
        <span :class="[vuetify.locale.isRtl.value? 'me-1' : 'order-1 ms-1']">{{ locale('SUBSCRIPTION') }}</span>
        <span>{{ locale(planTitle) }}</span>
      </v-card-title>

      <!-- Plan description -->
      <v-card-text>{{ locale(planDetails) }}</v-card-text>

      <!-- Dialog buttons -->
      <v-card-actions>
        <v-spacer />
        <!-- Close button -->
        <v-btn
          variant="text"
          color="secondary"
          :text="locale('CLOSE')"
          @click="showPlanDetailsDialog = false"
        />
        <!-- Buy button -->
        <v-btn
          variant="tonal"
          color="secondary"
          class="px-6"
          :text="locale('BUY')"
          @click="onBuyClick"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Pending purchase process dialog -->
  <v-dialog
    :model-value="vhApp.data.state.purchaseState === BillingPurchaseState.Processing"
    :persistent="true"
    max-width="600"
  >
    <v-card rounded="lg" color="secondary">
      <v-card-text class="px-3">
        {{ locale('WAITING_TO_COMPLETE_ORDER_PROCESS') }}
        <v-progress-linear :indeterminate="true" rounded="true" class="mt-3 mb-4" />
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Purchase complete dialog -->
  <v-dialog v-model="showPurchaseCompleteDialog" max-width="600">
    <v-card rounded="lg" color="secondary">
      <v-card-title class="text-center">
        <v-icon class="text-h2">mdi-party-popper</v-icon>
        <h2>{{ locale('CONGRATULATIONS') }}</h2>
      </v-card-title>

      <v-card-text>{{ locale('PURCHASE_AND_PROCESS_IS_COMPLETE_MESSAGE') }}</v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          rounded="pill"
          variant="text"
          color="primary"
          :text="locale('CLOSE')"
          @click="closeOnPurchaseComplete"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<style scoped>
#subscriptionFeaturesList > li {
  display: flex;
  justify-content: space-between;
  padding: 6px 5px;
}

#subscriptionFeaturesList > li:not(:first-child) {
  font-size: 12px;
}

#subscriptionFeaturesList > li:nth-child(even) {
  /*noinspection CssUnresolvedCustomProperty*/
  background-color: rgba(var(--v-theme-primary), 50%);
  border-radius: 3px;
}

#subscriptionFeaturesList > li > *:first-child {
  width: 44%;
}

#subscriptionFeaturesList > li > *:not(:first-child) {
  width: 28%;
}

.feature-title {
  /*noinspection CssUnresolvedCustomProperty*/
  color: rgb(var(--v-theme-secondary));
  min-width: 50px;
  font-size: 14px;
}

.free-feature {
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
}

.premium-feature {
  /*noinspection CssUnresolvedCustomProperty*/
  color: rgb(var(--v-theme-secondary-lighten-1));
  text-align: center;
}
</style>
