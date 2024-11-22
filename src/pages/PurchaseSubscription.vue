<script setup lang="ts">
import { SubscriptionPlan } from '@/services/VpnHood.Client.Api';
import { ClientApiFactory } from '@/services/ClientApiFactory';
import { onMounted, ref } from 'vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import router from '@/services/router';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const subscriptionPlans = ref<SubscriptionPlan[]>([]);
const showProcessDialog = ref<boolean>(false);
const showPurchaseCompleteDialog = ref<boolean>(false);

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

async function onPurchaseClick(planId: string): Promise<void> {
  if (!vhApp.data.userState.userAccount)
    await vhApp.signIn();

  if (vhApp.data.userState.userAccount?.providerPlanId === planId)
    throw new Error(locale('SELECTED_PLAN_ALREADY_SUBSCRIBED'));

  await purchase(planId);
}

async function purchase(planId: string): Promise<void> {
  const billingClient = ClientApiFactory.instance.createBillingClient();
  showProcessDialog.value = true;
  await billingClient.purchase(planId);
  await vhApp.loadAccount();
  showProcessDialog.value = false;
  showPurchaseCompleteDialog.value = true;
}

async function closeOnPurchaseComplete(): Promise<void> {
  showPurchaseCompleteDialog.value = false;
  await router.replace('/');
}

</script>

<template>

  <v-sheet class="pa-3" color="black">

    <v-card v-if="subscriptionPlans.length > 0" max-width="375"
      class="d-flex flex-column justify-space-between primary-bg-grad border border-secondary border-opacity-50 text-white rounded-lg pb-3 h-100 mx-auto" >

      <!-- Title, image and features -->
      <div>
        <div id="rocketWrapper" class="mx-auto">
          <h3 class="text-secondary-lighten-1 text-uppercase text-center mt-4">{{locale('GO_PREMIUM')}}</h3>
          <img
            id="rocket"
            :src="vhApp.getImageUrl('rocket.webp')"
            alt="Rocket"
            width="70"
            height="164"
            class="animation-translate-y mx-auto"
          />
          <img
            id="rocketSmoke"
            :src="vhApp.getImageUrl('rocket-smoke.webp')"
            alt="Rocket smoke"
            width="104"
            height="84"
            class="mx-auto"
          />
        </div>
        <ul id="featuresList" class="text-capitalize text-white px-5 mt-3" style="list-style: none;">
          <li>
            <v-icon icon="mdi-check-circle" size="16" color="secondary" class="me-2"/>
            {{locale('ULTRA_FAST_SPEED')}}
          </li>
          <li>
            <v-icon icon="mdi-check-circle" size="16" color="secondary" class="me-2"/>
            {{locale('REMOVE_AD')}}
          </li>
          <li>
            <v-icon icon="mdi-check-circle" size="16" color="secondary" class="me-2"/>
            {{locale('MORE_LOCATIONS')}}
          </li>
          <li>
            <v-icon icon="mdi-check-circle" size="16" color="secondary" class="me-2"/>
            {{locale('ALWAYS_ON')}}
          </li>
          <li>
            <v-icon icon="mdi-check-circle" size="16" color="secondary" class="me-2"/>
            {{locale('QUICK_LAUNCH')}}
          </li>
          <li>
            <v-icon icon="mdi-check-circle" size="16" color="secondary" class="me-2"/>
            {{locale('SUPPORT')}}
          </li>
        </ul>
      </div>

      <!-- Plan title, price, purchase button and back button -->
      <div class="px-5 mt-6">

        <!-- Plan title, price -->
        <v-row justify="space-between" class="mx-0">
          <v-col cols="auto" class="d-flex ga-1 align-items-center">
            <v-icon icon="mdi-crown" size="23" color="tertiary-lighten-1"/>
            <!-- TODO must change to subscriptionPlanId -->
            <span class="font-weight-bold text-body-1">{{locale('1_MONTH')}}</span>
          </v-col>
          <v-col cols="auto">
            <span class="font-weight-bold text-body-1">{{subscriptionPlans[0].planPrice}}</span>
            <span class="text-caption">{{locale('PER_MONTH')}}</span>
          </v-col>
        </v-row>

        <!-- Purchase button -->
        <v-btn
          block
          rounded="pill"
          color="secondary-lighten-1"
          class="text-primary-darken-2 mt-2 font-weight-bold"
          variant="flat"
          :text="locale('PURCHASE')"
          @click="onPurchaseClick(subscriptionPlans[0].subscriptionPlanId)"
        />

        <!-- Plan Descriptions -->
        <ul class="text-white opacity-30 text-caption ps-4 mt-2">
          <li>{{ locale('PLANS_ARE_AUTOMATICALLY_RENEWED') }}</li>
          <li>{{ locale('CANCEL_ANYTIME_ON_GOOGLE_PLAY') }}</li>
        </ul>


        <!-- Back button -->
        <v-btn
          rounded="pill"
          variant="text"
          :ripple="false"
          color="secondary"
          prepend-icon="mdi-chevron-left"
          class="opacity-60 text-capitalize align-self-start px-0 mt-3"
          :text="locale('GO_BACK')"
          @click="router.go(-1)"
        />
      </div>

        <!-- Multi Plans -->
