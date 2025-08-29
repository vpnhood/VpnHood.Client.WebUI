<script setup lang="ts">
import AppBar from '@/components/AppBar.vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { computed } from 'vue';
import router from '@/services/router';
import { Util } from '@/helpers/Util';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

enum Protocols {
  UDP,
  TCP,
  TcpAndDropHTTP3
}

interface ProtocolsItem {
  value: Protocols,
  title: string,
  subtitle: string,
  isDefault: boolean,
  isDisabled: boolean
}

const protocolsItem: ProtocolsItem[] = [
  {
    value: Protocols.UDP,
    title: "PROTOCOL_UDP",
    subtitle: "PROTOCOL_UDP_DESC",
    isDefault: false,
    isDisabled: isUdpUnsupported()
  },
  {
    value: Protocols.TCP,
    title: "PROTOCOL_TCP",
    subtitle: "PROTOCOL_TCP_DESC",
    isDefault: true,
    isDisabled: false
  },
  {
    value: Protocols.TcpAndDropHTTP3,
    title: "PROTOCOL_DROP_QUIC",
    subtitle: "PROTOCOL_DROP_QUIC_DESC",
    isDefault: false,
    isDisabled: false
  }
]

const cloakMode = computed({
  get: () => {
    return vhApp.data.state.isTcpProxy;
  },
  set: async (value: boolean) => {
    if (!vhApp.data.userSettings.isTcpProxyPrompted)
      await router.push({name: 'CLOAK_MODE'});

    vhApp.data.state.isTcpProxy = value;
    vhApp.data.userSettings.useTcpProxy = value;
    await vhApp.saveUserSetting();
  }
});

const activeProtocol = computed<Protocols>({
  get: () => {
    const { dropQuic, useUdpChannel } = vhApp.data.userSettings;
    if (isUdpUnsupported()) {
      return dropQuic ? Protocols.TcpAndDropHTTP3 : Protocols.TCP;
    }
    return useUdpChannel ? Protocols.UDP : (dropQuic ? Protocols.TcpAndDropHTTP3 : Protocols.TCP);
  },
  set: async (value: Protocols) => {
    const userSettings = vhApp.data.userSettings;
    userSettings.useUdpChannel = value === Protocols.UDP;
    userSettings.dropQuic = value === Protocols.TcpAndDropHTTP3;
    await vhApp.saveUserSetting();
  }
});
function isUdpUnsupported(): boolean {
  return vhApp.data.isConnected && !vhApp.data.state.sessionInfo?.isUdpChannelSupported;
}
</script>

<template>
  <v-sheet>
    <app-bar/>

    <p class="text-disabled text-caption mb-4">{{locale("PROTOCOL_DESC")}}</p>

    <!-- Cloak Mode -->
    <config-card>

      <v-card-item>
        <!-- Enforced by server alert -->
        <alert-warning v-if="vhApp.data.isConnected && !vhApp.data.state.canChangeTcpProxy" :text="locale('ENFORCED_BY_SERVER')" />

        <!-- Switch button -->
        <div class="d-flex align-center justify-space-between" :class="{'text-disabled': !vhApp.data.state.canChangeTcpProxy}">
          <span>{{ locale('CLOAK_MODE') }}</span>
          <v-switch v-model="cloakMode"  :disabled="!vhApp.data.state.canChangeTcpProxy"/>
        </div>

      </v-card-item>

      <!-- Description and learn more button -->
      <v-card-subtitle class="mb-3">
        <p>{{locale("CLOAK_MODE_SHORT_DESC")}}</p>
        <v-btn
          :text="locale('LEARN_MORE')"
          variant="plain"
          class="pa-0 opacity-100"
          :ripple="false"
          color="highlight"
          :append-icon="Util.getLocalizedRightChevron()"
          @click="router.push({name: 'CLOAK_MODE'})"
        />
      </v-card-subtitle>

    </config-card>

    <!-- Protocols radio buttons -->
    <config-card>

      <!-- UDP description -->
      <v-card-item>
        <v-card-subtitle>{{locale('PROTOCOL_UDP_NOTE')}}</v-card-subtitle>
      </v-card-item>

      <!-- UDP not supported alert -->
      <v-card-item v-if="isUdpUnsupported()" class="py-0">
        <alert-warning :text="locale('UDP_NOT_SUPPORTED_MESSAGE')" />
      </v-card-item>


      <!-- Radio buttons for protocols -->
      <v-card-item>
        <v-radio-group :hide-details="true" v-model="activeProtocol" color="highlight">
          <v-radio
            v-for="item in protocolsItem"
            :key="item.value"
            :value="item.value"
            :disabled="item.isDisabled"
            class="mb-3"
          >
            <template v-slot:label>
              <div class="d-flex flex-column align-start">

                <!-- Protocol name -->
                <span>{{ locale(item.title) }}</span>

                <span class="text-disabled text-caption">

                  <!-- Protocol short description -->
                  {{ locale(item.subtitle) }}

                  <!-- Default protocol -->
                  <v-chip
                    v-if="item.isDefault"
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
    </config-card>
  </v-sheet>
</template>
