<template>
  <v-bottom-sheet :inset="true" :fullscreen="true" :scrollable="true" :modelValue="modelValue"
                  @update:modelValue="$emit('update:modelValue',$event)">

    <!-- Page header -->
    <v-toolbar color="secondary" elevation="3" style="z-index: 1;" density="compact">

      <!-- Close button -->
      <v-btn icon="mdi-close" size="small" @click="$emit('update:modelValue',false)"></v-btn>

      <!-- Page title -->
      <v-toolbar-title class="text-body-1" :text="$t('SETTINGS')"></v-toolbar-title>
    </v-toolbar>

    <v-card>
      <v-card-item>
        <!-- Disconnecting alert -->
        <v-alert type="warning" :text="$t('APP_FILTER_DISCONNECTING_NOTE')"></v-alert>

        <!-- Exclude local network option -->
        <v-checkbox
            v-model="excludeLocalNetwork"
            color="secondary"
            class="mb-4"
            :label="$t('EXCLUDE_LOCAL_NETWORK')"
            :messages="$t('EXCLUDE_LOCAL_NETWORK_DESC')"
        >
        </v-checkbox>
        <v-divider></v-divider>
      </v-card-item>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: 'SettingSheet',
  props: {
    modelValue: Boolean,
  },
  emits: [
    "update:modelValue",
  ],
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