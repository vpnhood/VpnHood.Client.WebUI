<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ClientApiFactory } from '@/services/ClientApiFactory';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import router from '@/services/router';
import { Util } from '@/helpers/Util';
import PremiumFeaturesCarousel from '@/components/PurchaseSubscription/PremiumFeaturesCarousel.vue';
import StoreUnavailable from '@/components/PurchaseSubscription/StoreUnavailable.vue';
import PremiumByCode from '@/components/PurchaseSubscription/PremiumByCode.vue';
import PurchaseByStore from '@/components/PurchaseSubscription/PurchaseByStore.vue';
import type { AppPurchaseOptions } from '@/services/VpnHood.Client.Api';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;
const purchaseOptions = ref<AppPurchaseOptions>();

onMounted(async () => {
    const billingClient = ClientApiFactory.instance.createBillingClient();
    purchaseOptions.value = await billingClient.getPurchaseOptions();
});
</script>

<template>
  <grad-sheet>

      <!-- Back button -->
      <tonal-icon-btn
        v-if="!vhApp.data.features.isTv"
        :icon="Util.getLocalizedLeftChevron()"
        class="position-absolute mt-3"
        style="z-index: 999"
        @click="router.go(-1)"
      />

      <!-- Features Carousel -->
      <div class="d-flex align-center justify-center flex-grow-1">
        <premium-features-carousel/>
      </div>


      <!-- Premium by google and by code buttons -->
      <div class="mt-4">

        <!-- Show skeleton loader till to load google play info -->
        <v-skeleton-loader
          v-if="!purchaseOptions"
          color="rgba(var(--v-theme-card-on-grad-bg), 0.3)"
          type="heading, subtitle"
          class="mb-4"
          height="125px"
        />

        <!-- Purchase by store -->
        <purchase-by-store
          v-else-if="purchaseOptions?.isStoreAvailable"
          :subscription-plans="purchaseOptions.subscriptionPlans"
        />

        <!-- Store unavailable -->
        <store-unavailable
          v-else-if="purchaseOptions?.storeError"
          :error-message="purchaseOptions.storeError.message"
        />

        <!-- Purchase by Web -->
        <btn-style-1
          v-if="purchaseOptions?.purchaseUrl"
          class="mt-4 text-premium-code-btn"
          block
          rounded="pill"
          height="40px"
          color="rgba(var(--v-theme-card-on-grad-bg), 0.3)"
          prepend-icon="mdi-web"
          :text="locale('PURCHASE_VIA_WEB')"
          target="_blank"
          :href="purchaseOptions.purchaseUrl"
        />

        <!-- Input premium code -->
        <premium-by-code v-if="purchaseOptions?.canGoPremiumByCode" />
      </div>

  </grad-sheet>
</template>
