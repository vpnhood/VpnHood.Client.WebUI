<template>

  <v-dialog :modelValue="modelValue" @update:modelValue="$emit('update:modelValue',$event)" max-width="600"
            close-on-back>
    <v-card>
      <v-card-title class="bg-grey-lighten-3">{{$t("PROTOCOL")}}</v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <p class="pb-4 color-muted">{{ $t("PROTOCOL_DESC") }}</p>
        <v-radio-group v-model="useUdpChannel" hide-details>
          <v-radio :label="$t('PROTOCOL_UDP_ON')" :value="true" color="info"></v-radio>
          <v-radio :label="$t('PROTOCOL_UDP_OFF')" :value="false" color="info"></v-radio>
        </v-radio-group>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" variant="text" @click="$emit('update:modelValue',false)">
          {{ $t("CLOSE") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: 'ProtocolSheet',
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
            return this.$vpnHoodApp.settings.userSettings.useUdpChannel;
          },
          set(value: boolean) {
            this.$vpnHoodApp.settings.userSettings.useUdpChannel = value;
            this.$vpnHoodApp.saveUserSetting();
          }
        },
  },
})
</script>
