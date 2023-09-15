<template>
  <v-bottom-sheet inset scrollable close-on-back v-model="isShow" max-width="600">
    <v-toolbar theme="light" elevation="3" style="z-index: 1" class="rounded-t-xl">
      <v-btn icon="mdi-close" size="small" color="var(--muted-color)"  @click="isShow = false"></v-btn>
      <v-toolbar-title :text="$t('APP_FILTER')" class="pl-0"></v-toolbar-title>
    </v-toolbar>

    <v-card rounded>
      <v-card-text>
        <v-select
          class="ma-4"
          v-model="$vpnHoodApp.settings.userSettings.appFiltersMode"
          :items="getFilterModes()"
          :label="$t('APP_FILTER_DESC')"
          @change="configChanged()"
        ></v-select>

        <!-- autocomplete -->
        <v-autocomplete
          :loading="appsLoaded"
          v-if="$vpnHoodApp.settings.userSettings.appFiltersMode !== 'All'"
          v-model="$vpnHoodApp.settings.userSettings.appFilters"
          :items="$vpnHoodApp.getInstalledApps ? $vpnHoodApp.getInstalledApps : []"
          filled
          chips
          color="blue-grey lighten-2"
          :label="$t('SELECTED_APPS')"
          item-text="appName"
          item-value="appId"
          multiple
          @change="configChanged()"
        >
          <template v-slot:selection="data">
            <v-chip
              v-bind="data.attrs"
              :input-value="data.selected"
              close
              @click="data.select"
              @click:close="updateItem(data.item.appId, false)"
            >
              <v-avatar left>
                <v-img
                  :src="'data:image/png;base64, ' + data.item.iconPng"
                ></v-img>
              </v-avatar>
              {{ data.item.appName }}
            </v-chip>
          </template>
          <template v-slot:item="data">
            <template>
              <v-list-item-avatar>
                <img :src="'data:image/png;base64, ' + data.item.iconPng" />
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title
                  v-html="data.item.appName"
                ></v-list-item-title>
                <v-list-item-subtitle></v-list-item-subtitle>
              </v-list-item-content>
            </template>
          </template>
        </v-autocomplete>
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>


<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: 'AppFilter',
  components: {
  },
  created() {
    this.refresh();
  },
  data() {
    return {
      isShow: false,
      appsLoaded: true,
      search: ""
    }
  },

  methods: {
    async refresh() {
      this.appsLoaded = true;
      this.$vpnHoodApp.getInstalledApps();
      this.appsLoaded = false;
    },

    getFilterModes() {
      // set filter apps
      let filterModes = [{
        text: this.$t('APP_FILTER_ALL'),
        value: 'All',
      }];

      if (this.$vpnHoodApp.features.isExcludeAppsSupported)
        filterModes.push({
          text: this.$t('APP_FILTER_EXCLUDE'),
          value: 'Exclude',
        });

      if (this.$vpnHoodApp.features.isIncludeAppsSupported)
        filterModes.push({
          text: this.$t('APP_FILTER_INCLUDE'),
          value: 'Include',
        });

      return filterModes;
    },

    async updateItem(appId: string, isChecked: boolean): Promise<void> {
      if (this.$vpnHoodApp.settings.userSettings.appFilters){
        this.$vpnHoodApp.settings.userSettings.appFilters = this.$vpnHoodApp.settings.userSettings.appFilters.filter(x => x != appId);

        if (isChecked)
          this.$vpnHoodApp.settings.userSettings.appFilters.push(appId);

        await this.configChanged();
      }
    },

    async configChanged() {
      if (this.$vpnHoodApp.state.connectionState !== 'None')
        await this.$vpnHoodApp.disconnect();

      await this.$vpnHoodApp.saveUserSetting();
    }
  }
})
</script>
