<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { computed, onMounted, ref, watch } from 'vue';
import AppBar from '@/components/AppBar.vue';
import { SplitByCountryMode } from '@/services/VpnHood.Client.Api';
import FilterList, { type IListItemInfo } from '@/components/Settings/FilterList.vue';
import { type NavigationGuardNext, onBeforeRouteLeave, type RouteLocationNormalized } from 'vue-router';


const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const countryList = ref<IListItemInfo[]>([]);
const isShowList = computed(() => vhApp.data.userSettings.splitByCountryMode === SplitByCountryMode.ExcludeList);
const localSplitMode = ref(vhApp.data.userSettings.splitByCountryMode);
const selectedCountries = computed<string[]>({
  get: () => vhApp.data.userSettings.splitByCountries,
  set: async (countiresCode: string[]) => vhApp.data.userSettings.splitByCountries = countiresCode
});

watch(isShowList, () => {
  if (isShowList.value) fetchCountries();
});

watch(() => vhApp.data.userSettings.splitByCountryMode, (newVal) => {
  localSplitMode.value = newVal;
});

onMounted(() => {
  if (isShowList.value) fetchCountries();
});

async function fetchCountries() {
  if (countryList.value.length > 0) return;

  const rawCountries = await vhApp.appClient.getSupportedSplitByCountries();

  // 1. Create the base list
  const mapped = rawCountries.map(x => ({
    id: x.countryCode,
    name: x.translatedName,
    icon: vhApp.getCountryFlag(x.countryCode),
    // Logic: If it's NOT in the exclusion list, it is "Selected" (ON)
    isSelected: !selectedCountries.value.includes(x.countryCode)
  }));

  // 2. Calculate group sizes
  const onCount = mapped.filter(x => x.isSelected).length;
  const offCount = mapped.length - onCount;

  // 3. Determine the "Priority" value
  // If ON is the minority, it should have the lower sort value (0)
  const onPriority = onCount < offCount ? 0 : 1;
  const offPriority = onCount < offCount ? 1 : 0;

  // 4. Sort based on the dynamic priority
  countryList.value = mapped.sort((a, b) => {
    const aVal = a.isSelected ? onPriority : offPriority;
    const bVal = b.isSelected ? onPriority : offPriority;

    if (aVal !== bVal) return aVal - bVal;

    // Secondary sort by name so it looks organized
    return a.name.localeCompare(b.name);
  });
}

async function handleListUpdate(newList: IListItemInfo[]){
  // Update local UI
  countryList.value = newList;
  // Update the actual setting (triggers the setter)
  selectedCountries.value = newList.filter(x => !x.isSelected).map(x => x.id);
}

async function onSplitModeChange(value: SplitByCountryMode | null) {
  const oldValue = vhApp.data.userSettings.splitByCountryMode;

  if (value === null) {
    localSplitMode.value = oldValue;
    return;
  }

  if (!await vhApp.disconnectAlert()) {
    localSplitMode.value = oldValue;
    return;
  }

  // Update logic
  if (value === SplitByCountryMode.ExcludeMyCountry) {
    selectedCountries.value = [];
  }

  vhApp.data.userSettings.splitByCountryMode = value;
  await vhApp.saveUserSetting();
}

onBeforeRouteLeave(
  async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {

    // Show error when the user excluded all countries
    if (isShowList.value && selectedCountries.value.length === vhApp.data.uiState.allCountriesCount){
      next(false);
      await vhApp.processError(locale("ALL_COUTRIES_EXCLUDED_ERROR_MSG"));
      return;
    }

    await vhApp.saveUserSetting();
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

        <v-radio-group
          v-model="localSplitMode"
          @update:model-value="onSplitModeChange"
          hide-details="auto"
          color="highlight"
        >
          <v-radio
            :value="SplitByCountryMode.IncludeAll"
            class="radio-icon-top mb-3"
          >
            <template v-slot:label>
              <div class="d-flex flex-column">
                <span>{{ locale("INCLUDE_ALL") }}</span>
                <span class="text-disabled text-caption">{{ locale("INCLUDE_ALL_DESC") }}</span>
              </div>
            </template>
          </v-radio>

          <v-radio
            :value="SplitByCountryMode.ExcludeMyCountry"
            class="radio-icon-top mb-3"
          >
            <template v-slot:label>
              <div class="d-flex flex-column">
                <span>
                  {{ locale("EXCLUDE_MY_COUNTRY") }}
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
                    {{ locale("SPLIT_EXCLUDE_MY_COUNTRY_DESC") }}
                </span>
              </div>
            </template>
          </v-radio>

          <v-radio
            :value="SplitByCountryMode.ExcludeList"
            class="radio-icon-top mb-3"
          >
            <template v-slot:label>
              <div class="d-flex flex-column">
                <span>{{ locale("CUSTOM_INCLUDE_LIST") }}</span>
                <span class="text-disabled text-caption">{{ locale("CUSTOM_INCLUDE_LIST_DESC") }}</span>
              </div>
            </template>
          </v-radio>

        </v-radio-group>
      </v-card-item>
  </config-card>

  <!-- Country list -->
  <filter-list
    v-if="isShowList"
    :list="countryList"
    :loading="countryList.length < 1"
    icon-size="30"
    :is-icon-as-flag="true"
    @update:list="handleListUpdate"
  />

  </v-sheet>
</template>
