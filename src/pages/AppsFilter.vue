<script setup lang="ts">
import {FilterMode} from "@/services/VpnHood.Client.Api";
import AppBar from "@/components/AppBar.vue";
import {UiConstants} from "@/helpers/UiConstants";
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { computed, onMounted, ref } from 'vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

interface IMyInstalledApps {
  appId: string;
  appName: string;
  iconPng: string;
  isSelected: boolean;
}
enum ConfirmDialogAction {
  SelectAll,
  ClearAll
}
const showConfirmDialog = ref<boolean>(false);
const confirmDialogAction = ref<ConfirmDialogAction>(ConfirmDialogAction.SelectAll);
const myInstalledApps = ref<IMyInstalledApps[]>([]);
const search = ref<string | null>(null);

const appList = computed<IMyInstalledApps[]>(() => {
  if (search.value == null)
    return myInstalledApps.value;

  const searchText = search.value.toLowerCase();
  return myInstalledApps.value.filter(x => x.appName.toLowerCase().includes(searchText));
})

onMounted(async () => {
  if (vhApp.data.features.isExcludeAppsSupported || vhApp.data.features.isIncludeAppsSupported) {
    const installedApps = await vhApp.getInstalledApps();
    const filterMode = vhApp.data.settings.userSettings.appFiltersMode;

    // Add isSelected to all apps item
    myInstalledApps.value = installedApps.map(app => {
      // noinspection OverlyComplexBooleanExpressionJS
      const myApp: IMyInstalledApps = {
        appId: app.appId,
        appName: app.appName,
        iconPng: app.iconPng,
        isSelected: (filterMode === FilterMode.All)
          || (filterMode === FilterMode.Include && vhApp.data.settings.userSettings.appFilters.some(x => x === app.appId))
          || (filterMode === FilterMode.Exclude && vhApp.data.settings.userSettings.appFilters.every(x => x !== app.appId))
      };
      return myApp;
    });

    const futureInstalledAppInfo: IMyInstalledApps = {
      appId: "$",
      appName: locale('ALL_FUTURE_APPS'),
      iconPng: vhApp.isConnectApp() ? UiConstants.futureAppsIconConnect : UiConstants.futureAppsIconClient,
      isSelected: filterMode === FilterMode.All || filterMode === FilterMode.Exclude
    };
    myInstalledApps.value.push(futureInstalledAppInfo);
    sortApps(myInstalledApps.value);
  }
})

function sortApps(installedApps: IMyInstalledApps[]) {
  const isFutureAppSelected = myInstalledApps.value.some(x => x.appId === "$" && x.isSelected);
  installedApps.sort((a, b) => {
    // First condition displays first the enabled apps
    // Second condition displays first the disabled apps
    if (a.isSelected !== b.isSelected) return isFutureAppSelected
      ? Number(a.isSelected) - Number(b.isSelected)
      : Number(b.isSelected) - Number(a.isSelected);
    // Display first the "All Future Apps" option
    if (a.appId === "$") return -1;
    if (b.appId === "$") return +1;
    // Alphabetic sort
    return a.appName.localeCompare(b.appName);
  });
}

// Called after change each selection
async function saveChange(){

  // All apps
  const isAllSelectedApp = myInstalledApps.value.every(x => x.isSelected);
  if (isAllSelectedApp) {
    vhApp.data.settings.userSettings.appFiltersMode = FilterMode.All;
    vhApp.data.settings.userSettings.appFilters = [];
    await vhApp.saveUserSetting();
    return;
  }

  // All apps except selected
  const isFutureAppSelected = myInstalledApps.value.some(x => x.appId === "$" && x.isSelected);
  if (isFutureAppSelected) {
    vhApp.data.settings.userSettings.appFiltersMode = FilterMode.Exclude;
    vhApp.data.settings.userSettings.appFilters = myInstalledApps.value
      .filter(x => !x.isSelected && x.appId !== "$")
      .map(x => x.appId);
    await vhApp.saveUserSetting();
    return;
  }

  // Only selected apps
  vhApp.data.settings.userSettings.appFiltersMode = FilterMode.Include;
  vhApp.data.settings.userSettings.appFilters = myInstalledApps.value
    .filter(x => x.isSelected && x.appId !== "$")
    .map(x => x.appId);
  await vhApp.saveUserSetting();
}

