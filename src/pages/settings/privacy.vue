<script setup lang="ts">
import AppBar from '@/components/AppBar.vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import { computed } from 'vue';
import i18n from '@/locales/i18n';
import SettingsToggleItem from '@/components/Settings/SettingsToggleItem.vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

// allowAnonymousTracker already gated the backend trackers (the GA4 tracker and the endpoint
// tracker); it had simply never been surfaced, so it was stuck on its default of true and the
// analytics running in this WebView ignored it entirely. Saving it re-reads the settings, which is
// what re-syncs the analytics SDK — see VpnHoodApp.syncAnalyticsConsent.
const isAnonymousTrackerAllowed = computed<boolean>({
  get: () => vhApp.data.userSettings.allowAnonymousTracker,
  set: async (value: boolean) => {
    vhApp.data.userSettings.allowAnonymousTracker = value;
    await vhApp.saveUserSetting();
  }
});

// A TV is not guaranteed to have a browser: target="_blank" fires an intent that nothing on the
// device handles, so the tap either dies silently or takes the WebView down with it — which is why
// the navigation drawer hides its outbound links there. The policy itself cannot be dropped along
// with them: both stores want it reachable inside the app, not only on the listing (Apple 5.1.1,
// Play's User Data policy, which names VPN apps). So TV gets the address as text to read and open
// on a phone, and only the button — the part that needs a browser — is withheld.
const isShowPrivacyPolicyButton = computed(() => !vhApp.data.features.isTv);
</script>

<template>
  <v-sheet>
    <app-bar/>

    <!-- A build that collects nothing (a fork shipping neither analytics nor a crash reporter) offers no
         consent and makes no claim about data — it keeps only the privacy policy below. -->
    <settings-toggle-item
      v-if="vhApp.data.isAnonymousTrackerSupported"
      v-model="isAnonymousTrackerAllowed"
      :title="locale('ALLOW_ANONYMOUS_TRACKER')"
      :description="locale('ALLOW_ANONYMOUS_TRACKER_DESC')"
    />

    <config-card class="mt-4">
      <v-card-item>
        <p v-if="vhApp.data.isAnonymousTrackerSupported" class="text-body-small text-disabled">
          {{ locale('ANONYMOUS_TRACKER_NOTICE') }}
        </p>

        <v-btn
          v-if="isShowPrivacyPolicyButton"
          class="mt-3 ps-0"
          variant="text"
          color="highlight"
          density="comfortable"
          append-icon="mdi-open-in-new"
          :href="vhApp.privacyPolicyUrl()"
          target="_blank"
          :text="locale('PRIVACY_POLICY')"
        />

        <!-- The same policy for a device that cannot open it: an address, not a link. It carries no
             new wording — the label is the string the button already used and the rest is a URL — so
             nothing here waits on a translation. Forced LTR like every other address the app prints,
             or an RTL locale reorders it into something that cannot be typed. -->
        <div v-else class="mt-3">
          <p class="text-body-small">{{ locale('PRIVACY_POLICY') }}</p>
          <p dir="ltr" class="text-body-small text-highlight" style="text-align: start">
            {{ vhApp.privacyPolicyUrl() }}
          </p>
        </div>
      </v-card-item>
    </config-card>

  </v-sheet>
</template>
