<template>
  <v-dialog :modelValue="modelValue" @update:modelValue="$emit('update:modelValue',$event)" close-on-back>
    <v-card>
      <v-card-title class="bg-grey-lighten-3">{{$t("PUBLIC_SERVER_WARNING_TITLE")}}</v-card-title>
      <v-divider></v-divider>
      <v-card-text class="txt-small-1">
        <p class="pb-4 color-muted" v-html="$t('PUBLIC_SERVER_WARNING')"></p>
        <p><strong>{{$t("WARNING")}}!</strong> {{$t("PRIVACY_WARNING")}}</p>
        <a class="text-info" href="https://www.vpnhood.com/privacy-policy" target="_blank">{{ $t("READ_PRIVACY_POLICY") }}</a>
      </v-card-text>
      <v-divider></v-divider>
      <v-checkbox
          v-model="isDontShowMessage"
          :label="$t('DONT_SHOW_MESSAGE')"
          color="info"
          hide-details
      >
      </v-checkbox>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" variant="text" @click="$emit('update:modelValue',false)">
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
  props:{
    modelValue:Boolean,
  },
  emits: [
    "update:modelValue",
  ],
  data(){
    return{
      isDontShowMessage: false,
    }
  },
  methods:{
    async connect(): Promise<void>{
      // Set isDontShowMessage status to the user local storage
      this.isDontShowMessage ? localStorage.setItem("vh:DontShowPublicServerHint", "true") : localStorage.setItem("vh:DontShowPublicServerHint", "false");

      this.$emit('update:modelValue',false);
      this.$vpnHoodApp.vpnHoodGlobalProperty.showPremiumServerAd = true;
    }
  }
})
</script>