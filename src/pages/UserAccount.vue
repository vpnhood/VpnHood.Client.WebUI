<script lang="ts" setup>
import AppBar from '@/components/AppBar.vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { Util } from '@/helpers/Util';
import { AppPackageName } from '@/helpers/UiConstants';
import { ref } from 'vue';
import router from '@/services/router';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;
const userAccount = vhApp.data.userState.userAccount;
const showConfirmSignOut = ref<boolean>(false);

async function onSignOut() {
  await vhApp.signOut();
  await router.replace('/');
}

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
// TODO: improve page
</script>

<template>

  <!-- Page header -->
  <AppBar :page-title="locale('ACCOUNT')" />

  <v-sheet :class="{'primary-bg-grad' : vhApp.isPremiumAccount()}">

    <!-- Premium image -->
    <div v-if="vhApp.isPremiumAccount()" class="text-center">
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

      <!-- User details -->
      <config-card>

        <!-- User name -->
        <v-card-title>{{ userAccount?.name }}</v-card-title>

        <!-- User email -->
        <v-card-subtitle class="text-disabled">{{ userAccount?.email }}</v-card-subtitle>

        <!-- Sign out button -->
        <v-card-actions>
          <btn-style-1
            :text="locale('SIGN_OUT')"
            :color="vhApp.isPremiumAccount() ? 'active' : 'highlight'"
            class="ms-auto"
            size="small"
            @click="showConfirmSignOut = true"
          />
        </v-card-actions>

      </config-card>

      <!-- Subscriptions details -->
      <config-card v-if="vhApp.isPremiumAccount()">

        <v-card-title>{{locale('SUBSCRIPTION_DETAILS')}}</v-card-title>

        <v-card-text>
          <ul id="subscriptionInfoList" style="list-style: none;">
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

      <!-- Go premium -->
      <config-card v-else-if="vhApp.data.state.clientProfile?.selectedLocationInfo?.options.canGoPremium"
                   >
        <v-card-title>{{locale('UPGRADE')}}</v-card-title>
        <v-card-text class="d-flex align-center justify-space-between">
          <v-img
            :eager="true"
            :src="vhApp.getImageUrl('free-to-premium-account-icon.webp')"
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
            @click="router.push('/purchase-subscription')"
          />
        </v-card-actions>
      </config-card>

  </v-sheet>

  <!-- Confirm sign-out dialog -->
  <ConfirmDialog
    v-model="showConfirmSignOut"
    :title="locale('CONFIRM_SIGN_OUT_TITLE')"
    :message="locale('CONFIRM_SIGN_OUT_DESC')"
    @confirm="onSignOut()"
  />
</template>

<style scoped>
#subscriptionInfoList > li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 7px;
}

#subscriptionInfoList > li:nth-child(even) {
  /*noinspection CssUnresolvedCustomProperty*/
  background-color: rgb(var(--v-theme-zebra-on-config-card-bg));
}
</style>
