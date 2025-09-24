<script setup lang="ts">
import {
  AppPurchaseOptions,
  BillingPurchaseState,
  ClientProfileUpdateParams, ConnectPlanId,
  PatchOfString,
  SubscriptionPlan
} from '@/services/VpnHood.Client.Api';
import { ClientApiFactory } from '@/services/ClientApiFactory';
import { computed, onBeforeMount, onMounted, ref, watchEffect } from 'vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import router from '@/services/router';
import { Util } from '@/helpers/Util';
import { ComponentRouteController } from '@/services/ComponentRouteController';
import { ComponentName } from '@/helpers/UiConstants';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

// TODO: Improve this page
const purchaseOptions = ref<AppPurchaseOptions | null>(null);
const showPurchaseViaWeb = ref<boolean>(false);
const showPurchaseViaGoogle = ref<boolean>(false);
const isGoogleBillingAvailable = ref<boolean>(true);
const subscriptionPlans = ref<SubscriptionPlan[]>([]);
const showProcessDialog = ref<boolean>(false);
const purchaseCompleteDialogMessage = ref<string | null>(null);

const premiumCodeForm = ref<boolean>(false);
const formattedPremiumCode = ref('');
const premiumCodeRawNumber = ref<string>('');
const invalidCodeError = ref<null|string>(null);
const isShowCarouselArrow = ref<boolean>(true);

interface CarouselItem {
  image: string,
  title: string,
  description: string,
  height: string,
}

const carouselItems: CarouselItem[] = [
  {
    image: "ultra-fast-server.webp",
    title: "ULTRA_FAST_SPEED",
    description: "ULTRA_FAST_SPEED_DESC",
    height: "200px",
  },
  {
    image: "no-ads.webp",
    title: "REMOVE_AD",
    description: "REMOVE_AD_DESC",
    height: "200px",
  },
  {
    image: "more-location.webp",
    title: "MORE_LOCATIONS",
    description: "MORE_LOCATIONS_DESC",
    height: "200px",
  },
  {
    image: "split-ip.webp",
    title: "SPLIT_IP_ADDRESSES",
    description: "SPLIT_IP_ADDRESSES_PREMIUM_DESC",
    height: "200px",
  },
  {
    image: "private-dns.webp",
    title: "PRIVATE_AND_CUSTOM_DNS",
    description: "PRIVATE_AND_CUSTOM_DNS_DESC",
    height: "200px",
  },
  {
    image: "quick-launch.webp",
    title: "QUICK_LAUNCH",
    description: "QUICK_LAUNCH_DESC",
    height: "200px",
  },
  {
    image: "always-on.webp",
    title: "ALWAYS_ON",
    description: "ALWAYS_ON_PREMIUM_DESC",
    height: "200px",
  },
  {
    image: "support.webp",
    title: "24_7_SUPPORT",
    description: "24_7_SUPPORT_DESC",
    height: "200px",
  },
]

const isNewCode = computed<boolean | undefined>(() => {
  return vhApp.data.state.sessionInfo?.accessInfo?.isNew;
});
const premiumCodeDeviceCount = computed<number | undefined>(() => {
  return vhApp.data.state.sessionInfo?.accessInfo?.devicesSummary?.deviceCount;
});
const premiumCodeActivationDate = computed<Date | undefined>(() => {
  return vhApp.data.state.sessionInfo?.accessInfo?.createdTime;
});
const premiumCodeExpirationDate = computed<Date | null | undefined>(() => {
  return vhApp.data.state.sessionInfo?.accessInfo?.expirationTime;
});

const premiumCodeNumberRule = (value: string) => {
  return /^[0-9\-]*$/.test(value) || locale('PREMIUM_CODE_NUMBER_RULE_MSG');
};

const premiumCodeCountRule = (value: string) => {
  const count = value.replace(/-/g, '').length;
  return count == 20 || locale('PREMIUM_CODE_COUNT_RULE_MSG');
};

