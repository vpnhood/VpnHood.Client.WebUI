<template>

  <!-- Page header -->
  <AppBar :page-title="$t('PURCHASE_SUBSCRIPTION')"/>

  <v-sheet class="pa-4" color="primary-darken-2">

    <v-card color="transparent" flat v-if="subscriptionPlans.length > 0">
      <!-- Products list -->
      <v-card-item class="bg-primary-darken-2 border border-tertiary border-opacity-50 rounded-xl pa-3 mb-3 w-100">
        <!-- Image -->
        <v-img :eager="true" src="src/assets/images/ad-icon.png" max-width="150px" class="mx-auto"/>

        <!-- Title -->
        <h3 class="title-bold text-tertiary text-uppercase text-center pb-2 mb-2">
          {{ $t("PREMIUM_SERVER_AD_TITLE") }}</h3>

        <!-- Description -->
        <ul id="subscriptionFeaturesList">
          <li>
            <span class="feature-title"></span>
            <h4 class="text-center text-white opacity-60">{{ $t("FREE") }}</h4>
            <h4 class="text-center text-secondary-lighten-1">{{ $t("PREMIUM") }}</h4>
          </li>
          <li>
            <span class="feature-title">{{ $t("SPEED") }}</span>
            <span class="free-feature">{{ $t("UNLIMITED") }}</span>
            <span class="free-feature">{{ $t("UNLIMITED") }}</span>
          </li>
          <li>
            <span class="feature-title">{{ $t("TRAFFIC") }}</span>
            <span class="free-feature">{{ $t("UNLIMITED") }}</span>
            <span class="free-feature">{{ $t("UNLIMITED") }}</span>
          </li>
          <li>
            <span class="feature-title">{{ $t("NO_ADS") }}</span>
            <span class="free-feature"><v-icon icon="mdi-closeDialog"/></span>
            <span class="premium-feature"><v-icon icon="mdi-check"/></span>
          </li>
          <li>
            <span class="feature-title">{{ $t("ALWAYS_ON") }}</span>
            <span class="free-feature"><v-icon icon="mdi-closeDialog"/></span>
            <span class="premium-feature"><v-icon icon="mdi-check"/></span>
          </li>
          <li>
            <span class="feature-title">{{ $t("SUPPORT") }}</span>
            <span class="free-feature"><v-icon icon="mdi-closeDialog"/></span>
            <span class="premium-feature"><v-icon icon="mdi-check"/></span>
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
              :class="[$vpnHoodApp.data.userState.userAccount?.providerPlanId === plan.subscriptionPlanId ? 'border-secondary-lighten-1 border-opacity-100 py-2' : 'border-secondary border-opacity-25 py-3', 'mb-3 pe-2 border']"
              @click="showPlanDetails(plan.subscriptionPlanId)"
          >

            <!-- Plan title -->
            <v-list-item-title class="d-flex align-center">
              <span v-if="plan.subscriptionPlanId === SubscriptionPlansId.GlobalServer">{{$t("GLOBAL_SERVERS") }}</span>
            </v-list-item-title>

            <!-- Already subscribed -->
            <v-list-item-subtitle
                v-if="$vpnHoodApp.data.userState.userAccount?.providerPlanId === plan.subscriptionPlanId"
                class="text-caption text-secondary-lighten-1"
            >
              {{ $t('ALREADY_SUBSCRIBED') }}
            </v-list-item-subtitle>

            <!-- Plan price -->
            <template v-slot:append>
              <div class="text-end text-subtitle-2 text-secondary">
                <span>{{ plan.planPrice }}</span>
                <span>{{ $t("PER_MONTH") }}</span>
              </div>
              <!--suppress NestedConditionalExpressionJS -->
              <v-icon
                  :icon="$vpnHoodApp.data.userState.userAccount?.providerPlanId === plan.subscriptionPlanId
                      ? 'mdi-check-decagram'
                      : $vuetify.locale.isRtl? 'mdi-chevron-left' : 'mdi-chevron-right'"
                  :color="$vpnHoodApp.data.userState.userAccount?.providerPlanId === plan.subscriptionPlanId
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
              :class="[$vpnHoodApp.data.userState.userAccount?.providerPlanId === plan.subscriptionPlanId ? 'border-secondary-lighten-1 border-opacity-100 py-2' : 'border-secondary border-opacity-25 py-3', 'mb-3 pe-2 border']"
              @click="showPlanDetails(plan.subscriptionPlanId)"
          >

            <!-- Plan title -->
            <v-list-item-title class="d-flex align-center">
              <span v-if="plan.subscriptionPlanId === SubscriptionPlansId.GlobalServer">{{$t("GLOBAL_SERVERS") }}</span>
            </v-list-item-title>

            <!-- Already subscribed -->
            <v-list-item-subtitle
                v-if="$vpnHoodApp.data.userState.userAccount?.providerPlanId === plan.subscriptionPlanId"
                class="text-caption text-secondary-lighten-1"
            >
              {{ $t('ALREADY_SUBSCRIBED') }}
            </v-list-item-subtitle>

            <!-- Plan price -->
            <template v-slot:append>
              <div class="text-end text-subtitle-2 text-secondary">
                <span>{{ plan.planPrice }}</span>
                <span>{{ $t("PER_MONTH") }}</span>
              </div>
              <!--suppress NestedConditionalExpressionJS -->
              <v-icon
                  :icon="$vpnHoodApp.data.userState.userAccount?.providerPlanId === plan.subscriptionPlanId
                      ? 'mdi-check-decagram'
                      : $vuetify.locale.isRtl? 'mdi-chevron-left' : 'mdi-chevron-right'"
                  :color="$vpnHoodApp.data.userState.userAccount?.providerPlanId === plan.subscriptionPlanId
                      ? 'secondary-lighten-1'
                      : 'tertiary'"
                  class="ms-2"
              />
            </template>
          </v-list-item>
        </v-list>

      </v-card-item>


      <ul class="text-white opacity-30 text-caption ps-4">
        <li>{{ $t("PLANS_ARE_AUTOMATICALLY_RENEWED") }}</li>
        <li>{{ $t("CANCEL_ANYTIME_ON_GOOGLE_PLAY") }}</li>
      </ul>
    </v-card>

  </v-sheet>

  <!-- Plan details dialog on purchase subscription -->
  <v-dialog v-model="showPlanDetailsDialog" max-width="600">
    <v-card color="primary-darken-2">

      <!-- Plan title -->
      <v-card-title class="text-secondary d-flex">
        <span :class="[$vuetify.locale.isRtl? 'me-1' : 'order-1 ms-1']">{{ $t("SUBSCRIPTION") }}</span>
        <span>{{ $t(planTitle) }}</span>
      </v-card-title>

      <!-- Plan description -->
      <v-card-text>{{ $t(planDetails) }}</v-card-text>

      <!-- Dialog buttons -->
      <v-card-actions>
        <v-spacer/>
        <!-- Close button -->
        <v-btn
            variant="text"
            color="secondary"
            :text="$t('CLOSE')"
            @click="showPlanDetailsDialog = false"
        />
        <!-- Buy button -->
        <v-btn
            variant="tonal"
            color="secondary"
            class="px-6"
            :text="$t('BUY')"
            @click="onBuyClick"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Pending purchase process dialog -->
  <v-dialog :model-value="$vpnHoodApp.data.state.purchaseState === BillingPurchaseState.Processing" :persistent="true"
            max-width="600">
    <v-card rounded="lg" color="secondary">
      <v-card-text class="px-3">
        {{ $t("WAITING_TO_COMPLETE_ORDER_PROCESS") }}
        <v-progress-linear :indeterminate="true" rounded="true" class="mt-3 mb-4"/>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Purchase complete dialog -->
  <v-dialog v-model="showPurchaseCompleteDialog" max-width="600">
    <v-card rounded="lg" color="secondary">
      <v-card-title class="text-center">
        <v-icon class="text-h2">mdi-party-popper</v-icon>
        <h2>{{ $t("CONGRATULATIONS") }}</h2>
      </v-card-title>

      <v-card-text>{{ $t("PURCHASE_AND_PROCESS_IS_COMPLETE_MESSAGE") }}</v-card-text>

      <v-card-actions>
        <v-spacer/>
        <v-btn
            rounded="pill"
            variant="text"
            color="primary"
            :text="$t('CLOSE')"
            @click="closeOnPurchaseComplete"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Login dialog -->
  <v-dialog v-model="showLoginDialog" max-width="600">
    <v-card color="primary-darken-2">
      <!-- Sign in with google button -->
      <v-card-item
          class="bg-primary-darken-2 border border-tertiary border-opacity-50 rounded-xl text-center pa-5 mb-3">
        <p class="text-white border-b border-tertiary border-opacity-50 mb-5 pb-5">{{ $t("SIGN_IN_TO_CONTINUE") }}</p>
        <v-btn
            @click="onBuyClick"
            rounded="pill"
            color="white"
            size="large"
            :flat="true"
            class="font-weight-bold text-capitalize my-4"
        >
          <v-img
              src="src/assets/images/google-logo.png"
              alt="login with google"
              width="30px"
              class="me-4"
          />
          {{ $t("SIGN_IN_WITH_GOOGLE") }}
        </v-btn>
      </v-card-item>
      <v-card-actions>
        <v-spacer/>
        <v-btn
            variant="text"
            color="secondary"
            :text="$t('CANCEL')"
            @click="showLoginDialog = false"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<script lang="ts">
