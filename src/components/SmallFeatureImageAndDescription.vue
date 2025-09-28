<script setup lang="ts">
import { Util } from '@/helpers/Util';
import i18n from '@/locales/i18n';

const locale = i18n.global.t;

const props = defineProps<{
  image: string,
  description: string,
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
  <p class="mt-2 mb-5 pb-4 border-b text-center text-disabled text-caption px-3">{{locale(props.description)}}</p>
</template>
