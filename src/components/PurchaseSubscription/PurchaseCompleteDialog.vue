<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { PurchaseSubscriptionUtil } from '@/helpers/PurchaseSubscriptionUtil';
import { Util } from '@/helpers/Util';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const props = defineProps<{
  modelValue: boolean,
}>();

const {
  purchaseCompleteDialogMessage,
  isNewCode,
  premiumCodeExpirationDate,
  premiumCodeDeviceCount,
  premiumCodeActivationDate
} = PurchaseSubscriptionUtil
</script>

<template>
  <v-dialog
    :modelValue="props.modelValue"
    :persistent="true"
    >
    <v-card color="active">

      <v-card-title class="text-center pt-4">
        <v-icon class="text-h2">mdi-party-popper</v-icon>
        <h2>{{ locale('CONGRATULATIONS') }}</h2>
      </v-card-title>

      <v-card-text>
        <p>{{ purchaseCompleteDialogMessage }}</p>

        <!-- TODO: use theme color -->
        <v-alert v-if="vhApp.data.isPremiumAccount && vhApp.data.hasPremiumCode"
                 variant="flat"
                 color="#17083d"
                 density="compact"
                 rounded="lg"
                 class="text-caption mt-4"
        >

          <span v-if="!isNewCode && premiumCodeDeviceCount && premiumCodeDeviceCount > 1" class="mb-2">
            {{ locale('ALERT_FOR_USED_PREMIUM_CODE_MORE_THAN_ONE_DEVICE') }}
          </span>

          <ul id="activationInfo"
              :class="[premiumCodeDeviceCount && premiumCodeDeviceCount > 1 ? 'text-error' : 'text-active']"
              style="list-style: none;"
          >

            <li v-if="premiumCodeActivationDate">
              <span>{{ locale('ACTIVATED_ON') }}:</span>
              <span>{{ Util.getShortDate(premiumCodeActivationDate) }}</span>
            </li>

            <li v-if="premiumCodeExpirationDate">
              <span>{{ locale('EXPIRATION_DATE') }}:</span>
              <span>{{ Util.getShortDate(premiumCodeExpirationDate) }}</span>
            </li>

            <li v-if="premiumCodeDeviceCount && premiumCodeDeviceCount > 1">
              <span>{{ locale('USED_BY') }}:</span>
              <span class="text-lowercase">{{ premiumCodeDeviceCount }} {{ locale('DEVICE') }}</span>
            </li>

          </ul>

        </v-alert>

      </v-card-text>

      <v-card-actions>

        <v-btn
          v-if="vhApp.data.isConnected"
          :text="locale('STATISTICS')"
          @click="PurchaseSubscriptionUtil.closeCompleteDialog(true)"
        />
        <v-btn
          :text="locale('CLOSE')"
          variant="plain"
          @click="PurchaseSubscriptionUtil.closeCompleteDialog(false)"
        />

      </v-card-actions>

    </v-card>
  </v-dialog>
</template>
