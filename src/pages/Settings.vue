<template>

  <!-- Page header -->
  <AppBar :page-title="$t('SETTINGS')"/>

  <v-sheet class="pa-4"
           :color="$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect ? 'primary-darken-2' : 'gray-lighten-3'">


    <!-- Exclude local network option -->
    <v-card :color="$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect ? 'background' : 'white'" class="pa-4 mb-5">

      <!-- Section title -->
      <h4 class="mb-2">{{ $t("LOCAL_NETWORK") }}</h4>

      <!-- Disconnecting alert -->
      <v-alert class="mb-2 text-caption" type="warning" density="compact" :icon="false"
               :text="$t('APP_FILTER_DISCONNECTING_NOTE')"></v-alert>

      <v-row class="align-center justify-space-between">
        <v-col>{{ $t('EXCLUDE_LOCAL_NETWORK') }}</v-col>
        <v-col cols="auto">
          <v-switch
              v-model="excludeLocalNetwork"
              color="secondary"
              class="px-2"
              density="compact"
              :inline="true"
              :hide-details="true"
          />
        </v-col>
      </v-row>
      <p :class="[$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect ? 'text-disabled' : 'text-gray-lighten-2', 'text-caption mt-1']">
        {{ $t('EXCLUDE_LOCAL_NETWORK_DESC') }}
      </p>
    </v-card>

    <!-- Change language -->

    <v-card :color="$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect ? 'background' : 'white'" class="pa-4">

      <!-- Section title -->
      <h4 class="mb-2">{{ $t('LANGUAGE') }}</h4>

        <v-btn
            variant="tonal"
            block
            color="gray-lighten-2"
            class="justify-space-between px-2"
            @click="$router.push({path: '/languages'})"
        >
          <span :class="[$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect? 'text-white' : 'text-black', 'text-transform-none']">{{$t('APP_LANGUAGE')}}</span>
          <template v-slot:append>
            <span :class="[$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect ? 'text-disabled' : 'text-gray-lighten-2', 'text-caption me-1']">{{ $t($i18n.locale) }}</span>
            <v-icon :color="$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect? 'white' : 'black'" :icon="$vuetify.locale.isRtl? 'mdi-chevron-left' : 'mdi-chevron-right'" />
          </template>
        </v-btn>

      <div v-if="$i18n.locale !== LanguagesCode.English">
        <p :class="[$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect ? 'text-disabled' : 'text-gray-lighten-2', 'text-caption mt-4 mb-1']">
          {{ $t("CONTRIBUTE_EDIT_LANGUAGES_DESC") }}</p>
        <a class="text-secondary text-decoration-none text-caption" href="https://github.com/vpnhood/VpnHood/issues/496"
           target="_blank">
          {{ $t("CONTRIBUTE_EDIT_LANGUAGES_Title") }}
          <v-icon icon="mdi-open-in-new"/>
        </a>
      </div>

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
    excludeLocalNetwork: {
      get() {
        return this.$vpnHoodApp.data.settings.userSettings.excludeLocalNetwork;
      },
      async set(value: boolean) {
        if (this.$vpnHoodApp.data.settings.userSettings.excludeLocalNetwork !== value) {
          this.$vpnHoodApp.data.settings.userSettings.excludeLocalNetwork = value;
          await this.$vpnHoodApp.saveUserSetting();
          this.$vpnHoodApp.disconnect();
        }
      }
    },
  },
})
</script>