<template>
  <v-dialog v-model="isShow" close-on-back>
    <v-card :title="$t('PUBLIC_SERVER_WARNING_TITLE')">
      <v-divider class="mt-3"></v-divider>
      <v-card-text>
        <p class="pb-4 color-muted" v-html="$t('PUBLIC_SERVER_WARNING')"></p>
        <v-alert
            :title="$t('WARNING')"
            :text="$t('PRIVACY_WARNING')"
            color="warning"
            variant="outlined"
        >
        </v-alert>
        <a href="https://www.vpnhood.com/privacy-policy" target="_blank">{{ $t("READ_PRIVACY_POLICY") }}</a>
      </v-card-text>
      <v-divider></v-divider>
      <v-checkbox v-model="isDontShowMessage" :label="$t('DONT_SHOW_MESSAGE')" color="info"></v-checkbox>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" variant="text" @click="isShow = false">
          {{ $t("CANCEL") }}
        </v-btn>
        <v-btn color="blue darken-1" variant="text" @click="connect">
          {{ $t("ACCEPT") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {defineComponent} from "vue";
export default defineComponent({
  name: "PublicServerHintDialog",
  data(){
    return{
      isShow: false,
      isDontShowMessage: false,
    }
  },
  methods:{
    connect(){

    }
  }
})
</script>

<style scoped>

</style>