async function actionOnConfirm() {
  if (confirmDialogAction.value === ConfirmDialogAction.SelectAll)
    myInstalledApps.value.forEach(app => {app.isSelected = true});
  else
    myInstalledApps.value.forEach(app => {app.isSelected = false});

  sortApps(myInstalledApps.value);
  await saveChange();
}
</script>

<template>
  <AppBar :page-title="locale('APP_FILTER')"/>

  <v-sheet
    :color="vhApp.isConnectApp() ? 'primary-darken-2' : 'gray-lighten-6'"
    class="pt-0 pb-5"
  >

    <!-- Disconnect required alert -->
    <v-alert v-if="vhApp.isConnected()"
       class="text-caption mt-5"
       density="compact"
       :icon="false"
       type="warning"
       :text="locale('DISCONNECT_REQUIRED_TO_CHANGE_SETTING')"
    />

    <!-- Select all apps button -->
    <!-- DO NOT remove the 'd-inline-flex' class to support legacy browser -->
    <div class="mt-5">
      <v-btn
        prepend-icon="mdi-select-all"
        variant="tonal"
        rounded="pill"
        :disabled="vhApp.isConnected()"
        density="comfortable"
        class="d-inline-flex text-caption me-2"
        :text="locale('SELECT_ALL')"
        @click="confirmDialogAction = ConfirmDialogAction.SelectAll; showConfirmDialog = true"
      />

      <!-- Remove all apps button -->
      <v-btn
        prepend-icon="mdi-select-remove"
        variant="tonal"
        rounded="pill"
        :disabled="vhApp.isConnected()"
        density="comfortable"
        class="d-inline-flex text-caption"
        :text="locale('CLEAR_ALL')"
        @click="confirmDialogAction = ConfirmDialogAction.ClearAll; showConfirmDialog = true"
      />
    </div>

    <!-- Search box -->
    <v-text-field
      v-model="search"
      single-line
      clearable
      hide-details
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      density="compact"
      rounded="pill"
      color="secondary"
      id="appSearchField"
      :placeholder="locale('SEARCH')"
      :disabled="myInstalledApps.length < 1"
      class="mt-5"
    >
    </v-text-field>

    <!-- Filter apps option -->
    <v-card
      :color="vhApp.isConnectApp() ? 'background' : ''"
      :loading="myInstalledApps.length < 1"
      class="fill-height mt-5"
    >
        <!-- Apps list -->
        <v-list
          v-if="myInstalledApps.length > 1"
          id="appFilterList"
          select-strategy="classic"
          bg-color="transparent"
          :disabled="vhApp.isConnected()"
          selectable
        >
          <v-list-item
            v-for="app in appList"
            :key="app.appId"
            :value="app.appId"
            :title="app.appName"
            :ripple="true"
            :prepend-avatar="'data:image/png;base64, ' + app.iconPng"
            :class="[
                vhApp.isConnectApp()
                ? 'border-primary-darken-2 border-opacity-50'
                : 'border-gray-lighten-5 border-opacity-100',
                'border-b text-caption'
                ]"
            @click="app.isSelected = !app.isSelected; saveChange()"
          >
            <template v-slot:append>
              <v-switch
                tabindex="-1"
                :model-value="app.isSelected"
                :hide-details="true"
                readonly
                density="compact"
                color="secondary"
              />
            </template>
          </v-list-item>
        </v-list>

    </v-card>
  </v-sheet>

  <ConfirmDialog
    v-model="showConfirmDialog"
    :title="confirmDialogAction == ConfirmDialogAction.SelectAll
    ? locale('SELECT_ALL_APPS_TITLE') : locale('CLEAR_ALL_APPS_TITLE')"
    :message="locale('ARE_YOU_SURE')"
    @click-action="actionOnConfirm"
  />
</template>

<!--suppress CssUnusedSymbol -->
<style>
#appFilterList .v-avatar.v-avatar--density-default {
  width: 30px;
  height: 30px;
}

#appFilterList .v-list-item__overlay{
  opacity: 0;
}

#appSearchField{
  font-size: 13px;
}
</style>
