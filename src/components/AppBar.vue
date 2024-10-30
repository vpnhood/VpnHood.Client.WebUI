<template>
  <!-- Page header -->
  <v-app-bar
      :color="$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect ? 'background' : 'secondary'"
      :flat="$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect"
      density="compact"
      absolute
  >

    <!-- Back button -->
    <v-app-bar-nav-icon :icon="$vuetify.locale.isRtl? 'mdi-chevron-right' : 'mdi-chevron-left'" color="white" @click="$router.go(-1)"></v-app-bar-nav-icon>

    <!-- Page title -->
    <v-app-bar-title class="text-body-1 text-white ms-0">{{pageTitle}}</v-app-bar-title>

  </v-app-bar>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {AppName, UiConstants} from "@/UiConstants";

export default defineComponent({
  data() {
      return{
        AppName,
        UiConstants
      }
  },
  props: {
    pageTitle: String,
  }
})
</script>
