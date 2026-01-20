<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { computed, ref } from 'vue';
import AppBar from '@/components/AppBar.vue';
import { SplitByCountryMode } from '@/services/VpnHood.Client.Api';
import { type NavigationGuardNext, onBeforeRouteLeave, type RouteLocationNormalized } from 'vue-router';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const emptyManualCountriesError = ref<string | null>(null)

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

const debugData1 = computed<string[]>({
  get: () => vhApp.data.userSettings.debugData1?.split(' ') ?? [],
  set: (value: string[] | null) => {
    vhApp.data.userSettings.debugData1 = value?.join(' ') || null;

    if (value && value.length > 0)
      emptyManualCountriesError.value = null;
  }
});

onBeforeRouteLeave(
  async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    if (splitMode.value === SplitByCountryMode.ExcludeList && debugData1.value.length < 1){
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

    <p class="text-disabled text-caption mb-4">{{locale("SPLIT_COUNTRIES_DESC")}}</p>

    <config-card class="pb-3">

      <v-card-item>
        <v-radio-group
          v-model="splitMode"
          :hide-details="true"
          color="highlight"
        >
          <v-radio :value="SplitByCountryMode.IncludeAll" class="mb-3">
            <template v-slot:label>
              <div class="d-flex flex-column">
                <span>{{ locale("NO") }}</span>
                <span class="text-disabled text-caption">{{ locale("SLOWER") }}</span>
              </div>
            </template>
          </v-radio>

          <v-radio :value="SplitByCountryMode.ExcludeMyCountry" class="mb-3">
            <template v-slot:label>
              <div class="d-flex flex-column">
                <span>{{ locale("MY_COUNTRY") }}</span>
                <span class="text-disabled text-caption">
                    {{ locale("FASTER") }}
                    <v-chip
                      color="highlight"
                      :text="locale('RECOMMENDED')"
                      size="small"
                      variant="tonal"
                      density="comfortable"
                      tabindex="-1"
                    />
                  </span>
              </div>
            </template>
          </v-radio>

          <v-radio :value="SplitByCountryMode.ExcludeList" class="mb-3">
            <template v-slot:label>
              <div class="d-flex flex-column">
                <span>{{ locale("MANUAL") }}</span>
                <span class="text-disabled text-caption">{{ locale("MULTIPLE_COUNTRIES") }}</span>
              </div>
            </template>
          </v-radio>

        </v-radio-group>

        <v-combobox
          v-if="splitMode === SplitByCountryMode.ExcludeList"
          v-model="debugData1"
          theme="dark"
          clearable
          :label="locale('COUNTRIES')"
          :items="vhApp.data.features.debugCommands"
          :list-props="{ bgColor: 'app-bar' }"
          :error-messages="emptyManualCountriesError"
          hide-details="auto"
          hide-selected
          chips
          closable-chips
          multiple
        />

      </v-card-item>

  </config-card>
  </v-sheet>
</template>
