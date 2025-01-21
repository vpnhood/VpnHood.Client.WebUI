<script setup lang="ts">
import { ApiException, BillingPurchaseState, SubscriptionPlan } from '@/services/VpnHood.Client.Api';
import { ClientApiFactory } from '@/services/ClientApiFactory';
import { onMounted, onUnmounted, ref } from 'vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import router from '@/services/router';
import { Util } from '@/helpers/Util';
import { GooglePlayBillingResponseCode } from '@/helpers/googlePlayBilling/GooglePlayBillingResponseCode';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;
// TODO: Improve this page
const subscriptionPlans = ref<SubscriptionPlan[]>([]);
const showPurchaseCompleteDialog = ref<boolean>(false);
const premiumCode = ref<string | null>(null);
const premiumCodeErrorMessage = ref<string | null>(null);
const isGooglePlayAvailable = ref<boolean>(true);
const isGoogleBillingAvailable = ref<boolean>(true);

onMounted(async () => {
  if (vhApp.data.state.clientProfile?.selectedLocationInfo?.options.premiumByPurchase){
    try {
      // Get products list from Google and sort based on plan prices
      const billingClient = ClientApiFactory.instance.createBillingClient();
      const cloneSubscriptionPlans = await billingClient.getSubscriptionPlans();
      cloneSubscriptionPlans.sort(
        (a, b) => Number((a.planPrice).replace(/\D/g, '')) -
          Number((b.planPrice).replace(/\D/g, '')));
      subscriptionPlans.value = cloneSubscriptionPlans;
    }
    catch (err: unknown){
      if (!(err instanceof ApiException))
        throw err;

      if (err.exceptionTypeName === "GoogleBillingException" && err.data.BillingResponseCode === GooglePlayBillingResponseCode.ServiceUnavailable){
        isGoogleBillingAvailable.value = false;
        return;
      }

      if (err.exceptionTypeName === "GooglePlayUnavailableException")
        isGooglePlayAvailable.value = false;

      throw err;
    }
  }
});

onUnmounted(() => {
    premiumCode.value = '';
    premiumCodeErrorMessage.value = '';
})

