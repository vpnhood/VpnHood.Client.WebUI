<template>
  <v-app-bar color="transparent" elevation="0">

    <!-- Navigation drawer button -->
    <v-app-bar-nav-icon @click="$emit('openNavigationDrawer')"></v-app-bar-nav-icon>

    <!-- App name -->
    <v-spacer></v-spacer>
    <h3>{{ $t("APP_NAME") }}</h3>
    <v-spacer></v-spacer>

    <!-- App mini version -->
    <span class="text-disabled text-caption me-4">v {{ $vpnHoodApp.getAppVersion(false) }}</span>

  </v-app-bar>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: "AppBar",
  emits: [
    "openNavigationDrawer",
  ],
})
</script>