import {defineComponent} from "vue";
import AppBar from "@/components/AppBar.vue";
import {SubscriptionPlansId} from "@/UiConstants";
import { BillingPurchaseState, SubscriptionPlan } from '@/services/VpnHood.Client.Api'
import {ClientApiFactory} from "@/services/ClientApiFactory";
import {GooglePlayBillingPurchaseState} from "@/googlePlayBilling/GooglePlayBillingPurchaseState";
import {GooglePlayBillingResponseCode} from "@/googlePlayBilling/GooglePlayBillingResponseCode";

export default defineComponent({
  name: "PurchaseSubscription",
  components: {AppBar},
  data() {
    return {
      SubscriptionPlansId,
      BillingPurchaseState,
      subscriptionPlans: [] as SubscriptionPlan[],
      selectedPlanId: "",
      showPurchaseCompleteDialog: false,
      showPlanDetailsDialog: false,
      showLoginDialog: false,
      planTitle: "",
      planDetails: "",
    }
  },
  async created() {
    this.$vpnHoodApp.data.uiState.showLoadingDialog = true;

    // Get products list from Google and sort based on plan prices
    try {
      const billingClient = ClientApiFactory.instance.createBillingClient();
      const cloneSubscriptionPlans = await billingClient.getSubscriptionPlans();
      cloneSubscriptionPlans.sort(
          (a, b) => Number((a.planPrice).replace(/\D/g, '')) -
              Number((b.planPrice).replace(/\D/g, '')));
      this.subscriptionPlans = cloneSubscriptionPlans;
    } catch (err: unknown) {
      await this.$router.replace("/");
      this.googleBillingException(err);
    } finally {
      this.$vpnHoodApp.data.uiState.showLoadingDialog = false;
    }
  },
  methods: {
    showPlanDetails(planId: string): void {
      if (this.$vpnHoodApp.data.userState.userAccount?.providerPlanId === planId)
        return;

      // Defined plan title and details to show in the dialog
      switch (planId) {
        case SubscriptionPlansId.GlobalServer:
          this.planTitle = "GLOBAL_SERVERS";
          this.planDetails = "GLOBAL_SERVERS_NOTICE";
          break;
      }

      // Save user selected plan id for continue purchase
      this.selectedPlanId = planId;
      this.showPlanDetailsDialog = true;
    },

    async onBuyClick(): Promise<void> {
      this.showPlanDetailsDialog = false;
      if (!this.$vpnHoodApp.data.userState.userAccount)
        await this.$vpnHoodApp.signIn();

      if (this.$vpnHoodApp.data.userState.userAccount?.providerPlanId === this.selectedPlanId)
        throw new Error(this.$t("SELECTED_PLAN_ALREADY_SUBSCRIBED"));

      await this.purchase(this.selectedPlanId);
    },

    async purchase(planId: string): Promise<void> {
      try {
        const billingClient = ClientApiFactory.instance.createBillingClient();
        await billingClient.purchase(planId);
        this.showPurchaseCompleteDialog = true;
        await this.$vpnHoodApp.loadAccount();
      } catch (err: unknown) {
        this.showPurchaseCompleteDialog = false;
        this.googleBillingException(err);
      }
    },

    closeOnPurchaseComplete() {
      this.showPurchaseCompleteDialog = false;
      this.$router.replace("/");
    },

    googleBillingException(exception: unknown) {
      if (exception.exceptionTypeName !== "GoogleBillingException") {
        throw exception;
      } else {
        const googleMessageTitle = this.$t("GOOGLE_EXCEPTION_MESSAGE");
        const billingMessage = exception.data.BillingMessage;

        if (exception.data.PurchaseState === GooglePlayBillingPurchaseState.Pending)
          throw new Error(this.$t("GOOGLE_BILLING_PENDING_PURCHASE"))

        switch (exception.data.BillingResponseCode) {

          case GooglePlayBillingResponseCode.BillingUnavailable:
            throw new Error(this.$t("GOOGLE_BILLING_BILLING_UNAVAILABLE"));

          case GooglePlayBillingResponseCode.ServiceDisconnected:
            throw new Error(this.$t("GOOGLE_BILLING_SERVICE_DISCONNECTED"));

          case GooglePlayBillingResponseCode.Error:
            throw new Error(
                `${this.$t("ORDER_PROCESSING_FAILED")}
                ${billingMessage ? `${googleMessageTitle} ${billingMessage}` : ""}`);

          case GooglePlayBillingResponseCode.DeveloperError:
            throw new Error(
                `${this.$t("GOOGLE_BILLING_DEVELOPER_ERROR")}
                ${billingMessage ? `${googleMessageTitle} ${billingMessage}` : ""}`);

          case GooglePlayBillingResponseCode.FeatureNotSupported:
            throw new Error(this.$t("GOOGLE_BILLING_FEATURE_NOT_SUPPORTED"));

          case GooglePlayBillingResponseCode.ItemAlreadyOwned:
            throw new Error(this.$t("SELECTED_PLAN_ALREADY_SUBSCRIBED"));

          case GooglePlayBillingResponseCode.ItemUnavailable:
            throw new Error(this.$t("GOOGLE_BILLING_ITEM_UNAVAILABLE"));

          case GooglePlayBillingResponseCode.ItemNotOwned:
            throw new Error(this.$t("GOOGLE_BILLING_ITEM_NOT_OWNED"));

          case GooglePlayBillingResponseCode.NetworkError:
            throw new Error(this.$t("GOOGLE_BILLING_NETWORK_ERROR"));

          case GooglePlayBillingResponseCode.ServiceTimeout:
            throw new Error(this.$t("GOOGLE_BILLING_SERVICE_TIMEOUT"));

          case GooglePlayBillingResponseCode.ServiceUnavailable:
            throw new Error(this.$t("GOOGLE_BILLING_SERVICE_UNAVAILABLE"));

          case GooglePlayBillingResponseCode.UserCancelled:
            console.log(this.$t("GOOGLE_BILLING_USER_CANCELED"));
        }
      }

    }
  }

})
</script>
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
