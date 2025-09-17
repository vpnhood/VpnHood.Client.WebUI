<script lang="ts" setup>
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { Util } from '@/helpers/Util';
import { AppPackageName } from '@/helpers/UiConstants';
import { ref } from 'vue';
import router from '@/services/router';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import AppBar from '@/components/AppBar.vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;
const userAccount = vhApp.data.userState.userAccount;
const showConfirmSignOut = ref<boolean>(false);

async function onSignOut() {
  await vhApp.signOut();
  await router.replace({name: 'HOME'});
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
  <v-sheet :class="{'primary-bg-grad' : vhApp.data.isPremiumAccount}">
    <app-bar/>

    <!-- Premium image -->
    <div v-if="vhApp.data.isPremiumAccount" class="text-center">
      <v-img
        :eager="true"
        :src="vhApp.getAssetPath('you-are-premium.webp')"
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
          :color="vhApp.data.isPremiumAccount ? 'active' : 'highlight'"
          class="ms-auto"
          size="small"
          @click="showConfirmSignOut = true"
        />
      </v-card-actions>

    </config-card>

    <!-- Premium code details -->
    <config-card v-if="vhApp.data.isPremiumAccount && vhApp.data.hasPremiumCode">

      <v-card-title>{{locale('PREMIUM_CODE_DETAILS')}}</v-card-title>

      <v-card-text>
        <ul v-if="vhApp.data.state.sessionInfo?.accessInfo" id="premiumInfoList">

          <!-- Activation time -->
          <li>
            <span class="text-subtitle-2 text-disabled">{{ locale('ACTIVATED_ON') }}:</span>
            <span class="text-subtitle-2 text-active">{{
                Util.getShortDate(vhApp.data.state.sessionInfo.accessInfo.createdTime) }}</span>
          </li>

          <!-- Expiration time -->
          <li>
            <span class="text-subtitle-2 text-disabled">{{ locale('EXPIRATION_DATE') }}:</span>
            <span :class="[vhApp.data.state.sessionInfo.accessInfo.expirationTime ? 'text-error' : 'text-active']">
              {{ vhApp.data.state.sessionInfo.accessInfo.expirationTime
              ? Util.getShortDate(vhApp.data.state.sessionInfo.accessInfo.expirationTime)
              : locale('NEVER') }}
            </span>
          </li>

          <!-- Last use -->
          <li>
            <span class="text-subtitle-2 text-disabled">{{ locale('LAST_USED') }}:</span>
            <span class="text-highlight">
              {{ Util.getShortDate(vhApp.data.state.sessionInfo.accessInfo.lastUsedTime) }}
            </span>
          </li>

          <!-- Used device -->
          <li>
            <span class="text-subtitle-2 text-disabled">{{locale('USED_BY')}}</span>
            <span v-if="vhApp.data.state.sessionInfo.accessInfo.devicesSummary?.hasMoreDevices" class="text-highlight">
              {{locale('MORE_THAN_X_DEVICES', {x: vhApp.data.state.sessionInfo.accessInfo.devicesSummary?.deviceCount})}}
            </span>
            <span v-else class="text-highlight">
              {{ vhApp.data.state.sessionInfo.accessInfo.devicesSummary?.deviceCount }} {{locale('DEVICE') }}
            </span>
          </li>

        </ul>

        <!-- If connection state is not connected -->
        <div v-else class="text-center text-caption text-disabled">
          <v-icon icon="mdi-information-outline" size="30"/>
          <p class="mt-3">{{locale('DISPLAY_INFO_AFTER_CONNECTION')}}</p>
        </div>

      </v-card-text>

      <!-- More details -->
      <v-card-actions v-if="vhApp.data.state.sessionInfo?.accessInfo">
        <btn-style-1
          class="ms-auto"
          :append-icon="Util.getLocalizedRightChevron()"
          :text="locale('MORE_DETAILS')"
          size="small"
          @click="router.push({name: 'STATISTICS'})"
        />
      </v-card-actions>

    </config-card>

    <!-- Subscriptions details -->
    <config-card v-else-if="vhApp.data.isPremiumAccount">

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

    <!-- Go premium -->
    <config-card v-else-if="vhApp.data.state.clientProfile?.selectedLocationInfo?.options.canGoPremium"
                 >
      <v-card-title>{{locale('UPGRADE')}}</v-card-title>
      <v-card-text class="d-flex align-center justify-space-between">
        <v-img
          :eager="true"
          :src="vhApp.getAssetPath('free-to-premium-account-icon.webp')"
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

    <!-- Confirm sign-out dialog -->
    <ConfirmDialog
      v-model="showConfirmSignOut"
      :title="locale('CONFIRM_SIGN_OUT_TITLE')"
      :message="locale('CONFIRM_SIGN_OUT_DESC')"
      @confirm="onSignOut()"
    />

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

#premiumInfoList > li:nth-child(even) {
  /*noinspection CssUnresolvedCustomProperty*/
  background-color: rgb(var(--v-theme-zebra-on-config-card-bg));
}
</style>
