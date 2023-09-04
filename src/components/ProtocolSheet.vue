<template>
  <v-dialog v-model="isShow">
    <v-card :title="$t('PROTOCOL')">
      <v-divider class="mt-3"></v-divider>
      <v-card-text>
        <p class="pb-4 color-muted">{{ $t("PROTOCOL_DESC") }}</p>
        <v-radio-group v-model="useUdpChannel" hide-details>
          <v-radio :label="$t('PROTOCOL_UDP_ON')" :value="true" ></v-radio>
          <v-radio :label="$t('PROTOCOL_UDP_OFF')" :value="false" ></v-radio>
        </v-radio-group>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" variant="text" @click="isShow = false">
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
  data() {
    return {
      isShow: false,
    }
  },
  computed: {
    useUdpChannel:
        {
          get() {
            return this.$clientApp.settings.userSettings.useUdpChannel;
          },
          set(value) {
            this.$clientApp.settings.userSettings.useUdpChannel = value;
          }
        },
  },
})
</script>
