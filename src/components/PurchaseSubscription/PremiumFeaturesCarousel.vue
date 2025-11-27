<script setup lang="ts">
import { Util } from '@/helpers/Util';
import i18n from '@/locales/i18n';
import { onBeforeMount } from 'vue';

const locale = i18n.global.t;
interface CarouselItem {
  image: string,
  title: string,
  description: string,
  height: string,
}
const carouselItems: CarouselItem[] = [
  {
    image: "ultra-fast-server.webp",
    title: "ULTRA_FAST_SPEED",
    description: "ULTRA_FAST_SPEED_DESC",
    height: "200px",
  },
  {
    image: "no-ads.webp",
    title: "REMOVE_AD",
    description: "REMOVE_AD_DESC",
    height: "200px",
  },
  {
    image: "more-location.webp",
    title: "MORE_LOCATIONS",
    description: "MORE_LOCATIONS_DESC",
    height: "200px",
  },
  {
    image: "split-ip.webp",
    title: "SPLIT_IP_ADDRESSES",
    description: "SPLIT_IP_ADDRESSES_PREMIUM_DESC",
    height: "200px",
  },
  {
    image: "private-dns.webp",
    title: "PRIVATE_AND_CUSTOM_DNS",
    description: "PRIVATE_AND_CUSTOM_DNS_DESC",
    height: "200px",
  },
  {
    image: "quick-launch.webp",
    title: "QUICK_LAUNCH",
    description: "QUICK_LAUNCH_DESC",
    height: "200px",
  },
  {
    image: "always-on.webp",
    title: "ALWAYS_ON",
    description: "ALWAYS_ON_PREMIUM_DESC",
    height: "200px",
  },
  {
    image: "support.webp",
    title: "24_7_SUPPORT",
    description: "24_7_SUPPORT_DESC",
    height: "200px",
  },
]

// preload the rocket images
onBeforeMount(() => {
  ["rocket-bg.webp", "rocket-smoke.webp", "rocket.webp"]
    .map(Util.getAssetPath)
    .forEach(src => new Image().src = src);
})
</script>

<template>
  <v-carousel
    id="featuresCarousel"
    show-arrows
    delimiter-icon="mdi-circle"
    color="highlight"
    height="380"
    hide-delimiter-background
    class="text-white text-center"
  >
    <!-- Carousel arrows -->
    <template v-slot:prev="{ props }">
      <v-btn color="highlight" :icon="Util.getLocalizedLeftChevron()" size="40" variant="text" @click="props.onClick" />
    </template>
    <template v-slot:next="{ props }">
      <v-btn color="highlight" :icon="Util.getLocalizedRightChevron()" size="40" variant="text"
             @click="props.onClick" />
    </template>

    <!-- Carousel items -->
    <v-carousel-item v-for="item in carouselItems" :key="item.title" eager>
      <template v-slot:default>

        <div v-if="item.title === 'ULTRA_FAST_SPEED'" id="rocketWrapper" class="mx-auto mb-4">
          <div id="rocket" class="animation-translate-y mx-auto" />
          <div id="rocketSmoke" class="mx-auto" />
        </div>

        <v-img
          v-else
          eager
          :src="Util.getAssetPath(item.image)"
          alt="Symbol image"
          width="100%"
          :height="item.height"
          class="mx-auto mb-5"
        />
        <h3 class="mb-2">{{locale(item.title)}}</h3>
        <p class="text-subtitle-2 text-medium-emphasis px-3">{{locale(item.description)}}</p>
      </template>
    </v-carousel-item>
  </v-carousel>
</template>

<style scoped>
#rocketWrapper {
  position: relative;
  background: url('@/assets/images/rocket-bg.webp') no-repeat top center;
  background-size: contain;
  width: 100%;
  height: 55%;
  min-height: 150px;
  max-height: 335px;
}

#rocket, #rocketSmoke {
  position: absolute;
  left: 0;
  right: 0;
}

#rocket {
  background: url('@/assets/images/rocket.webp') no-repeat top center;
  background-size: contain;
  width: 100%;
  height: 56%;
  bottom: 35%;
  z-index: 1;
}

#rocketSmoke {
  background: url('@/assets/images/rocket-smoke.webp') no-repeat top center;
  background-size: contain;
  width: 42%;
  height: 35%;
  bottom: 16%;
  z-index: 2;
}
</style>

<!--suppress CssUnusedSymbol -->
<style>
#featuresCarousel .v-carousel__controls .v-btn--icon .v-icon{
  --v-icon-size-multiplier:.8;
}
#featuresCarousel .v-carousel__controls__item{
  margin: 0 3px;
}
#featuresCarousel .v-btn--icon.v-btn--density-default {
  width: calc(var(--v-btn-height) + 6px);
  height: calc(var(--v-btn-height) + 6px);
}
</style>
