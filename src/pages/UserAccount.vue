<script lang="ts" setup>
import AppBar from '@/components/AppBar.vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { Util } from '@/helpers/Util';
import { AppPackageName } from '@/helpers/UiConstants';
import { ref } from 'vue';
import router from '@/services/router';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

const vhApp = VpnHoodApp.instance
const locale = i18n.global.t;
const userAccount = vhApp.data.userState.userAccount;
const showConfirmSignOut = ref<boolean>(false);
const isPremiumAccount = ref<boolean>(vhApp.data.state.clientProfile?.isPremiumAccount ?? false);

function onSignOut() {
  showConfirmSignOut.value = false;
  vhApp.signOut();
  router.replace('/');
}

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

  <!-- Page header -->
  <AppBar :page-title="locale('ACCOUNT')" />

  <v-sheet
    :color="vhApp.isConnectApp() ? 'primary-darken-2' : 'gray-lighten-6'"
    class="pa-4 d-flex flex-column justify-space-between"
    :class="{'primary-bg-grad' : vhApp.isConnectApp() && isPremiumAccount}"
  >
    <!-- Premium image -->
    <div v-if="isPremiumAccount" class="position-relative">
      <v-img
        :eager="true"
        :src="vhApp.getImageUrl('you-are-premium.webp')"
        alt="Premium Image"
        width="100%"
        max-width="371px"
        class="mx-auto"
      />
      <h3 class="position-absolute w-100 text-secondary-lighten-1 text-center text-capitalize" style="bottom: 20px">
        {{locale("YOU_ARE_PREMIUM") }}
      </h3>
    </div>

    <!-- User and subscription info -->
    <div>

      <!-- User details -->
      <v-card :color="vhApp.isConnectApp() ? 'background' : 'white'" >
        <v-card-text class="d-flex justify-space-between">
          <!-- User info -->
          <div>
            <h4 :class="isPremiumAccount ? 'text-secondary-lighten-1' : 'text-secondary'">{{userAccount?.name}}</h4>
            <p class="text-caption text-disabled">{{userAccount?.email}}</p>
          </div>
          <!-- Sign out button -->
          <v-btn
            :color="isPremiumAccount ? 'secondary-lighten-1' : 'secondary'"
            class="text-capitalize text-primary-darken-2 font-weight-bold"
            :text="locale('SIGN_OUT')"
            rounded="pill"
            size="small"
            @click="showConfirmSignOut = true"
          />
        </v-card-text>
      </v-card>

      <!-- Subscriptions details -->
      <v-card v-if="isPremiumAccount" :color="vhApp.isConnectApp() ? 'background' : 'white'" class="mt-4">
        <v-card-text>
          <ul id="subscriptionInfoList" style="list-style: none;">
            <!-- Created time -->
            <li>
              <span class="text-subtitle-2 text-disabled">{{locale('SUBSCRIBED_SINCE')}}:</span>
              <span class="text-subtitle-2">{{formatDate(userAccount?.createdTime)}}</span>
            </li>
            <!-- Next payment or Expiration time -->
            <li>
              <span class="text-subtitle-2 text-disabled">
                {{userAccount?.isAutoRenew ? locale('NEXT_PAYMENT') : locale('EXPIRATION_TIME')}}:
              </span>
              <span :class="[userAccount?.isAutoRenew ? 'text-secondary-lighten-2' : 'text-error', 'text-subtitle-2']">
                {{formatDate(userAccount?.expirationTime)}}
              </span>
            </li>
            <!-- Auto renew -->
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
            <!-- Price -->
            <li>
              <span class="text-subtitle-2 text-disabled">{{locale('PRICE')}}:</span>
              <span class="text-subtitle-2">
                <span class="text-caption text-disabled">{{userAccount?.priceCurrency}}</span>
                {{userAccount?.priceAmount}}{{locale('PER_MONTH')}}
              </span>
            </li>
          </ul>
        </v-card-text>
        <!-- Manage on google play button -->
        <v-card-actions>
          <v-btn
            variant="flat"
            class="text-capitalize text-primary-darken-2 font-weight-bold ms-auto"
            :append-icon="Util.getLocalizedRightChevron()"
            :text="locale('MANAGE_ON_GOOGLE_PLAY')"
            rounded="pill"
            color="secondary-lighten-1"
            size="small"
            :href="'https://play.google.com/store/account/subscriptions?sku='+ userAccount?.providerSubscriptionId +
        '&package=' + vhApp.isConnectApp() ? AppPackageName.VpnHoodConnect : AppPackageName.VpnHoodClient"
            target="_blank"
          />
        </v-card-actions>
      </v-card>

      <!-- Go premium -->
      <v-card v-else :color="vhApp.isConnectApp() ? 'background' : 'white'" class="mt-4">
        <v-card-text class="d-flex align-center ga-4">
          <v-img
            :eager="true"
            :src="vhApp.getImageUrl('free-to-premium-account-icon.webp')"
            alt="Go Premium Image"
            width="100%"
            max-width="92px"
          />
          <div class="text-end flex-grow-1">
            <p class="text-start" v-html="locale('UPGRADE_ACCOUNT_DESC')"></p>
            <v-btn
              variant="flat"
              class="text-capitalize text-primary-darken-2 font-weight-bold mt-3"
              :append-icon="Util.getLocalizedRightChevron()"
              :text="locale('GO_PREMIUM')"
              rounded="pill"
              color="secondary-lighten-1"
              size="small"
              @click="router.push('/purchase-subscription')"
            />
          </div>
        </v-card-text>
      </v-card>

    </div>
  </v-sheet>

  <!-- Confirm sign-out dialog -->
  <ConfirmDialog
    v-model="showConfirmSignOut"
    :title="locale('CONFIRM_SIGN_OUT_TITLE')"
    :message="locale('CONFIRM_SIGN_OUT_DESC')"
    @click-action="onSignOut"
  />
</template>

<style scoped>
#subscriptionInfoList>li{
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 9px;
}
#subscriptionInfoList>li:nth-child(even){
  /*noinspection CssUnresolvedCustomProperty*/
  background-color: rgb(var(--v-theme-primary-darken-2));
}
</style>
