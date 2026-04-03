<script lang="ts" setup>
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { Util } from '@/helpers/Util';
import router from '@/services/router';
import AppBar from '@/components/AppBar.vue';
import UserDetails from '@/components/User/UserDetails.vue';
import ChangePremiumMethod from '@/components/User/ChangePremiumMethod.vue';
import PremiumCodeDetails from '@/components/User/PremiumCodeDetails.vue';
import UserPremiumImage from '@/components/User/UserPremiumImage.vue';
import SubscriptionDetails from '@/components/User/SubscriptionDetails.vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

async function removeCode(): Promise<void> {
  const result = await vhApp.showConfirmDialog(locale('CONFIRM_REMOVE_PREMIUM_CODE'), locale('CONFIRM_REMOVE_PREMIUM_CODE_DESC'));
  if (!result)
    return;

  await router.replace({name: 'HOME'});
  await vhApp.removePremiumCode();
}
</script>

<template>
  <v-sheet :class="{'primary-bg-grad' : vhApp.data.isPremiumUser}">
    <app-bar/>

    <!-- Premium image -->
    <user-premium-image v-if="vhApp.data.isPremiumUser"/>

    <!-- User details -->
    <user-details v-if="vhApp.data.userState.userAccount"/>

    <!-- Premium user by google subscription -->
    <template v-if="vhApp.data.isPremiumByGoogle">

      <!-- Sign out and remove google subscription -->
      <change-premium-method
        :title="locale('WOULD_YOU_LIKE_TO_CHANGE')"
        :description="locale('SIGN_OUT_TO_USE_PREMIUM_CODE_MSG')"
        :button-name="locale('SIGN_OUT')"
        @button-click="vhApp.signOut()"
      />

      <subscription-details />

      <premium-code-details/>
    </template>

    <!-- Premium user by code -->
    <template v-else-if="vhApp.data.isPremiumByCode">

      <!-- Remove code -->
      <change-premium-method
        :title="locale('REMOVE_CURRENT_PREMIUM_CODE')"
        :description="locale('REMOVE_CURRENT_PREMIUM_CODE_DESC')"
        :button-name="locale('REMOVE_CODE')"
        @button-click="removeCode()"
      />

      <premium-code-details/>

    </template>

    <!-- Go premium -->
    <config-card v-else-if="vhApp.data.state.clientProfile?.canGoPremium">
      <v-card-title>{{locale('UPGRADE')}}</v-card-title>
      <v-card-text class="d-flex align-center justify-space-between">
        <v-img
          :eager="true"
          :src="Util.getAssetPath('free-to-premium-account-icon.webp')"
          alt="Go Premium Image"
          width="100%"
          max-width="92px"
          class="me-4"
        />
        <div class="flex-grow-1">
          <p v-html="locale('UPGRADE_ACCOUNT_DESC')"></p>
        </div>
      </v-card-text>
      <v-card-actions>
        <btn-style-1
          class="ms-auto"
          :append-icon="Util.getLocalizedRightChevron()"
          :text="locale('GO_PREMIUM')"
          size="small"
          @click="router.push({name: 'PURCHASE_SUBSCRIPTION'})"
        />
      </v-card-actions>
    </config-card>

  </v-sheet>
</template>
