<script setup lang="ts">
import {SplitByMode} from "@/services/VpnHood.Client.Api";
import {UiConstants} from "@/helpers/UiConstants";
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { computed, onMounted, ref } from 'vue';
import DisconnectRequiredAlert from '@/components/DisconnectRequiredAlert.vue';
import AppBar from '@/components/AppBar.vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

interface IMyInstalledApps {
  appId: string;
  appName: string;
  iconPng: string;
  isSelected: boolean;
}

const myInstalledApps = ref<IMyInstalledApps[]>([]);
const search = ref<string | null>(null);
const isShowSearchBox = ref<boolean>(!vhApp.data.features.isTv);


const appList = computed<IMyInstalledApps[]>(() => {
  if (search.value == null)
    return myInstalledApps.value;

  const searchText = search.value.toLowerCase();
  return myInstalledApps.value.filter(x => x.appName.toLowerCase().includes(searchText));
})

onMounted(async () => {
  if (vhApp.data.features.isExcludeAppsSupported || vhApp.data.features.isIncludeAppsSupported) {
    const installedApps = await vhApp.getInstalledApps();
    const splitByAppMode = vhApp.data.userSettings.splitByAppMode;

    // Add isSelected to all app items
    myInstalledApps.value = installedApps.map(app => {
      // noinspection OverlyComplexBooleanExpressionJS
      const myApp: IMyInstalledApps = {
        appId: app.appId,
        appName: app.appName,
        iconPng: app.iconPng,
        isSelected: (splitByAppMode === SplitByMode.All)
          || (splitByAppMode === SplitByMode.Include && vhApp.data.userSettings.splitByApps.some(x => x === app.appId))
          || (splitByAppMode === SplitByMode.Exclude && vhApp.data.userSettings.splitByApps.every(x => x !== app.appId))
      };
      return myApp;
    });

    const futureInstalledAppInfo: IMyInstalledApps = {
      appId: "$",
      appName: locale('ALL_FUTURE_APPS'),
      iconPng: vhApp.isConnectApp() ? UiConstants.futureAppsIconConnect : UiConstants.futureAppsIconClient,
      isSelected: splitByAppMode === SplitByMode.All || splitByAppMode === SplitByMode.Exclude
    };
    myInstalledApps.value.push(futureInstalledAppInfo);
    sortApps(myInstalledApps.value);
  }
})

function sortApps(installedApps: IMyInstalledApps[]) {
  const isFutureAppSelected = myInstalledApps.value.some(x => x.appId === "$" && x.isSelected);
  installedApps.sort((a, b) => {
    // The first condition displays first the enabled apps
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
    vhApp.data.userSettings.splitByAppMode = SplitByMode.All;
    vhApp.data.userSettings.splitByApps = [];
    await vhApp.saveUserSetting();
    return;
  }

  // All apps except selected
  const isFutureAppSelected = myInstalledApps.value.some(x => x.appId === "$" && x.isSelected);
  if (isFutureAppSelected) {
    vhApp.data.userSettings.splitByAppMode = SplitByMode.Exclude;
    vhApp.data.userSettings.splitByApps = myInstalledApps.value
      .filter(x => !x.isSelected && x.appId !== "$")
      .map(x => x.appId);
    await vhApp.saveUserSetting();
    return;
  }

  // Only selected apps
  vhApp.data.userSettings.splitByAppMode = SplitByMode.Include;
  vhApp.data.userSettings.splitByApps = myInstalledApps.value
    .filter(x => x.isSelected && x.appId !== "$")
    .map(x => x.appId);
  await vhApp.saveUserSetting();
}

async function onSelectAll(){
    const result = await vhApp.showConfirmDialog(locale('SELECT_ALL_APPS_TITLE'), locale('ARE_YOU_SURE'));
    if (result) {
      myInstalledApps.value.forEach(app => {app.isSelected = true});
      sortApps(myInstalledApps.value);
      await saveChange();
    }
}
async function onClearAll(){
    const result = await vhApp.showConfirmDialog(locale('CLEAR_ALL_APPS_TITLE'), locale('ARE_YOU_SURE'));
    if (result) {
      myInstalledApps.value.forEach(app => {app.isSelected = false});
      sortApps(myInstalledApps.value);
      await saveChange();
    }
}
</script>

<template>
  <v-sheet>
    <app-bar/>

    <!-- Disconnect required alert -->
    <disconnect-required-alert class="mb-4"/>

    <!-- Filter apps option -->
    <config-card :loading="myInstalledApps.length < 1" class="pt-3">
      <v-card-item>
        <div class="d-flex flex-wrap ga-2">

          <!-- Select all apps button -->
          <btn-style-5
            prepend-icon="mdi-select-all"
            class="flex-grow-1 text-caption"
            :text="locale('SELECT_ALL')"
            @click="onSelectAll()"
          />

          <!-- Clear all apps button -->
          <btn-style-5
            prepend-icon="mdi-select-remove"
            class="flex-grow-1 text-caption"
            :text="locale('CLEAR_ALL')"
            @click="onClearAll()"
          />

          <!-- Search button -->
          <btn-style-5
            v-if="!isShowSearchBox"
            prepend-icon="mdi-magnify"
            class="flex-grow-1 text-caption"
            :text="locale('SEARCH')"
            @click="isShowSearchBox = !isShowSearchBox"
          />

        </div>
      </v-card-item>

      <v-card-item>
        <!-- Search box -->
        <v-text-field
          v-if="isShowSearchBox"
          v-model="search"
          single-line
          clearable
          hide-details
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          rounded="pill"
          color="highlight"
          id="appSearchField"
          :placeholder="locale('SEARCH')"
        >
        </v-text-field>
      </v-card-item>

      <v-defaults-provider v-if="myInstalledApps.length < 1" :defaults="{
          'VSkeletonLoader':{
            'color': 'rgba(var(--v-theme-card-on-grad-bg), 0.3)',
            'type': 'list-item-avatar'
            }
        }"
      >
        <v-skeleton-loader />
        <v-skeleton-loader />
        <v-skeleton-loader />
        <v-skeleton-loader />
        <v-skeleton-loader />
        <v-skeleton-loader />
        <v-skeleton-loader />
        <v-skeleton-loader />
      </v-defaults-provider>

      <!-- Apps list -->
      <v-list v-else
        id="appFilterList"
        select-strategy="classic"
        bg-color="transparent"
        selectable
      >
        <v-list-item
          v-for="(app, index) in appList"
          :key="app.appId"
          :value="app.appId"
          :title="app.appName"
          :ripple="true"
          :prepend-avatar="'data:image/png;base64, ' + app.iconPng"
          class="text-caption"
          :class="{'border-b': myInstalledApps.length > index + 1}"
          @click="app.isSelected = !app.isSelected; saveChange()"
        >
          <template v-slot:append>
            <v-switch
              :model-value="app.isSelected"
              :hide-details="true"
              tabindex="-1"
              readonly
              density="compact"
            />
          </template>
        </v-list-item>
      </v-list>

    </config-card>

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

#appSearchField{
  font-size: 13px;
}
</style>
