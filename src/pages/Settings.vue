<template>

  <!-- Page header -->
  <AppBar :page-title="$t('SETTINGS')"/>

  <v-sheet class="pa-4"
           :color="$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect ? 'primary-darken-2' : 'gray-lighten-3'">


    <!-- Exclude local network option -->
    <h4 class="mb-2">{{ $t("LOCAL_NETWORK") }}</h4>
    <v-card :color="$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect ? 'background' : 'white'"
            class="pa-4 mb-5">
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
      <p class="text-disabled text-caption mt-1">
        {{ $t('EXCLUDE_LOCAL_NETWORK_DESC') }}
      </p>
    </v-card>

    <!-- Change language -->
    <h4 class="mb-2">{{ $t('LANGUAGE') }}</h4>
    <v-card :color="$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect ? 'background' : 'white'">
      <v-card-text>

        <v-btn
            variant="tonal"
            block
            color="gray-lighten-2"
            class="justify-space-between px-2"
            @click="$router.push({path: '/languages'})"
        >
          <span class="text-black">{{$t('APP_LANGUAGE')}}</span>
          <span class="text-disabled text-caption ms-1">({{ $t($i18n.locale) }})</span>
          <template v-slot:append>
            <v-icon color="black" :icon="$vuetify.locale.isRtl? 'mdi-chevron-left' : 'mdi-chevron-right'" />
          </template>
        </v-btn>

        <p v-if="$i18n.locale !== 'en'" class="text-disabled text-caption mt-4 mb-1">
          {{ $t("CONTRIBUTE_EDIT_LANGUAGES_DESC") }}</p>
        <a class="text-secondary text-decoration-none text-caption" href="https://github.com/vpnhood/VpnHood/issues/496"
           target="_blank">
          {{ $t("CONTRIBUTE_EDIT_LANGUAGES_Title") }}
          <v-icon icon="mdi-open-in-new"/>
        </a>
      </v-card-text>
    </v-card>

  </v-sheet>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import AppBar from "@/components/AppBar.vue";
import {AppName} from "@/UiConstants";

export default defineComponent({
  name: "SettingsPage",
  components: {AppBar},
  data() {
    return {
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