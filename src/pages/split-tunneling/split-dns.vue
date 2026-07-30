<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { computed, ref, watch } from 'vue';
import AppBar from '@/components/AppBar.vue';
import SplitTunnelingDisabledAlert from '@/components/SplitTunneling/SplitTunnelingDisabledAlert.vue';
import { SplitDnsMode } from '@/services/VpnHood.Client.Api';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const localSplitDnsMode = ref(vhApp.data.userSettings.splitTunneling.dnsMode);

// the permissive choice lets DNS follow the splits out of the tunnel, which is worth saying out
// loud — but only while the master toggle allows splitting; otherwise the disabled alert speaks
const isDnsLeaking = computed<boolean>(() =>
  vhApp.data.userSettings.splitTunneling.enabled && localSplitDnsMode.value === SplitDnsMode.DefaultRoute);

watch(() => vhApp.data.userSettings.splitTunneling.dnsMode, (newVal) => {
  localSplitDnsMode.value = newVal;
});

async function onSplitDnsModeChange(value: SplitDnsMode | null) {
  if (value === null) {
    localSplitDnsMode.value = vhApp.data.userSettings.splitTunneling.dnsMode;
    return;
  }

  vhApp.data.userSettings.splitTunneling.dnsMode = value;
  await vhApp.saveUserSetting();
}
</script>

<template>
  <v-sheet>
    <app-bar/>

    <split-tunneling-disabled-alert/>

    <!-- Feature description -->
    <p class="text-disabled text-body-small mb-4">{{ locale("SPLIT_DNS_DESC") }}</p>

    <!-- Leak warning for the mode that lets DNS out of the tunnel -->
    <alert-warning v-if="isDnsLeaking" :text="locale('SPLIT_DNS_LEAK_WARNING')" class="mb-4"/>

    <config-card class="pt-3">
      <v-card-item class="ps-1">

        <v-radio-group
          v-model="localSplitDnsMode"
          @update:model-value="onSplitDnsModeChange"
          hide-details="auto"
          color="highlight"
        >
          <v-radio
            :value="SplitDnsMode.IncludeAll"
            class="radio-icon-top mb-3"
          >
            <template v-slot:label>
              <div class="d-flex flex-column">
                <span>
                  {{ locale("SPLIT_DNS_INCLUDE_ALL") }}
                  <v-chip
                    color="highlight"
                    :text="locale('RECOMMENDED')"
                    size="small"
                    variant="tonal"
                    density="comfortable"
                    tabindex="-1"
                  />
                </span>
                <span class="text-disabled text-body-small">{{ locale("SPLIT_DNS_INCLUDE_ALL_DESC") }}</span>
              </div>
            </template>
          </v-radio>

          <v-radio
            :value="SplitDnsMode.DefaultRoute"
            class="radio-icon-top mb-3"
          >
            <template v-slot:label>
              <div class="d-flex flex-column">
                <span>{{ locale("SPLIT_DNS_DEFAULT_ROUTE") }}</span>
                <span class="text-disabled text-body-small">{{ locale("SPLIT_DNS_DEFAULT_ROUTE_DESC") }}</span>
              </div>
            </template>
          </v-radio>

        </v-radio-group>
      </v-card-item>
    </config-card>
  </v-sheet>
</template>
