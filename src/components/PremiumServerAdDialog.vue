<template>
  <!-- Minimize Go Premium button for guest user -->
  <v-btn
      v-if="!$vpnHoodApp.data.userState.userAccount?.subscriptionId"
      :flat="true"
      variant="outlined"
      color="tertiary"
      rounded="pill"
      size="small"
      height="40"
      @click="$emit('update:modelValue',true)"
      class="ps-1 pe-3 text-capitalize"
  >
    <v-icon icon="mdi-crown" color="primary" size="30" class="bg-tertiary rounded-circle me-2"/>
    {{$t("PREMIUM_SERVER_AD_TITLE")}}
  </v-btn>

  <!-- Minimize Go Premium Server button for premium user -->
  <v-chip
      v-else
      prepend-icon="mdi-crown"
      :text="$t('YOU_ARE_PREMIUM')"
      color="secondary-lighten-1"
      variant="tonal"
      tag="h6"
      @click="$emit('update:modelValue',true)"
  />

  <!-- Maximize Go Premium Server -->
  <v-dialog
      transition="dialog-bottom-transition"
      :modelValue="modelValue"
      @update:modelValue="$emit('update:modelValue',$event)"
      :fullscreen="true"
  >
      <v-card color="primary-darken-2" :flat="true" class="pa-5 justify-center align-center">

        <!-- Close button -->
        <v-btn icon="mdi-window-close" variant="tonal" color="white" size="small" class="d-block mx-auto mb-4" @click="$emit('update:modelValue',false)"/>

        <!-- Sign in with google button -->
        <v-card-item v-if="!$vpnHoodApp.data.userState.userAccount" class="bg-primary-darken-2 border border-tertiary border-opacity-50 rounded-xl text-center pa-5 mb-3">
          <p class="text-white border-b border-tertiary border-opacity-50 mb-5 pb-5">{{$t("SIGN_IN_TO_CONTINUE")}}</p>
          <v-btn
              @click="onSignIn"
              rounded="pill"
              color="white"
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

        <!-- Products list -->
        <template v-else-if="subscriptionPlans.length > 0">
          <v-card-item class="bg-primary-darken-2 border border-tertiary border-opacity-50 rounded-xl pa-5 mb-3">
            <!-- Image -->
            <v-img :eager="true" src="../assets/images/ad-icon.png" max-width="200px" class="mx-auto"/>

            <!-- Title -->
            <h3 id="adTitle" class="title-bold border-b border-tertiary border-opacity-25 text-tertiary text-uppercase text-center pb-2 mb-2">
              {{$t("PREMIUM_SERVER_AD_TITLE")}}</h3>

            <!-- Description -->
            <ul id="adDesc" class="list-unstyled text-white text-body-2">
              <li><v-icon class="me-3" icon="mdi-check-decagram-outline" color="tertiary"/>{{$t("PREMIUM_FEATURE_1")}}</li>
              <li><v-icon class="me-3" icon="mdi-check-decagram-outline" color="tertiary"/>{{$t("PREMIUM_FEATURE_2")}}</li>
              <li><v-icon class="me-3" icon="mdi-check-decagram-outline" color="tertiary"/>{{$t("PREMIUM_FEATURE_3")}}</li>
              <li><v-icon class="me-3" icon="mdi-check-decagram-outline" color="tertiary"/>{{$t("PREMIUM_FEATURE_4")}}</li>
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
                  :class="[$vpnHoodApp.data.userState.userAccount.providerPlanId === plan.subscriptionPlanId ? 'border-secondary-lighten-1 border-opacity-100' : 'border-secondary border-opacity-25', 'mb-2 pe-2 border']"
                  @click="onContinuePurchase(plan.subscriptionPlanId)"
              >

                <!-- Plan title -->
                <v-list-item-title class="d-flex align-center">
                  <h4 v-if="plan.subscriptionPlanId === SubscriptionPlansId.GlobalServer">{{ $t("GLOBAL_SERVERS") }}</h4>
                  <h4 v-if="plan.subscriptionPlanId === SubscriptionPlansId.HiddenServer">{{ $t("HIDDEN_SERVER") }}</h4>
                  <h4 v-if="plan.subscriptionPlanId === SubscriptionPlansId.BundleServers">{{ $t("BUNDLE_SERVERS") }}</h4>
                </v-list-item-title>

                <!-- Already subscribed -->
                <v-list-item-subtitle
                    v-if="$vpnHoodApp.data.userState.userAccount.providerPlanId === plan.subscriptionPlanId"
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
                  <v-icon
                      :icon="$vpnHoodApp.data.userState.userAccount.providerPlanId === plan.subscriptionPlanId
                      ? 'mdi-check-decagram'
                      : 'mdi-chevron-right'"

                      :color="$vpnHoodApp.data.userState.userAccount.providerPlanId === plan.subscriptionPlanId
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
  </v-dialog>

  <!-- Pending purchase process dialog -->
  <v-dialog v-model="showPendingProcessDialog" :persistent="true" max-width="600">
    <v-card rounded="lg" color="secondary">
      <v-card-text class="px-3">
        {{ $t("WAITING_TO_COMPLETE_ORDER_PROCESS") }}
        <v-progress-linear :indeterminate="true" rounded class="mt-3 mb-4" />
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Purchase complete dialog -->
  <v-dialog v-model="showPurchaseCompleteDialog" :persistent="true" max-width="600">
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

  <!-- Notice dialog on purchase subscription -->
  <v-dialog v-model="showPlanNoticeDialog" :persistent="true" max-width="600">
    <v-card rounded="lg" color="white">
      <v-card-title class="text-white bg-secondary">
        <span v-if="planNoticeType === SubscriptionPlansId.GlobalServer">{{$t("GLOBAL_SERVERS")}}</span>
        <span v-if="planNoticeType === SubscriptionPlansId.HiddenServer">{{$t("HIDDEN_SERVER")}}</span>
        <span v-if="planNoticeType === SubscriptionPlansId.BundleServers">{{$t("BUNDLE_SERVERS")}}</span>
        <span class="ms-1">{{$t("SUBSCRIPTION")}}</span>
      </v-card-title>
      <v-divider/>
      <v-card-text>
        <p v-if="planNoticeType === SubscriptionPlansId.HiddenServer">{{$t('HIDDEN_SERVER_NOTICE')}}</p>
        <p v-if="planNoticeType === SubscriptionPlansId.GlobalServer">{{$t('GLOBAL_SERVERS_NOTICE')}}</p>
        <p v-if="planNoticeType === SubscriptionPlansId.BundleServers">{{$t('BUNDLE_SERVERS_NOTICE')}}</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer/>
        <v-btn
            rounded="pill"
            variant="text"
            color="secondary"
            :text="$t('CLOSE')"
            @click="closePlanNoticeDialog"
        />
        <v-btn
            v-if="showContinueInNotice"
            rounded="pill"
            variant="flat"
            color="secondary"
            class="px-8"
            :text="$t('BUY')"
            @click="googlePlayPurchaseProduct()"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {ClientApiFactory} from "@/services/ClientApiFactory";
