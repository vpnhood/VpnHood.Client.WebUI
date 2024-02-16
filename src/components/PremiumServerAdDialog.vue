<template>
  <!-- Minimize Premium Server ad -->
  <v-btn
      :flat="true"
      variant="outlined"
      color="sharp-master-green"
      rounded="pill"
      size="small"
      height="40"
      @click="onOpenDialog"
      class="ps-1 pe-3"
  >
    <v-img src="../assets/images/ad-icon-minimize.png" width="35px" alt="Premium Server Ad icon" class="me-2"/>
    {{$t("PREMIUM_SERVER_AD_TITLE")}}
  </v-btn>

  <!-- Maximize Premium Server Ad -->
  <v-dialog
      id="premiumServerAd"
      transition="dialog-bottom-transition"
      :modelValue="modelValue"
      @update:modelValue="$emit('update:modelValue',$event)"
      :fullscreen="true"
  >
      <v-card color="#06124bd4" :flat="true" class="pa-5 justify-center align-center">

        <!-- Close button -->
        <v-btn icon="mdi-window-close" variant="tonal" color="white" size="small" class="d-block mx-auto mb-4" @click="$emit('update:modelValue',false)"/>

        <!-- Sign in with google button -->
        <v-card-item v-if="!$vpnHoodApp.data.userState.userAccount" class="cardWrapper rounded-xl text-center pa-5 mb-3">
          <p class="text-white border-b border-color-sky-blue mb-5 pb-5">{{$t("SIGN_IN_TO_CONTINUE")}}</p>
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
          <v-card-item class="cardWrapper rounded-xl pa-5 mb-3">
            <!-- Image -->
            <v-img :eager="true" src="../assets/images/ad-icon.png" max-width="200px" class="mx-auto"/>

            <!-- Title -->
            <h3 id="adTitle" class="title-bold color-sharp-master-green text-uppercase text-center pb-2 mb-2">
              {{$t("PREMIUM_SERVER_AD_TITLE")}}</h3>

            <!-- Description -->
            <ul id="adDesc" class="list-unstyled text-white text-body-2">
              <li><v-icon class="me-3" icon="mdi-check-decagram-outline" color="sharp-master-green"/>{{$t("PREMIUM_FEATURE_1")}}</li>
              <li><v-icon class="me-3" icon="mdi-check-decagram-outline" color="sharp-master-green"/>{{$t("PREMIUM_FEATURE_2")}}</li>
              <li><v-icon class="me-3" icon="mdi-check-decagram-outline" color="sharp-master-green"/>{{$t("PREMIUM_FEATURE_3")}}</li>
              <li><v-icon class="me-3" icon="mdi-check-decagram-outline" color="sharp-master-green"/>{{$t("PREMIUM_FEATURE_4")}}</li>
            </ul>
          </v-card-item>


          <v-card-item  class="pa-0 w-100">
            <v-list v-if="subscriptionPlans" bg-color="transparent" >
              <!-- Plan item -->
              <v-list-item
                  v-for="plan in subscriptionPlans"
                  :key="plan.subscriptionPlanId"
                  lines="two"
                  color="white"
                  base-color="primary-darken-2"
                  variant="flat"
                  :disabled="$vpnHoodApp.data.userState.userAccount.subscriptionPlanId === plan.subscriptionPlanId"
                  :active="plan.subscriptionPlanId === selectedPlanId"
                  active-class="active"
                  class="plan-item ps-2 mb-2"
                  @click="selectedPlanId = plan.subscriptionPlanId"
              >
                <template v-slot:prepend>
                  <v-radio
                      v-if="$vpnHoodApp.data.userState.userAccount.subscriptionPlanId !== plan.subscriptionPlanId"
                      v-model="selectedPlanId"
                      density="compact"
                      :true-value="plan.subscriptionPlanId"
                      :class="[selectedPlanId === plan.subscriptionPlanId?'':'opacity-30', 'me-3 text-white' ]"
                      color="sharp-master-green"
                  />
                </template>

                <!-- Plan title -->
                <v-list-item-title class="d-flex align-center">
                  <h3 v-if="plan.subscriptionPlanId === SubscriptionPlansId.HiddenServer">{{ $t("HIDDEN_SERVER") }}</h3>
                  <h3 v-if="plan.subscriptionPlanId === SubscriptionPlansId.GlobalServer">{{ $t("GLOBAL_SERVERS") }}</h3>
                  <h3 v-if="plan.subscriptionPlanId === SubscriptionPlansId.BundleServers">{{ $t("BUNDLE_SERVERS") }}</h3>
                  <v-btn icon="mdi-information-symbol" size="20px" variant="outlined" color="white" class="ms-3 opacity-30" @click="openPlanNoticeDialog(plan.subscriptionPlanId)"/>
                </v-list-item-title>

                <v-list-item-subtitle class="text-caption text-white opacity-30">

                  <!-- Already subscribed -->
                  <template v-if="$vpnHoodApp.data.userState.userAccount.subscriptionPlanId === plan.subscriptionPlanId">
                    <v-chip
                        color="sharp-master-green"
                        density="compact"
                        variant="tonal"
                        size="small"
                        :text="$t('ALREADY_SUBSCRIBED')"
                        class="mt-2"
                    />
                  </template>

                  <!-- Plan description -->
                  <template v-else>
                    <span v-if="plan.subscriptionPlanId === SubscriptionPlansId.HiddenServer">{{ $t("HIDDEN_SERVER") }}</span>
                    <span v-if="plan.subscriptionPlanId === SubscriptionPlansId.GlobalServer">{{ $t("GLOBAL_SERVERS") }}</span>
                    <span v-if="plan.subscriptionPlanId === SubscriptionPlansId.BundleServers">{{ $t("BUNDLE_SERVERS_DESC") }}</span>
                  </template>
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
                variant="elevated"
                class="grad-btn font-weight-bold text-capitalize"
                :text="$t('CONTINUE')"
                @click="onContinuePurchase"
            />
          </v-card-item>
        </template>

      </v-card>
  </v-dialog>

  <!-- Pending purchase process dialog -->
  <v-dialog
      v-model="showPendingProcessDialog"
      :persistent="true"
      width="auto">
    <v-card
        rounded="lg"
        color="master-green"
        class="py-5">

      <v-card-text>
        {{ $t("WAITING_TO_COMPLETE_ORDER_PROCESS") }}
        <v-progress-linear
            class="mt-4"
            :indeterminate="true"
            rounded
        ></v-progress-linear>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Purchase complete dialog -->
  <v-dialog
      v-model="showPurchaseCompleteDialog"
      :persistent="true"
      width="auto">
    <v-card
        rounded="lg"
        color="master-green"
        class="py-5">

      <!-- If order is complete -->
      <v-card-title class="text-center text-h5">
        <div>
          <v-icon class="text-h2">mdi-party-popper</v-icon>
        </div>
        {{ $t("CONGRATULATIONS") }}
      </v-card-title>

      <v-card-text>
        {{ $t("PURCHASE_AND_PROCESS_IS_COMPLETE_MESSAGE") }}
      </v-card-text>

      <v-card-actions>
        <div class="mx-auto">
          <v-btn
              rounded="pill"
              variant="flat"
              append-icon="mdi-chevron-right"
              class="ms-2 px-5 color-master-green"
              @click="showServers"
              >
            {{ $t("SHOW_SERVERS") }}
          </v-btn>

          <v-btn
              rounded="pill"
              variant="outlined"
              class="ms-2 px-8"
              @click="showPurchaseCompleteDialog = false">
            {{ $t("CLOSE") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Notice dialog on purchase subscription -->
  <v-dialog
      v-model="showPlanNoticeDialog"
      :persistent="true"
      width="auto">
    <v-card
        rounded="lg"
        color="master-green"
        class="pt-0 pb-3 notice position-relative">
      <v-card-text>
        <p v-if="planNoticeType === SubscriptionPlansId.HiddenServer">{{$t('HIDDEN_SERVER_NOTICE')}}</p>
        <p v-if="planNoticeType === SubscriptionPlansId.GlobalServer" v-html="$t('GLOBAL_SERVERS_NOTICE')"></p>
        <p v-if="planNoticeType === SubscriptionPlansId.BundleServers">{{$t('BUNDLE_SERVERS_NOTICE')}}</p>
      </v-card-text>
      <v-card-actions>
        <v-btn
            rounded="pill"
            variant="outlined"
            class="ms-2 px-8"
            @click="closePlanNoticeDialog">
          {{ $t("CLOSE") }}
        </v-btn>
        <v-spacer/>
        <v-btn
            v-if="showContinueInNotice"
            rounded="pill"
            variant="flat"
            append-icon="mdi-chevron-right"
            class="ms-2 px-5 color-master-green"
            @click="googlePlayPurchaseProduct()">
          {{ $t("CONTINUE") }}
        </v-btn>
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
      this.$emit('update:modelValue',true);
      if (this.$vpnHoodApp.data.userState.userAccount){
        try {
          this.$vpnHoodApp.data.uiState.showLoadingDialog = true;
          await this.showProducts();
        }
        finally {
          this.$vpnHoodApp.data.uiState.showLoadingDialog = false;
        }
      }
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

    // Check current order state 'isProcessed' for 6 time
    async processPendingOrder(providerOrderId: string): Promise<void> {
      const accountClient = ClientApiFactory.instance.createAccountClient();

      for (let counter = 0; counter < 5; counter++) {
        try {
          const appSubscriptionOrder = await accountClient.getSubscriptionOrderByProviderOrderId(providerOrderId);

          if (!appSubscriptionOrder.isProcessed)
            throw new Error("Order has not processed yet.");

          // Order process complete
          await this.$vpnHoodApp.processUserAccount();
          this.showPurchaseCompleteDialog = true;
          return;
        }
        catch (err: any) {
          console.log(err);
          await new Promise<void>(resolve => setTimeout(resolve, 5000));
        }
      }
      throw new Error(this.$t("ORDER_PROCESSING_FAILED"));
    },

    showServers(){
      this.$emit('update:modelValue',false);
      this.$router.replace("/servers");
    }
  }
})
</script>

<!--suppress CssUnusedSymbol -->
<style scoped>
#adTitle {
  font-size: 130%;
  border-bottom: 1px rgba(63, 246, 169, 0.15) solid;
}
#adDesc {
  line-height: 31px;
}
.cardWrapper {
  border: 1px rgba(22, 163, 254, 0.44) solid;
  background-color: var(--primary-darken-2);
}
/*noinspection ALL*/
.v-card-item {
  width: 100%;
  max-width: 500px;
}
.plan-item{
  border-width: 1px;
  border-style: solid;
  border-radius: 15px;
}
.plan-item:not(.active){
  border-color: rgba(255, 255, 255, 0.2);
}
.plan-item.active{
  border-width: 2px;
  border-color: var(--sharp-master-green);
  background-color: var(--primary-darken-2) !important;
  color: white !important;
}
</style>
<!--suppress CssUnusedSymbol -->
<style>
.plan-item .v-list-item__overlay{
  display: none !important;
}
</style>