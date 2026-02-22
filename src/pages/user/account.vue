<script lang="ts" setup>
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { Util } from '@/helpers/Util';
import { AppPackageName } from '@/helpers/UiConstants';
import router from '@/services/router';
import AppBar from '@/components/AppBar.vue';
import { computed } from 'vue';
import UserDetails from '@/components/User/UserDetails.vue';
import ChangePremiumMethod from '@/components/User/ChangePremiumMethod.vue';
import PremiumCodeDetails from '@/components/User/PremiumCodeDetails.vue';
import UserPremiumImage from '@/components/User/UserPremiumImage.vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;
const userAccount = computed(() => vhApp.data.userState.userAccount);

function formatDate(date: Date | null | undefined): string | null {
  if (!date)
    return null;

  // Format the date part
  const optionsDate: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  };
  return date.toLocaleDateString('locales', optionsDate).replace(',', '');
}
</script>

<template>
  <v-sheet :class="{'primary-bg-grad' : vhApp.data.isPremiumAccount}">
    <app-bar/>

    <!-- Premium image -->
    <user-premium-image v-if="vhApp.data.isPremiumAccount"/>

    <!-- User details -->
    <user-details v-if="userAccount"/>

    <!-- Premium subscription -->
    <template v-if="vhApp.data.isPremiumAccount">

      <!-- Sign out to change premium method -->
      <change-premium-method
        :title="locale('WOULD_YOU_LIKE_TO_CHANGE')"
        :description="locale('SIGN_OUT_TO_USE_PREMIUM_CODE_MSG')"
        :button-name="locale('SIGN_OUT')"
        @button-click="vhApp.signOut()"
      />

      <!-- Subscriptions details -->
      <config-card>
        <v-card-title>{{locale('SUBSCRIPTION_DETAILS')}}</v-card-title>
        <v-card-text>
          <ul id="premiumInfoList">

            <!-- Created time -->
            <li>
              <span class="text-subtitle-2 text-disabled">{{ locale('SUBSCRIBED_SINCE') }}:</span>
              <span class="text-subtitle-2">{{ formatDate(userAccount?.createdTime) }}</span>
            </li>

            <!-- Next payment or Expiration time -->
            <li>
            <span class="text-subtitle-2 text-disabled">
              {{ userAccount?.isAutoRenew ? locale('NEXT_PAYMENT') : locale('EXPIRATION_TIME') }}:
            </span>
              <span :class="[userAccount?.isAutoRenew ? 'text-active' : 'text-error', 'text-subtitle-2']">
              {{ formatDate(userAccount?.expirationTime) }}
            </span>
            </li>

            <!-- Auto renew -->
            <li>
              <span class="text-subtitle-2 text-disabled">{{ locale('AUTO_RENEW') }}:</span>
              <v-chip
                variant="tonal"
                density="compact"
                :color="userAccount?.isAutoRenew ? 'active' : 'error' "
              >
                {{ userAccount?.isAutoRenew ? locale('YES') : locale('NO') }}
              </v-chip>
            </li>

            <!-- Price -->
            <li>
              <span class="text-subtitle-2 text-disabled">{{ locale('PRICE') }}:</span>
              <span class="text-subtitle-2">
                <span class="text-caption text-disabled">{{ userAccount?.priceCurrency }}</span>
                {{ userAccount?.priceAmount }}{{ locale('PER_MONTH') }}
              </span>
            </li>
          </ul>
        </v-card-text>

        <!-- Manage on google play button -->
        <v-card-actions>
          <btn-style-1
            class="ms-auto"
            :append-icon="Util.getLocalizedRightChevron()"
            :text="locale('MANAGE_ON_GOOGLE_PLAY')"
            size="small"
            :href="`https://play.google.com/store/account/subscriptions?sku=${userAccount?.providerSubscriptionId}&package=${vhApp.isConnectApp() ? AppPackageName.VpnHoodConnect : AppPackageName.VpnHoodClient}`"
            target="_blank"
          />
        </v-card-actions>

      </config-card>

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

<style scoped>
#premiumInfoList{
  list-style: none;
}
#premiumInfoList > li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 7px;
}

#premiumInfoList > li:nth-child(odd) {
  /*noinspection CssUnresolvedCustomProperty*/
  background-color: rgb(var(--v-theme-zebra-on-config-card-bg));
}
</style>
