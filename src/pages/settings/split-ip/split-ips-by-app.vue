<script setup lang="ts">
import SplitIpInput from '@/components/SplitIpInput.vue';
import { IPFilterType } from '@/helpers/UiConstants';
import AppBar from '@/components/AppBar.vue';
</script>

<template>
  <v-sheet>
    <app-bar/>
    <split-ip-input :ip-filter-type="IPFilterType.FilterByApp" />
  </v-sheet>
</template>
