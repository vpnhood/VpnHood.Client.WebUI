<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount } from 'vue'
import router from '@/services/router';
import LoadingDialog from '@/components/LoadingDialog.vue';

const videoElement = ref<HTMLVideoElement | null>(null);
const videoUrl = ref<string | undefined>('');
const isLoading = ref<boolean>(true);
const isVideoEnded = ref<boolean>(false);

// Video loaded
function handleVideoLoaded() {
  isLoading.value = false;
}

// Video ended
async function handleVideoEnded() {
  isVideoEnded.value = true;
}

onMounted(() => {
  if (videoElement.value) {
    videoElement.value.addEventListener('loadeddata', handleVideoLoaded);
    videoElement.value.addEventListener('ended', handleVideoEnded);
  }
})
onBeforeUnmount(() => {
  if (videoElement.value) {
    videoElement.value.removeEventListener('loadeddata', handleVideoLoaded)
    videoElement.value.removeEventListener('ended', handleVideoEnded);
  }
})
</script>

<template>
  <v-sheet style="padding: 0 !important;">
    <LoadingDialog v-if="isLoading" v-model="isLoading"/>
    <video v-show="!isLoading && !isVideoEnded"
           ref="videoElement"
           width="100%"
           height="100%"
           autoplay
    >
      <source :src="videoUrl" type="video/mp4" />
      Your browser does not support the video tag.
    </video>

    <v-bottom-sheet
      v-model="isVideoEnded"
      persistent
      fullscreen
      :scrim="false"
    >
      <!-- Back button -->
      <tonal-icon-btn
        icon="mdi-close"
        class="ms-3 mt-3"
        @click="router.replace({ name: 'HOME' })"
      />
      <h2 class="text-center">Test</h2>
    </v-bottom-sheet>
  </v-sheet>
</template>

<style scoped>
/* Optional styling */
</style>
