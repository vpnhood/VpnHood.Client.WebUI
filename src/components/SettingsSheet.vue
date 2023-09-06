<template>
  <v-bottom-sheet inset scrollable close-on-back v-model="isShow" max-width="600">

    <!-- List header -->
    <v-toolbar dark color="primary" elevation="3" style="z-index: 1" class="rounded-t-xl">
      <v-btn icon="mdi-close" size="small" @click="isShow = false"></v-btn>
      <v-toolbar-title :text="$t('SETTINGS')"></v-toolbar-title>
    </v-toolbar>

    <v-list lines="three" >
      <v-list-subheader>{{$t("GENERAL")}}</v-list-subheader>


      <v-list-item :value="excludeLocalNetwork">
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
  data(){
    return{
      isShow: false,
    }
  },
  computed: {
    excludeLocalNetwork:
    {
      get() {
        return this.$clientApp.settings.userSettings.excludeLocalNetwork;
      },
      set(value) {
        if (this.$clientApp.settings.userSettings.excludeLocalNetwork != value) {
          this.$clientApp.settings.userSettings.excludeLocalNetwork = value;
          //this.$clientApp.saveUserSettings();
          this.$clientApp.disconnect();
        }
      }
    },
  },
})
</script>