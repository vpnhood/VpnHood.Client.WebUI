<template>

  <!-- Page header -->
  <AppBar :page-title="$t('PURCHASE_SUBSCRIPTION')"/>

  <v-sheet class="pa-4" color="primary-darken-2">

    <!-- Exclude local network option -->
    <v-card color="transparent" flat>

        <!-- Products list -->
        <template v-if="subscriptionPlans.length > 0">
          <v-card-item class="bg-primary-darken-2 border border-tertiary border-opacity-50 rounded-xl pa-5 mb-3 w-100">
            <!-- Image -->
            <v-img :eager="true" src="../assets/images/ad-icon.png" max-width="200px" class="mx-auto"/>

            <!-- Title -->
            <h3 class="title-bold border-b border-tertiary border-opacity-25 text-tertiary text-uppercase text-center pb-2 mb-2">
              {{$t("PREMIUM_SERVER_AD_TITLE")}}</h3>

            <!-- Description -->
            <ul class="list-unstyled text-white text-body-2">
              <li class="py-1"><v-icon class="me-3" icon="mdi-check-decagram-outline" color="tertiary"/>{{$t("PREMIUM_FEATURE_1")}}</li>
              <li class="py-1"><v-icon class="me-3" icon="mdi-check-decagram-outline" color="tertiary"/>{{$t("PREMIUM_FEATURE_2")}}</li>
              <li class="py-1"><v-icon class="me-3" icon="mdi-check-decagram-outline" color="tertiary"/>{{$t("PREMIUM_FEATURE_3")}}</li>
              <li class="py-1"><v-icon class="me-3" icon="mdi-check-decagram-outline" color="tertiary"/>{{$t("PREMIUM_FEATURE_4")}}</li>
            </ul>
          </v-card-item>

          <!-- Plans list -->
          <v-card-item  class="pa-0 w-100">
            <v-list v-if="subscriptionPlans" bg-color="transparent">
              <!-- Plan item -->
              <v-list-item
                  v-for="plan in subscriptionPlans"
                  :key="plan.subscriptionPlanId"
                  color="white"
                  rounded="lg"
                  base-color="primary-darken-2"
                  variant="flat"
                  :class="[$vpnHoodApp.data.userState.userAccount?.providerPlanId === plan.subscriptionPlanId ? 'border-secondary-lighten-1 border-opacity-100 py-2' : 'border-secondary border-opacity-25 py-4', 'mb-3 pe-2 border']"
                  @click="showPlanDetails(plan.subscriptionPlanId)"
              >

                <!-- Plan title -->
                <v-list-item-title class="d-flex align-center">
                  <h4 v-if="plan.subscriptionPlanId === SubscriptionPlansId.GlobalServer">{{ $t("GLOBAL_SERVERS") }}</h4>
                  <h4 v-if="plan.subscriptionPlanId === SubscriptionPlansId.HiddenServer">{{ $t("HIDDEN_SERVER") }}</h4>
                  <h4 v-if="plan.subscriptionPlanId === SubscriptionPlansId.BundleServers">{{ $t("BUNDLE_SERVERS") }}</h4>
                </v-list-item-title>

                <!-- Already subscribed -->
                <v-list-item-subtitle
                    v-if="$vpnHoodApp.data.userState.userAccount?.providerPlanId === plan.subscriptionPlanId"
                    class="text-caption text-secondary-lighten-1"
                >
                  {{$t('ALREADY_SUBSCRIBED')}}
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
        </template>

    </v-card>

  </v-sheet>

  <!-- Plan details dialog on purchase subscription -->
  <v-dialog v-model="showPlanDetailsDialog" max-width="600">
    <v-card color="primary-darken-2">

      <!-- Plan title -->
      <v-card-title class="text-secondary d-flex">
        <span :class="[$vuetify.locale.isRtl? 'me-1' : 'order-1 ms-1']">{{$t("SUBSCRIPTION")}}</span>
        <span>{{$t(planTitle)}}</span>
      </v-card-title>

      <!-- Plan description -->
      <v-card-text>{{$t(planDetails)}}</v-card-text>

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
            @click="onContinuePurchase"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Pending purchase process dialog -->
  <v-dialog v-model="showPendingProcessDialog" :persistent="true"  max-width="600">
    <v-card rounded="lg" color="secondary">
      <v-card-text class="px-3">
        {{ $t("WAITING_TO_COMPLETE_ORDER_PROCESS") }}
        <v-progress-linear :indeterminate="true" rounded class="mt-3 mb-4" />
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
            @click="showPurchaseCompleteDialog = false"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Login dialog -->
  <v-dialog v-model="showLoginDialog" max-width="600">
    <v-card color="primary-darken-2">
    <!-- Sign in with google button -->
    <v-card-item class="bg-primary-darken-2 border border-tertiary border-opacity-50 rounded-xl text-center pa-5 mb-3">
      <p class="text-white border-b border-tertiary border-opacity-50 mb-5 pb-5">{{$t("SIGN_IN_TO_CONTINUE")}}</p>
      <v-btn
          @click="onContinuePurchase"
          rounded="pill"
          color="white"
          size="large"
          :flat="true"
          class="font-weight-bold text-capitalize my-4"
      >
        <v-img
            src="../assets/images/google-logo.png"
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
import {AppAccount, SubscriptionPlan} from "@/services/VpnHood.Client.Api";
import {ClientApiFactory} from "@/services/ClientApiFactory";

