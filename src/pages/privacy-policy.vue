<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';

const vhApp = VpnHoodApp.instance;

const emit = defineEmits<{
  (e: 'accept', value: boolean): void,
}>();
</script>

<template>
  <v-sheet class="pt-4">
    <v-card color="transparent">
      <div tabindex="-1">
        <v-card-title class="text-center">VpnHood! CONNECT Privacy Policy</v-card-title>
        <v-divider/>

        <!-- The short version of docs/legal/end-user/vpnhood-connect-privacy-policy.md in the VpnHood
             repo, which is what the link below opens (the website renders the slug from that file).
             A consent screen that discloses nothing is not consent: the points below are the ones a
             user would want to know before tapping Accept — what we never record, what our servers do
             keep, and what the app sends. Keep them true to that file whenever it changes; the build
             a user installed from decides which of the last ones apply, so they stay conditional. -->
        <v-card-text class="text-body-medium px-2 mb-4">
          <p class="pb-4 text-disabled">
            VpnHood! CONNECT is a VPN you can use without an account. Here is the short version of our Privacy Policy:<br/><br/>
            • We do not record your browsing. Our servers never extract the destinations you visit — domains, URLs, or IP addresses — from your traffic.<br/><br/>
            • Your IP address and connection times stay in server log files for 30 days. We use them only to act on a copyright infringement notice.<br/><br/>
            • The app sends anonymous usage and diagnostic data, identified only by a random id. You can turn this off at any time in Settings → Privacy.<br/><br/>
            • Depending on where you installed the app from, it may also show ads, send crash reports, and offer an optional Google sign-in for subscriptions.<br/><br/>
            The full policy explains each of these. By tapping ‘Accept and continue’, you agree to it.
          </p>
          <span>Please read our</span>
          <a
            tabindex="-1"
            class="text-highlight font-weight-bold ms-1"
            :href="vhApp.privacyPolicyUrl()"
            target="_blank"
          >
            Privacy Policy
            <v-icon icon="mdi-open-in-new"/>
          </a>
        </v-card-text>
      </div>

      <v-card-actions>
        <!-- Accept button -->
        <btn-style-3
          autofocus
          tabindex="1"
          block
          text="Accept and continue"
          @click="emit('accept', true)"
        />
      </v-card-actions>
    </v-card>
  </v-sheet>
</template>
