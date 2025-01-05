<script setup lang="ts">
import i18n from '@/locales/i18n';
import AppBar from '@/components/AppBar.vue';
import FilterIp from '@/components/FilterIp.vue';
import { IPFilterType } from '@/helpers/UiConstants';
</script>

<template>
  <!-- Page header -->
  <AppBar :page-title="i18n.global.t('FILTER_IPS_BY_DEVICE')" />

  <filter-ip :ip-filter-type="IPFilterType.FilterByDevice" />
</template>