// Keep only numbers and limit to 20 characters
const premiumCodeHandleInput = (event: Event) => {
  if (invalidCodeError.value) invalidCodeError.value = null;
  const value = (event.target as HTMLInputElement).value;
  premiumCodeRawNumber.value = value.replace(/\D/g, '').slice(0, 20);
};

// Add a dash every 4 characters during input premium code
watchEffect(() => {
  formattedPremiumCode.value = premiumCodeRawNumber.value.match(/.{1,4}/g)?.join('-') || '';
});

// Use one dialog for purchase by Google and premium code
const isShowProcessDialog = computed<boolean>(() => {
  return vhApp.data.state.purchaseState === BillingPurchaseState.Processing || showProcessDialog.value;
});

// preload the rocket images
onBeforeMount(() => {
  const preloadImages = [
    Util.getAssetPath('rocket-bg.webp'),
    Util.getAssetPath('rocket-smoke.webp'),
    Util.getAssetPath('rocket.webp'),
  ];

  preloadImages.forEach(src => {
    const img = new Image();
    img.src = src;
  });
})

onMounted(async () => {

  // Hide the carousel arrow after 3 seconds
 /* setTimeout(() => {
    isShowCarouselArrow.value = false;
  }, 6000);*/

  // Check eligibility to purchase by Google
  if (vhApp.data.state.clientProfile?.selectedLocationInfo?.options.premiumByPurchase !== true){
    isGoogleBillingAvailable.value = false;
    showPurchaseViaGoogle.value = false;
    return;
  }

  // Get the purchase availability methods
  const billingClient = ClientApiFactory.instance.createBillingClient();
  purchaseOptions.value = await billingClient.getPurchaseOptions();

  // Show purchase via web
  showPurchaseViaWeb.value = !!purchaseOptions.value.purchaseUrl;

  // Show purchase via Google
  showPurchaseViaGoogle.value = !!purchaseOptions.value.storeName;

  // Google billing is not available
  isGoogleBillingAvailable.value = purchaseOptions.value.subscriptionPlans.length > 0;

  // Sort plans based on plan prices
  if (isGoogleBillingAvailable.value) {
    subscriptionPlans.value = purchaseOptions.value.subscriptionPlans.sort(
      (a, b) => Number((a.planPrice).replace(/\D/g, '')) -
        Number((b.planPrice).replace(/\D/g, ''))
    );
  }

});

async function onPurchaseClick(planId: string): Promise<void> {
  // Login if not logged in
  if (!vhApp.data.userState.userAccount)
    await vhApp.signIn(true);

  // Check if the user is premium by selected plan
  if (vhApp.data.userState.userAccount?.providerPlanId === planId)
    throw new Error(locale('SELECTED_PLAN_ALREADY_SUBSCRIBED'));

  // Start google billing flow
  await purchase(planId);
}

async function purchase(planId: string): Promise<void> {
  vhApp.data.uiState.showLoadingDialog = true;
  try {
    const billingClient = ClientApiFactory.instance.createBillingClient();
    await billingClient.purchase(planId);
    await vhApp.loadAccount();
    vhApp.data.uiState.showLoadingDialog = false;
    purchaseCompleteDialogMessage.value = locale('PURCHASE_AND_PROCESS_IS_COMPLETE_MESSAGE');
  }
  finally {
    vhApp.data.uiState.showLoadingDialog = false;
  }
}

