<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { Util } from '@/helpers/Util';
import router from '@/services/router';
import AppBar from '@/components/AppBar.vue';

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
    <v-img
      :eager="true"
      :src="Util.getAssetPath('you-are-premium.webp')"
      alt="Premium Image"
      width="100%"
      max-width="371px"
      class="mx-auto"
    />

    <div class="text-active text-center mt-n7 mb-10">
      <h2>{{ locale('CONGRATULATIONS') }}!</h2>
      <h3>{{ locale('YOU_ARE_PREMIUM') }}</h3>
    </div>

    <!-- user is premium by code -->
    <config-card v-if="vhApp.data.isPremiumAccount && vhApp.data.hasPremiumCode">

      <v-card-title class="text-wrap">{{locale('WOULD_YOU_LIKE_TO_CHANGE')}}</v-card-title>

      <v-card-text class="text-disabled">{{locale('REMOVE_PREMIUM_CODE_TO_ADD_NEW_ONE_MSG')}}</v-card-text>

      <v-card-actions>
        <btn-style-1
          :text="locale('REMOVE_CODE')"
          class="ms-auto"
          :append-icon="Util.getLocalizedRightChevron()"
          size="small"
          @click="removeCode()"
        />
        <v-btn
          v-if="vhApp.data.isConnected"
          variant="plain"
          :text="locale('STATISTICS')"
          size="small"
          @click="router.push({name: 'STATISTICS'})"
        />
      </v-card-actions>
    </config-card>

    <!-- user is premium by purchase subscription from google play -->
    <config-card v-else-if="vhApp.data.isPremiumAccount">

      <v-card-title class="text-wrap">{{locale('WOULD_YOU_LIKE_TO_CHANGE')}}</v-card-title>

      <v-card-text class="text-disabled">{{locale('SIGN_OUT_TO_USE_PREMIUM_CODE_MSG')}}</v-card-text>

      <v-card-actions>
        <btn-style-1
          class="ms-auto"
          :text="locale('ACCOUNT')"
          :append-icon="Util.getLocalizedRightChevron()"
          size="small"
          @click="router.push({name: 'ACCOUNT'})"
        />
      </v-card-actions>
    </config-card>

  </v-sheet>
</template>
