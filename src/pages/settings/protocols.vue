<script setup lang="ts">
import AppBar from '@/components/AppBar.vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import { ChannelProtocol } from '@/services/VpnHood.Client.Api';
import i18n from '@/locales/i18n';
import { computed } from 'vue';
import router from '@/services/router';
import { Util } from '@/helpers/Util';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

interface ProtocolsItem {
  value: ChannelProtocol,
  title: string,
  subtitle: string,
  isDefault: boolean,
  isVisible: boolean,
  isDisabled: boolean,
  disabledReason?: string
}

// Configuration (static meta) for each channel protocol
const allProtocolsConfig: Record<string, { title: string; subtitle: string; isDefault: boolean; }> = {
  [ChannelProtocol.Udp]: { title: 'PROTOCOL_UDP', subtitle: 'PROTOCOL_UDP_DESC', isDefault: false },
  [ChannelProtocol.Tcp]: { title: 'PROTOCOL_TCP', subtitle: 'PROTOCOL_TCP_DESC', isDefault: true },
  [ChannelProtocol.TcpProxyAndUdp]: { title: 'PROTOCOL_TCP_PROXY_AND_UDP', subtitle: 'PROTOCOL_TCP_PROXY_AND_UDP_DESC', isDefault: false },
  [ChannelProtocol.TcpProxy]: { title: 'PROTOCOL_TCP_PROXY', subtitle: 'PROTOCOL_TCP_PROXY_DESC', isDefault: false },
  [ChannelProtocol.TcpProxyAndDropQuic]: { title: 'PROTOCOL_TCP_PROXY_AND_DROP_QUIC', subtitle: 'PROTOCOL_TCP_PROXY_AND_DROP_QUIC_DESC', isDefault: false },
};

const protocolsItem = computed<ProtocolsItem[]>(() => {
  const supported = (vhApp.data.features.channelProtocols || []) as ChannelProtocol[];
  const serverSupported = (vhApp.data.state.serverChannelProtocols || []) as ChannelProtocol[];

  return Object.keys(allProtocolsConfig)
    .filter(key => supported.includes(key as ChannelProtocol)) // only those supported by features
    .map(key => {
      const cfg = allProtocolsConfig[key];
      const protocol = key as ChannelProtocol;
      const isServer = serverSupported.includes(protocol);
      return {
        value: protocol,
        title: cfg.title,
        subtitle: cfg.subtitle,
        isDefault: cfg.isDefault,
        isVisible: true,
        isDisabled: !isServer,
        disabledReason: !isServer ? locale('SERVER_NOT_SUPPORTED') : undefined,
      } as ProtocolsItem;
    });
});

// Check if protocol is TcpProxy-based
function isTcpProxyProtocol(protocol: ChannelProtocol | undefined | null): boolean {
  if (!protocol) return false;
  return [ChannelProtocol.TcpProxy, ChannelProtocol.TcpProxyAndUdp, ChannelProtocol.TcpProxyAndDropQuic].includes(protocol);
}

// Cloak mode reflects whether current selected protocol is a TcpProxy variant.
// Toggle switches between a preferred non-proxy protocol and a proxy variant.
const cloakMode = computed({
  get: () => isTcpProxyProtocol(vhApp.data.userSettings.channelProtocol),
  set: async (value: boolean) => {
    const current = vhApp.data.userSettings.channelProtocol as ChannelProtocol | undefined;
    if (value) {
      // Enabling cloak: move to closest TcpProxy variant based on current base protocol
      if (!vhApp.data.userSettings.isTcpProxyPrompted)
        await router.push({ name: 'CLOAK_MODE' });
      if (current === ChannelProtocol.Udp) {
        vhApp.data.userSettings.channelProtocol = ChannelProtocol.TcpProxyAndUdp;
      } else if (current === ChannelProtocol.TcpProxyAndDropQuic) {
        // already cloaked with strongest option
      } else if (current === ChannelProtocol.TcpProxyAndUdp || current === ChannelProtocol.TcpProxy) {
        // already a cloak variant
      } else if (current === ChannelProtocol.Tcp) {
        vhApp.data.userSettings.channelProtocol = ChannelProtocol.TcpProxy;
      } else {
        vhApp.data.userSettings.channelProtocol = ChannelProtocol.TcpProxy; // fallback
      }
    } else {
      // Disabling cloak: revert to non-proxy analogue
      if (current === ChannelProtocol.TcpProxyAndUdp) {
        vhApp.data.userSettings.channelProtocol = ChannelProtocol.Udp;
      } else if (current === ChannelProtocol.TcpProxyAndDropQuic) {
        vhApp.data.userSettings.channelProtocol = ChannelProtocol.Tcp; // fallback (no drop quic analogue without proxy?)
      } else if (current === ChannelProtocol.TcpProxy) {
        vhApp.data.userSettings.channelProtocol = ChannelProtocol.Tcp;
      }
    }
    await vhApp.saveUserSetting();
  }
});

const activeProtocol = computed<ChannelProtocol>({
  get: () => (vhApp.data.userSettings.channelProtocol || ChannelProtocol.Tcp) as ChannelProtocol,
  set: async (value: ChannelProtocol) => {
    if (isTcpProxyProtocol(value) && !vhApp.data.userSettings.isTcpProxyPrompted) {
      await router.push({ name: 'CLOAK_MODE' });
      return;
    }
    vhApp.data.userSettings.channelProtocol = value;
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
        <!-- Switch button -->
        <div class="d-flex align-center justify-space-between">
          <span>{{ locale('CLOAK_MODE') }}</span>
          <v-switch v-model="cloakMode"/>
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

                  <!-- Server not supported message -->
                  <span v-if="item.isDisabled && item.disabledReason">
                    - {{ item.disabledReason }}
                  </span>

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
