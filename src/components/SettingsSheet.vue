<template>
  <v-bottom-sheet inset scrollable close-on-back :modelValue="modelValue" @update:modelValue="$emit('update:modelValue',$event)" max-width="600">

    <!-- List header -->
    <v-toolbar dark color="primary" elevation="3" style="z-index: 1" class="rounded-t-xl">
      <v-btn icon="mdi-close" size="small" @click="$emit('update:modelValue',false)"></v-btn>
      <v-toolbar-title :text="$t('SETTINGS')"></v-toolbar-title>
    </v-toolbar>

    <v-list lines="three" >
    <!-- TODO Exclude local network does not work -->
      <v-list-item :value="excludeLocalNetwork">

        <!-- Bind checkbox to list item -->
        <template v-slot:prepend="{ isActive }">
          <v-list-item-action start>
            <v-checkbox-btn :model-value="isActive"></v-checkbox-btn>
          </v-list-item-action>
        </template>

        <v-list-item-title>{{$t("EXCLUDE_LOCAL_NETWORK")}}</v-list-item-title>
        <v-list-item-subtitle>{{$t("EXCLUDE_LOCAL_NETWORK_DESC")}}</v-list-item-subtitle>
      </v-list-item>
    </v-list>

  </v-bottom-sheet>
</template>

<script lang="ts">
import {defineComponent} from "vue";
export default defineComponent({
  name: 'SettingSheet',
  props:{
    modelValue:Boolean,
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
        if (this.$vpnHoodApp.settings.userSettings.excludeLocalNetwork != value) {
          this.$vpnHoodApp.settings.userSettings.excludeLocalNetwork = value;
          this.$vpnHoodApp.saveUserSetting();
          this.$vpnHoodApp.disconnect();
        }
      }
    },
  },
})
</script>