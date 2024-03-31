<template>
  <v-dialog
      :modelValue="modelValue"
      @update:modelValue="$emit('update:modelValue',$event)"
      :close-on-back="true"
      :fullscreen="true"
      :scrollable="true"
      :persistent="true"
  >
    <v-card>

      <v-card-title class="text-center pt-0 pb-2 bg-background">
        <v-btn icon="mdi-window-close" variant="tonal"  size="small" class="d-block mx-auto my-4" @click="$emit('update:modelValue',false)"/>
       <span>{{$t("MIGRATION_TITLE")}}</span>
      </v-card-title>
      <v-divider/>

      <v-card-text class="text-body-2 px-5">
        <div v-html="$t('MIGRATION_DESC')"></div>
      </v-card-text>

      <v-card-actions class="d-flex flex-column bg-background py-3" >
        <v-btn
            variant="flat"
            :text="$t('DOWNLOAD_VPN_HOOD_CONNECT')"
            href="https://play.google.com/store/apps/details?id=com.vpnhood.connect.android"
            target="_blank"
            block
            class="text-capitalize mb-3 mx-0"
            color="secondary"
            @click="$emit('update:modelValue',false)"
        />
        <v-btn
            variant="tonal"
            block
            :text="$t('CONTINUE')"
            @click="continueConnect"
            class="text-capitalize mx-0"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: "MigratePublicServerDialog",
  props:{
    modelValue:Boolean,
  },
  emits: [
    "update:modelValue",
    "acceptPrivacyPolicy"
  ],
  methods:{
    async continueConnect(): Promise<void>{
      this.$emit('update:modelValue',false);
      await this.$vpnHoodApp.connect();
    },
  }
})
</script>