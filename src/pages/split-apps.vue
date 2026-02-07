<script setup lang="ts">
import { SplitByMode } from '@/services/VpnHood.Client.Api';
import {UiConstants} from "@/helpers/UiConstants";
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { computed, onMounted, ref } from 'vue';
import AppBar from '@/components/AppBar.vue';
import FilterList, { type IListItemInfo } from '@/components/FilterList.vue';
import { type NavigationGuardNext, onBeforeRouteLeave, type RouteLocationNormalized } from 'vue-router';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const appList = ref<IListItemInfo[]>([]);
const splitMode = computed<SplitByMode>({
  get: () => vhApp.data.userSettings.splitByAppMode,
  set: async (value: SplitByMode) => vhApp.data.userSettings.splitByAppMode = value
});
const selectedApps = computed<string[]>({
  get: () => vhApp.data.userSettings.splitByApps,
  set: async (apps: string[]) => vhApp.data.userSettings.splitByApps = apps
});
const isSaveRejected = computed(() => splitMode.value === SplitByMode.Include && selectedApps.value.length == 0);

onMounted(async () => {
  if (vhApp.data.features.isExcludeAppsSupported || vhApp.data.features.isIncludeAppsSupported) {
    const installedApps = await vhApp.getInstalledApps();

    // Add isSelected to all app items
    appList.value = installedApps.map(app => ({
      id: app.appId,
      name: app.appName,
      icon: 'data:image/png;base64, ' + app.iconPng,
      isSelected: (splitMode.value === SplitByMode.All)
        || (splitMode.value === SplitByMode.Include && selectedApps.value.some(x => x === app.appId))
        || (splitMode.value === SplitByMode.Exclude && selectedApps.value.every(x => x !== app.appId))
    }));

    const futureInstalledAppInfo: IListItemInfo = {
      id: "$",
      name: locale('ALL_FUTURE_APPS'),
      icon: vhApp.isConnectApp() ? UiConstants.futureAppsIconConnect : UiConstants.futureAppsIconClient,
      isSelected: splitMode.value === SplitByMode.All || splitMode.value === SplitByMode.Exclude
    };
    appList.value.push(futureInstalledAppInfo);
    sortApps(appList.value);
  }
})

function sortApps(installedApps: IListItemInfo[]) {
  const isFutureAppSelected = appList.value.some(x => x.id === "$" && x.isSelected);
  installedApps.sort((a, b) => {
    // The first condition displays first the enabled apps
    // Second condition displays first the disabled apps
    if (a.isSelected !== b.isSelected) return isFutureAppSelected
      ? Number(a.isSelected) - Number(b.isSelected)
      : Number(b.isSelected) - Number(a.isSelected);
    // Display first the "All Future Apps" option
    if (a.id === "$") return -1;
    if (b.id === "$") return +1;
    // Alphabetic sort
    return a.name.localeCompare(b.name);
  });
}

async function handleListUpdate(newList: IListItemInfo[]){
  if (!await vhApp.disconnectAlert()) return;
  appList.value = newList;

  // All apps
  const isAllSelectedApp = newList.every(x => x.isSelected);
  if (isAllSelectedApp) {
    splitMode.value = SplitByMode.All;
    selectedApps.value = [];
    await vhApp.saveUserSetting();
    return;
  }

  // All apps except selected
  const isFutureAppSelected = newList.some(x => x.id === "$" && x.isSelected);
  if (isFutureAppSelected) {
    splitMode.value = SplitByMode.Exclude;
    selectedApps.value = newList
      .filter(x => !x.isSelected && x.id !== "$")
      .map(x => x.id);
    await vhApp.saveUserSetting();
    return;
  }

  // Only selected apps
  splitMode.value = SplitByMode.Include;
  selectedApps.value = newList
    .filter(x => x.isSelected && x.id !== "$")
    .map(x => x.id);

  if (!isSaveRejected.value)
    await vhApp.saveUserSetting();
}

onBeforeRouteLeave(
  async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {

    // Show error when the user excluded all countries
    if (isSaveRejected.value){
      next(false);
      await vhApp.processError(locale("ALL_APPS_EXCLUDED_ERROR_MSG"));
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
    <p class="text-disabled text-caption mb-4">{{locale("SPLIT_APPS_DESC")}}</p>

      <!-- Apps list -->
      <filter-list
        :list="appList"
        :loading="appList.length < 1"
        icon-size="30"
        @update:list="handleListUpdate"
      />
  </v-sheet>
</template>
