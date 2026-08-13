<script setup lang="ts">
import { ref } from 'vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import { loadContentDocument } from '@/services/ContentDocuments';
import i18n from '@/locales/i18n';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const emit = defineEmits<{
  (e: 'accept', value: boolean): void,
}>();

// The disclosure itself is a document (src/content/<lang>/privacy-consent.md), not a resource
// string: it is long-form prose, and vhtranslator's docs mode keeps every language in step with
// the English source and verifies each translation structurally. Only the chrome around it —
// button and link labels — lives in the locale files.
// The document is fetched at setup rather than embedded so a user downloads their own language
// only. Empty until it lands, which is a frame or two from the same bundle; a spinner would
// flash for longer than the text takes to arrive.
const documentHtml = ref<string>('');
const documentTitle = ref<string>('');

loadContentDocument('privacy-consent', i18n.global.locale.value)
  .then(document => {
    documentHtml.value = document.html;
    documentTitle.value = document.title;
  })
  .catch((error: unknown) => vhApp.processError(error));
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
        <!-- text-wrap because v-card-title is single-line with an ellipsis by default, and a
             translated title is routinely longer than the English one it came from. -->
        <v-card-title class="text-center text-wrap flex-shrink-0">{{ documentTitle }}</v-card-title>
        <v-divider class="flex-shrink-0"/>

        <!-- The wrapper anchors a fade-out overlay at the bottom of the scroll area: a fading
             last line is the cue that the text continues. The card-text's own bottom padding
             matches the fade height, so once the user HAS reached the end the fade sits over
             empty padding and nothing looks cut off — the cue cancels itself exactly when it
             stops being true. -->
        <div class="scroll-area flex-grow-1 d-flex flex-column overflow-hidden">
          <v-card-text class="text-body-medium px-2 pb-12 flex-grow-1 overflow-y-auto">
            <!-- Repository content compiled into the bundle at build time — never user input. -->
            <div class="content-document text-disabled" v-html="documentHtml"></div>

            <!-- Stays in the template rather than the document: the address is decided at
                 runtime by the app type, so it cannot be baked into translated markdown. -->
            <span>{{ locale('PLEASE_READ_OUR') }}</span>
            <a
              tabindex="-1"
              class="text-highlight font-weight-bold ms-1"
              :href="vhApp.privacyPolicyUrl()"
              target="_blank"
            >
              {{ locale('PRIVACY_POLICY') }}
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
          :text="locale('ACCEPT_AND_CONTINUE')"
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

/* The rendered document. :deep because the markup comes from v-html and carries no scope
   attribute. Spacing is set here rather than left to the browser defaults, which give headings
   and lists desktop-sized margins on a phone. */
.content-document :deep(p) {
  margin-bottom: 1rem;
}
.content-document :deep(ul),
.content-document :deep(ol) {
  /* Logical padding so the markers sit inside the text on both LTR and RTL. */
  padding-inline-start: 1.25rem;
  margin-bottom: 1rem;
}
.content-document :deep(li) {
  margin-bottom: 0.5rem;
}
.content-document :deep(a) {
  color: rgb(var(--v-theme-highlight));
}
.content-document :deep(h1),
.content-document :deep(h2),
.content-document :deep(h3) {
  margin-bottom: 0.5rem;
}
</style>
