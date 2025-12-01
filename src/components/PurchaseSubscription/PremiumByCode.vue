<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { ComponentRouteController } from '@/services/ComponentRouteController';
import { ComponentName } from '@/helpers/UiConstants';
import { ClientProfileUpdateParams, ConnectPlanId, PatchOfString, } from '@/services/VpnHood.Client.Api';
import { ref } from 'vue';
import PendingDialog from '@/components/PurchaseSubscription/PendingDialog.vue';
import PremiumCodeCompleteDialog from '@/components/PurchaseSubscription/PremiumCodeCompleteDialog.vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const premiumCodeForm = ref<boolean>(false);
const invalidCodeError = ref<null|string>(null);
const formattedPremiumCode = ref('');
const premiumCodeRawNumber = ref<string|null>(null);
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
async function validatePremiumCode(): Promise<void> {
  const profileId = vhApp.data.state.clientProfile?.clientProfileId;
  if (!profileId)
    throw new Error(locale("PROFILE_ID_NOT_FOUND_DURING_VALIDATION_MSG"));

  try {
    await vhApp.clientProfileClient.update(profileId, new ClientProfileUpdateParams({
      accessCode: new PatchOfString({ value: premiumCodeRawNumber.value })
    }));

    await validateCodeViaAccessServer(profileId);
  }
  catch{
    invalidCodeError.value = locale("INVALID_PREMIUM_CODE_NUMBERS_MSG");
  }
}
async function validateCodeViaAccessServer(profileId: string): Promise<void>{
  try {
    await ComponentRouteController.showComponent(ComponentName.EnterPremiumCode, false);
    isShowPendingDialog.value = true;
    await vhApp.connect(profileId, undefined, true, ConnectPlanId.Normal, false, false);

    if (vhApp.data.isConnected && vhApp.data.isPremiumAccount && vhApp.data.hasPremiumCode)
      isShowPremiumCodeCompleteDialog.value = true;
  }
  catch {
    await vhApp.removePremiumCode()
  }
  finally {
    isShowPendingDialog.value = false;
  }
}
</script>

<template>
  <!-- Premium code button -->
  <btn-style-1
    class="mt-4 text-premium-code-btn"
    block
    height="40px"
    rounded="pill"
    color="rgba(var(--v-theme-card-on-grad-bg), 0.3)"
    prepend-icon="mdi-key"
    :text="locale('I_HAVE_A_PREMIUM_CODE')"
    @click="ComponentRouteController.showComponent(ComponentName.EnterPremiumCode)"
  />

  <!-- Premium code sheet -->
  <v-bottom-sheet
    v-model="ComponentRouteController.create(ComponentName.EnterPremiumCode).isVisible"
    contained width="100%"
    max-width="100%"
  >

    <v-card
      prepend-icon="mdi-key"
      color="background"
      class="rounded-b-0"
      :title="locale('ENTER_PREMIUM_CODE')"
    >
      <v-card-item class="pt-0">
        <alert-note :title="locale('NOTE')" :text="locale('ACTIVE_PREMIUM_KEY_EXPIRATION_NOTICE')" class="mb-2" />

        <v-form
          v-model="premiumCodeForm"
          @submit.prevent="validatePremiumCode()"
        >
          <v-text-field
            v-model="formattedPremiumCode"
            :placeholder="locale('ENTER_YOUR_CODE')"
            @input="premiumCodeHandleInput"
            :error-messages="invalidCodeError"
            hide-details="auto"
            single-line
            clearable
            :on-click:clear="() => premiumCodeRawNumber = null"
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