async function validatePremiumCode(): Promise<void> {
  if (!premiumCodeRawNumber.value)
    return;

  const profileId = vhApp.data.state.clientProfile?.clientProfileId;
  if (!profileId)
    throw new Error(locale("PROFILE_ID_NOT_FOUND_DURING_VALIDATION_MSG"));

  try {
    await vhApp.clientProfileClient.update(profileId, new ClientProfileUpdateParams({
      accessCode: new PatchOfString({ value: premiumCodeRawNumber.value.toString() })
    }));

    await validateCodeViaAccessServer(profileId);
  }
  catch{
    invalidCodeError.value = locale("INVALID_PREMIUM_CODE_NUMBERS_MSG");
  }

}
async function validateCodeViaAccessServer(profileId: string): Promise<void>{
  try {
    showProcessDialog.value = true;

    await vhApp.connect(profileId, undefined, true, ConnectPlanId.Normal, false, false);

    if (vhApp.data.isConnected && vhApp.data.isPremiumAccount && vhApp.data.hasPremiumCode)
      purchaseCompleteDialogMessage.value = locale('PREMIUM_CODE_PROCESS_IS_COMPLETE_MESSAGE');
  }
  catch {
    await vhApp.removePremiumCode()
  }
  finally {
    showProcessDialog.value = false;
  }
}
function closeCompleteDialog(showStatistics: boolean) {
  purchaseCompleteDialogMessage.value = null;
  router.replace({ name: showStatistics ? 'STATISTICS' : 'HOME' });
}
</script>

