<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { Util } from '@/helpers/Util';
import router from '@/services/router';
import { ref } from 'vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import AppBar from '@/components/AppBar.vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const showConfirmRemoveCode = ref<boolean>(false);

async function removeCode() {
  try {
    await router.replace({name: 'HOME'});
    await vhApp.removePremiumCode();
  }
  finally {
    showConfirmRemoveCode.value = false;
  }
}
</script>

<template>
  <v-sheet class="primary-bg-grad">
    <app-bar/>

    <!-- Premium image -->
    <v-img
      :eager="true"
      :src="vhApp.getAssetPath('you-are-premium.webp')"
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
    <config-card v-if="vhApp.data.isPremiumAccount(true)">

      <v-card-title class="text-wrap">{{locale('WOULD_YOU_LIKE_TO_CHANGE')}}</v-card-title>

      <v-card-text class="text-disabled">{{locale('REMOVE_PREMIUM_CODE_TO_ADD_NEW_ONE_MSG')}}</v-card-text>

      <v-card-actions>
        <btn-style-1
          :text="locale('REMOVE_CODE')"
          class="ms-auto"
          :append-icon="Util.getLocalizedRightChevron()"
          size="small"
          @click="showConfirmRemoveCode = true"
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
    <config-card v-else-if="vhApp.data.isPremiumAccount()">

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

    <!-- Confirm remove premium code -->
    <ConfirmDialog
      v-model="showConfirmRemoveCode"
      :title="locale('CONFIRM_REMOVE_PREMIUM_CODE')"
      :message="locale('CONFIRM_REMOVE_PREMIUM_CODE_DESC')"
      @confirm="removeCode()"
    />

  </v-sheet>
</template>
