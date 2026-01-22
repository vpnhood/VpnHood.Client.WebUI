<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { computed, onMounted, ref } from 'vue';
import AppBar from '@/components/AppBar.vue';
import { CountryInfo, SplitByCountryMode } from '@/services/VpnHood.Client.Api';
import { type NavigationGuardNext, onBeforeRouteLeave, type RouteLocationNormalized } from 'vue-router';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const emptyManualCountriesError = ref<string | null>(null);
const countryList = ref<CountryInfo[]>();
const splitMode = computed<SplitByCountryMode>({
  get: () => {
    return vhApp.data.userSettings.splitByCountryMode;
  },
  set: async (value: SplitByCountryMode) => {
    if (vhApp.data.isConnected && !await vhApp.showConfirmDialog(locale('DISCONNECT_ALERT'), locale('DISCONNECT_ALERT_DESC')))
      return;

    vhApp.data.userSettings.splitByCountryMode = value;
    await vhApp.saveUserSetting();
  }
});

const selectedCountries = computed<string[]>({
  get: () => vhApp.data.userSettings.splitByCountries,
  set: async (value: string[]) => {
    vhApp.data.userSettings.splitByCountries = value ?? [];
    await vhApp.saveUserSetting();

    if (value.length > 0)
      emptyManualCountriesError.value = null;
  }
});
onMounted(async () => {
  countryList.value = await vhApp.appClient.getSupportedSplitByCountries();
})
onBeforeRouteLeave(
  async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    if (splitMode.value === SplitByCountryMode.ExcludeList && selectedCountries.value.length < 1){
      emptyManualCountriesError.value = locale('EMPTY_COUNTRY_LIST_ERROR_MSG');
      next(false);
      return;
    }

    next();
  }
);
</script>

<template>
  <v-sheet>
    <app-bar/>

    <!-- Feature description -->
    <p class="text-disabled text-caption mb-4">{{locale("SPLIT_COUNTRIES_DESC")}}</p>

    <config-card class="pt-3">

      <v-card-item class="ps-1">

        <!-- TODO: Create component for all radio group -->
        <v-radio-group
          v-model="splitMode"
          :hide-details="true"
          color="highlight"
        >
          <v-radio :value="SplitByCountryMode.IncludeAll" class="mb-3">
            <template v-slot:label>
              <div class="d-flex flex-column align-start">
                <span>{{ locale("OFF") }}</span>
                <span class="text-disabled text-caption">{{ locale("SPLIT_COUNTRY_OFF_DESC") }}</span>
              </div>
            </template>
          </v-radio>

          <v-radio :value="SplitByCountryMode.ExcludeMyCountry" class="mb-3">
            <template v-slot:label>
              <div class="d-flex flex-column">
                <span>
                  {{ locale("MY_COUNTRY") }}
                  <v-chip
                    color="highlight"
                    :text="locale('RECOMMENDED')"
                    size="small"
                    variant="tonal"
                    density="comfortable"
                    tabindex="-1"
                  />
                </span>
                <span class="text-disabled text-caption">
                    {{ locale("SPLIT_MY_COUNTRY_DESC") }}
                </span>
              </div>
            </template>
          </v-radio>

          <v-radio :value="SplitByCountryMode.ExcludeList" class="mb-3">
            <template v-slot:label>
              <div class="d-flex flex-column">
                <span>{{ locale("CUSTOM_EXCLUSION_LIST") }}</span>
                <span class="text-disabled text-caption">{{ locale("CUSTOM_EXCLUSION_LIST_DESC") }}</span>
              </div>
            </template>
          </v-radio>

        </v-radio-group>
      </v-card-item>

      <!-- Country list -->
      <v-card-item v-if="splitMode === SplitByCountryMode.ExcludeList" class="pt-0 pb-4">
        <v-combobox
          v-model="selectedCountries"
          theme="dark"
          :label="locale('COUNTRIES')"
          :items="countryList"
          item-title="englishName"
          item-value="countryCode"
          :return-object="false"
          :list-props="{ bgColor: 'app-bar' }"
          :error-messages="emptyManualCountriesError"
          hide-details="auto"
          variant="outlined"
          color="highlight"
          class="mt-2"
          hide-selected
          clearable
          chips
          closable-chips
          multiple
        >
          <!-- Selected countries -->
          <template v-slot:chip="{ props, item }">
            <v-chip v-bind="props" label>
              <template v-slot:prepend>
                <v-img
                  :src="vhApp.getCountryFlag(item.raw.countryCode)"
                  eager
                  alt="country flag"
                  width="18px"
                  class="me-1"
                />
              </template>
              <template v-slot:close>
                <v-icon icon="mdi-close" size="14"/>
              </template>
            </v-chip>
          </template>

          <!-- List item flag -->
          <template v-slot:item="{ props, item }">
            <v-list-item v-bind="props" :title="item.raw.englishName">
              <template v-slot:prepend>
                <v-img
                  :src="vhApp.getCountryFlag(item.raw.countryCode)"
                  width="22px"
                  alt="country flag"
                  class="me-3"
                />
              </template>
            </v-list-item>
          </template>

        </v-combobox>
      </v-card-item>
  </config-card>
  </v-sheet>
</template>
