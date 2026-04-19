<script setup lang="ts">
import { Util } from '@/helpers/Util';

const props = defineProps<{
  image: string,
  description?: string ,
}>();
</script>

<template>
  <v-img
    :src="Util.getAssetPath(props.image)"
    alt="Symbol image"
    width="100%"
    max-height="130px"
    class="mx-auto"
  />
  <p class="mt-2 mb-5 text-disabled text-caption px-3">{{ props.description }}</p>
</template>
