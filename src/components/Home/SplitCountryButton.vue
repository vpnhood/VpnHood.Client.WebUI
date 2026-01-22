<script setup lang="ts">
import router from '@/services/router';
import { Util } from '@/helpers/Util';
import i18n from '@/locales/i18n';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import { computed } from 'vue';
import { SplitByCountryMode } from '@/services/VpnHood.Client.Api';
import CountryFlagWrapper from '@/components/CountryFlagWrapper.vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const excludedCountries = computed((): string[] => vhApp.data.userSettings.splitByCountries ?? []);
const allowMultipleSplitCountryFlag = computed((): boolean => vhApp.data.userSettings.splitByCountryMode ===
  SplitByCountryMode.ExcludeList && excludedCountries.value.length <= 5);

const isShowSplitCountryFlag = computed((): boolean => vhApp.data.userSettings.splitByCountryMode === SplitByCountryMode.ExcludeMyCountry);
const isShowSplitCountryText = computed((): boolean => !allowMultipleSplitCountryFlag.value || excludedCountries.value.length === 1);

const splitCountryStatusText = computed((): string => {
  switch (vhApp.data.userSettings.splitByCountryMode){
    case SplitByCountryMode.ExcludeMyCountry:
      return "MY_COUNTRY";
    case SplitByCountryMode.ExcludeList:
      return locale(excludedCountries.value.length === 1 ? 'CUSTOM' : 'SPLIT_COUNTRY_COUNT', { x:
        excludedCountries.value.length
      });
    default:
      return "OFF";
  }
});
</script>

<template>
  <home-config-btn
    id="excludeCountryButton"
    prepend-icon="mdi-call-split"
    class="mb-1"
    tabindex="6"
    @click="router.push({ name: 'SPLIT_COUNTRIES' })"
  >
    <span class="config-btn-title">{{ locale('SPLIT_COUNTRIES') }}</span>
    <v-icon :icon="Util.getLocalizedRightChevron()" />

    <!-- Text related to selected option -->
    <span
      v-if="isShowSplitCountryText"
      class="config-btn-value text-white text-capitalize text-caption text-truncate limited-width-to-truncate opacity-50"
    >
      {{ locale(splitCountryStatusText) }}
    </span>

    <template v-if="allowMultipleSplitCountryFlag || isShowSplitCountryFlag" v-slot:append>

      <!-- Multiple country flag -->
      <template v-if="allowMultipleSplitCountryFlag">
        <country-flag-wrapper
          v-for="countryCode in excludedCountries"
          :key="countryCode"
          :country-code="countryCode"
        />
      </template>

      <!-- Client country flag -->
      <country-flag-wrapper v-else :country-code="vhApp.data.state.clientCountryCode" />
    </template>

  </home-config-btn>
</template>
