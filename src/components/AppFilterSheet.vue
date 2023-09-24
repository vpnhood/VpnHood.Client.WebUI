<template>
  <v-bottom-sheet :modelValue="modelValue" @update:modelValue="$emit('update:modelValue',$event)" inset fullscreen scrollable close-on-back max-width="600">
    <v-toolbar theme="light" elevation="3" style="z-index: 1" >
      <v-btn icon="mdi-close" size="small" color="var(--muted-color)"  @click="this.$emit('update:modelValue',false)"></v-btn>
      <v-toolbar-title :text="$t('APP_FILTER')"></v-toolbar-title>
    </v-toolbar>

    <v-card>
      <v-card-item>
        <!-- Filter mode items -->
        <v-select
            v-model="appFiltersMode"
            :items="getFilterModes()"
            item-title="text"
            :label="$t('APP_FILTER_DESC')"
            variant="outlined"
            class="mt-5"
        ></v-select>

        <!-- autocomplete -->
        <v-autocomplete
            v-if="$vpnHoodApp.settings.userSettings.appFiltersMode !== 'All'"
            :loading="isUpdating"
            v-model="appFilters"
            :items="installedApps"
            item-text="appName"
            item-value="appId"
            :label="$t('SELECTED_APPS')"
            variant="outlined"
            color="blue-grey lighten-2"
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
                :title="item?.raw?.appName"
                :prepend-avatar="'data:image/png;base64, ' + item.raw.iconPng"
                color="sky-blue"

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
import {DeviceAppInfo, FilterMode} from "@/hood/VpnHood.Client.Api";

export default defineComponent({
  name: 'AppFilterSheet',
  props:{
    modelValue:Boolean,
  },
  emits: [
    "update:modelValue",
  ],
  data() {
    return {
      isUpdating: true,
      installedApps: [] as DeviceAppInfo[],
    }
  },
  async created() {
    this.isUpdating = true;
    await this.getInstalledApp();
    this.isUpdating = false;
  },
  computed: {
    appFiltersMode:
        {
          get() {
            return this.$vpnHoodApp.settings.userSettings.appFiltersMode;
          },
          set(value: FilterMode) {
            this.$vpnHoodApp.settings.userSettings.appFiltersMode = value;
            this.$vpnHoodApp.saveUserSetting();
          }
        },

    appFilters:
        {
          get() {
            return this.$vpnHoodApp.settings.userSettings.appFilters;
          },
          set(value: string[] | null) {
            this.$vpnHoodApp.settings.userSettings.appFilters = value;
            this.$vpnHoodApp.saveUserSetting();
          }
        },
  },
  methods: {
    async getInstalledApp():Promise<void>{
      const AppsList =  await this.$vpnHoodApp.getInstalledApps();
      const sortedApps = AppsList.sort((a, b) => a.appName.localeCompare(b.appName, undefined, { sensitivity: 'base' }));
      this.installedApps = sortedApps;
    },

    getFilterModes() {
      // Set filter apps
      let filterModes = [{
        text: this.$t('APP_FILTER_ALL'),
        value: 'All',
      }];

      //if (this.$vpnHoodApp.features.isExcludeAppsSupported)
        filterModes.push({
          text: this.$t('APP_FILTER_EXCLUDE'),
          value: 'Exclude',
        });

      //if (this.$vpnHoodApp.features.isIncludeAppsSupported)
        filterModes.push({
          text: this.$t('APP_FILTER_INCLUDE'),
          value: 'Include',
        });

      return filterModes;
    },

    async configChanged() {
      if (this.$vpnHoodApp.state.connectionState !== 'None')
        await this.$vpnHoodApp.disconnect();

      await this.$vpnHoodApp.saveUserSetting();
    }
  }
})
</script>
