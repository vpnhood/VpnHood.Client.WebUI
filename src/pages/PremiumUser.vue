<script setup lang="ts">
import AppBar from '@/components/AppBar.vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { Util } from '@/helpers/Util';
import router from '@/services/router';
import { ref } from 'vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import { ClientProfileUpdateParams, PatchOfString } from '@/services/VpnHood.Client.Api';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const showConfirmSignOut = ref<boolean>(false);
const showConfirmRemoveCode = ref<boolean>(false);

async function onSignOut() {
  try {
    await vhApp.signOut();
    await router.replace('/purchase-subscription');
  }
  finally {
    showConfirmSignOut.value = false;
  }
}

async function removePremiumCode() {
  try {
    const profileId = vhApp.data.state.clientProfile?.clientProfileId;
    if (!profileId)
      throw new Error("Could not find the profile id.");

    await vhApp.clientProfileClient.update(profileId, new ClientProfileUpdateParams({
      accessCode: new PatchOfString({value: null})
    }));
    await router.replace('/purchase-subscription');
  }
  finally {
    showConfirmRemoveCode.value = false;
  }
}
</script>

<template>

  <!-- Page header -->
  <AppBar :page-title="locale('PREMIUM_USER')" />

  <v-sheet class="primary-bg-grad">

    <!-- Premium image -->
    <div class="text-center">
      <v-img
        :eager="true"
        :src="vhApp.getImageUrl('you-are-premium.webp')"
        alt="Premium Image"
        width="100%"
        max-width="371px"
      />
      <div class="text-active mt-n7 mb-10">
        <h2>{{ locale('CONGRATULATIONS') }}!</h2>
        <h3>{{ locale('YOU_ARE_PREMIUM') }}</h3>
      </div>
    </div>

    <!-- user is premium by code -->
    <config-card v-if="vhApp.isPremiumAccount(true)">

      <v-card-title class="text-wrap">{{locale('WOULD_YOU_LIKE_TO_CHANGE')}}</v-card-title>

      <v-card-text class="text-disabled">{{locale('REMOVE_PREMIUM_CODE_TO_ADD_NEW_ONE_MSG')}}</v-card-text>

      <v-card-actions>
        <btn-style-1
          class="ms-auto"
          :text="locale('STATISTICS')"
          :append-icon="Util.getLocalizedRightChevron()"
          size="small"
          @click="router.push('/premium-Statistics')"
        />
        <v-btn
          variant="plain"
          :text="locale('REMOVE_CODE')"
          size="small"
          @click="showConfirmRemoveCode = true"
        />
      </v-card-actions>
    </config-card>

    <!-- user is premium by purchase subscription from google play -->
    <config-card v-else-if="vhApp.isPremiumAccount()">

      <v-card-title class="text-wrap">{{locale('WOULD_YOU_LIKE_TO_CHANGE')}}</v-card-title>

      <v-card-text class="text-disabled">{{locale('SIGN_OUT_TO_USE_PREMIUM_CODE_MSG')}}</v-card-text>

      <v-card-actions>
        <btn-style-1
          class="ms-auto"
          :text="locale('STATISTICS')"
          :append-icon="Util.getLocalizedRightChevron()"
          size="small"
          @click="router.push('/premium-Statistics')"
        />
        <v-btn
          variant="plain"
          :text="locale('SIGN_OUT')"
          size="small"
          @click="showConfirmSignOut = true"
        />
      </v-card-actions>
    </config-card>

    <!-- Confirm remove premium code -->
    <ConfirmDialog
      v-model="showConfirmRemoveCode"
      :title="locale('CONFIRM_REMOVE_PREMIUM_CODE')"
      :message="locale('CONFIRM_REMOVE_PREMIUM_CODE_DESC')"
      @confirm="removePremiumCode()"
    />

    <!-- Confirm sign-out dialog -->
    <ConfirmDialog
      v-model="showConfirmSignOut"
      :title="locale('CONFIRM_SIGN_OUT_TITLE')"
      :message="locale('CONFIRM_SIGN_OUT_DESC')"
      @confirm="onSignOut()"
    />

  </v-sheet>
</template>
