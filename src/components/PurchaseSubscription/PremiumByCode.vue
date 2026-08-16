<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { ClientProfileUpdateParams, ConnectPlanId, PatchOfString } from '@/services/VpnHood.Client.Api';
import { ref } from 'vue';
import PendingDialog from '@/components/PurchaseSubscription/PendingDialog.vue';
import PremiumCodeCompleteDialog from '@/components/PurchaseSubscription/PremiumCodeCompleteDialog.vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const premiumCodeForm = ref<boolean>(false);
const invalidCodeError = ref<null | string>(null);
const formattedPremiumCode = ref('');
const premiumCodeRawNumber = ref<string | null>(null);
const isShowPremiumCodeCompleteDialog = ref(false);
const isShowPendingDialog = ref(false);

// Add a dash every 4 characters during input premium code
/*
watchEffect(() => {
  formattedPremiumCode.value = premiumCodeRawNumber.value.match(/.{1,4}/g)?.join('-') || '';
});
*/

/*const premiumCodeNumberRule = (value: string) => {
  return /^[0-9\-]*$/.test(value) || locale('PREMIUM_CODE_NUMBER_RULE_MSG');
};*/

/*const premiumCodeCountRule = (value: string) => {
  const count = value.replace(/-/g, '').length;
  return count == 20 || locale('PREMIUM_CODE_COUNT_RULE_MSG');
};*/

// Keep only numbers and limit to 20 characters
const premiumCodeHandleInput = (event: Event) => {
  if (invalidCodeError.value) invalidCodeError.value = null;
  const value = (event.target as HTMLInputElement).value;
  premiumCodeRawNumber.value = value;
};

async function updatePremiumCode(): Promise<void> {
  const profileId = vhApp.data.state.clientProfile?.clientProfileId;
  if (!profileId) {
    throw new Error(locale('PROFILE_ID_NOT_FOUND_DURING_VALIDATION_MSG'));
  }

  try {
    // try to update premium code to client profile, if the code is invalid, it will throw error and show error message, if the code is valid, it will try to connect to access server with new code, if the connection is successful and premium by code is active, it will show complete dialog, otherwise it will remove the premium code from client profile
    await vhApp.clientProfileClient.update(
      profileId,
      new ClientProfileUpdateParams({
        accessCode: new PatchOfString({ value: premiumCodeRawNumber.value }),
      }),
    );
  } catch {
    invalidCodeError.value = locale('INVALID_PREMIUM_CODE_NUMBERS_MSG');
    return;
  }

  // Pasting a code is a purely LOCAL act (lifecycle §8): nothing is reported to the backend,
  // and the account's chosen code is never moved from here. Importing a code INTO an account
  // is a portal act — the client-area codes page — where the person can actually see whether
  // it was accepted; the same call from here succeeded or silently did nothing depending on
  // which channel issued the code, with no way for anyone to tell.

  // try to connect to access server with new premium code
  try {
    emit('update:modelValue', false);
    isShowPendingDialog.value = true;
    await vhApp.connect({clientProfileId: profileId, serverLocation: null, isPremium: true, planId: ConnectPlanId.Normal, isDiagnose: false, goToHome: false});

    if (vhApp.data.isConnected && vhApp.data.isPremiumUser) {
      isShowPremiumCodeCompleteDialog.value = true;
    }

  } finally {
    isShowPendingDialog.value = false;
  }
}
</script>

<template>
  <!-- Premium code sheet -->
  <v-bottom-sheet
    :modelValue="props.modelValue"
    @update:modelValue="emit('update:modelValue', $event)"
    contained
    width="100%"
    max-width="100%"
  >
    <v-card
      prepend-icon="mdi-key"
      color="background"
      class="rounded-b-0"
      :title="locale('ENTER_PREMIUM_CODE')"
    >
      <v-card-item class="pt-0">
        <alert-note
          :title="locale('NOTE')"
          :text="locale('ACTIVE_PREMIUM_KEY_EXPIRATION_NOTICE')"
          class="mb-2"
        />

        <v-form
          v-model="premiumCodeForm"
          @submit.prevent="updatePremiumCode()"
        >
          <v-text-field
            v-model="formattedPremiumCode"
            :placeholder="locale('ENTER_YOUR_CODE')"
            @input="premiumCodeHandleInput"
            :error-messages="invalidCodeError"
            hide-details="auto"
            single-line
            clearable
            :on-click:clear="() => (premiumCodeRawNumber = null)"
            autofocus
            spellcheck="false"
            autocomplete="off"
            dir="ltr"
            density="compact"
            color="highlight"
            variant="outlined"
            rounded="md"
            class="mb-5"
          />

          <v-btn
            variant="flat"
            rounded="pill"
            color="activate-code-btn"
            class="text-transform-none"
            block
            type="submit"
            :disabled="!premiumCodeRawNumber"
            :text="locale('ACTIVATE')"
          />
        </v-form>
      </v-card-item>
    </v-card>
  </v-bottom-sheet>

  <!-- Pending purchase process dialog -->
  <pending-dialog :model-value="isShowPendingDialog" />

  <!-- Purchase complete dialog -->
  <premium-code-complete-dialog :model-value="isShowPremiumCodeCompleteDialog" />
</template>
