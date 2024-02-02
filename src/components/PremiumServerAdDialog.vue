<template>
  <!-- Minimize Premium Server ad -->
  <v-btn
      :flat="true"
      variant="outlined"
      color="sharp-master-green"
      rounded="pill"
      size="small"
      height="40"
      @click="showProducts"
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
      <v-card color="#06124bd4" :flat="true" class="px-8 justify-center align-center">
        <!-- Close button -->
        <v-btn icon="mdi-window-close" variant="tonal" color="white" size="small" class="mx-auto mb-4" @click="$emit('update:modelValue',false)"/>

        <v-card-item id="adContentWrapper" class="rounded-xl pa-5 mb-3">
          <!-- Image -->
          <v-img :eager="true" src="../assets/images/ad-icon.png" max-width="200px" class="mx-auto"/>

          <!-- Title -->
          <h3 id="adTitle" class="title-bold color-sharp-master-green text-uppercase text-center pb-2 mb-2">
            {{$t("PREMIUM_SERVER_AD_TITLE")}}</h3>

          <!-- Description -->
          <ul id="adDesc" class="text-white text-body-2">
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
                 :active="plan.subscriptionPlanId === selectedPlanId"
                 active-class="active"
                 class="plan-item ps-2 mb-2"
                 @click="selectedPlanId = plan.subscriptionPlanId"
             >
               <template v-slot:prepend>
                 <v-radio
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
                 <v-btn icon="mdi-information-symbol" size="20px" variant="outlined" color="white" class="ms-3 opacity-30"/>
               </v-list-item-title>

               <v-list-item-subtitle class="text-caption text-white opacity-30">
                 <span v-if="plan.subscriptionPlanId === SubscriptionPlansId.HiddenServer">{{ $t("HIDDEN_SERVER") }}</span>
                 <span v-if="plan.subscriptionPlanId === SubscriptionPlansId.GlobalServer">{{ $t("GLOBAL_SERVERS") }}</span>
                 <span v-if="plan.subscriptionPlanId === SubscriptionPlansId.BundleServers">{{ $t("BUNDLE_SERVERS_DESC") }}</span>
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

        <!-- Buttons -->
        <v-card-item class="pa-0 w-100">
          <!-- Go to VpnHood Store page on google play button -->
          <v-btn
              href="https://play.google.com/store/apps/details?id=com.vphood.store.android"
              :block="true"
              rounded="pill"
              height="45"
              variant="elevated"
              class="grad-btn font-weight-bold text-capitalize"
              :text="$t('CONTINUE')"
          >
          </v-btn>


        </v-card-item>
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
      selectedPlanId: SubscriptionPlansId.HiddenServer as String,
    }
  },
  methods:{
    changeSelectedPlan(){
      console.log(this.selectedPlanId);
    },
    async showProducts(){
      try {
        this.$vpnHoodApp.data.uiState.showLoadingDialog = true;
        const billingClient = ClientApiFactory.instance.createBillingClient();
        this.subscriptionPlans = await billingClient.getSubscriptionPlans();
        console.log(this.subscriptionPlans);
        this.$emit('update:modelValue',true);
      }
      finally {
        this.$vpnHoodApp.data.uiState.showLoadingDialog = false;
      }

    }
  }
})
</script>

<style scoped>
#adTitle {
  font-size: 130%;
  border-bottom: 1px rgba(63, 246, 169, 0.15) solid;
}
#adDesc {
  line-height: 31px;
}
#adContentWrapper {
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
<style>
.plan-item .v-list-item__overlay{
  display: none !important;
}
</style>