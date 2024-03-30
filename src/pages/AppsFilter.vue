<template>

  <AppBar :page-title="$t('APP_FILTER')"/>

  <v-sheet :color="$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect ? 'primary-darken-2' : 'gray-lighten-3'">

    <!-- Disconnecting alert -->
    <v-alert class="mb-3 text-caption" density="compact" :icon="false" type="warning" :text="$t('APP_FILTER_DISCONNECTING_NOTE')"></v-alert>

    <!-- Exclude local network option -->
    <v-card :color="$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect ? 'background' : ''">
      <v-card-item>

        <!-- Which app can use vpn -->
        <v-select
            v-model="appFiltersMode"
            :items="getFilterModes()"
            item-title="text"
            :label="$t('APP_FILTER_DESC')"
            variant="outlined"
            class="my-5"
            color="secondary"
            hide-details
            :list-props="{class: $vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect ? 'bg-background':'white'}"
        ></v-select>

        <!-- Choose apps -->
        <v-autocomplete
            v-if="$vpnHoodApp.data.settings.userSettings.appFiltersMode !== FilterMode.All"
            :loading="isUpdating"
            v-model="appFilters"
            :items="installedApps"
            item-title="appName"
            item-value="appId"
            :label="$t('SELECTED_APPS')"
            variant="outlined"
            color="secondary"
            :chips="true"
            :closable-chips="true"
            :multiple="true"
            hide-details
            :list-props="{class: $vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect ? 'bg-background':'white'}"
        >
          <!-- Selected apps -->
          <template v-slot:chip="{props, item}">
            <v-chip
                v-bind="props"
                :text="item.raw.appName"
                :prepend-avatar="'data:image/png;base64, ' + item.raw.iconPng"
                variant="tonal"
                color="secondary"
            >
            </v-chip>
          </template>

          <!-- App list items -->
          <template v-slot:item="{props, item}">
            <v-list-item
                v-bind="props"
                :title="item.raw.appName"
                :prepend-avatar="'data:image/png;base64, ' + item.raw.iconPng"
                color="secondary"
                border
            >
            </v-list-item>
          </template>
        </v-autocomplete>
      </v-card-item>
    </v-card>
  </v-sheet>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {DeviceAppInfo, FilterMode} from "@/services/VpnHood.Client.Api";
import AppBar from "@/components/AppBar.vue";
import {AppName} from "@/UiConstants";

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
      isUpdating: true,
      installedApps: [] as DeviceAppInfo[],
      FilterMode,
      AppName
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
    appFiltersMode: {
      get() {
        return this.$vpnHoodApp.data.settings.userSettings.appFiltersMode;
      },
      async set(value: FilterMode) {
        this.$vpnHoodApp.data.settings.userSettings.appFiltersMode = value;
        await this.$vpnHoodApp.saveUserSetting();
        await this.$vpnHoodApp.disconnect();
      }
    },

    appFilters: {
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
      const deviceAppInfos = await this.$vpnHoodApp.getInstalledApps();
      return deviceAppInfos.sort((a, b) => a.appName.localeCompare(b.appName, undefined, {sensitivity: 'base'}));
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