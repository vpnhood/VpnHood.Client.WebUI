<script setup lang="ts">
import { AppConnectionState } from '@/services/VpnHood.Client.Api';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { computed } from 'vue';
import { Protocols } from '@/helpers/UiConstants';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const props = defineProps<{
  modelValue: boolean
}>();

const activeProtocol = computed<Protocols>({
  get: () => {
    const { dropQuic, useUdpChannel } = vhApp.data.settings.userSettings;
    if (isUdpUnsupported()) {
      return dropQuic ? Protocols.TcpAndDropHTTP3 : Protocols.TCP;
    }
    return useUdpChannel ? Protocols.UDP : (dropQuic ? Protocols.TcpAndDropHTTP3 : Protocols.TCP);
  },
  set: async (value: Protocols) => {
    const userSettings = vhApp.data.settings.userSettings;
    userSettings.useUdpChannel = value === Protocols.UDP;
    userSettings.dropQuic = value === Protocols.TcpAndDropHTTP3;
    await vhApp.saveUserSetting();
  }
});
function isUdpUnsupported(): boolean {
  return vhApp.data.connectionState === AppConnectionState.Connected &&
    !vhApp.data.state.sessionInfo?.isUdpChannelSupported;
}
</script>

<template>
  <v-dialog
    :modelValue="props.modelValue"
    @update:modelValue="$emit('update:modelValue',$event)"
  >
    <v-card color="general-dialog" :title="locale('PROTOCOL')">

      <v-card-text class="text-disabled text-caption">{{ locale('PROTOCOL_DESC') }}</v-card-text>

      <v-card-item>

        <!-- UDP not supported alert -->
        <alert-warning
          v-if="isUdpUnsupported()"
          class="mb-3"
          :title="locale('WARNING')"
          :text="locale('UDP_NOT_SUPPORTED_MESSAGE')"
        />

        <v-radio-group :hide-details="true" v-model="activeProtocol" class="text-general-dialog-text" color="highlight">

          <!-- UDP -->
          <v-radio :value="Protocols.UDP" :disabled="isUdpUnsupported()" class="mb-3">
            <template v-slot:label>
              <div class="d-flex flex-column">
                <span>{{ locale('PROTOCOL_UDP') }}</span>
                <span class="text-disabled text-caption">{{ locale('PROTOCOL_UDP_DESC') }}</span>
              </div>
            </template>
          </v-radio>

          <!-- TCP -->
          <v-radio :value="Protocols.TCP" class="mb-3">
            <template v-slot:label>
              <div class="d-flex flex-column">
                <span>{{ locale('PROTOCOL_TCP') }}</span>
                <span class="text-disabled text-caption">{{ locale('PROTOCOL_TCP_DESC') }}</span>
              </div>
            </template>
          </v-radio>

          <!-- TCP & Drop HTTP/3 -->
          <v-radio :value="Protocols.TcpAndDropHTTP3">
            <template v-slot:label>
              <div class="d-flex flex-column align-start">
                <span>{{ locale('PROTOCOL_DROP_QUIC') }}</span>
                <span class="text-disabled text-caption">
                  {{ locale('PROTOCOL_DROP_QUIC_DESC') }}
                  <v-chip
                    color="highlight"
                    :text="locale('DEFAULT')"
                    size="small"
                    variant="tonal"
                    density="comfortable"
                    tabindex="-1"
                  />
                </span>
              </div>
            </template>
          </v-radio>

        </v-radio-group>
      </v-card-item>

      <v-card-actions>
        <v-btn :text="locale('CLOSE')" @click="$emit('update:modelValue',false)" />
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>
