<script setup lang="ts">
import { AppConnectionState } from '@/services/VpnHood.Client.Api';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { computed } from 'vue';
import { Protocols } from '@/UiConstants';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const props = defineProps<{
  modelValue: boolean
}>();

const activeProtocol = computed<Protocols>({
  get: () => {
    if (isUdpUnsupported())
      return vhApp.data.settings.userSettings.dropQuic ? Protocols.TcpAndDropHTTP3 : Protocols.TCP;

    return vhApp.data.settings.userSettings.useUdpChannel
      ? Protocols.UDP
      : vhApp.data.settings.userSettings.dropQuic
        ? Protocols.TcpAndDropHTTP3
        : Protocols.TCP;
  },
  set: async (value: Protocols) => {
    vhApp.data.settings.userSettings.useUdpChannel = (!(value === Protocols.TCP || value === Protocols.TcpAndDropHTTP3));
    vhApp.data.settings.userSettings.dropQuic = value === Protocols.TcpAndDropHTTP3;
    await vhApp.saveUserSetting();
  }
});

function isUdpUnsupported(): boolean {
  return vhApp.data.state.connectionState === AppConnectionState.Connected &&
    vhApp.data.state.isUdpChannelSupported === false;
}
</script>

<template>
  <v-dialog
    :modelValue="props.modelValue"
    @update:modelValue="$emit('update:modelValue',$event)"
    max-width="600"
  >
    <v-card :color="vhApp.isConnectApp() ? 'primary-darken-2' : 'white'">
      <v-card-title :class="vhApp.isConnectApp() ? 'text-secondary' : 'bg-secondary'">
        {{ locale('PROTOCOL') }}
      </v-card-title>

      <v-card-text>
        <p :class="[vhApp.isConnectApp() ? 'text-disabled' : 'text-gray-lighten-2','pb-4']">
          {{ locale('PROTOCOL_DESC') }}
        </p>

        <!-- UDP not supported alert -->
        <v-alert
          v-if="isUdpUnsupported()"
          class="mb-3 text-caption"
          :icon="false"
          type="warning"
          :text="locale('UDP_NOT_SUPPORTED_MESSAGE')"
        />

        <v-radio-group :hide-details="true" v-model="activeProtocol" class="mx-n3">

          <!-- UDP -->
          <v-radio :value="Protocols.UDP" :disabled="isUdpUnsupported()" color="secondary" class="mb-3">
            <template v-slot:label>
              <div class="d-flex flex-column">
                <span>{{ locale('PROTOCOL_UDP') }}</span>
                <span :class="[vhApp.isConnectApp() ? 'text-disabled' : 'text-gray-lighten-2','text-caption']">
                {{ locale('PROTOCOL_UDP_DESC') }}
              </span>
              </div>
            </template>
          </v-radio>

          <!-- TCP -->
          <v-radio :value="Protocols.TCP" color="secondary" class="mb-3">
            <template v-slot:label>
              <div class="d-flex flex-column">
                <span>{{ locale('PROTOCOL_TCP') }}</span>
                <span :class="[vhApp.isConnectApp() ? 'text-disabled' : 'text-gray-lighten-2','text-caption']">
                  {{ locale('PROTOCOL_TCP_DESC') }}
                </span>
              </div>
            </template>
          </v-radio>

          <!-- TCP & Drop HTTP/3 -->
          <v-radio :value="Protocols.TcpAndDropHTTP3" color="secondary">
            <template v-slot:label>
              <div class="d-flex flex-column align-start">
                <span>{{ locale('PROTOCOL_DROP_QUIC') }}</span>
                <span :class="[vhApp.isConnectApp() ? 'text-disabled' : 'text-gray-lighten-2','text-caption']">
                  {{ locale('PROTOCOL_DROP_QUIC_DESC') }}
                  <span class="text-secondary">({{ locale('DEFAULT') }})</span>
                </span>
              </div>
            </template>
          </v-radio>

        </v-radio-group>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" variant="text" :text="locale('CLOSE')" @click="$emit('update:modelValue',false)" />
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>
