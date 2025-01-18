<script setup lang="ts">
import router from '@/services/router';
import { Util } from '@/helpers/Util';

const props = defineProps<{
  pageTitle: string,
}>();
</script>

<template>
  <!-- Page header -->
  <v-app-bar
    flat
    absolute
    color="background"
    density="compact"
  >

    <!-- Back button -->
    <v-app-bar-nav-icon :icon="Util.getLocalizedLeftChevron()" @click="router.go(-1)" />

    <!-- Page title -->
    <v-app-bar-title class="text-body-1 ms-0">{{props.pageTitle}}</v-app-bar-title>

  </v-app-bar>
</template>