<template>
  <v-sheet :class="Util.getSpecialPageCardClass()">

      <!-- Back button -->
      <tonal-icon-btn
        v-if="!vhApp.data.features.isTv"
        :icon="Util.getLocalizedLeftChevron()"
        class="position-absolute"
        style="z-index: 999"
        @click="router.go(-1)"
      />

      <div class="d-flex align-center justify-center flex-grow-1">
        <v-carousel
          id="featuresCarousel"
          :show-arrows="isShowCarouselArrow"
          delimiter-icon="mdi-circle"
          color="highlight"
          height="380"
          hide-delimiter-background
          class="text-white text-center"
        >
          <!-- Carousel arrows -->
          <template v-slot:prev="{ props }">
            <v-btn color="highlight" :icon="Util.getLocalizedLeftChevron()" size="40" variant="text" @click="props.onClick" />
          </template>
          <template v-slot:next="{ props }">
            <v-btn color="highlight" :icon="Util.getLocalizedRightChevron()" size="40" variant="text"
                   @click="props.onClick" />
          </template>

          <!-- Carousel items -->
          <v-carousel-item v-for="item in carouselItems" :key="item.title" eager>
            <template v-slot:default>

              <div v-if="item.title === 'ULTRA_FAST_SPEED'" id="rocketWrapper" class="mx-auto mb-4">
                <div id="rocket" class="animation-translate-y mx-auto" />
                <div id="rocketSmoke" class="mx-auto" />
              </div>

              <v-img
                v-else
                eager
                :src="Util.getAssetPath(item.image)"
                alt="Symbol image"
                width="100%"
                :height="item.height"
                class="mx-auto mb-5"
              />
                <h3 class="mb-2">{{locale(item.title)}}</h3>
                <p class="text-subtitle-2 text-medium-emphasis px-3">{{locale(item.description)}}</p>
            </template>
          </v-carousel-item>
        </v-carousel>
      </div>


      <!-- Premium by google and by code buttons -->
      <div class="mt-4">

        <!-- Show skeleton loader till to load google play info -->
        <v-skeleton-loader v-if="subscriptionPlans.length === 0 && isGoogleBillingAvailable"
                           color="rgba(var(--v-theme-card-on-grad-bg), 0.3)"
                           type="heading, subtitle"
                           class="mb-4"
                           height="125px"
        />

        <!-- Purchase by google -->
        <v-card v-else-if="showPurchaseViaGoogle &&
        vhApp.data.state.clientProfile?.selectedLocationInfo?.options.premiumByPurchase"
                class="py-3 px-3 rounded-lg text-white mb-4"
                :class="{'border border-error border-opacity-100': !isGoogleBillingAvailable}"
                color="rgba(var(--v-theme-card-on-grad-bg), 0.3)"
        >
          <template v-if="isGoogleBillingAvailable">
            <!-- Plan title, price -->
            <v-row justify="space-between">
              <v-col cols="auto" class="d-flex ga-1 align-center">
                <v-icon icon="mdi-crown" size="23" color="disable-premium" />
                <!-- TODO: must change to subscriptionPlanId -->
                <span class="font-weight-bold text-body-2">{{ locale('1_MONTH') }}</span>
              </v-col>
              <v-col cols="auto" class="d-flex ga-1 align-center">
                <span v-if="subscriptionPlans[0]?.planPrice" class="font-weight-bold text-body-2">
                  {{ subscriptionPlans[0].planPrice }}
                </span>
                <v-progress-circular
                  v-else
                  size="18"
                  indeterminate
                  width="1"
                />
                <span class="text-caption">{{ locale('PER_MONTH') }}</span>
              </v-col>
            </v-row>

            <!-- Purchase button -->
            <v-btn
              variant="flat"
              rounded="pill"
              color="purchase-subscription-btn"
              class="text-transform-none font-weight-bold mt-1"
              block
              :loading="!subscriptionPlans[0]?.subscriptionPlanId"
              :disabled="!subscriptionPlans[0]?.subscriptionPlanId"
              :text="locale('PURCHASE')"
              @click="onPurchaseClick(subscriptionPlans[0].subscriptionPlanId)"
            />

            <!-- Plan Descriptions -->
            <ul class="text-white opacity-40 ps-4 mt-2" style="font-size: 10px;">
              <li>{{ locale('PLANS_ARE_AUTOMATICALLY_RENEWED') }}</li>
              <li>{{ locale('CANCEL_ANYTIME_ON_GOOGLE_PLAY') }}</li>
            </ul>
          </template>

          <template v-else>
            <v-icon class="pe-3" color="error" icon="mdi-alert-circle-outline" />
            <span class="text-error text-caption">{{ locale('GOOGLE_PLAY_BILLING_UNAVAILABLE') }}</span>
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

        <!-- Alternative purchase button -->
        <v-card v-if="showPurchaseViaWeb"
                class="py-1 rounded-lg mb-4"
                color="rgba(var(--v-theme-card-on-grad-bg), 0.3)"
        >
          <v-btn
            v-if="purchaseOptions?.purchaseUrl"
            block
            :ripple="false"
            color="premium-code-btn"
            variant="text"
            prepend-icon="mdi-web"
            :text="locale('PURCHASE_VIA_WEB')"
            target="_blank"
            :href="purchaseOptions.purchaseUrl"
          />
        </v-card>

        <!-- Input premium code button -->
        <v-card v-if="vhApp.data.state.clientProfile?.selectedLocationInfo?.options.premiumByCode"
                class="py-1 rounded-lg"
                color="rgba(var(--v-theme-card-on-grad-bg), 0.3)"
        >
          <v-btn
            block
            :ripple="false"
            color="premium-code-btn"
            variant="text"
            prepend-icon="mdi-key"
            :text="locale('I_HAVE_A_PREMIUM_CODE')"
            @click="ComponentRouteController.showComponent(ComponentName.EnterPremiumCode)"
          />
        </v-card>

        <!-- Premium code sheet -->
        <v-bottom-sheet
          v-model="ComponentRouteController.create(ComponentName.EnterPremiumCode).isShow"
          contained width="100%"
          max-width="100%"
        >

          <v-card
            prepend-icon="mdi-key"
            color="background"
            class="rounded-b-0"
            :title="locale('ENTER_PREMIUM_CODE')"
          >
            <v-card-item class="pt-0">
              <alert-note :title="locale('NOTE')" :text="locale('ACTIVE_PREMIUM_KEY_EXPIRATION_NOTICE')" class="mb-2" />

              <v-form
                v-model="premiumCodeForm"
                @submit.prevent="validatePremiumCode()"
              >
                <v-text-field
                  v-model="formattedPremiumCode"
                  :placeholder="locale('ENTER_YOUR_CODE')"
                  :rules="[premiumCodeNumberRule, premiumCodeCountRule]"
                  @input="premiumCodeHandleInput"
                  :error-messages="invalidCodeError"
                  hide-details="auto"
                  single-line
                  clearable
                  autofocus
                  spellcheck="false"
                  autocomplete="off"
                  dir="ltr"
                  density="compact"
                  color="highlight"
                  variant="outlined"
                  rounded="md"
                  class="mb-5"
                />

                <v-btn
                  variant="flat"
                  rounded="pill"
                  color="activate-code-btn"
                  class="text-transform-none"
                  block
                  type="submit"
                  :disabled="!premiumCodeForm"
                  :text="locale('ACTIVATE')"
                />
              </v-form>


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
    <v-dialog :model-value="purchaseCompleteDialogMessage != null" :persistent="true">
      <v-card color="active">

        <v-card-title class="text-center pt-4">
          <v-icon class="text-h2">mdi-party-popper</v-icon>
          <h2>{{ locale('CONGRATULATIONS') }}</h2>
        </v-card-title>

        <v-card-text>
          <p>{{ purchaseCompleteDialogMessage }}</p>

          <!-- TODO: use theme color -->
          <v-alert v-if="vhApp.data.isPremiumAccount && vhApp.data.hasPremiumCode"
                   variant="flat"
                   color="#17083d"
                   density="compact"
                   rounded="lg"
                   class="text-caption mt-4"
          >

          <span v-if="!isNewCode && premiumCodeDeviceCount && premiumCodeDeviceCount > 1" class="mb-2">
            {{ locale('ALERT_FOR_USED_PREMIUM_CODE_MORE_THAN_ONE_DEVICE') }}
          </span>

            <ul id="activationInfo"
                :class="[premiumCodeDeviceCount && premiumCodeDeviceCount > 1 ? 'text-error' : 'text-active']"
                style="list-style: none;"
            >

              <li v-if="premiumCodeActivationDate">
                <span>{{ locale('ACTIVATED_ON') }}:</span>
                <span>{{ Util.getShortDate(premiumCodeActivationDate) }}</span>
              </li>

              <li v-if="premiumCodeExpirationDate">
                <span>{{ locale('EXPIRATION_DATE') }}:</span>
                <span>{{ Util.getShortDate(premiumCodeExpirationDate) }}</span>
              </li>

              <li v-if="premiumCodeDeviceCount && premiumCodeDeviceCount > 1">
                <span>{{ locale('USED_BY') }}:</span>
                <span class="text-lowercase">{{ premiumCodeDeviceCount }} {{ locale('DEVICE') }}</span>
              </li>

            </ul>

          </v-alert>

        </v-card-text>

        <v-card-actions>
          <v-btn v-if="vhApp.data.isConnected" :text="locale('STATISTICS')" @click="closeCompleteDialog(true)" />
          <v-btn :text="locale('CLOSE')" variant="plain" @click="closeCompleteDialog(false)" />
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-sheet>
</template>

