<script lang="ts" setup>
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import router from '@/services/router';
import AppBar from '@/components/AppBar.vue';
import UserDetails from '@/components/User/UserDetails.vue';
import ChangePremiumMethod from '@/components/User/ChangePremiumMethod.vue';
import PremiumCodeDetails from '@/components/User/PremiumCodeDetails.vue';
import UserPremiumImage from '@/components/User/UserPremiumImage.vue';

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
  <v-sheet class="primary-bg-grad">
    <app-bar/>

    <!-- Premium image -->
    <user-premium-image/>

    <!-- User details -->
    <user-details v-if="vhApp.data.userState.userAccount"/>

    <!-- Remove premium code -->
    <change-premium-method
      :title="locale('REMOVE_CURRENT_PREMIUM_CODE')"
      :description="locale('REMOVE_CURRENT_PREMIUM_CODE_DESC')"
      :button-name="locale('REMOVE_CODE')"
      @button-click="removeCode()"
    />

    <premium-code-details/>

  </v-sheet>
</template>

