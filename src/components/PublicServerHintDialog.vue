<template>
  <v-dialog
      :modelValue="modelValue"
      @update:modelValue="$emit('update:modelValue',$event)"
      :close-on-back="true"
      :fullscreen="true"
      :scrollable="true"
      :persistent="true"
  >
    <v-card color="primary-darken-2" class="pa-5">
      <v-card-title class="text-center text-white text-h5 pb-5">{{$t("PUBLIC_SERVER_WARNING_TITLE")}}</v-card-title>
      <v-divider/>

      <v-card-text class="text-body-2">
        <p class="pb-4 color-muted" v-html="$t('PUBLIC_SERVER_WARNING')"></p>
        <p><strong class="text-secondary">{{$t("WARNING")}}!</strong> {{$t("PRIVACY_WARNING")}}</p>
        <a class="text-secondary" href="https://www.vpnhood.com/privacy-policy" target="_blank">{{ $t("READ_PRIVACY_POLICY") }}</a>
      </v-card-text>

      <v-card-actions>
        <!-- Accept button -->
        <v-btn
            color="tertiary"
            :block="true"
            rounded="pill"
            variant="flat"
            :text="$t('ACCEPT')"
            @click="accept"
            class="text-primary-darken-2"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: "PublicServerHintDialog",
  props:{
    modelValue:Boolean,
  },
  emits: [
    "update:modelValue",
    "acceptPrivacyPolicy"
  ],
  methods:{
    async accept(): Promise<void>{
       localStorage.setItem("vh:DontShowPublicServerHint", "true");
      this.$emit('acceptPrivacyPolicy');
      this.$emit('update:modelValue',false);
    },
  }
})
</script>