<!--        <v-list v-if="subscriptionPlans.length > 1" bg-color="transparent">
          &lt;!&ndash; Plan item &ndash;&gt;
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
            @click="onPurchaseClick(plan.subscriptionPlanId)"
          >

            &lt;!&ndash; Plan title &ndash;&gt;
            <v-list-item-title class="d-flex align-center">
              <span v-if="plan.subscriptionPlanId === SubscriptionPlansId.GlobalServer">
                {{ locale('GLOBAL_SERVERS') }}
              </span>
            </v-list-item-title>

            &lt;!&ndash; Already subscribed &ndash;&gt;
            <v-list-item-subtitle
              v-if="vhApp.data.userState.userAccount?.providerPlanId === plan.subscriptionPlanId"
              class="text-caption text-secondary-lighten-1"
            >
              {{ locale('ALREADY_SUBSCRIBED') }}
            </v-list-item-subtitle>

            &lt;!&ndash; Plan price &ndash;&gt;
            <template v-slot:append>
              <div class="text-end text-subtitle-2 text-secondary">
                <span>{{ plan.planPrice }}</span>
                <span>{{ locale('PER_MONTH') }}</span>
              </div>
              &lt;!&ndash;suppress NestedConditionalExpressionJS &ndash;&gt;
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
        </v-list>-->

        <!-- Single Plan -->
<!--        <v-list v-else bg-color="transparent">

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

            &lt;!&ndash; Plan title &ndash;&gt;
            <v-list-item-title class="d-flex align-center">
              <span v-if="plan.subscriptionPlanId === SubscriptionPlansId.GlobalServer">
                {{ locale('GLOBAL_SERVERS') }}
              </span>
            </v-list-item-title>

            &lt;!&ndash; Already subscribed &ndash;&gt;
            <v-list-item-subtitle
              v-if="vhApp.data.userState.userAccount?.providerPlanId === plan.subscriptionPlanId"
              class="text-caption text-secondary-lighten-1"
            >
              {{ locale('ALREADY_SUBSCRIBED') }}
            </v-list-item-subtitle>

            &lt;!&ndash; Plan price &ndash;&gt;
            <template v-slot:append>
              <div class="text-end text-subtitle-2 text-secondary">
                <span>{{ plan.planPrice }}</span>
                <span>{{ locale('PER_MONTH') }}</span>
              </div>
              &lt;!&ndash;suppress NestedConditionalExpressionJS &ndash;&gt;
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
        </v-list>-->

    </v-card>

  </v-sheet>

  <!-- Pending purchase process dialog -->
  <v-dialog
    v-model="showProcessDialog"
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
#rocketWrapper{
  position: relative;
  background: url('@/assets/images/rocket-bg.webp') no-repeat top center;
  background-size: contain;
  width: 250px;
  height: 302px;
}
#rocket, #rocketSmoke{
  position: absolute;
  left: 0;
  right: 0;
  height: auto;
}
#rocket{
  width: 59px;
  height: 138px;
  bottom: 95px;
  z-index: 1;
}
#rocketSmoke{
  width: 104px;
  height: 84px;
  bottom: 50px;
  z-index: 2;
}
#featuresList>li{
  padding: 3px 0;
}
</style>