import {SubscriptionPlan} from "@/services/VpnHood.Client.Api";
import {SubscriptionPlansId} from "@/UiConstants";

export default defineComponent({
  name: "PremiumServerAdDialog",
  props: {
    modelValue: Boolean,
  },
  emits: [
    "update:modelValue",
  ],
  data(){
    return{
      SubscriptionPlansId,
      subscriptionPlans: [] as SubscriptionPlan[],
      selectedPlanId: SubscriptionPlansId.HiddenServer as string,
      showPendingProcessDialog: false,
      showPurchaseCompleteDialog: false,
      showPlanNoticeDialog: false,
      showContinueInNotice: false,
      planNoticeType: "",
    }
  },
  watch: {
    modelValue(newVal) {
      if (newVal) {
        // The dialog is open at this point.
        // To ensure the DOM has updated, use this.$nextTick:
        this.$nextTick(() => {
          this.onOpenDialog();
        });
      }
    },
  },
  methods:{
    async onOpenDialog(): Promise<void>{
      if (this.$vpnHoodApp.data.userState.userAccount){
        try {
          this.$vpnHoodApp.data.uiState.showLoadingDialog = true;
          await this.showProducts();
        }
        finally {
          this.$vpnHoodApp.data.uiState.showLoadingDialog = false;
        }
      }
      this.$emit('update:modelValue',true);
    },

    async onSignIn(): Promise<void>{
      try {
        this.$vpnHoodApp.data.uiState.showLoadingDialog = true;
        await this.$vpnHoodApp.signIn();
        await this.showProducts();
      }
      finally {
        this.$vpnHoodApp.data.uiState.showLoadingDialog = false;
      }
    },

    async showProducts(): Promise<void>{
      try {
        const billingClient = ClientApiFactory.instance.createBillingClient();
        let cloneSubscriptionPlans = await billingClient.getSubscriptionPlans();
        cloneSubscriptionPlans.sort(
            (a, b) => Number((a.planPrice).replace(/\D/g, '')) -
                Number((b.planPrice).replace(/\D/g, '')));
        this.subscriptionPlans = cloneSubscriptionPlans;
      }
      catch (err: any){
        this.$emit('update:modelValue',false);
        throw err;
      }
    },

    closePlanNoticeDialog(): void{
      this.showContinueInNotice = false;
      this.showPlanNoticeDialog = false;
    },

    onContinuePurchase(planId: string): void{
      if (this.$vpnHoodApp.data.userState.userAccount?.providerPlanId === planId)
        return;

      this.selectedPlanId = planId;
      this.planNoticeType = planId;
      this.showContinueInNotice = true;
      this.showPlanNoticeDialog = true;
    },

    async googlePlayPurchaseProduct(): Promise<void>{
      this.closePlanNoticeDialog();
      try {
        const billingClient = ClientApiFactory.instance.createBillingClient();
        const orderId = await billingClient.purchase(this.selectedPlanId);
        this.showPendingProcessDialog = true;
        await this.processPendingOrder(orderId);
      }
      catch (err: any){
        if(err.message === "A task was canceled.")
          console.error(err);
      }
      finally {
        this.showPendingProcessDialog = false;
      }
    },

    async processPendingOrder(providerOrderId: string): Promise<void> {
      const accountClient = ClientApiFactory.instance.createAccountClient();
      const isOrderProcessed: boolean = await accountClient.isSubscriptionOrderProcessed(providerOrderId);
      if (isOrderProcessed){
        await this.$vpnHoodApp.processUserAccount();
        this.showPurchaseCompleteDialog = true;
      }
      else
        throw new Error(this.$t("ORDER_PROCESSING_FAILED"));
    },
  }
})
</script>


<style scoped>
#adTitle {font-size: 130%;}
#adDesc {line-height: 26px;}

/*noinspection ALL*/
.v-card-item {
  width: 100%;
  max-width: 500px;
}
</style>

<!--suppress CssUnusedSymbol -->
<style>
.v-list-item__overlay{display: none !important;}
</style>