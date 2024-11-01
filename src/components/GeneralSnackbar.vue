<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean,
  message: string,
}>();
</script>

<template>
  <v-snackbar
    :modelValue="props.modelValue" @update:modelValue="$emit('update:modelValue',$event)"
    location="top"
    :timeout="3000"
    color="secondary"
  >
    {{props.message}}
  </v-snackbar>
</template>

<style scoped>

</style>
