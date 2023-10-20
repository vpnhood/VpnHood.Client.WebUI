<template>
  <!-- Minimize Premium Server ad -->
  <v-btn
      :flat="true"
      variant="outlined"
      color="sharp-master-green"
      rounded="pill"
      height="40"
      @click="$emit('update:modelValue',true); showByUser = true"
      class="ps-1 pe-3"
  >
    <v-img src="../assets/images/ad-icon-minimize.png" width="35px" alt="Premium Server Ad icon" class="me-2"/>
    {{$t("STORE_AD_TITLE")}}
  </v-btn>

  <!-- Maximize Premium Server Ad -->
  <v-dialog :modelValue="modelValue" @update:modelValue="$emit('update:modelValue',$event)" close-on-back :fullscreen="true">
    <v-card class="pa-8 justify-center align-center add-bg">

      <v-card-item id="adContentWrapper" class="rounded-lg pa-5 mb-8 text-center">

        <!-- Image -->
        <v-img src="../assets/images/ad-icon.png" max-width="400px" class="mx-auto"/>

        <!-- Title -->
        <h3 id="adTitle" class="title-bold color-sharp-master-green text-uppercase pb-2 mb-5 mt-5">
          {{$t("STORE_AD_TITLE")}}</h3>

        <!-- Description -->
        <p id="adDesc" class="regular-font text-white" v-html="$t('STORE_AD_DESCRIPTION')"></p>

      </v-card-item>

      <!-- Buttons -->
      <v-card-item class="pa-0 w-100">
        <!-- Go to VpnHood Store page on google play button -->
        <v-btn
            href="https://play.google.com/store/apps/details?id=com.vphood.store.android"
            :block="true"
            target="_blank"
            rounded="pill"
            height="45"
            variant="elevated"
            class="grad-btn mb-4 "
            :text="$t('GO_PREMIUM_ON_GOOGLE_PLAY')"
        >
        </v-btn>

        <!-- Continue with free slow speed button -->
        <v-btn
            v-if="!showByUser"
            :block="true"
            height="45"
            rounded="pill"
            variant="outlined"
            color="sky-blue"
            class="text-capitalize"
            @click="$vpnHoodApp.connect()"
        >
          {{$t('CONTINUE_WITH_FREE_SLOW_SPEED')}}
        </v-btn>

        <!-- Close button -->
        <v-btn
            v-else
            :block="true"
            height="45"
            rounded="pill"
            variant="outlined"
            color="sky-blue"
            @click="$emit('update:modelValue',false); showByUser = false">
          {{$t('CLOSE')}}
        </v-btn>
      </v-card-item>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: "PremiumServerAdDialog",
  data() {
    return {
      showByUser: false,
    }
  },
  props: {
    modelValue: Boolean,
  },
  emits: [
    "update:modelValue",
  ]
})
</script>

<style scoped>
#adTitle {
  font-size: 130%;
  border-bottom: 1px rgba(63, 246, 169, 0.15) solid;
}

#adDesc {
  font-size: 17px;
  line-height: 31px;
}

#adContentWrapper {
  border: 1px var(--sky-blue) solid;
  background-color: #06124BFF;
}

/*noinspection ALL*/
.v-card-item {
  max-width: 500px;
}

.add-bg{
  background-color: #06124bcf;
}
</style>