<style scoped>
#rocketWrapper {
  position: relative;
  background: url('@/assets/images/rocket-bg.webp') no-repeat top center;
  background-size: contain;
  width: 100%;
  height: 55%;
  min-height: 150px;
  max-height: 335px;
}

#rocket, #rocketSmoke {
  position: absolute;
  left: 0;
  right: 0;
}

#rocket {
  background: url('@/assets/images/rocket.webp') no-repeat top center;
  background-size: contain;
  width: 100%;
  height: 56%;
  bottom: 35%;
  z-index: 1;
}

#rocketSmoke {
  background: url('@/assets/images/rocket-smoke.webp') no-repeat top center;
  background-size: contain;
  width: 42%;
  height: 35%;
  bottom: 16%;
  z-index: 2;
}

#activationInfo > li {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

<!--suppress CssUnusedSymbol -->
<style>
#featuresCarousel .v-carousel__controls .v-btn--icon .v-icon{
  --v-icon-size-multiplier:.8;
}
#featuresCarousel .v-carousel__controls__item{
  margin: 0 3px;
}
#featuresCarousel .v-btn--icon.v-btn--density-default {
  width: calc(var(--v-btn-height) + 6px);
  height: calc(var(--v-btn-height) + 6px);
}/*
#featuresCarousel .v-window__controls{
  padding: 0;
  animation: pulseOpacity 2s infinite;
}*/
</style>
