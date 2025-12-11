<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import AppBar from '@/components/AppBar.vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { AppProxyMode } from '@/services/VpnHood.Client.Api';
import DeviceProxyList from '@/components/Proxies/DeviceProxyList.vue';
import ManualProxyList from '@/components/Proxies/ManualProxyList.vue';


const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const proxyModeItems = [
  { value: AppProxyMode.NoProxy, title: locale('PROXY_MODE_NOPROXY') },
  { value: AppProxyMode.Device, title: locale('PROXY_MODE_DEVICE') },
  { value: AppProxyMode.Manual, title: locale('PROXY_MODE_MANUAL') }
];

const proxyMode = computed<AppProxyMode>({
    get: () => vhApp.data.userSettings.proxySettings.mode,
    set: async (value: AppProxyMode) => {
        const proxySettings = vhApp.data.userSettings.proxySettings;
        const previous = proxySettings.mode;
        if (previous === value)
            return;

        proxySettings.mode = value;
        try {
            await vhApp.saveUserSetting();
        } catch (err: unknown) {
            proxySettings.mode = previous;
            throw err;
        }
    }
});


onMounted(async () => {

});

onUnmounted(() => {

});

</script>

<template>
    <v-sheet>
      <app-bar />

      <!-- Proxy mode select-->
      <config-card>
        <v-card-item class="smallSelect">
          <div class="d-flex align-center justify-space-between">
            <span>{{ locale('PROXY_MODE') }}</span>

            <v-select
              v-model="proxyMode"
              :items="proxyModeItems"
              item-title="title"
              item-value="value"
              variant="plain"
              density="compact"
              single-line
              color="highlight"
              hide-details
              class="flex-grow-0 text-highlight"
            />
          </div>
        </v-card-item>
      </config-card>

      <!-- Manual mode -->
      <manual-proxy-list v-if="proxyMode == AppProxyMode.Manual"/>

      <!-- Device mode -->
      <device-proxy-list v-else-if="proxyMode === AppProxyMode.Device" />

    </v-sheet>
</template>


<!--suppress CssUnusedSymbol -->
<style>
.smallSelect .v-field{
  font-size: 14px;
}
.smallSelect .v-field__input{
  padding-top: 0;
  padding-inline-end: 0;
  padding-bottom: 0;
}
.smallSelect .v-field.v-field--variant-plain .v-field__append-inner{
  padding-top: 6px;
}
</style>
