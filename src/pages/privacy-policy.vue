<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';

const vhApp = VpnHoodApp.instance;

const emit = defineEmits<{
  (e: 'accept', value: boolean): void,
}>();
</script>

<template>
  <!-- Anchored absolutely to v-main (position-relative, the same anchor the reconnect bar
       uses): percentage heights (the VSheet default fill-height) resolve to auto on this chain
       because v-app only guarantees a MIN-height, which is exactly why the page used to grow
       with its text. With the box pinned to v-main, the flex column below can do its job: ONLY
       the disclosure text scrolls and the Accept button stays on-screen at every text length,
       font scale, and language. The overflow-hidden on each flex level is what lets the text
       block shrink below its content height and become the scroll container. -->
  <v-sheet class="privacy-policy-page pt-4 d-flex flex-column">
    <v-card color="transparent" class="d-flex flex-column flex-grow-1 overflow-hidden">
      <div tabindex="-1" class="d-flex flex-column flex-grow-1 overflow-hidden">
        <v-card-title class="text-center flex-shrink-0">VpnHood! CONNECT Privacy Policy</v-card-title>
        <v-divider class="flex-shrink-0"/>

        <!-- The short version of docs/legal/end-user/vpnhood-connect-privacy-policy.md in the VpnHood
             repo, which is what the link below opens (the website renders the slug from that file).
             A consent screen that discloses nothing is not consent: the points below are the ones a
             user would want to know before tapping Accept — what we never record, what our servers do
             keep, and what the app sends. Keep them true to that file whenever it changes; the build
             a user installed from decides which of the last ones apply, so they stay conditional. -->
        <!-- The wrapper anchors a fade-out overlay at the bottom of the scroll area: a fading
             last line is the cue that the text continues. The card-text's own bottom padding
             matches the fade height, so once the user HAS reached the end the fade sits over
             empty padding and nothing looks cut off — the cue cancels itself exactly when it
             stops being true. -->
        <div class="scroll-area flex-grow-1 d-flex flex-column overflow-hidden">
          <v-card-text class="text-body-medium px-2 pb-12 flex-grow-1 overflow-y-auto">
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

        <!-- Bounds the scroll region (Material's scrollable-dialog pattern). The explicit
             opacity is required, not decoration: the theme's global border-opacity is 0.03,
             which renders a bare divider invisible — the same idiom the proxy components use
             when a divider has to be seen. -->
        <v-divider class="flex-shrink-0 opacity-20"/>
      </div>

      <!-- Pinned below the scroll area, never pushed off-screen. The button is centred in the
           band between the divider and the page edge: the 16px underneath is the sheet's own
           bottom padding, so only the top needs matching here (default actions padding is 8/8,
           which left the button hugging the divider). -->
      <v-card-actions class="flex-shrink-0 pt-4 pb-0">
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

<style scoped>
/* Individual sides rather than the inset shorthand: this app still supports old WebViews. */
.privacy-policy-page {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

/* "There is more below": the last visible line melts into the background. Built from the
   theme's background token, so it holds in both themes; pointer-events lets the user scroll
   through it. Height must stay in step with the card-text's pb-12 (48px) — see the template
   comment. When the text is short or fully scrolled the gradient sits over bare background
   and is invisible. */
.scroll-area {
  position: relative;
}
.scroll-area::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 48px;
  background: linear-gradient(to bottom, rgba(var(--v-theme-background), 0), rgb(var(--v-theme-background)));
  pointer-events: none;
}
</style>
