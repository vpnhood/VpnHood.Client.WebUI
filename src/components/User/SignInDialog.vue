<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { ApiException, SignInState } from '@/services/VpnHood.Client.Api';

// The sign-in chooser. The store/IdP method is the PRIMARY everywhere it exists — one prominent
// button — and the portal's own email + password is the secondary path beneath it, for people who
// bought on the account website (sign-in only: the backend never creates an account for it).
// A second factor arrives as a challenge step in here, never as a redirect to a website; the
// account website appears exactly once, as the "forgot password" escape hatch in the browser.
const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

type Step = 'start' | 'password' | 'challenge' | 'backup-code';
const step = ref<Step>('start');
const email = ref('');
const password = ref('');
const twoFactorCode = ref('');
const newBackupCode = ref('');
const errorMessage = ref('');
const isWorking = ref(false);
const showPassword = ref(false);

// a reopened dialog starts from the beginning, holding no one's credentials. With no identity
// provider to choose, the chooser would be a single button in front of the only form there is, so
// the dialog opens on the form itself.
watch(
  () => props.modelValue,
  () => {
    step.value = vhApp.primaryProviderId() ? 'start' : 'password';
    email.value = '';
    password.value = '';
    twoFactorCode.value = '';
    newBackupCode.value = '';
    errorMessage.value = '';
    showPassword.value = false;
  },
);

const primaryMethod = computed(() => vhApp.primaryProviderId());
const primaryLabelKey = computed(() => {
  if (!primaryMethod.value) return 'SIGN_IN';
  const key = `SIGN_IN_WITH_${primaryMethod.value.toUpperCase()}`;
  return i18n.global.te(key) ? key : 'SIGN_IN';
});
const hasPasswordMethod = computed(() => vhApp.data.features.authProviderIds.includes('password'));
// The account website is a WEB page, so it needs a browser to LEAVE the app with. Withheld where
// there is none — the link would open nothing — which is asked of the device rather than guessed
// from "is this a TV": a television with a browser installed opens it fine.
const accountWebsiteUrl = computed(() =>
  vhApp.data.intentFeatures.isWebBrowserSupported ? vhApp.data.features.accountWebsiteUrl : null);

function close(): void {
  emit('update:modelValue', false);
}

async function signInWithPrimary(): Promise<void> {
  close();
  await vhApp.signIn();
}

// The portal's machine code (err.data.Code) is the contract; its English detail is the fallback
// for a code this build does not know yet. invalid_credentials deliberately covers unknown email,
// wrong password AND never-set password in ONE message — the API is built so nothing can tell
// those apart (anti-enumeration), so neither can this dialog.
function messageForError(err: unknown): string {
  if (err instanceof ApiException) {
    const code = err.data['Code'];
    switch (code) {
      case 'invalid_credentials':
        return locale('SIGN_IN_INVALID_CREDENTIALS');
      case 'too_many_attempts':
        return locale('SIGN_IN_COOLDOWN');
      case 'invalid_code':
        return locale('SIGN_IN_WRONG_CODE');
      case 'invalid_challenge':
        return locale('SIGN_IN_CHALLENGE_EXPIRED');
      case 'unsupported_two_factor':
        return locale('SIGN_IN_UNSUPPORTED_TWO_FACTOR');
      case 'no_account':
        return locale('SIGN_IN_NO_ACCOUNT');
      case 'account_ambiguous':
        return locale('SIGN_IN_ACCOUNT_AMBIGUOUS');
    }
  }
  return err instanceof Error ? err.message : String(err);
}

async function submitPassword(): Promise<void> {
  if (!email.value || !password.value) return;
  errorMessage.value = '';
  isWorking.value = true;
  try {
    const result = await vhApp.signInWithPassword(email.value.trim(), password.value);
    if (result.state !== SignInState.SignedIn) {
      // the password is right; nothing is signed in until the second factor answers
      twoFactorCode.value = '';
      step.value = 'challenge';
      return;
    }
    close();
  } catch (err: unknown) {
    errorMessage.value = messageForError(err);
  } finally {
    isWorking.value = false;
  }
}

async function submitChallenge(): Promise<void> {
  if (!twoFactorCode.value) return;
  errorMessage.value = '';
  isWorking.value = true;
  try {
    const result = await vhApp.completeSignInChallenge(twoFactorCode.value.trim());
    if (result.newBackupCode) {
      // the backup code was spent and rotated — this is the ONLY time the new one is shown
      newBackupCode.value = result.newBackupCode;
      step.value = 'backup-code';
      return;
    }
    close();
  } catch (err: unknown) {
    errorMessage.value = messageForError(err);
    // a spent or expired challenge restarts from the password, with the message explaining why
    if (err instanceof ApiException && err.data['Code'] === 'invalid_challenge')
      step.value = 'password';
  } finally {
    isWorking.value = false;
  }
}
</script>

