<template>

  <AppBar :page-title="$t('APP_FILTER')"/>

  <v-sheet :color="$vpnHoodApp.isConnectApp() ? 'primary-darken-2' : 'gray-lighten-6'">

    <!-- Disconnecting alert -->
    <v-alert class="mb-5 text-caption" density="compact" :icon="false" type="warning"
             :text="$t('APP_FILTER_DISCONNECTING_NOTE')"></v-alert>

    <v-btn
        prepend-icon="mdi-select-all"
        variant="tonal"
        rounded="pill"
        density="comfortable"
        class="text-caption me-3"
        :text="$t('SELECT_ALL')"
        @click="showDialog(ConfirmDialogAction.SelectAll, $t('SELECT_ALL_APPS_TITLE'), $t('ARE_YOU_SURE'))"
    />

    <v-btn
        prepend-icon="mdi-select-remove"
        variant="tonal"
        rounded="pill"
        density="comfortable"
        class="text-caption"
        :text="$t('CLEAR_ALL')"
        @click="showDialog(ConfirmDialogAction.ClearAll, $t('CLEAR_ALL_APPS_TITLE'), $t('ARE_YOU_SURE'))"
    />

    <!-- Filter apps option -->
    <v-card :color="$vpnHoodApp.isConnectApp() ? 'background' : ''" class="mt-3">

      <!-- Apps list -->
      <v-card-item class="px-0 pb-0">

        <!-- Loading list -->
        <v-progress-linear
            v-if="myInstalledApps.length < 1"
            color="secondary"
            indeterminate
        ></v-progress-linear>

        <!-- Apps list -->
        <v-list
            v-else
            id="appFilterList"
            select-strategy="classic"
            bg-color="transparent"
            class="py-0"
            selectable
        >
          <v-list-item
              v-for="app in myInstalledApps"
              :key="app.appId"
              :value="app.appId"
              :title="app.appName"
              ripple
              :prepend-avatar="'data:image/png;base64, ' + app.iconPng"
              :class="[
                $vpnHoodApp.isConnectApp()
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
                  hide-details
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

<script lang="ts">
import {defineComponent} from "vue";
import {FilterMode} from "@/services/VpnHood.Client.Api";
import AppBar from "@/components/AppBar.vue";
import {AppName, UiConstants} from "@/UiConstants";

//import {ref} from "firebase/storage";

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

export default defineComponent({
  name: 'AppsFilter',
  components: {AppBar},
  props: {
    modelValue: Boolean,
  },
  emits: [
    "update:modelValue",
  ],
  data() {
    return {
      myInstalledApps: [] as IMyInstalledApps[],
      ConfirmDialogAction,
      FilterMode,
      AppName,
    }
  },

  async created() {
    if (this.$vpnHoodApp.data.features.isExcludeAppsSupported || this.$vpnHoodApp.data.features.isIncludeAppsSupported) {
      let installedApps = await this.$vpnHoodApp.getInstalledApps();
      const filterMode = this.$vpnHoodApp.data.settings.userSettings.appFiltersMode;

      // Add isSelected to all apps item
      this.myInstalledApps = installedApps.map(app => {
        // noinspection OverlyComplexBooleanExpressionJS
        let myApp: IMyInstalledApps = {
          appId: app.appId,
          appName: app.appName,
          iconPng: app.iconPng,
          isSelected: (filterMode === FilterMode.All)
              || (filterMode === FilterMode.Include && this.$vpnHoodApp.data.settings.userSettings.appFilters.some(x => x === app.appId))
              || (filterMode === FilterMode.Exclude && this.$vpnHoodApp.data.settings.userSettings.appFilters.every(x => x !== app.appId))
        };
        return myApp;
      });

      const futureInstalledAppInfo: IMyInstalledApps = {
        appId: "$",
        appName: this.$t('ALL_FUTURE_APPS'),
        iconPng: this.$vpnHoodApp.isConnectApp() ? UiConstants.futureAppsIconConnect : UiConstants.futureAppsIconClient,
        isSelected: filterMode === FilterMode.All || filterMode === FilterMode.Exclude
      };
      this.myInstalledApps.push(futureInstalledAppInfo);
      this.sortApps(this.myInstalledApps);
    }
  },

  methods: {
    sortApps(installedApps: IMyInstalledApps[]) {
      const isFutureAppSelected = this.myInstalledApps.some(x => x.appId === "$" && x.isSelected);
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
    },

    selectAll() {
      this.myInstalledApps.forEach(app => {app.isSelected = true});
      this.sortApps(this.myInstalledApps);
      this.saveChange();
    },

    clearAll() {
      this.myInstalledApps.forEach(app => {app.isSelected = false});
      this.sortApps(this.myInstalledApps);
      this.saveChange();
    },

    // Called after change each selection
    async saveChange(){

      // All apps
      const isAllSelectedApp = this.myInstalledApps.every(x => x.isSelected);
      if (isAllSelectedApp) {
        this.$vpnHoodApp.data.settings.userSettings.appFiltersMode = FilterMode.All;
        this.$vpnHoodApp.data.settings.userSettings.appFilters = [];
        await this.$vpnHoodApp.saveUserSetting();
        return;
      }

      // All apps except selected
      const isFutureAppSelected = this.myInstalledApps.some(x => x.appId === "$" && x.isSelected);
      if (isFutureAppSelected) {
        this.$vpnHoodApp.data.settings.userSettings.appFiltersMode = FilterMode.Exclude;
        this.$vpnHoodApp.data.settings.userSettings.appFilters = this.myInstalledApps
            .filter(x => !x.isSelected && x.appId !== "$")
            .map(x => x.appId);
        await this.$vpnHoodApp.saveUserSetting();
        return;
      }

      // Only selected apps
      this.$vpnHoodApp.data.settings.userSettings.appFiltersMode = FilterMode.Include;
      this.$vpnHoodApp.data.settings.userSettings.appFilters = this.myInstalledApps
          .filter(x => x.isSelected && x.appId !== "$")
          .map(x => x.appId);
      await this.$vpnHoodApp.saveUserSetting();
    },

    async showDialog(confirmAction: ConfirmDialogAction, title: string, message: string) {
      let confirmResult = await this.$vpnHoodApp.data.confirmDialog.showDialog(title, message);
      if (confirmResult)
        confirmAction === ConfirmDialogAction.SelectAll ? this.selectAll() : this.clearAll();
    },

  }
})
</script>

<style>
/*noinspection CssUnusedSymbol*/
#appFilterList .v-avatar.v-avatar--density-default {
  width: 30px;
  height: 30px;
}

/*noinspection CssUnusedSymbol*/
#appFilterList .v-list-item__overlay{
  opacity: 0;
}
</style>