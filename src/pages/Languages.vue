<template>

  <!-- Page header -->
  <AppBar :page-title="$t('LANGUAGE')"/>

  <v-sheet class="pa-4" :color="$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect ? 'primary-darken-2' : 'gray-lighten-3'">

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
  name: "LanguagesPage",
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
    defaultLanguage: {
      get() {
        return this.$vpnHoodApp.data.settings.userSettings.cultureCode === null
            ? 'auto'
            : this.$vpnHoodApp.data.settings.userSettings.cultureCode;
      },
      async set(value: string) {
        this.$vpnHoodApp.data.settings.userSettings.cultureCode = value === 'auto' ? null : value;
        await this.$vpnHoodApp.saveUserSetting();
        this.$router.go(0);
      }
    },
  },
})
</script>