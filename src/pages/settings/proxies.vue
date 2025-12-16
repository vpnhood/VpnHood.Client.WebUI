<script setup lang="ts">
import { computed } from 'vue';
import AppBar from '@/components/AppBar.vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { AppProxyMode } from '@/services/VpnHood.Client.Api';
import DeviceProxy from '@/components/Proxies/DeviceProxy.vue';
import ManualProxies from '@/components/Proxies/ManualProxies.vue';
import { Util } from '@/helpers/Util';
import SmallFeatureImageAndDescription from '@/components/SmallFeatureImageAndDescription.vue';


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

</script>

<template>
    <v-sheet>
      <app-bar />

      <!-- Small image for manual mode -->
      <small-feature-image-and-description v-if="proxyMode === AppProxyMode.Manual" image="proxy.webp" description="PROXY_NOTE" />

      <!-- Large image for other modes -->
      <template v-else>
        <v-img
          :src="Util.getAssetPath('proxy.webp')"
          alt="Symbol image"
          width="100%"
          max-height="280px"
          class="mx-auto"
        />
        <p class="mt-2 mb-5 pb-4 border-b text-center text-disabled text-caption px-3">{{locale('PROXY_NOTE')}}</p>
      </template>

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
      <manual-proxies v-if="proxyMode == AppProxyMode.Manual"/>

      <!-- Device mode -->
      <device-proxy v-else-if="proxyMode === AppProxyMode.Device" />

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
