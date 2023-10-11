<template>
  <v-bottom-sheet :modelValue="modelValue" @update:modelValue="$emit('update:modelValue',$event)" inset fullscreen
                  scrollable close-on-back>
    <v-toolbar theme="light" elevation="3" style="z-index: 1;" density="compact">
      <v-btn icon="mdi-close" size="small" color="var(--muted-color)" @click="$emit('update:modelValue',false)"></v-btn>
      <v-toolbar-title :text="$t('APP_FILTER')"></v-toolbar-title>
    </v-toolbar>

    <v-card>
      <v-card-item>

        <!-- Disconnecting alert -->
        <v-alert
            color="light-purple"
            :text="$t('APP_FILTER_DISCONNECTING_NOTE')"
        ></v-alert>

        <!-- Filter mode items -->
        <v-select
            v-model="appFiltersMode"
            :items="getFilterModes()"
            item-title="text"
            :label="$t('APP_FILTER_DESC')"
            variant="outlined"
            class="mt-5"
            color="primary"
        ></v-select>

        <!-- autocomplete -->
        <v-autocomplete
            v-if="$vpnHoodApp.data.settings.userSettings.appFiltersMode !== FilterMode.All"
            :loading="isUpdating"
            v-model="appFilters"
            :items="installedApps"
            item-title="appName"
            item-value="appId"
            :label="$t('SELECTED_APPS')"
            variant="outlined"
            color="primary"
            class="test"
            chips
            closable-chips
            multiple
        >
          <!-- Selected items chip -->
          <template v-slot:chip="{props, item}">
            <v-chip
                v-bind="props"
                :text="item.raw.appName"
                :prepend-avatar="'data:image/png;base64, ' + item.raw.iconPng"
                variant="tonal"
                color="primary"
            >
            </v-chip>
          </template>

          <!-- List items -->
          <template v-slot:item="{props, item}">
            <v-list-item
                v-bind="props"
                :title="item.raw.appName"
                :prepend-avatar="'data:image/png;base64, ' + item.raw.iconPng"
                color="primary"
                border
            >
            </v-list-item>
          </template>

        </v-autocomplete>
      </v-card-item>
    </v-card>
  </v-bottom-sheet>
</template>


<script lang="ts">
import {defineComponent} from "vue";
import {DeviceAppInfo, FilterMode} from "@/services/VpnHood.Client.Api";

export default defineComponent({
  name: 'AppFilterSheet',
  props: {
    modelValue: Boolean,
  },
  emits: [
    "update:modelValue",
  ],
  data() {
    return {
      isUpdating: true,
      installedApps: [] as DeviceAppInfo[],
      FilterMode
    }
  },
  async created() {
    if (this.$vpnHoodApp.data.features.isExcludeAppsSupported || this.$vpnHoodApp.data.features.isIncludeAppsSupported) {
      this.isUpdating = true;
      this.installedApps = await this.getInstalledApp();
      this.isUpdating = false;
    }
  },
  computed: {
    appFiltersMode:
        {
          get() {
            return this.$vpnHoodApp.data.settings.userSettings.appFiltersMode;
          },
          async set(value: FilterMode) {
            this.$vpnHoodApp.data.settings.userSettings.appFiltersMode = value;
            await this.$vpnHoodApp.saveUserSetting();
            await this.$vpnHoodApp.disconnect();
          }
        },

    appFilters:
        {
          get() {
            return this.$vpnHoodApp.data.settings.userSettings.appFilters;
          },
          async set(value: string[] | null) {
            this.$vpnHoodApp.data.settings.userSettings.appFilters = value;
            await this.$vpnHoodApp.saveUserSetting();
            await this.$vpnHoodApp.disconnect();
          }
        },
  },
  methods: {
    async getInstalledApp(): Promise<DeviceAppInfo[]> {
      const AppsList = await this.$vpnHoodApp.getInstalledApps();
      return AppsList.sort((a, b) => a.appName.localeCompare(b.appName, undefined, {sensitivity: 'base'}));
    },

    getFilterModes(): any[] {
      // Set filter apps
      let filterModes = [{
        text: this.$t('APP_FILTER_ALL'),
        value: FilterMode.All,
      }];

      if (this.$vpnHoodApp.data.features.isExcludeAppsSupported)
        filterModes.push({
          text: this.$t('APP_FILTER_EXCLUDE'),
          value: FilterMode.Exclude,
        });

      if (this.$vpnHoodApp.data.features.isIncludeAppsSupported)
        filterModes.push({
          text: this.$t('APP_FILTER_INCLUDE'),
          value: FilterMode.Include,
        });

      return filterModes;
    },
  }
})
</script>
