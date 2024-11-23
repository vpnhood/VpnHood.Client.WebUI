<script lang="ts" setup>
import AppBar from '@/components/AppBar.vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { Util } from '@/helpers/Util';
import { AppPackageName } from '@/helpers/UiConstants';


const vhApp = VpnHoodApp.instance
const locale = i18n.global.t;
const userAccount = vhApp.data.userState.userAccount;

function formatDate(date: Date | null | undefined): string | null{
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
  <!-- TODO Implement page -->
  <!-- Page header -->
  <AppBar :page-title="locale('MANAGE_SUBSCRIPTIONS')" />

  <v-sheet
    :color="vhApp.isConnectApp() ? 'primary-darken-2' : 'gray-lighten-6'"
    class="pa-4"
  >
    <div class="d-flex ga-3">
      <v-icon icon="mdi-crown" size="large" color="tertiary-lighten-1"/>
      <div>
        <h4 class="text-secondary-lighten-1">{{userAccount?.name}}</h4>
        <p class="text-caption text-disabled">{{userAccount?.email}}</p>
      </div>
    </div>

    <v-card
      :color="vhApp.isConnectApp() ? 'background' : 'white'"
      class="pa-4 pt-2 my-5"
    >
      <ul id="subscriptionInfoList" style="list-style: none;">
        <li>
          <span class="text-subtitle-2 text-disabled">{{locale('SUBSCRIBED_SINCE')}}:</span>
          <span class="text-subtitle-2">{{formatDate(userAccount?.createdTime)}}</span>
        </li>
        <li>
          <span class="text-subtitle-2 text-disabled">{{userAccount?.isAutoRenew ? locale('NEXT_PAYMENT') : locale('EXPIRATION_TIME')}}:</span>
          <span :class="[userAccount?.isAutoRenew ? 'text-secondary-lighten-2' : 'text-error', 'text-subtitle-2']">
            {{formatDate(userAccount?.expirationTime)}}
          </span>
        </li>
        <li>
          <span class="text-subtitle-2 text-disabled">{{locale('AUTO_RENEW')}}:</span>
          <v-chip
            variant="tonal"
            density="compact"
            :color="userAccount?.isAutoRenew ? 'secondary-lighten-2' : 'error' "
          >
            {{userAccount?.isAutoRenew ? locale('YES') : locale('NO') }}
          </v-chip>
        </li>
        <li>
          <span class="text-subtitle-2 text-disabled">{{locale('PRICE')}}:</span>
          <span class="text-subtitle-2">
            <span class="text-caption text-disabled">{{userAccount?.priceCurrency}}</span>
            {{userAccount?.priceAmount}}{{locale('PER_MONTH')}}
          </span>
        </li>
      </ul>
      <v-btn
        block
        flat
        color="secondary-lighten-1"
        class="mt-7 text-primary font-weight-bold"
        :append-icon="Util.getLocalizedRightChevron()"
        text="Manage on Google Play"
        rounded="pill"
        :href="'https://play.google.com/store/account/subscriptions?sku='+ userAccount?.providerSubscriptionId +
        '&package=' + vhApp.isConnectApp() ? AppPackageName.VpnHoodConnect : AppPackageName.VpnHoodClient"
        target="_blank"
      />
    </v-card>

  </v-sheet>
</template>

<style scoped>
#subscriptionInfoList>li{
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 13px 9px;
}
#subscriptionInfoList>li:nth-child(even){
  /*noinspection CssUnresolvedCustomProperty*/
  background-color: rgb(var(--v-theme-primary-darken-2));
}
</style>
