<script setup lang="ts">
import { Util } from '@/helpers/Util';
import i18n from '@/locales/i18n';
import { ref } from 'vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import router from '@/services/router';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const remainingTimeSecond = ref<number>(0);
const showExtendDialog = ref<boolean>(false);
const showLoadingAdDialog = ref<boolean>(false);

const fiveMinutes = 299;
const fifteenMinutes = 899;
function calcRemainingTime(): string{
  const currentDate: Date = new Date();
  const expireTime = vhApp.data.state.sessionStatus?.accessUsage?.expirationTime;
  if (!expireTime)
    return "";

  const diffTime = expireTime.getTime() - currentDate.getTime();
  remainingTimeSecond.value = diffTime > 0 ? Math.floor(diffTime / 1000) : 0;

  if (remainingTimeSecond.value < fiveMinutes)
    showExtendDialog.value = false;

  const hrs = Math.floor(remainingTimeSecond.value / 3600);
  const mins = Math.floor((remainingTimeSecond.value % 3600) / 60);
  const secs = remainingTimeSecond.value % 60;
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}
function pad(num: number): string{
  return num.toString().padStart(2, '0');
}
function getCountdownColor(): string{
  if (remainingTimeSecond.value < fiveMinutes)
    return 'error';
  if (remainingTimeSecond.value < fifteenMinutes)
    return 'tertiary-lighten-1';
  return 'secondary-lighten-1';
}
async function showRewardedAd(){
  try {
    showLoadingAdDialog.value = true;
    await vhApp.apiClient.extendByRewardedAd();
    showExtendDialog.value = false;
  }
  catch (err: unknown){
    console.log(err);
  }
  finally {
    showLoadingAdDialog.value = false;
  }
}
</script>

<template>
  <v-chip
    prepend-icon="mdi-crown"
    :color="getCountdownColor()"
    class="pe-1"
    variant="tonal"
  >
    <span class="text-start" style="width: 63px">{{ calcRemainingTime() }}</span>
    <v-chip
      v-if="remainingTimeSecond > fiveMinutes"
      variant="flat"
      color="tertiary-lighten-1"
      class="text-capitalize text-primary font-weight-bold"
      :append-icon="Util.getLocalizedRightChevron()"
      size="small"
      :text="locale('EXTEND_IT')"
      @click="showExtendDialog = true"
    />
  </v-chip>

  <v-dialog
    v-model="showExtendDialog"
    :persistent="true"
    fullscreen
    content-class="pa-3"
    class="bg-black"
  >
    <v-card class="justify-space-between primary-bg-grad border border-secondary border-opacity-50 text-white rounded-lg pb-3 h-100">
      <h3 class="mt-5 text-center" v-html="locale('EXTEND_PREMIUM_SESSION')" />

      <v-img
        :eager="true"
        :src="vhApp.getImageUrl('extend-session.webp')"
        alt="Session Icon"
        width="100%"
        max-width="500px"
        class="mx-auto"
      />


      <div class="px-3">

        <!-- Watch rewarded ad -->
        <v-row dense align="center" class="button-wrapper border border-purple border-opacity-25 px-1 mx-0 mb-2 rounded-lg">
          <v-col cols="auto">
            <v-icon icon="mdi-play-box-lock-open-outline" color="tertiary" size="30" />
          </v-col>
          <v-col>
            <h4 class="text-capitalize">{{locale('WATCH_REWARDED_AD')}}</h4>
            <p class="text-disabled text-caption" style="line-height: 1.3">
              {{ locale('EXTEND_BY_REWARDED_AD_DESC', {minutes:
              vhApp.data.state.clientProfile?.selectedLocationInfo?.options.premiumByRewardedAd}) }}
            </p>
          </v-col>
          <v-col cols="auto" class="action-btn">
            <v-btn
              :text="locale('SHOW_AD')"
              color="secondary-lighten-1"
              class="text-primary-darken-2 px-2"
              size="small"
              rounded="pill"
              variant="flat"
              @click="showRewardedAd()"
            />
          </v-col>
        </v-row>

        <v-row dense align="center" class="button-wrapper border border-purple border-opacity-25 px-1 mx-0 mb-2 rounded-lg">
          <v-col cols="auto">
            <v-icon icon="mdi-crown-circle-outline" color="tertiary" size="30" />
          </v-col>
          <v-col>
            <h4 class="text-capitalize">{{locale('GO_PREMIUM_2')}}</h4>
            <p class="text-disabled text-caption" style="line-height: 1.3">{{ locale('GO_PREMIUM_DESC') }}</p>
          </v-col>
          <v-col cols="auto" class="action-btn">
            <v-btn
              :text="locale('UPGRADE')"
              color="secondary-lighten-1"
              class="text-primary-darken-2 px-2"
              size="small"
              rounded="pill"
              variant="flat"
              @click="router.push('/purchase-subscription')"
            />
          </v-col>
        </v-row>

        <!-- Back button -->
        <v-btn
          rounded="pill"
          variant="text"
          :ripple="false"
          color="secondary"
          prepend-icon="mdi-chevron-left"
          class="opacity-60 text-capitalize align-self-start px-0 mt-3"
          :text="locale('GO_BACK')"
          @click="showExtendDialog = false"
        />

      </div>

    </v-card>
  </v-dialog>

</template>
