<template>

  <!-- Page header -->
  <AppBar :page-title="$t('SETTINGS')"/>

  <v-sheet class="pa-4"
           :color="$vpnHoodApp.isConnectApp() ? 'primary-darken-2' : 'gray-lighten-6'">

    <!-- Change language -->
    <v-card :color="$vpnHoodApp.isConnectApp() ? 'background' : 'white'" class="pa-4 mb-5">

      <!-- Section title -->
      <h4 class="mb-2">{{ $t('LANGUAGE') }}</h4>

      <v-btn
          variant="tonal"
          block
          color="gray-lighten-2"
          class="justify-space-between px-2"
          @click="$router.push({path: '/languages'})"
      >

          <span
              :class="[$vpnHoodApp.isConnectApp()? 'text-white' : 'text-black', 'text-transform-none']"
          >
            {{$t('APP_LANGUAGE')}}
          </span>

        <template v-slot:append>
          <!-- Active language name -->
          <span
              :class="[$vpnHoodApp.isConnectApp() ? 'text-disabled' : 'text-gray-lighten-2', 'text-caption text-capitalize me-1']"
          >
              {{ $vpnHoodApp.data.state.currentUiCultureInfo.nativeName }}
            </span>

          <!-- Button icon -->
          <v-icon
              :color="$vpnHoodApp.isConnectApp()? 'white' : 'black'"
              :icon="$vuetify.locale.isRtl? 'mdi-chevron-left' : 'mdi-chevron-right'"
          />
        </template>

      </v-btn>

      <!-- Language contribute link -->
      <div v-if="$i18n.locale !== LanguagesCode.English">

        <!-- Description -->
        <p :class="[$vpnHoodApp.isConnectApp() ? 'text-disabled' : 'text-gray-lighten-2', 'text-caption mt-4 mb-1']">
          {{ $t("CONTRIBUTE_EDIT_LANGUAGES_DESC") }}
        </p>

        <!-- Link -->
        <a class="text-secondary text-decoration-none text-caption" href="https://explore.transifex.com/vpnhood/vpnhood-client"
           target="_blank">
          {{ $t("CONTRIBUTE_EDIT_LANGUAGES_Title") }}
          <v-icon icon="mdi-open-in-new"/>
        </a>
      </div>

    </v-card>

    <!-- Exclude local network option -->
    <v-card :color="$vpnHoodApp.isConnectApp() ? 'background' : 'white'" class="pa-4">

      <!-- Section title -->
      <h4 class="mb-2">{{ $t("LOCAL_NETWORK") }}</h4>

      <!-- Disconnecting alert -->
      <v-alert class="mb-2 text-caption" type="warning" density="compact" :icon="false"
               :text="$t('APP_FILTER_DISCONNECTING_NOTE')"></v-alert>

      <v-row class="align-center justify-space-between">
        <v-col>{{ $t('INCLUDE_LOCAL_NETWORK') }}</v-col>
        <v-col cols="auto">
          <v-switch
              v-model="includeLocalNetwork"
              color="secondary"
              class="px-2"
              density="compact"
              :inline="true"
              :hide-details="true"
          />
        </v-col>
      </v-row>
      <p :class="[$vpnHoodApp.isConnectApp() ? 'text-disabled' : 'text-gray-lighten-2', 'text-caption mt-1']">
        {{ $t('INCLUDE_LOCAL_NETWORK_DESC') }}
      </p>
    </v-card>

  </v-sheet>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import AppBar from "@/components/AppBar.vue";
import {AppName, LanguagesCode} from "@/UiConstants";

export default defineComponent({
  name: "SettingsPage",
  components: {AppBar},
  data() {
    return {
      LanguagesCode,
      AppName
    }
  },
  computed: {
    includeLocalNetwork: {
      get() {
        return this.$vpnHoodApp.data.settings.userSettings.includeLocalNetwork;
      },
      async set(value: boolean) {
        this.$vpnHoodApp.data.settings.userSettings.includeLocalNetwork = value;
        await this.$vpnHoodApp.saveUserSetting();
      }
    },
  },
})
</script>