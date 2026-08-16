<script lang="ts" setup>
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { Util } from '@/helpers/Util';
import router from '@/services/router';
import { ref } from 'vue';
import AppBar from '@/components/AppBar.vue';
import UserDetails from '@/components/User/UserDetails.vue';
import ChangePremiumMethod from '@/components/User/ChangePremiumMethod.vue';
import PremiumCodeDetails from '@/components/User/PremiumCodeDetails.vue';
import UserPremiumImage from '@/components/User/UserPremiumImage.vue';
import SubscriptionDetails from '@/components/User/SubscriptionDetails.vue';
import DeleteAccountDialog from '@/components/User/DeleteAccountDialog.vue';
import PremiumByCode from '@/components/PurchaseSubscription/PremiumByCode.vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const showChangeCodeSheet = ref(false);
const showDeleteDialog = ref(false);

// The account is read once, when the app boots, so this page would otherwise render whatever was
// true then. That matters after a deletion on another device: the app signs itself out as soon as
// the backend rejects its session, but a screen holding the old value keeps showing the person who
// was deleted. Re-reading here costs a local API call and makes this page tell the truth.
// NOTE deliberately absent (lifecycle §8): no code list, no picker, no deletion preview — the
// backend hands the app ONE code or nothing, and the deletion dialog is static text.
vhApp.loadAccount()
  .catch((error: unknown) => vhApp.processError(error));

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

    <!-- Premium user by the account's store subscription (Play or App Store) -->
    <template v-if="vhApp.data.isPremiumByAccount">

      <!-- Sign out and detach the store subscription -->
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

      <!-- Change code in ONE step: entering a new code replaces the current one — no
           remove-first ritual. Only where this build may take a typed code at all (a
           per-build capability, lifecycle §9); the Remove card below stays in every build,
           because removing is the escape that re-opens store buying, not code entry. -->
      <change-premium-method
        v-if="vhApp.data.features.isPremiumCodeSupported"
        :title="locale('CHANGE_PREMIUM_CODE')"
        :description="locale('CHANGE_PREMIUM_CODE_DESC')"
        :button-name="locale('CHANGE_CODE')"
        @button-click="showChangeCodeSheet = true"
      />

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

    <!-- Delete account — the stores require it wherever sign-in exists, so it shows for
         EVERY signed-in user, premium or not. Deliberately outside the premium
         v-if/v-else-if chain above. The dialog is static text plus an explicit
         acknowledgement (lifecycle §10): no codes, no counts, nothing fetched — the
         farewell mail is what carries the codes. -->
    <config-card v-if="vhApp.data.userState.userAccount">
      <v-card-title class="text-error">{{ locale('DELETE_MY_ACCOUNT') }}</v-card-title>
      <v-card-text>{{ locale('DELETE_MY_ACCOUNT_DESC') }}</v-card-text>
      <v-card-actions>
        <v-btn
          class="ms-auto"
          color="error"
          variant="tonal"
          size="small"
          :text="locale('DELETE_MY_ACCOUNT')"
          @click="showDeleteDialog = true"
        />
      </v-card-actions>
    </config-card>

    <!-- One-step change: the same code sheet the purchase page uses -->
    <premium-by-code v-model="showChangeCodeSheet"/>

    <!-- The static confirmation: warn, acknowledge, act -->
    <delete-account-dialog
      v-model="showDeleteDialog"
      @confirm="() => vhApp.deleteAccount()"
    />

  </v-sheet>
</template>
