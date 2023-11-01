<template>
  <v-sheet>

    <!-- Disconnecting alert -->
    <v-alert class="mb-3" type="warning" :text="$t('APP_FILTER_DISCONNECTING_NOTE')"></v-alert>

    <!-- Exclude local network option -->
    <v-card>
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

export default defineComponent({
  name: "SettingsPage",
  computed: {
    excludeLocalNetwork:
        {
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

<style scoped>

</style>