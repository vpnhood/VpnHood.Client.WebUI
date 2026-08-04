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
// device handles, so the tap either dies silently or takes the WebView down with it. Every other
// outbound link in the navigation drawer is hidden there for the same reason. TV keeps no in-app
// policy at all then: the Play listing and the App Store metadata carry it, which is what TV apps
// commonly rely on.
const isShowPrivacyPolicyLink = computed(() => !vhApp.data.features.isTv);
// The card holds the tracker notice and that link; on a build with neither it would render as an
// empty box.
const isShowPrivacyPolicyCard = computed(() =>
  vhApp.data.isAnonymousTrackerSupported || isShowPrivacyPolicyLink.value);
</script>

<template>
  <v-sheet>
    <app-bar/>

    <!-- A build that collects nothing (a fork shipping neither analytics nor a crash reporter) offers no
         consent and makes no claim about data — it keeps only the privacy policy link below, where
         that link is shown at all. -->
    <settings-toggle-item
      v-if="vhApp.data.isAnonymousTrackerSupported"
      v-model="isAnonymousTrackerAllowed"
      :title="locale('ALLOW_ANONYMOUS_TRACKER')"
      :description="locale('ALLOW_ANONYMOUS_TRACKER_DESC')"
    />

    <config-card v-if="isShowPrivacyPolicyCard" class="mt-4">
      <v-card-item>
        <p v-if="vhApp.data.isAnonymousTrackerSupported" class="text-body-small text-disabled">
          {{ locale('ANONYMOUS_TRACKER_NOTICE') }}
        </p>

        <v-btn
          v-if="isShowPrivacyPolicyLink"
          class="mt-3 ps-0"
          variant="text"
          color="highlight"
          density="comfortable"
          append-icon="mdi-open-in-new"
          :href="vhApp.privacyPolicyUrl()"
          target="_blank"
          :text="locale('PRIVACY_POLICY')"
        />
      </v-card-item>
    </config-card>

  </v-sheet>
</template>
