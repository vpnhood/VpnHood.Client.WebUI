<script setup lang="ts">
import FilterIp from '@/components/FilterIp.vue';
import { IPFilterType } from '@/helpers/UiConstants';
import AppBar from '@/components/AppBar.vue';
</script>

<template>
  <v-sheet>
    <app-bar/>
    <filter-ip :ip-filter-type="IPFilterType.FilterByApp" />
  </v-sheet>
</template>
