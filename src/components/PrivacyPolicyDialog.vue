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
      <v-card-title class="text-center text-white pt-0 pb-2">
        <v-img
            :eager="true"
            src="../assets/images/logo-connect.png"
            alt="logo"
            max-width="60"
            width="60"
            height="60"
            class="mx-auto mb-1"
        />
        {{$t("VPNHOOD_CONNECT_PRIVACY_POLICY_TITLE")}}
      </v-card-title>
      <v-divider/>

      <v-card-text class="text-body-2 px-2">
        <p class="pb-4 text-disabled text-caption" v-html="$t('VPNHOOD_CONNECT_PRIVACY_POLICY_DESC')"></p>
        <span>{{ $t("READ_PRIVACY_POLICY") }}</span>
        <a class="text-secondary font-weight-bold ms-1" href="https://www.vpnhood.com/privacy-policy" target="_blank">
          {{ $t("PRIVACY_POLICY") }}
          <v-icon icon="mdi-open-in-new"/>
        </a>
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