async function onPurchaseClick(planId: string): Promise<void> {
  if (!vhApp.data.userState.userAccount)
    await vhApp.signIn();

  if (vhApp.data.userState.userAccount?.providerPlanId === planId)
    throw new Error(locale('SELECTED_PLAN_ALREADY_SUBSCRIBED'));

  await purchase(planId);
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

  <v-sheet color="grad-bg-container-bg">

    <v-card max-width="600"
            class="d-flex flex-column justify-space-between primary-bg-grad border border-highlight border-opacity-50 rounded-xl fill-height mx-auto">

      <!-- Back button -->
      <tonal-icon-btn
        :icon="Util.getLocalizedLeftChevron()"
        class="position-absolute ms-3 mt-3"
        style="z-index: 999"
        @click="router.go(-1)"
      />
      <!-- Title, image and features -->
      <div class="d-flex flex-column flex-grow-1">
        <h4 class="text-active text-uppercase text-center mt-4">{{locale('GO_PREMIUM')}}</h4>
        <div id="rocketWrapper" class="mx-auto">
          <div id="rocket" class="animation-translate-y mx-auto" />
          <div id="rocketSmoke" class="mx-auto"/>
        </div>
        <v-defaults-provider :defaults="{
          'VIcon': {
            'icon': 'mdi-check-circle',
            'color': 'highlight',
            'size': '18',
            'class': 'me-2',
          }
        }">
          <ul id="featuresList" class="text-capitalize text-body-2 text-white px-5 mt-4" style="list-style: none;">
            <li>
              <v-icon/>
              {{locale('ULTRA_FAST_SPEED')}}
            </li>
            <li>
              <v-icon/>
              {{locale('REMOVE_AD')}}
            </li>
            <li>
              <v-icon/>
              {{locale('MORE_LOCATIONS')}}
            </li>
            <li>
              <v-icon/>
              {{locale('FILTER_IP_ADDRESSES')}}
            </li>
            <li>
              <v-icon/>
              {{locale('ALWAYS_ON')}}
            </li>
            <li>
              <v-icon/>
              {{locale('QUICK_LAUNCH')}}
            </li>
            <li>
              <v-icon/>
              {{locale('SUPPORT')}}
            </li>
          </ul>
        </v-defaults-provider>
      </div>

      <!-- Premium by google and by code buttons -->
      <div class="px-5 mt-4">

        <!-- Purchase by google -->
        <v-card v-if="isGooglePlayAvailable &&
        vhApp.data.state.clientProfile?.selectedLocationInfo?.options.premiumByPurchase"
          class="py-3 px-3 rounded-lg text-white mb-4"
          :class="{'border border-error border-opacity-100': !isGoogleBillingAvailable}"
          color="rgba(var(--v-theme-card-on-grad-bg), 0.3)"
        >
          <template v-if="isGoogleBillingAvailable">
            <!-- Plan title, price -->
            <v-row justify="space-between">
              <v-col cols="auto" class="d-flex ga-1 align-center">
                <v-icon icon="mdi-crown" size="23" color="disable-premium"/>
                <!-- TODO: must change to subscriptionPlanId -->
                <span class="font-weight-bold text-body-2">{{locale('1_MONTH')}}</span>
              </v-col>
              <v-col cols="auto" class="d-flex ga-1 align-center">
                <span v-if="subscriptionPlans[0]?.planPrice" class="font-weight-bold text-body-2">
                  {{subscriptionPlans[0].planPrice}}
                </span>
                <v-progress-circular
                  v-else
                  size="18"
                  indeterminate
                  width="1"
                />
                <span class="text-caption">{{locale('PER_MONTH')}}</span>
              </v-col>
            </v-row>

            <!-- Purchase button -->
            <btn-style-1
              block
              class="mt-1"
              :loading="!subscriptionPlans[0]?.subscriptionPlanId"
              :disabled="!subscriptionPlans[0]?.subscriptionPlanId"
              :text="locale('PURCHASE')"
              @click="onPurchaseClick(subscriptionPlans[0].subscriptionPlanId)"
            />

            <!-- Plan Descriptions -->
            <ul class="text-disabled opacity-50 ps-4 mt-2" style="font-size: 10px;">
              <li>{{ locale('PLANS_ARE_AUTOMATICALLY_RENEWED') }}</li>
              <li>{{ locale('CANCEL_ANYTIME_ON_GOOGLE_PLAY') }}</li>
            </ul>
          </template>

          <template v-else>
            <v-icon class="pe-3" color="error" icon="mdi-alert-circle-outline"/>
            <span class="text-error text-caption">{{locale('GOOGLE_PLAY_BILLING_UNAVAILABLE')}}</span>
            <v-btn
              :text="locale('MORE_INFO')"
              color="error"
              variant="tonal"
              rounded="pill"
              size="small"
              block
              class="text-lowercase mt-2"
              @click="vhApp.showErrorMessage(locale('GOOGLE_BILLING_BILLING_UNAVAILABLE'))"
            />
          </template>

        </v-card>

        <!-- Input premium code button and sheet -->
        <v-bottom-sheet v-if="vhApp.data.state.clientProfile?.selectedLocationInfo?.options.premiumByCode">
          <template v-slot:activator="{ props }">
            <v-card class="py-1 rounded-lg mb-4" color="rgba(var(--v-theme-card-on-grad-bg), 0.3)">
              <v-btn
                v-bind="props"
                block
                :ripple="false"
                color="highlight"
                variant="text"
                prepend-icon="mdi-key"
                :text="locale('I_HAVE_A_PREMIUM_CODE')"
              />
            </v-card>
          </template>

          <v-card
            prepend-icon="mdi-key"
            color="background"
            class="rounded-b-0"
            :title="locale('ENTER_PREMIUM_CODE')"
          >
            <v-card-item class="pt-0">
              <alert-note :text="locale('ACTIVE_PREMIUM_KEY_EXPIRATION_NOTICE')" class="mb-2"/>

              <v-text-field
                v-model="premiumCode"
                :error-messages="premiumCodeErrorMessage"
                :placeholder="locale('INTER_YOUR_CODE')"
                hide-details
                single-line
                clearable
                spellcheck="false"
                autocomplete="off"
                dir="ltr"
                density="compact"
                color="highlight"
                variant="outlined"
                rounded="md"
                class="mb-5"
              />

              <btn-style-2
                block
                :disabled="!premiumCode"
                :text="locale('CHECK_AND_ACTIVE')"
              />
            </v-card-item>

          </v-card>
        </v-bottom-sheet>

      </div>

      <!-- TODO: review after enable more subscriptions -->
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
    :model-value="vhApp.data.state.purchaseState === BillingPurchaseState.Processing"
    :persistent="true"
  >
    <v-card color="general-dialog">
      <v-card-text class="text-general-dialog-text text-body-2">
        {{ locale('WAITING_TO_COMPLETE_ORDER_PROCESS') }}
        <v-progress-linear :indeterminate="true" height="2" rounded="true" class="my-3" />
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Purchase complete dialog -->
  <v-dialog v-model="showPurchaseCompleteDialog">
    <v-card color="active">
      <v-card-title class="text-center pt-4">
        <v-icon class="text-h2">mdi-party-popper</v-icon>
        <h2>{{ locale('CONGRATULATIONS') }}</h2>
      </v-card-title>

      <v-card-text>{{ locale('PURCHASE_AND_PROCESS_IS_COMPLETE_MESSAGE') }}</v-card-text>

      <v-card-actions>
        <v-btn :text="locale('CLOSE')" @click="closeOnPurchaseComplete" />
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<style scoped>
#rocketWrapper{
  position: relative;
  background: url('@/assets/images/rocket-bg.webp') no-repeat top center;
  background-size: contain;
  width: 100%;
  height: 57%;
  min-height: 150px;
  max-height: 335px;
}
#rocket, #rocketSmoke{
  position: absolute;
  left: 0;
  right: 0;
}
#rocket{
  background: url('@/assets/images/rocket.webp') no-repeat top center;
  background-size: contain;
  width: 100%;
  height: 41%;
  bottom: 35%;
  z-index: 1;
}
#rocketSmoke{
  background: url('@/assets/images/rocket-smoke.webp') no-repeat top center;
  background-size: contain;
  width: 42%;
  height: 29%;
  bottom: 16%;
  z-index: 2;
}
#featuresList>li{
  padding: 2px 0;
}
</style>