<template>
  <v-dialog
    :modelValue="props.modelValue"
    max-width="420"
    @update:modelValue="close()"
  >
    <v-card color="general-dialog">
      <!-- Step 1: the chooser — store sign-in above, email beneath -->
      <template v-if="step === 'start'">
        <v-card-title>{{ locale('SIGN_IN') }}</v-card-title>
        <v-card-text class="text-general-dialog-text">
          <v-btn
            v-if="primaryMethod"
            block
            color="highlight"
            size="large"
            class="text-transform-none"
            :text="locale(primaryLabelKey)"
            @click="signInWithPrimary()"
          />
          <template v-if="hasPasswordMethod">
            <div v-if="primaryMethod" class="d-flex align-center my-4">
              <v-divider />
              <span class="mx-3 text-disabled text-body-small">{{ locale('OR') }}</span>
              <v-divider />
            </div>
            <v-btn
              block
              variant="outlined"
              size="large"
              class="text-transform-none"
              prepend-icon="mdi-email-outline"
              :text="locale('SIGN_IN_WITH_EMAIL')"
              @click="step = 'password'"
            />
          </template>
        </v-card-text>
        <v-card-actions>
          <v-btn :text="locale('CANCEL')" @click="close()" />
        </v-card-actions>
      </template>

      <!-- Step 2: the account website's own email + password -->
      <template v-else-if="step === 'password'">
        <v-card-title>{{ locale('SIGN_IN_WITH_EMAIL') }}</v-card-title>
        <v-card-text class="text-general-dialog-text">
          <p class="text-body-medium mb-4">{{ locale('SIGN_IN_WITH_EMAIL_DESC') }}</p>
          <v-form @submit.prevent="submitPassword()">
            <v-text-field
              v-model="email"
              :label="locale('EMAIL')"
              type="email"
              autocomplete="email"
              autofocus
              density="comfortable"
            />
            <v-text-field
              v-model="password"
              :label="locale('PASSWORD')"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              density="comfortable"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
            />
            <!-- submit inside the form so Enter works -->
            <v-btn
              block
              color="highlight"
              size="large"
              type="submit"
              :loading="isWorking"
              :disabled="!email || !password"
              :text="locale('SIGN_IN')"
            />
          </v-form>
          <p v-if="errorMessage" class="text-error text-body-medium mt-3">{{ errorMessage }}</p>
          <!-- the one place the account website appears: setting/recovering the password happens
               there — store-created accounts have never set one, and the error message says so -->
          <a
            v-if="accountWebsiteUrl"
            :href="accountWebsiteUrl"
            target="_blank"
            class="d-block mt-4 text-body-small"
          >{{ locale('FORGOT_PASSWORD') }}</a>
        </v-card-text>
        <v-card-actions>
          <!-- nothing to go back TO when the form is the whole dialog -->
          <v-btn v-if="primaryMethod" :text="locale('BACK')" @click="step = 'start'; errorMessage = ''" />
          <v-spacer />
          <v-btn :text="locale('CANCEL')" @click="close()" />
        </v-card-actions>
      </template>

      <!-- Step 3: the second factor, in the app — never a website -->
      <template v-else-if="step === 'challenge'">
        <v-card-title>{{ locale('TWO_FACTOR_TITLE') }}</v-card-title>
        <v-card-text class="text-general-dialog-text">
          <p class="text-body-medium mb-4">{{ locale('TWO_FACTOR_DESC') }}</p>
          <v-form @submit.prevent="submitChallenge()">
            <v-text-field
              v-model="twoFactorCode"
              :label="locale('TWO_FACTOR_CODE')"
              autocomplete="one-time-code"
              inputmode="numeric"
              autofocus
              density="comfortable"
            />
            <v-btn
              block
              color="highlight"
              size="large"
              type="submit"
              :loading="isWorking"
              :disabled="!twoFactorCode"
              :text="locale('CONFIRM')"
            />
          </v-form>
          <p v-if="errorMessage" class="text-error text-body-medium mt-3">{{ errorMessage }}</p>
          <p class="text-disabled text-body-small mt-4">{{ locale('TWO_FACTOR_BACKUP_HINT') }}</p>
        </v-card-text>
        <v-card-actions>
          <v-btn :text="locale('CANCEL')" @click="close()" />
        </v-card-actions>
      </template>

      <!-- Step 4: only after a backup code was spent — its replacement, shown exactly once -->
      <template v-else-if="step === 'backup-code'">
        <v-card-title>{{ locale('NEW_BACKUP_CODE_TITLE') }}</v-card-title>
        <v-card-text class="text-general-dialog-text">
          <p class="text-body-medium">{{ locale('NEW_BACKUP_CODE_DESC') }}</p>
          <p class="text-headline-small text-center font-weight-bold my-4" style="user-select: all">
            {{ newBackupCode }}
          </p>
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="highlight"
            :text="locale('I_SAVED_IT')"
            @click="close()"
          />
        </v-card-actions>
      </template>
    </v-card>
  </v-dialog>
</template>
