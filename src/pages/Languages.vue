<template>

  <!-- Page header -->
  <AppBar :page-title="$t('LANGUAGE')"/>

  <v-sheet class="pa-4" :color="$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect ? 'primary-darken-2' : 'gray-lighten-3'">

    <v-card :color="$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect ? 'background' : 'white'">
      <v-list bg-color="transparent" class="py-0">
        <v-list-item
            v-for="(locale, index) in myLocales"
            :key="index"
            :value="locale.code"
            v-model="defaultLanguage"
            :class="[
                $vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect
                ? 'border-primary-darken-2 border-opacity-50'
                : 'border-gray-lighten-3 border-opacity-100',
                'border-b'
                ]"
            active-class="text-secondary"
            :active="locale.code === defaultLanguage"
            @click="defaultLanguage = locale.code"
        >
          <!-- َActive language icon -->
          <template v-slot:prepend>
            <v-radio
                v-model="defaultLanguage"
                density="compact"
                true-icon="mdi-check-all"
                false-icon=""
                :value="locale.code"
                :color="locale.code === defaultLanguage ? 'secondary' : 'gray'"
                :class="[locale.code === defaultLanguage ? '' : 'opacity-30', 'me-3' ]"
            />
          </template>

          <!-- Language name -->
          <v-list-item-title class="text-capitalize">
            {{ locale.nativeName }}

            <!-- System default language name -->
            <span v-if="locale.code === LanguagesCode.SystemDefault" class="text-caption text-gray-lighten-2 ms-1">
              ({{$vpnHoodApp.data.state.systemCultureNativeName.nativeName}})
            </span>
          </v-list-item-title>

          <!-- Show message if the system language does not supported -->
          <v-list-item-subtitle v-if="!myLocales.find(x => x.code === $vpnHoodApp.data.state.systemCultureNativeName.code)">
            {{$t("SYSTEM_DEFAULT_LANGUAGE_NOT_SUPPORTED_DESC")}}
          </v-list-item-subtitle>

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
      myLocales: [{code: LanguagesCode.SystemDefault, nativeName: this.$t("SYSTEM_DEFAULT_LANGUAGE", this.$i18n.locale)}] as UiCultureInfo[],
      AppName,
      LanguagesCode
    }
  },
  created() {
    const sortedCultureInfos = this.$vpnHoodApp.data.cultureInfos.sort((a, b) => a.nativeName.localeCompare(b.nativeName));
    this.myLocales.push(...sortedCultureInfos);

    /*const languageDictionary: { [code: string]: string } = {};
    sortedCultureInfos.forEach((language) => {
      languageDictionary[language.code] = language.nativeName;
    });*/

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