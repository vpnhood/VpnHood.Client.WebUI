<script setup lang="ts">
import {FilterMode} from "@/services/VpnHood.Client.Api";
import AppBar from "@/components/AppBar.vue";
import {UiConstants} from "@/helper/UiConstants";
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { onMounted, ref } from 'vue';

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

const myInstalledApps = ref<IMyInstalledApps[]>([]);

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

function selectAll() {
  myInstalledApps.value.forEach(app => {app.isSelected = true});
  sortApps(myInstalledApps.value);
  saveChange();
}

function clearAll() {
  myInstalledApps.value.forEach(app => {app.isSelected = false});
  sortApps(myInstalledApps.value);
  saveChange();
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

async function showDialog(confirmAction: ConfirmDialogAction, title: string, message: string) {
  const confirmResult = await vhApp.data.confirmDialog.showDialog(title, message);
  if (!confirmResult)
    return;

  if (confirmAction === ConfirmDialogAction.SelectAll)
    selectAll();
  else
    clearAll();
}
</script>

<template>

  <AppBar :page-title="locale('APP_FILTER')"/>

  <v-sheet :color="vhApp.isConnectApp() ? 'primary-darken-2' : 'gray-lighten-6'">

    <!-- Disconnecting alert -->
    <v-alert v-if="vhApp.isConnected()" class="mb-5 text-caption" density="compact" :icon="false" type="warning"
             :text="locale('DISCONNECT_REQUIRED_TO_CHANGE_SETTING')"></v-alert>

    <v-btn
      prepend-icon="mdi-select-all"
      variant="tonal"
      rounded="pill"
      :disabled="vhApp.isConnected()"
      density="comfortable"
      class="text-caption me-3"
      :text="locale('SELECT_ALL')"
      @click="showDialog(ConfirmDialogAction.SelectAll, locale('SELECT_ALL_APPS_TITLE'), locale('ARE_YOU_SURE'))"
    />

    <v-btn
      prepend-icon="mdi-select-remove"
      variant="tonal"
      rounded="pill"
      :disabled="vhApp.isConnected()"
      density="comfortable"
      class="text-caption"
      :text="locale('CLEAR_ALL')"
      @click="showDialog(ConfirmDialogAction.ClearAll, locale('CLEAR_ALL_APPS_TITLE'), locale('ARE_YOU_SURE'))"
    />

    <!-- Filter apps option -->
    <v-card :color="vhApp.isConnectApp() ? 'background' : ''" class="mt-3">

      <!-- Apps list -->
      <v-card-item class="px-0 pb-0">

        <!-- Loading list -->
        <v-progress-linear v-if="myInstalledApps.length < 1" color="secondary" indeterminate />

        <!-- Apps list -->
        <v-list
          v-else
          id="appFilterList"
          select-strategy="classic"
          bg-color="transparent"
          :disabled="vhApp.isConnected()"
          class="py-0"
          selectable
        >
          <v-list-item
            v-for="app in myInstalledApps"
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
      </v-card-item>
    </v-card>
  </v-sheet>

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
</style>
