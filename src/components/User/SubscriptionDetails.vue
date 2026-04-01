<script setup lang="ts">
import { computed } from 'vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { Util } from '@/helpers/Util';
import { AppPackageName } from '@/helpers/UiConstants';

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
  <config-card >
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
