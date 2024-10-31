<script setup lang="ts">
import { computed } from 'vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import PremiumConnectButton from '@/components/PromoteDialog/PremiumConnectButton.vue';

const vhApp = VpnHoodApp.instance;
const dialogData = computed(() => vhApp.data.uiState.promoteDialogData);

const props = defineProps<{
  modelValue: boolean,
}>();
</script>

<template>
  <v-dialog
    :modelValue="props.modelValue"
    @update:modelValue="$emit('update:modelValue',$event)"
    :persistent="true"
    fullscreen
    content-class="pa-3"
  >
    <v-card class="justify-space-between primary-bg-grad border border-secondary text-white rounded-lg pb-3">
      <div class="mb-10">
        <v-img
          :eager="true"
          :src="vhApp.getImageUrl('premium-servers.webp')"
          alt="Premium Servers Icon"
          width="80%"
          max-width="500px"
          class="mx-auto"
        />
        <h3 class="text-center" v-html="$t('SELECTED_LOCATION_IS_PREMIUM')" />
        <p class="px-5 text-disabled text-center text-caption">
          For unlimited
          access,
          please upgrade
          to premium.
          Otherwise, limited access options are available based on your country</p>
      </div>


      <div class="px-3">

        <premium-connect-button
          icon="mdi-play-box-lock-open-outline"
          :title="$t('WATCH_REWARDED_AD')"
          :description="$t('WATCH_REWARDED_AD_DESC')"
          :button-text="$t('CONNECT')"
        />
        <premium-connect-button
          icon="mdi-timer-lock-open-outline"
          :title="$t('TRY_PREMIUM')"
          :description="$t('TRY_PREMIUM_DESC')"
          :button-text="$t('CONNECT')"
        />
        <premium-connect-button
          icon="mdi-crown-circle-outline"
          :title="$t('GO_PREMIUM_2')"
          :description="$t('GO_PREMIUM_DESC')"
          :button-text="$t('UPGRADE')"
        />

        <!-- Back button -->
        <v-btn
          rounded="pill"
          variant="text"
          :ripple="false"
          color="secondary"
          prepend-icon="mdi-chevron-left"
          class="opacity-60 text-capitalize align-self-start px-0 mt-3"
          :text="$t('GO_BACK')"
          @click="$emit('update:modelValue', false)"
        />

      </div>

    </v-card>
  </v-dialog>
</template>
