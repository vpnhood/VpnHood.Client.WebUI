<script setup lang="ts">
const props = defineProps< {
  title: string,
}>();
</script>

<template>
  <div class="settings-section-title d-flex align-center mb-3">
    <span class="flex-shrink-0 me-2 text-caption text-disabled">{{props.title}}</span>
    <v-divider color="disabled" opacity=".2" class="flex-grow-1"></v-divider>
  </div>
</template>

<style>
/*noinspection CssUnusedSymbol*/
.v-card + .settings-section-title{
  margin-top: 30px;
}
</style>
