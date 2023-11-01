<template>
  <v-app-bar
      color="secondary"
      density="compact"
      elevation="3"
  >
    <!-- Close button -->
    <v-app-bar-nav-icon icon="mdi-close" color="white" @click="$router.go(-1)"></v-app-bar-nav-icon>

    <!-- Page title -->
    <v-app-bar-title class="text-body-1 text-white">{{$route.name}}</v-app-bar-title>

  </v-app-bar>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: "PageTitleBar",
})
</script>