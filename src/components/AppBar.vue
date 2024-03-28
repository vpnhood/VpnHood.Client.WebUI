<template>
  <!-- Page header -->
  <v-app-bar
      :color="$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect ? 'background' : 'secondary'"
      :flat="$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect"
      density="compact"
  >

    <!-- Close button -->
    <v-app-bar-nav-icon icon="mdi-chevron-left" color="white" @click="$router.replace('/')"></v-app-bar-nav-icon>

    <!-- Page title -->
    <v-app-bar-title class="text-body-1 text-white">{{pageTitle}}</v-app-bar-title>

  </v-app-bar>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {AppName} from "@/UiConstants";

export default defineComponent({
  name: "AppBar",
  data() {
      return{
        AppName
      }
  },
  props: {
    pageTitle: String,
  }
})
</script>