export default defineComponent({
  name: "PurchaseSubscription",
  components: {AppBar},
  data() {
    return {
      SubscriptionPlansId,
      subscriptionPlans: [] as SubscriptionPlan[],
      selectedPlanId: SubscriptionPlansId.HiddenServer as string,
      showPendingProcessDialog: false,
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
      let cloneSubscriptionPlans = await billingClient.getSubscriptionPlans();
      cloneSubscriptionPlans.sort(
          (a, b) => Number((a.planPrice).replace(/\D/g, '')) -
              Number((b.planPrice).replace(/\D/g, '')));
      this.subscriptionPlans = cloneSubscriptionPlans;
    }
    catch (err: any){
      this.$router.replace("/");
      throw err;
    }
    finally {
      this.$vpnHoodApp.data.uiState.showLoadingDialog = false;
    }
  },
  methods:{
    showPlanDetails(planId: string): void{
      if (this.$vpnHoodApp.data.userState.userAccount?.providerPlanId === planId)
        return;

      // Defined plan title and details to show in the dialog
      switch (planId) {
        case SubscriptionPlansId.GlobalServer:
          this.planTitle = "GLOBAL_SERVERS";
          this.planDetails = "GLOBAL_SERVERS_NOTICE";
          break;
        case SubscriptionPlansId.HiddenServer:
          this.planTitle = "HIDDEN_SERVER";
          this.planDetails = "HIDDEN_SERVER_NOTICE";
          break;
        case SubscriptionPlansId.BundleServers:
          this.planTitle = "BUNDLE_SERVERS";
          this.planDetails = "BUNDLE_SERVERS_NOTICE";
          break;
      }

      // Save user selected plan id for continue purchase
      this.selectedPlanId = planId;

      this.showPlanDetailsDialog = true;
    },

    async GetOrSetUserAccount(): Promise<AppAccount>{
      // User is signed in
      if(this.$vpnHoodApp.data.userState.userAccount)
        return this.$vpnHoodApp.data.userState.userAccount;

      // Show google play sign in dialog
      try {
        this.$vpnHoodApp.data.uiState.showLoadingDialog = true;
        return await this.$vpnHoodApp.signIn();
      }
      finally {
        this.$vpnHoodApp.data.uiState.showLoadingDialog = false;
      }
    },

    async onContinuePurchase(): Promise<void>{
      this.showPlanDetailsDialog = false;
      const userAccount: AppAccount = await this.GetOrSetUserAccount();
      if(userAccount.providerPlanId === this.selectedPlanId)
          throw new Error(this.$t("SELECTED_PLAN_ALREADY_SUBSCRIBED"));
      await this.googlePlayPurchaseProduct();
    },

    async googlePlayPurchaseProduct(): Promise<void>{
      try {
        const billingClient = ClientApiFactory.instance.createBillingClient();
        const providerOrderId: string = await billingClient.purchase(this.selectedPlanId);
        this.showPendingProcessDialog = true;
        await this.processPendingOrder(providerOrderId);
      }
      catch (err: any){
        if (err.exceptionTypeName === "OperationCanceledException")
          console.log(err);
        else throw err;
      }
      finally {
        this.showPendingProcessDialog = false;
      }
    },

    async processPendingOrder(providerOrderId: string): Promise<void> {
      const accountClient = ClientApiFactory.instance.createAccountClient();
      const isOrderProcessed: boolean = await accountClient.isSubscriptionOrderProcessed(providerOrderId);
      if (isOrderProcessed){
        await this.$vpnHoodApp.refreshAccount();
        this.showPurchaseCompleteDialog = true;
      }
      else
        throw new Error(this.$t("ORDER_PROCESSING_FAILED"));
    },
  }

})
</script>