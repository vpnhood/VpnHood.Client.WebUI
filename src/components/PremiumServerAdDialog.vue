<template>
  <!-- Minimize Premium Server ad -->
  <v-btn
      v-if="!$vpnHoodApp.data.userState.userAccount?.subscriptionId"
      :flat="true"
      variant="outlined"
      color="tertiary"
      rounded="pill"
      size="small"
      height="40"
      @click="onOpenDialog"
      class="ps-1 pe-3"
  >
    <v-icon icon="mdi-crown" color="primary" size="30" class="bg-tertiary rounded-circle me-2"/>
<!--    <v-img src="../assets/images/ad-icon-minimize.png" width="35px" alt="Premium Server Ad icon" class="me-2"/>-->
    {{$t("PREMIUM_SERVER_AD_TITLE")}}
  </v-btn>
  <v-chip
      v-else
      prepend-icon="mdi-crown"
      append-icon="mdi-dots-vertical"
      :text="$t('PREMIUM_USER')"
      color="secondary-lighten-1"
      variant="tonal"
      tag="h6"
      @click="onOpenDialog"
  />

  <!-- Maximize Premium Server Ad -->
  <v-dialog
      transition="dialog-bottom-transition"
      :modelValue="modelValue"
      @update:modelValue="$emit('update:modelValue',$event)"
      :fullscreen="true"
  >
      <v-card color="rgba(var(--v-theme-primary-darken-2), 0.9)" :flat="true" class="pa-5 justify-center align-center">

        <!-- Close button -->
        <v-btn icon="mdi-window-close" variant="tonal" color="white" size="small" class="d-block mx-auto mb-4" @click="$emit('update:modelValue',false)"/>

        <!-- Sign in with google button -->
        <v-card-item v-if="!$vpnHoodApp.data.userState.userAccount" class="bg-primary-darken-2 border border-tertiary border-opacity-50 rounded-xl text-center pa-5 mb-3">
          <p class="text-white border-b border-tertiary border-opacity-50 mb-5 pb-5">{{$t("SIGN_IN_TO_CONTINUE")}}</p>
          <v-btn
              @click="onSignIn"
              rounded="pill"
              size="large"
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


          <v-card-item  class="pa-0 w-100">
            <v-list v-if="subscriptionPlans" bg-color="transparent" >
              <!-- Plan item -->
              <v-list-item
                  v-for="plan in subscriptionPlans"
                  :key="plan.subscriptionPlanId"
                  color="white"
                  rounded="15"
                  base-color="primary-darken-2"
                  variant="flat"
                  :disabled="$vpnHoodApp.data.userState.userAccount.providerPlanId === plan.subscriptionPlanId"
                  :active="plan.subscriptionPlanId === selectedPlanId"
                  active-class="border border-opacity-100 border-tertiary bg-primary-darken-2 text-white"
                  class="ps-2 mb-2 border border-surface border-opacity-25"
                  @click="selectedPlanId = plan.subscriptionPlanId"
              >
                <template v-slot:prepend v-if="$vpnHoodApp.data.userState.userAccount.providerPlanId !== plan.subscriptionPlanId">
                  <v-radio
                      v-model="selectedPlanId"
                      density="compact"
                      :true-value="plan.subscriptionPlanId"
                      :class="[selectedPlanId === plan.subscriptionPlanId ? '' : 'opacity-30', 'me-1 text-white' ]"
                      color="tertiary"
                  />
                </template>

                <!-- Plan title -->
                <v-list-item-title :class="[$vpnHoodApp.data.userState.userAccount.providerPlanId === plan.subscriptionPlanId ? 'ms-4' : '', 'd-flex align-center']">
                  <h4 v-if="plan.subscriptionPlanId === SubscriptionPlansId.HiddenServer">{{ $t("HIDDEN_SERVER") }}</h4>
                  <h4 v-if="plan.subscriptionPlanId === SubscriptionPlansId.GlobalServer">{{ $t("GLOBAL_SERVERS") }}</h4>
                  <h4 v-if="plan.subscriptionPlanId === SubscriptionPlansId.BundleServers">{{ $t("BUNDLE_SERVERS") }}</h4>
                  <v-btn
                      v-if="$vpnHoodApp.data.userState.userAccount.providerPlanId !== plan.subscriptionPlanId"
                      icon="mdi-information-symbol"
                      size="20px"
                      variant="outlined"
                      color="purple"
                      class="ms-2"
                      @click="openPlanNoticeDialog(plan.subscriptionPlanId)"
                  />
                </v-list-item-title>

                <v-list-item-subtitle v-if="$vpnHoodApp.data.userState.userAccount.providerPlanId === plan.subscriptionPlanId" class="text-caption text-white opacity-30">

                  <!-- Already subscribed -->
                  <v-chip
                      color="secondary-lighten-1"
                      variant="tonal"
                      size="small"
                      :text="$t('ALREADY_SUBSCRIBED')"
                      class="ms-2"
                  />

                  <!-- Plan description -->
<!--                  <template v-else>
                    <span v-if="plan.subscriptionPlanId === SubscriptionPlansId.HiddenServer">{{ $t("HIDDEN_SERVER_SUBTITLE") }}</span>
                    <span v-if="plan.subscriptionPlanId === SubscriptionPlansId.GlobalServer">{{ $t("GLOBAL_SERVERS_SUBTITLE") }}</span>
                    <span v-if="plan.subscriptionPlanId === SubscriptionPlansId.BundleServers">{{ $t("BUNDLE_SERVERS_SUBTITLE") }}</span>
                  </template>-->
                </v-list-item-subtitle>

                <!-- Plan price -->
                <template v-slot:append>
                  <div class="text-end text-subtitle-2">
                    <span>{{ plan.planPrice }}</span>
                    <span>{{ $t("PER_MONTH") }}</span>
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </v-card-item>

          <!-- Continue button -->
          <v-card-item class="pa-0 w-100">
            <v-btn
                :block="true"
                rounded="pill"
                height="45"
                :disabled="selectedPlanId === $vpnHoodApp.data.userState.userAccount.providerPlanId"
                variant="elevated"
                class="master-btn font-weight-bold text-capitalize"
                :text="$t('CONTINUE')"
                @click="onContinuePurchase"
            />
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
    <v-card rounded="lg" color="secondary">
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
            color="primary"
            :text="$t('CLOSE')"
            @click="closePlanNoticeDialog"
        />
        <v-btn
            v-if="showContinueInNotice"
            rounded="pill"
            variant="flat"
            color="primary"
            append-icon="mdi-chevron-right"
            class="px-3"
            :text="$t('CONTINUE')"
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
  methods:{
    async onOpenDialog(){
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

    async onSignIn(){
      try {
        this.$vpnHoodApp.data.uiState.showLoadingDialog = true;
        await this.$vpnHoodApp.signIn();
        await this.showProducts();
      }
      finally {
        this.$vpnHoodApp.data.uiState.showLoadingDialog = false;
      }
    },

    async showProducts(){
      const billingClient = ClientApiFactory.instance.createBillingClient();
      this.subscriptionPlans = await billingClient.getSubscriptionPlans();
    },

    openPlanNoticeDialog(planId: string){
      this.planNoticeType = planId;
      this.showPlanNoticeDialog = true;
    },

    closePlanNoticeDialog(){
      this.showContinueInNotice = false;
      this.showPlanNoticeDialog = false;
    },

    onContinuePurchase(){
      this.planNoticeType = this.selectedPlanId;
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