<script lang="ts" setup>
import { ref } from 'vue';
import AppBar from '@/components/AppBar.vue';
import i18n from '@/locales/i18n';
import { Util } from '@/helpers/Util';
import { UiConstants } from '@/helpers/UiConstants';
import { VpnHoodApp } from '@/services/VpnHoodApp';

// MOCK PAGE. Nothing here is wired to the app: no setting is read or saved, and the find button
// only says so. It exists to show the shape of the feature behind the /starlink debug command; the
// state below is local to the page and dies with it.
const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

// Where the Starlink terminal that carries the traffic lives — nowhere, out on the internet, or on this LAN.
enum StarlinkRelayMode {
  Disabled = 'disabled',
  Remote = 'remote',
  Local = 'local'
}

const relayMode = ref<StarlinkRelayMode>(StarlinkRelayMode.Disabled);
const remoteEndpoint = ref<string | null>(null);
const localEndpoint = ref<string | null>(null);
const isAutoFind = ref<boolean>(true);

function findLocalRouter(): void {
  vhApp.showGeneralSnackbar(locale('NOT_IMPLEMENTED_YET'));
}
</script>

<template>
  <v-sheet>
    <app-bar/>

    <!-- Feature image, sized like every other settings page's -->
    <v-img
      :src="Util.getAssetPath('starlink.svg')"
      alt="Symbol image"
      width="100%"
      max-height="240px"
      class="mx-auto"
      :aspect-ratio="UiConstants.featureImageAspectRatio"
      :eager="true"
    />
    <p class="mt-2 mb-5 text-disabled text-body-small px-3">{{ locale('STARLINK_TOOLS_DESC') }}</p>

    <config-card class="pa-3">

      <v-radio-group v-model="relayMode" :hide-details="true" color="highlight">

        <!-- Off -->
        <v-radio v-ripple :value="StarlinkRelayMode.Disabled" class="mb-6">
          <template v-slot:label>
            <div class="d-flex flex-column align-start">
              <span>{{ locale('STARLINK_MODE_DISABLED') }}</span>
              <span class="text-disabled text-body-small">{{ locale('STARLINK_MODE_DISABLED_DESC') }}</span>
            </div>
          </template>
        </v-radio>

        <!-- Remote terminal, reached over the internet -->
        <v-radio v-ripple :value="StarlinkRelayMode.Remote" class="mb-3">
          <template v-slot:label>
            <div class="d-flex flex-column align-start">
              <span>{{ locale('STARLINK_MODE_REMOTE') }}</span>
              <span class="text-disabled text-body-small">{{ locale('STARLINK_MODE_REMOTE_DESC') }}</span>
            </div>
          </template>
        </v-radio>

        <v-locale-provider v-if="relayMode === StarlinkRelayMode.Remote" :rtl="false">
          <v-text-field
            v-model="remoteEndpoint"
            :label="locale('STARLINK_ENDPOINT')"
            placeholder="203.0.113.10:9200"
            variant="outlined"
            density="compact"
            rounded="lg"
            color="highlight"
            hide-details="auto"
            clearable
            class="mb-3 ms-8"
          />
        </v-locale-provider>

        <!-- Router on this network. Its own controls live outside this group on purpose — see below. -->
        <v-radio v-ripple :value="StarlinkRelayMode.Local" class="mb-6">
          <template v-slot:label>
            <div class="d-flex flex-column align-start">
              <span>{{ locale('STARLINK_MODE_LOCAL') }}</span>
              <span class="text-disabled text-body-small">{{ locale('STARLINK_MODE_LOCAL_DESC') }}</span>
            </div>
          </template>
        </v-radio>

      </v-radio-group>

      <!-- The local option's controls, kept OUT of the radio group above: a checkbox inside a
           v-radio-group joins that group and writes its own value into the group's model, which
           deselects the radio and folds this block away the moment the box is ticked. Local is the
           last option, so rendering the block right after the group looks the same as nesting it. -->
      <div v-if="relayMode === StarlinkRelayMode.Local" class="ms-8">
        <v-locale-provider :rtl="false">
          <v-text-field
            v-model="localEndpoint"
            :label="locale('STARLINK_ENDPOINT')"
            placeholder="192.168.1.1:9200"
            variant="outlined"
            density="compact"
            rounded="lg"
            color="highlight"
            hide-details="auto"
            clearable
          />
        </v-locale-provider>

        <!-- Auto-find fills the address in rather than taking the field over: it stays editable
             either way, so a discovered address can still be corrected by hand. -->
        <div class="d-flex align-center justify-space-between ga-3 mt-1">
          <v-checkbox
            v-model="isAutoFind"
            :label="locale('STARLINK_AUTO_FIND')"
            density="compact"
            color="highlight"
            hide-details
          />

          <btn-style-2
            :text="locale('STARLINK_FIND')"
            size="small"
            @click="findLocalRouter()"
          />
        </div>
      </div>

    </config-card>

  </v-sheet>
</template>
