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
const isPremiumAccount = ref<boolean>((vhApp.data.state.clientProfile?.isPremiumAccount && vhApp.data.features.isPremiumFlagSupported) ?? false);

function onSignOut() {
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

  <v-sheet class="d-flex flex-column justify-space-between" :class="{'primary-bg-grad' : isPremiumAccount}">

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
      <h3 class="position-absolute w-100 text-active text-center text-capitalize" style="bottom: 20px">
        {{locale("YOU_ARE_PREMIUM") }}
      </h3>
    </div>

    <!-- User and subscription info -->
    <div>

      <!-- User details -->
      <v-card color="config-card-bg" >
        <v-card-text class="d-flex justify-space-between">
          <!-- User info -->
          <div>
            <h4 :class="isPremiumAccount ? 'text-active' : 'text-highlight'">{{userAccount?.name}}</h4>
            <p class="text-caption text-disabled">{{userAccount?.email}}</p>
          </div>
          <!-- Sign out button -->
          <v-btn
            :color="isPremiumAccount ? 'active' : 'highlight'"
            class="text-capitalize font-weight-bold"
            :text="locale('SIGN_OUT')"
            rounded="pill"
            size="small"
            @click="showConfirmSignOut = true"
          />
        </v-card-text>
      </v-card>

      <!-- Subscriptions details -->
      <v-card v-if="isPremiumAccount && vhApp.data.userState.userAccount?.subscriptionId" color="config-card-bg">
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
              <span :class="[userAccount?.isAutoRenew ? 'text-active' : 'text-error', 'text-subtitle-2']">
                {{formatDate(userAccount?.expirationTime)}}
              </span>
            </li>
            <!-- Auto renew -->
            <li>
              <span class="text-subtitle-2 text-disabled">{{locale('AUTO_RENEW')}}:</span>
              <v-chip
                variant="tonal"
                density="compact"
                :color="userAccount?.isAutoRenew ? 'active' : 'error' "
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
          <btn-style-1
            class="ms-auto"
            :append-icon="Util.getLocalizedRightChevron()"
            :text="locale('MANAGE_ON_GOOGLE_PLAY')"
            size="small"
            :href="`https://play.google.com/store/account/subscriptions?sku=${userAccount?.providerSubscriptionId}&package=${vhApp.isConnectApp() ? AppPackageName.VpnHoodConnect : AppPackageName.VpnHoodClient}`"
            target="_blank"
          />
        </v-card-actions>
      </v-card>

      <!-- Go premium -->
      <v-card v-else-if="vhApp.data.state.clientProfile?.selectedLocationInfo?.options.canGoPremium" color="config-card-bg">
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
            <btn-style-1
              class="mt-3"
              :append-icon="Util.getLocalizedRightChevron()"
              :text="locale('GO_PREMIUM')"
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
    @confirm="onSignOut()"
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
  background-color: rgb(var(--v-theme-zebra-on-config-card-bg));
}
</style>
