<template>

  <v-dialog :modelValue="modelValue" @update:modelValue="$emit('update:modelValue',$event)" max-width="600"
            close-on-back>
    <v-card>
      <v-card-title class="bg-master-green">{{$t("PROTOCOL")}}</v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <p class="pb-4 color-muted">{{ $t("PROTOCOL_DESC") }}</p>
        <v-radio-group v-model="useUdpChannel" hide-details>
          <v-radio :label="$t('PROTOCOL_UDP_ON')" :value="true" color="secondary"></v-radio>
          <v-radio :label="$t('PROTOCOL_UDP_OFF')" :value="false" color="secondary"></v-radio>
        </v-radio-group>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" variant="text" @click="$emit('update:modelValue',false)">
          {{ $t("CLOSE") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: 'ProtocolDialog',
  props:{
    modelValue:Boolean,
  },
  emits: [
    "update:modelValue",
  ],
  computed: {
    useUdpChannel:
        {
          get() {
            return this.$vpnHoodApp.data.settings.userSettings.useUdpChannel;
          },
          async set(value: boolean) {
            this.$vpnHoodApp.data.settings.userSettings.useUdpChannel = value;
            await this.$vpnHoodApp.saveUserSetting();
          }
        },
  },
})
</script>
