<template>

  <!-- Page header -->
  <AppBar :page-title="$t('SETTINGS')"/>

  <v-sheet class="pa-4"
           :color="$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect ? 'primary-darken-2' : 'gray-lighten-3'">


    <!-- Exclude local network option -->
    <p class="mb-2">{{$t("LOCAL_NETWORK")}}</p>
    <v-card :color="$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect ? 'background' : 'white'" class="pa-4 mb-5">
      <!-- Disconnecting alert -->
      <v-alert class="mb-2 text-caption" type="warning" density="compact" :icon="false"  :text="$t('APP_FILTER_DISCONNECTING_NOTE')"></v-alert>

      <v-row class="align-center justify-space-between">
        <v-col>{{$t('EXCLUDE_LOCAL_NETWORK')}}</v-col>
        <v-col cols="auto" >
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
      <p :class="[$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect ? 'text-disabled' : 'text-gray-lighten-2' ,'text-caption mt-1']">
        {{$t('EXCLUDE_LOCAL_NETWORK_DESC')}}
      </p>
    </v-card>

    <p class="mb-2">{{$t('LANGUAGE')}}</p>
    <v-card :color="$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect ? 'background' : 'white'">
      <v-list bg-color="transparent">
        <v-list-item
            v-for="(locale, index) in myLocales"
            :key="index"
            :value="locale"
            v-model="defaultLanguage"
            :class="[
                $vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect
                ? 'border-primary-darken-2 border-opacity-50'
                : 'border-surface border-opacity-50',
                locale.length === index - 1 ? '' : 'border-b '
                ]"
            active-class="text-secondary"
            :active="locale === defaultLanguage"
            @click="defaultLanguage = locale"
        >
          <!-- َActive item icon -->
          <template v-slot:prepend>
            <v-radio
                v-model="defaultLanguage"
                density="compact"
                :value="locale"
                :color="locale === defaultLanguage ? 'secondary' : 'gray'"
                :class="[locale === defaultLanguage ? '' : 'opacity-30', 'me-3' ]"
            />
          </template>
          <v-list-item-title>{{ $t(locale) }}</v-list-item-title>

        </v-list-item>
      </v-list>
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
      myLocales: ['auto'],
      AppName
    }
  },
  created() {
    this.myLocales.push(...this.$i18n.availableLocales);
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
    defaultLanguage: {
      get() {
        return this.$vpnHoodApp.data.settings.userSettings.cultureCode === null
            ? 'auto'
            : this.$vpnHoodApp.data.settings.userSettings.cultureCode;
      },
      async set(value: string) {
        this.$vpnHoodApp.data.settings.userSettings.cultureCode = value === 'auto' ? null : value;
        await this.$vpnHoodApp.saveUserSetting();
        window.location.href = '/';
      }
    },
  },
})
</script>