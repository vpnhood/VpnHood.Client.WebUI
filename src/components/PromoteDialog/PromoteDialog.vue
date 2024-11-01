<script setup lang="ts">
import { computed } from 'vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import PremiumConnectButton from '@/components/PromoteDialog/PremiumConnectButton.vue';
import type { PromoteDialogData } from '@/services/UiState';
import i18n from '@/locales/i18n';
import { ClientProfileUpdateParams, PatchOfString } from '@/services/VpnHood.Client.Api';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;
const dialogData = computed<PromoteDialogData>(() => vhApp.data.uiState.promoteDialogData);
const dialogTitle = dialogData.value.isPremiumLocation
  ? locale('SELECTED_LOCATION_IS_PREMIUM')
  : locale('SELECTED_LOCATION_IS_FREE');
const dialogDescription = dialogData.value.isPremiumLocation
  ? locale('SELECTED_LOCATION_IS_PREMIUM_DESC')
  : locale('SELECTED_LOCATION_IS_FREE_DESC');

const props = defineProps<{
  modelValue: boolean,
}>();

function action(){
  await VhApp.updateClientProfile(currentClientProfileInfo.value.clientProfileId, new
    ClientProfileUpdateParams(
      { clientProfileName: new PatchOfString({ value: newClientProfileName.value }
        )
      })
  );
  await vhApp.saveUserSetting();
}
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
        <h3 class="text-center" v-html="dialogTitle" />
        <p class="px-5 text-disabled text-center text-caption">{{dialogDescription}}</p>
      </div>


      <div class="px-3">

        <!-- Watch rewarded ad -->
        <premium-connect-button
          v-if="dialogData.showRewardedAd"
          icon="mdi-play-box-lock-open-outline"
          :title="$t('WATCH_REWARDED_AD')"
          :description="$t('WATCH_REWARDED_AD_DESC')"
          :button-text="$t('CONNECT')"
        />

        <!-- Try premium -->
        <premium-connect-button
          v-if="dialogData.showTryPremium"
          icon="mdi-timer-lock-open-outline"
          :title="$t('TRY_PREMIUM')"
          :description="$t('TRY_PREMIUM_DESC')"
          :button-text="$t('CONNECT')"
        />

        <!-- Go premium -->
        <premium-connect-button
          v-if="dialogData.showGoPremium"
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
