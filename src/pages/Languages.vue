<template>
  <!-- Page header -->
  <v-app-bar color="secondary" density="compact" elevation="3">

    <!-- Close button -->
    <v-app-bar-nav-icon icon="mdi-close" color="white" @click="$router.replace('/')"></v-app-bar-nav-icon>

    <!-- Page title -->
    <v-app-bar-title class="text-body-1 text-white">{{ $t('SETTINGS') }}</v-app-bar-title>

  </v-app-bar>

  <v-sheet>
    <v-list>
      <v-list-item
          v-for="locale in $i18n.availableLocales"
          :key="locale"
          :value="locale"
          v-model="defaultLanguage"
          rounded="lg"
          base-color="primary-darken-2"
          variant="flat"
          class="ps-2 mb-2 border border-surface border-opacity-25"
          active-class="border border-opacity-100 border-secondary-lighten-1"
          :active="locale === $vpnHoodApp.data.settings.userSettings.cultureCode"
          @click="defaultLanguage = locale"
      >
        <!-- َActive item icon -->
        <template v-slot:prepend>
          <v-radio
              v-model="defaultLanguage"
              density="compact"
              :value="locale"
              :color="locale === $vpnHoodApp.data.settings.userSettings.cultureCode ? 'secondary-lighten-1' : 'gray'"
              :class="[locale === $vpnHoodApp.data.settings.userSettings.cultureCode ? '' : 'opacity-30', 'me-3' ]"
          />
        </template>
        <v-list-item-title class="title">{{ $t(locale) }}</v-list-item-title>

      </v-list-item>
    </v-list>
  </v-sheet>
</template>

<script lang="ts">
import {defineComponent} from "vue";


export default defineComponent({
  name: 'LanguagesPage',
  data() {
    return {

    }
  },

  computed: {
    defaultLanguage:
        {
          get() {
            return this.$vpnHoodApp.data.settings.userSettings.cultureCode;
          },
          async set(value: string) {
            this.$vpnHoodApp.data.settings.userSettings.cultureCode = value;
            await this.$vpnHoodApp.saveUserSetting();
            window.location.href ='/';
          }
        },
  },

  methods: {

  }
})
</script>