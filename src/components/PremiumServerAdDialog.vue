<template>
  <!-- Minimize Premium Server ad -->
  <v-btn
      :flat="true"
      variant="outlined"
      color="sharp-master-green"
      rounded="pill"
      size="small"
      height="40"
      @click="showProducts"
      class="ps-1 pe-3"
  >
    <v-img src="../assets/images/ad-icon-minimize.png" width="35px" alt="Premium Server Ad icon" class="me-2"/>
    {{$t("PREMIUM_SERVER_AD_TITLE")}}
  </v-btn>

  <!-- Maximize Premium Server Ad -->
  <v-dialog
      id="premiumServerAd"
      transition="dialog-bottom-transition"
      :modelValue="modelValue"
      @update:modelValue="$emit('update:modelValue',$event)"
      :fullscreen="true"
  >
      <v-card color="#06124bd4" :flat="true" class="px-8 justify-center align-center">
        <!-- Close button -->
        <v-btn icon="mdi-window-close" variant="tonal" color="white" size="small" class="mx-auto mb-5" @click="$emit('update:modelValue',false)"/>

        <v-card-item id="adContentWrapper" class="rounded-xl pa-8 mb-5">
          <!-- Image -->
          <v-img :eager="true" src="../assets/images/ad-icon.png" max-width="250px" class="mx-auto"/>

          <!-- Title -->
          <h3 id="adTitle" class="title-bold color-sharp-master-green text-uppercase text-center pb-4 mb-4">
            {{$t("PREMIUM_SERVER_AD_TITLE")}}</h3>

          <!-- Description -->
          <ul id="adDesc" class="text-white text-body-2">
            <li><v-icon class="me-3" icon="mdi-check-decagram-outline" color="sharp-master-green"/>{{$t("PREMIUM_FEATURE_1")}}</li>
            <li><v-icon class="me-3" icon="mdi-check-decagram-outline" color="sharp-master-green"/>{{$t("PREMIUM_FEATURE_2")}}</li>
            <li><v-icon class="me-3" icon="mdi-check-decagram-outline" color="sharp-master-green"/>{{$t("PREMIUM_FEATURE_3")}}</li>
            <li><v-icon class="me-3" icon="mdi-check-decagram-outline" color="sharp-master-green"/>{{$t("PREMIUM_FEATURE_4")}}</li>
            <li><v-icon class="me-3" icon="mdi-check-decagram-outline" color="sharp-master-green"/>{{$t("PREMIUM_FEATURE_5")}}</li>
          </ul>
        </v-card-item>

        <!-- Buttons -->
        <v-card-item class="pa-0 w-100">
          <!-- Go to VpnHood Store page on google play button -->
          <v-btn
              href="https://play.google.com/store/apps/details?id=com.vphood.store.android"
              :block="true"
              rounded="pill"
              height="45"
              variant="elevated"
              class="grad-btn font-weight-bold text-capitalize"
              :text="$t('BUY_PREMIUM_SERVER')"
          >
          </v-btn>

          <!-- Close button -->
  <!--        <v-btn
              :block="true"
              height="45"
              rounded="pill"
              variant="outlined"
              color="sky-blue"
              :text="$t('CLOSE')"
              @click="$emit('update:modelValue',false)">
          </v-btn>-->
        </v-card-item>
      </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: "PremiumServerAdDialog",
  props: {
    modelValue: Boolean,
  },
  emits: [
    "update:modelValue",
  ],
  methods:{
    showProducts(){
      this.$emit('update:modelValue',true);
    }
  }
})
</script>

<style scoped>
#adTitle {
  font-size: 130%;
  border-bottom: 1px rgba(63, 246, 169, 0.15) solid;
}
#adDesc {
  line-height: 31px;
}
#adContentWrapper {
  border: 1px rgba(22, 163, 254, 0.44) solid;
  background-color: #06124BFF;
}
/*noinspection ALL*/
.v-card-item {
  width: 100%;
  max-width: 500px;
}
</style>