<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount } from 'vue'
import router from '@/services/router'
import LoadingDialog from '@/components/LoadingDialog.vue'
import i18n from '@/locales/i18n'
import { VpnHoodApp } from '@/services/VpnHoodApp';
import { onBeforeRouteLeave } from 'vue-router';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const videoElement = ref<HTMLVideoElement | null>(null);
const isLoading = ref<boolean>(false);
const isVideoPlayed = ref<boolean>(false);
const isVideoEnded = ref<boolean>(false);
const remainingTimeSecond = ref<number>(0);
const allowLeave = ref(false);

function getVideo() {
  return videoElement.value;
}

function onVideoLoaded() {
  const video = getVideo();
  if (!video) return;
  remainingTimeSecond.value = Math.floor(video.duration);
  isLoading.value = false;
}

function onVideoFailed(){
  internalAdDismissed(false, true);
}

function onVideoEnded() {
  isVideoEnded.value = true;
}

function onVideoPlaying() {
  isVideoPlayed.value = true;
}

function updateRemainingTime() {
  const video = getVideo();
  if (!video) return;
  const duration = video.duration;
  const currentTime = video.currentTime;
  remainingTimeSecond.value = Math.max(0, Math.ceil(duration - currentTime));
}

function handleVisibilityChange() {
  const video = getVideo();
  if (!video) return;

  if (document.hidden && !video.paused) {
    video.pause();
  } else if (!document.hidden && video.paused && !isVideoEnded.value) {
    video.play();
  }
}

async function internalAdDismissed(learnMore: boolean, videoFailed: boolean = false) {

  // If the video is still playing and debug mode is not enabled, don't allow navigation
  if (remainingTimeSecond.value > 0 && !vhApp.data.features.isDebugMode)
    return;

  allowLeave.value = true;
  await router.replace({ name: learnMore ? 'PURCHASE_SUBSCRIPTION' : 'HOME' });

  let dismissReason = 'ok';
  if (videoFailed)
    dismissReason = 'videoFailed';
  else if (learnMore)
    dismissReason = 'learnMore';

  await vhApp.apiClient.dismissInternalAd(dismissReason);
}

onBeforeRouteLeave((to, from, next) => {
  if (allowLeave.value) {
    next(); // allow navigation
  } else {
    next(false); // block back button
  }
});

onMounted(() => {
  const video = getVideo();
  if (video) {
    video.addEventListener('error', onVideoFailed);
    video.addEventListener('loadeddata', onVideoLoaded);
    video.addEventListener('ended', onVideoEnded);
    video.addEventListener('timeupdate', updateRemainingTime);
    video.addEventListener('playing', onVideoPlaying, { once: true });
  }

  document.addEventListener('visibilitychange', handleVisibilityChange);
});

onBeforeUnmount(() => {
  const video = getVideo();
  if (video) {
    video.removeEventListener('loadeddata', onVideoLoaded);
    video.removeEventListener('ended', onVideoEnded);
    video.removeEventListener('timeupdate', updateRemainingTime);
    video.removeEventListener('playing', onVideoPlaying);
    video.removeEventListener('error', onVideoFailed);
  }

  document.removeEventListener('visibilitychange', handleVisibilityChange);
});
</script>

<template>
  <v-sheet color="#0b0923">

    <LoadingDialog v-if="isLoading" v-model="isLoading" />

    <!-- Video -->
    <div v-show="!isLoading" class="d-flex flex-column justify-space-between fill-height py-8">

      <v-btn
        :icon="remainingTimeSecond <=0 ? 'mdi-close' : ''"
        :text="remainingTimeSecond > 0 ? remainingTimeSecond : ''"
        variant="tonal"
        color="white"
        class="ms-auto text-caption"
        density="compact"
        @click="internalAdDismissed(false)"
      />

      <video v-show="isVideoPlayed"
        ref="videoElement"
        width="100%"
        autoplay
        preload="auto"
        playsinline
      >
        <source :src="vhApp.getAssetPath('internal-ad.mp4')" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <!-- Buttons -->
      <v-row align="center" class="flex-grow-0" :class="{'opacity-50': remainingTimeSecond > 0}">

        <!-- Close button -->
        <v-col cols="6">
          <btn-style-2
            :text="locale('CLOSE')"
            block
            :disabled="remainingTimeSecond > 0"
            @click="internalAdDismissed(false)"
          >
          </btn-style-2>
        </v-col>

        <!-- Learn more button -->
        <v-col cols="6">
          <btn-style-1
            :text="locale('LEARN_MORE')"
            tabindex="0"
            :disabled="remainingTimeSecond > 0"
            block
            @click="internalAdDismissed(true)"
          />
        </v-col>

      </v-row>
    </div>
  </v-sheet>
</template>
