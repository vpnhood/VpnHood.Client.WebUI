<template>

  <!-- Page header -->
  <AppBar :page-title="$t('LANGUAGE')"/>

  <v-sheet class="pa-4"
           :color="$vpnHoodApp.isConnectApp() ? 'primary-darken-2' : 'gray-lighten-6'">

    <v-card :color="$vpnHoodApp.isConnectApp() ? 'background' : 'white'">
      <v-list
          v-model="defaultLanguage"
          select-strategy="classic"
          bg-color="transparent"
          class="py-0"
          active-class="text-secondary"
      >
        <v-list-item
            v-for="(locale, index) in myLocales"
            :key="index"
            :value="locale.code"
            :class="[
                $vpnHoodApp.isConnectApp()
                ? 'border-primary-darken-2 border-opacity-50'
                : 'border-gray-lighten-5 border-opacity-100',
                'border-b'
                ]"
            :active="locale.code === defaultLanguage"
            @click="defaultLanguage = locale.code"
        >

          <!-- Language name -->
          <v-list-item-title class="text-capitalize">

            <!-- Radio button icon -->
            <span class="me-2">
              <v-icon v-if="locale.code === defaultLanguage" icon="mdi-radiobox-marked"/>
              <v-icon v-else icon="mdi-radiobox-blank" class="text-gray-lighten-1"/>
            </span>

            {{ locale.nativeName }}

            <!-- System default language name -->
            <span
                v-if="locale.code === LanguagesCode.SystemDefault"
                :class="[$vpnHoodApp.isConnectApp() ? 'text-disabled' : 'text-gray-lighten-2', 'text-caption ms-1']"
            >
              ({{ $vpnHoodApp.data.state.systemUiCultureInfo.nativeName }})
            </span>
          </v-list-item-title>

          <!-- Show message if the system language does not supported -->
          <p
              dir="ltr"
              v-if="locale.code === LanguagesCode.SystemDefault && !myLocales.find(x => x.code === $vpnHoodApp.data.state.systemUiCultureInfo.code)"
              :class="[$vpnHoodApp.isConnectApp() ? 'text-disabled' : 'text-gray-lighten-2', 'text-caption']"
          >
            {{ $t("SYSTEM_DEFAULT_LANGUAGE_NOT_SUPPORTED_DESC") }}
          </p>

        </v-list-item>
      </v-list>
    </v-card>

  </v-sheet>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import AppBar from "@/components/AppBar.vue";
import {AppName, LanguagesCode} from "@/UiConstants";
import {string} from "postcss-selector-parser";
import {UiCultureInfo} from "@/services/VpnHood.Client.Api";

export default defineComponent({
  name: "AppLanguages",
  methods: {string},
  components: {AppBar},
  data() {
    return {
      AppName,
      LanguagesCode,
      myLocales: [
        {
          code: LanguagesCode.SystemDefault,
          nativeName: this.$t("SYSTEM_DEFAULT_LANGUAGE", this.$i18n.locale)
        }
      ] as UiCultureInfo[]
    }
  },
  created() {
    const sortedCultureInfos = this.$vpnHoodApp.data.cultureInfos.sort((a, b) => a.nativeName.localeCompare(b.nativeName));
    this.myLocales.push(...sortedCultureInfos);
  },
  computed: {
    defaultLanguage: {
      get() {
        return this.$vpnHoodApp.data.settings.userSettings.cultureCode === null
            ? LanguagesCode.SystemDefault
            : this.$vpnHoodApp.data.settings.userSettings.cultureCode;
      },
      async set(value: string) {
        this.$vpnHoodApp.data.settings.userSettings.cultureCode = value === LanguagesCode.SystemDefault ? null : value;
        await this.$vpnHoodApp.saveUserSetting();
        this.$router.go(0);
      }
    },
  },
})
</script>