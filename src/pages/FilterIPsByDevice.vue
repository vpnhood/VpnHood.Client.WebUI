<script setup lang="ts">
import FilterIp from '@/components/FilterIp.vue';
import { IPFilterType } from '@/helpers/UiConstants';
</script>

<template>
  <filter-ip :ip-filter-type="IPFilterType.FilterByDevice" />
</template>
