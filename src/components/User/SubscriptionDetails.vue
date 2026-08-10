<script setup lang="ts">
import { computed } from 'vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { Util } from '@/helpers/Util';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const userAccount = computed(() => vhApp.data.userState.userAccount);
</script>

<template>
  <config-card >
    <v-card-title>{{locale('SUBSCRIPTION_DETAILS')}}</v-card-title>
    <v-card-text>
      <ul id="premiumInfoList">

        <!-- Created time -->
        <li>
          <span class="text-label-large text-disabled">{{ locale('SUBSCRIBED_SINCE') }}:</span>
          <span class="text-label-large">{{ Util.getShortDate(userAccount?.createdTime) }}</span>
        </li>

        <!-- Next payment or Expiration time -->
        <li>
            <span class="text-label-large text-disabled">
              {{ userAccount?.isAutoRenew ? locale('NEXT_PAYMENT') : locale('EXPIRATION_TIME') }}:
            </span>
          <span :class="[userAccount?.isAutoRenew ? 'text-active' : 'text-error', 'text-label-large']">
              {{ Util.getShortDate(userAccount?.expirationTime) }}
            </span>
        </li>

        <!-- Auto renew -->
        <li>
          <span class="text-label-large text-disabled">{{ locale('AUTO_RENEW') }}:</span>
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
          <span class="text-label-large text-disabled">{{ locale('PRICE') }}:</span>
          <span class="text-label-large">
                <span class="text-body-small text-disabled">{{ userAccount?.priceCurrency }}</span>
                {{ userAccount?.priceAmount }}{{ locale('PER_MONTH') }}
              </span>
        </li>
      </ul>
    </v-card-text>

    <!-- Manage-subscription button. The URL comes from the API per account
         (userAccount.subscriptionManagementUrl) and is present only when THIS build's store billed
         the active subscription — so this component knows NO store: no hardcoded URLs, no platform
         branching, nothing for a fork to edit, and no way to name another platform's store inside an
         App Store build (App Review 2.3.10/3.1.1). A subscription billed by another store gets a
         neutral sentence instead of a link. -->
    <v-card-actions v-if="userAccount?.subscriptionManagementUrl">
      <btn-style-1
        class="ms-auto"
        :append-icon="Util.getLocalizedRightChevron()"
        :text="locale('MANAGE_SUBSCRIPTION')"
        size="small"
        :href="userAccount?.subscriptionManagementUrl"
        target="_blank"
      />
    </v-card-actions>
    <v-card-text v-else class="text-body-small text-disabled pt-0">
      {{ locale('SUBSCRIPTION_MANAGED_WHERE_PURCHASED') }}
    </v-card-text>

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
