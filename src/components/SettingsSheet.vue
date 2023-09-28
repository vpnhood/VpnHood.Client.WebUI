<template>
  <v-bottom-sheet inset fullscreen scrollable close-on-back :modelValue="modelValue"
                  @update:modelValue="$emit('update:modelValue',$event)" max-width="600">
    <v-toolbar theme="light" elevation="3" style="z-index: 1" density="compact">
      <v-btn icon="mdi-close" size="small" color="var(--muted-color)" @click="$emit('update:modelValue',false)"></v-btn>
      <v-toolbar-title :text="$t('SETTINGS')"></v-toolbar-title>
    </v-toolbar>

    <v-card>
      <v-card-item>
        <!-- Disconnecting alert -->
        <v-alert
            color="light-purple"
            :text="$t('APP_FILTER_DISCONNECTING_NOTE')"
        ></v-alert>

        <v-checkbox
            v-model="excludeLocalNetwork"
            color="primary"
            class="mb-4"
            :label="$t('EXCLUDE_LOCAL_NETWORK')"
            :messages="$t('EXCLUDE_LOCAL_NETWORK_DESC')"
        >

        </v-checkbox>
        <v-divider></v-divider>
        <!-- Exclude local network option -->

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
            return this.$vpnHoodApp.settings.userSettings.excludeLocalNetwork;
          },
          set(value: boolean) {
            if (this.$vpnHoodApp.settings.userSettings.excludeLocalNetwork !== value) {
              this.$vpnHoodApp.settings.userSettings.excludeLocalNetwork = value;
              this.$vpnHoodApp.saveUserSetting();
              this.$vpnHoodApp.disconnect();
            }
          }
        },
  },
})
</script>