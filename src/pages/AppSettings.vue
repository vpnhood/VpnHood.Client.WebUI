<script lang="ts" setup>
import AppBar from '@/components/AppBar.vue'
import { LanguagesCode } from '@/helpers/UiConstants'
import { computed } from 'vue'
import { VpnHoodApp } from '@/services/VpnHoodApp'
import i18n from '@/locales/i18n'
import vuetify from '@/services/vuetify';
import router from '@/services/router';

const vhApp = VpnHoodApp.instance
const locale = i18n.global.t;

const includeLocalNetwork = computed({
  get: () => VpnHoodApp.instance.data.settings.userSettings.includeLocalNetwork,
  set: async (value: boolean) => {
    vhApp.data.settings.userSettings.includeLocalNetwork = value
    await vhApp.saveUserSetting()
  }
})
</script>

<template>
  <!-- Page header -->
  <AppBar :page-title="locale('SETTINGS')" />

  <v-sheet
    :color="vhApp.isConnectApp() ? 'primary-darken-2' : 'gray-lighten-6'"
    class="pa-4"
  >
    <!-- Change language -->
    <v-card
      :color="vhApp.isConnectApp() ? 'background' : 'white'"
      class="pa-4 mb-5"
    >
      <!-- Section title -->
      <h4 class="mb-2">{{ locale('LANGUAGE') }}</h4>

      <v-btn
        block
        class="justify-space-between px-2"
        color="gray-lighten-2"
        variant="tonal"
        @click="router.push({ path: '/languages' })"
      >
        <span :class="[vhApp.isConnectApp() ? 'text-white' : 'text-black','text-transform-none']">
          {{ locale('APP_LANGUAGE') }}
        </span>

        <template v-slot:append>
          <!-- Active language name -->
          <span
            :class="[vhApp.isConnectApp() ? 'text-disabled': 'text-gray-lighten-2']"
            class="text-caption text-capitalize me-1"
          >
            {{ vhApp.data.state.currentUiCultureInfo.nativeName }}
          </span>

          <!-- Button icon -->
          <v-icon
            :color="vhApp.isConnectApp() ? 'white' : 'black'"
            :icon="
              vuetify.locale.isRtl.value ? 'mdi-chevron-left' : 'mdi-chevron-right'
            "
          />
        </template>
      </v-btn>

      <!-- Language contribute link -->
      <div v-if="i18n.global.locale.value !== LanguagesCode.English">
        <!-- Description -->
        <p :class="[vhApp.isConnectApp() ? 'text-disabled': 'text-gray-lighten-2','text-caption mt-4 mb-1']">
          {{ locale('CONTRIBUTE_EDIT_LANGUAGES_DESC') }}
        </p>

        <!-- Link -->
        <a
          class="text-secondary text-decoration-none text-caption"
          href="https://explore.transifex.com/vpnhood/vpnhood-client"
          target="_blank"
        >
          {{ locale('CONTRIBUTE_EDIT_LANGUAGES_Title') }}
          <v-icon icon="mdi-open-in-new" />
        </a>
      </div>
    </v-card>

    <!-- Exclude local network option -->
    <v-card
      :color="vhApp.isConnectApp() ? 'background' : 'white'"
      class="pa-4"
    >
      <!-- Section title -->
      <h4 class="mb-2">{{ locale('LOCAL_NETWORK') }}</h4>

      <!-- Disconnecting alert -->
      <v-alert
        v-if="vhApp.isConnected()"
        :icon="false"
        :text="locale('DISCONNECT_REQUIRED_TO_CHANGE_SETTING')"
        class="mb-2 text-caption"
        density="compact"
        type="warning"
      ></v-alert>

      <v-row class="align-center justify-space-between">
        <v-col>{{ locale('INCLUDE_LOCAL_NETWORK') }}</v-col>
        <v-col cols="auto">
          <v-switch
            v-model="includeLocalNetwork"
            :disabled="vhApp.isConnected()"
            :hide-details="true"
            :inline="true"
            class="px-2"
            color="secondary"
            density="compact"
          />
        </v-col>
      </v-row>
      <p :class="[vhApp.isConnectApp() ? 'text-disabled' : 'text-gray-lighten-2', 'text-caption mt-1']">
        {{ locale('INCLUDE_LOCAL_NETWORK_DESC') }}
      </p>
    </v-card>
  </v-sheet>
</template>
