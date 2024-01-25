<template>

  <v-dialog :modelValue="modelValue" @update:modelValue="$emit('update:modelValue',$event)" max-width="600">
    <v-card>
      <v-card-title class="bg-master-green">{{$t("PROTOCOL")}}</v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <p class="pb-4 color-muted">{{ $t("PROTOCOL_DESC") }}</p>
        <v-radio-group v-model="useUdpChannel" hide-details>

          <v-radio :value="true" color="warning">
            <template v-slot:label>
              <span>{{ $t("PROTOCOL_UDP_ON") }}</span>
              <v-chip class="ms-2" size="small" variant="flat" color="warning" :text="$t('LESS_LATENCY')"></v-chip>
            </template>
          </v-radio>

          <v-radio :value="false" color="secondary">
            <template v-slot:label>
              <span>{{ $t("PROTOCOL_UDP_OFF") }}</span>
              <v-chip class="ms-2" size="small" color="secondary" :text="$t('DEFAULT')"></v-chip>
            </template>
          </v-radio>

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
