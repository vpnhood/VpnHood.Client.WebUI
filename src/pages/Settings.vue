<template>

  <!-- Page header -->
  <AppBar :page-title="$t('SETTINGS')"/>

  <v-sheet class="pa-4"
           :color="$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect ? 'primary-darken-2' : 'gray-lighten-3'">

    <!-- Disconnecting alert -->
    <v-alert class="mb-3" type="warning" :text="$t('APP_FILTER_DISCONNECTING_NOTE')"></v-alert>

    <!-- Exclude local network option -->
    <v-card :color="$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect ? 'background' : 'white'">
      <v-card-item>
        <v-checkbox
            v-model="excludeLocalNetwork"
            color="secondary"
            class="mb-4"
            :label="$t('EXCLUDE_LOCAL_NETWORK')"
            :messages="$t('EXCLUDE_LOCAL_NETWORK_DESC')"
        >
        </v-checkbox>
      </v-card-item>
    </v-card>

  </v-sheet>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import AppBar from "@/components/AppBar.vue";
import {AppName} from "@/UiConstants";

export default defineComponent({
  name: "SettingsPage",
  components: {AppBar},
  data() {
    return {
      AppName
    }
  },
  computed: {
    excludeLocalNetwork: {
      get() {
        return this.$vpnHoodApp.data.settings.userSettings.excludeLocalNetwork;
      },
      async set(value: boolean) {
        if (this.$vpnHoodApp.data.settings.userSettings.excludeLocalNetwork !== value) {
          this.$vpnHoodApp.data.settings.userSettings.excludeLocalNetwork = value;
          await this.$vpnHoodApp.saveUserSetting();
          this.$vpnHoodApp.disconnect();
        }
      }
    },
  },
})
</script>