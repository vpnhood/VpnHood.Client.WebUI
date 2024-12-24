<script setup lang="ts">
import { BillingPurchaseState, SubscriptionPlan } from '@/services/VpnHood.Client.Api';
import { ClientApiFactory } from '@/services/ClientApiFactory';
import { onMounted, onUnmounted, ref } from 'vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import router from '@/services/router';
import { Util } from '@/helpers/Util';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const subscriptionPlans = ref<SubscriptionPlan[]>([]);
const showPurchaseCompleteDialog = ref<boolean>(false);
const purchaseCompleteMessage = ref<string | null>(null);
const premiumCode = ref<string | null>(null);
const premiumCodeErrorMessage = ref<string | null>(null);

onMounted(async () => {
  // Get products list from Google and sort based on plan prices
  const billingClient = ClientApiFactory.instance.createBillingClient();
  const cloneSubscriptionPlans = await billingClient.getSubscriptionPlans();
  cloneSubscriptionPlans.sort(
    (a, b) => Number((a.planPrice).replace(/\D/g, '')) -
      Number((b.planPrice).replace(/\D/g, '')));
  subscriptionPlans.value = cloneSubscriptionPlans;
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
  purchaseCompleteMessage.value = locale('PURCHASE_AND_PROCESS_IS_COMPLETE_MESSAGE');
  showPurchaseCompleteDialog.value = true;
}

async function closeOnPurchaseComplete(): Promise<void> {
  showPurchaseCompleteDialog.value = false;
  await router.replace('/');
}
</script>

<template>

  <v-sheet class="pa-3" color="black">

    <v-card max-width="600"
            class="d-flex flex-column justify-space-between primary-bg-grad border border-secondary border-opacity-50 text-white rounded-lg pb-5 h-100 mx-auto" >

      <!-- Back button -->
      <v-btn
        variant="tonal"
        size="30"
        color="secondary"
        :icon="Util.getLocalizedLeftChevron()"
        class="position-absolute opacity-70 text-capitalize ms-3 mt-3"
        style="z-index: 999"
        @click="router.go(-1)"
      />
      <!-- Title, image and features -->
      <div class="d-flex flex-column flex-grow-1">
        <h4 class="text-secondary-lighten-1 text-uppercase text-center mt-4">{{locale('GO_PREMIUM')}}</h4>
        <div id="rocketWrapper" class="mx-auto">
          <div id="rocket" class="animation-translate-y mx-auto" />
          <div id="rocketSmoke" class="mx-auto"/>
        </div>
        <ul id="featuresList" class="text-capitalize text-body-2 text-white px-5 mt-4" style="list-style: none;">
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

      <!-- Premium by google and by code buttons -->
      <div class="px-5 mt-4">

        <!-- Purchase by google -->
        <v-card v-if="vhApp.data.state.clientProfile?.selectedLocationInfo?.options.premiumByPurchase"
          class="py-3 px-3 rounded-lg text-white"
          color="rgba(var(--v-theme-primary-lighten-1), 0.3)"
        >
        <!-- Plan title, price -->
        <v-row justify="space-between">
          <v-col cols="auto" class="d-flex ga-1 align-center">
            <v-icon icon="mdi-crown" size="23" color="tertiary-lighten-1"/>
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
        <v-btn
          block
          rounded="pill"
          color="secondary-lighten-1"
          class="text-primary-darken-2 mt-1 font-weight-bold"
          variant="flat"
          :loading="!subscriptionPlans[0]?.subscriptionPlanId"
          :disabled="!subscriptionPlans[0]?.subscriptionPlanId"
          :text="locale('PURCHASE')"
          @click="onPurchaseClick(subscriptionPlans[0].subscriptionPlanId)"
        />

        <!-- Plan Descriptions -->
        <ul class="text-white opacity-30 ps-4 mt-2" style="font-size: 10px;">
          <li>{{ locale('PLANS_ARE_AUTOMATICALLY_RENEWED') }}</li>
          <li>{{ locale('CANCEL_ANYTIME_ON_GOOGLE_PLAY') }}</li>
        </ul>
        </v-card>

        <!-- Input premium code button and sheet -->
        <v-bottom-sheet v-if="vhApp.data.state.clientProfile?.selectedLocationInfo?.options.premiumByCode">
          <template v-slot:activator="{ props }">
            <v-card class="mt-4 py-1 rounded-lg" color="rgba(var(--v-theme-primary-lighten-1), 0.3)">
              <v-btn
                v-bind="props"
                block
                color="secondary"
                class="text-transform-none"
                variant="text"
                prepend-icon="mdi-key"
                :text="locale('I_HAVE_A_PREMIUM_CODE')"
              />
            </v-card>
          </template>

          <v-card
            prepend-icon="mdi-key"
            :color="vhApp.isConnectApp() ? 'primary-darken-2' : 'gray-lighten-6'"
            :title="locale('ENTER_PREMIUM_CODE')"
            class="pa-3 rounded-t-xl"
          >
            <v-divider/>
            <v-card-item >
              <h5 class="text-secondary">{{locale("IMPORTANT")}}:</h5>
              <p class="text-caption text-secondary mb-4">{{locale('ACTIVE_PREMIUM_KEY_EXPIRATION_NOTICE')}}</p>

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
                :autofocus="true"
                density="compact"
                color="secondary"
                variant="outlined"
                rounded="lg"
              />

              <v-btn
                block
                rounded="pill"
                color="secondary"
                variant="flat"
                :disabled="!premiumCode"
                :text="locale('CHECK_AND_ACTIVE')"
                class="text-transform-none mt-2"
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

      <v-card-text>{{ purchaseCompleteMessage }}</v-card-text>

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
  width: 100%;
  height: 57%;
}
/*TODO: remove if unnecessary*/
#rocket, #rocketSmoke{
  position: absolute;
  left: 0;
  right: 0;
  height: auto;
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
