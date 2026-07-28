<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { computed, ref, watch } from 'vue';
import AppBar from '@/components/AppBar.vue';
import SettingsSectionTitle from '@/components/Settings/SettingsSectionTitle.vue';
import { SplitDnsMode, UnsupportedIpMode } from '@/services/VpnHood.Client.Api';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const localSplitDnsMode = ref(vhApp.data.userSettings.splitDnsMode);
const localUnsupportedIpMode = ref(vhApp.data.userSettings.unsupportedIpMode);

// the permissive choice of each policy lets traffic out of the tunnel, which is worth saying out loud
const isDnsLeaking = computed<boolean>(() => localSplitDnsMode.value === SplitDnsMode.DefaultRoute);
const isIpLeaking = computed<boolean>(() => localUnsupportedIpMode.value === UnsupportedIpMode.Exclude);

watch(() => vhApp.data.userSettings.splitDnsMode, (newVal) => {
  localSplitDnsMode.value = newVal;
});
watch(() => vhApp.data.userSettings.unsupportedIpMode, (newVal) => {
  localUnsupportedIpMode.value = newVal;
});

async function onSplitDnsModeChange(value: SplitDnsMode | null) {
  if (value === null) {
    localSplitDnsMode.value = vhApp.data.userSettings.splitDnsMode;
    return;
  }

  vhApp.data.userSettings.splitDnsMode = value;
  await vhApp.saveUserSetting();
}

async function onUnsupportedIpModeChange(value: UnsupportedIpMode | null) {
  if (value === null) {
    localUnsupportedIpMode.value = vhApp.data.userSettings.unsupportedIpMode;
    return;
  }

  vhApp.data.userSettings.unsupportedIpMode = value;
  await vhApp.saveUserSetting();
}
</script>

<template>
  <v-sheet>
    <app-bar/>

    <!-- Feature description -->
    <p class="text-disabled text-body-small mb-4">{{ locale("LEAK_PROTECTION_DESC") }}</p>

    <!-- Split DNS -->
    <settings-section-title :title="locale('SPLIT_DNS')"/>
    <p class="text-disabled text-body-small mb-4">{{ locale("SPLIT_DNS_DESC") }}</p>

    <!-- Leak warning for the mode that lets DNS out of the tunnel -->
    <alert-warning v-if="isDnsLeaking" :text="locale('SPLIT_DNS_LEAK_WARNING')" class="mb-4"/>

    <config-card class="pt-3 mb-4">
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

    <!-- Unsupported IPs -->
    <settings-section-title :title="locale('UNSUPPORTED_IPS')"/>
    <p class="text-disabled text-body-small mb-4">{{ locale("UNSUPPORTED_IPS_DESC") }}</p>

    <!-- Leak warning for the mode that lets unsupported destinations out of the tunnel -->
    <alert-warning v-if="isIpLeaking" :text="locale('UNSUPPORTED_IPS_LEAK_WARNING')" class="mb-4"/>

    <config-card class="pt-3">
      <v-card-item class="ps-1">

        <v-radio-group
          v-model="localUnsupportedIpMode"
          @update:model-value="onUnsupportedIpModeChange"
          hide-details="auto"
          color="highlight"
        >
          <v-radio
            :value="UnsupportedIpMode.Block"
            class="radio-icon-top mb-3"
          >
            <template v-slot:label>
              <div class="d-flex flex-column">
                <span>
                  {{ locale("UNSUPPORTED_IPS_BLOCK") }}
                  <v-chip
                    color="highlight"
                    :text="locale('RECOMMENDED')"
                    size="small"
                    variant="tonal"
                    density="comfortable"
                    tabindex="-1"
                  />
                </span>
                <span class="text-disabled text-body-small">{{ locale("UNSUPPORTED_IPS_BLOCK_DESC") }}</span>
              </div>
            </template>
          </v-radio>

          <v-radio
            :value="UnsupportedIpMode.Exclude"
            class="radio-icon-top mb-3"
          >
            <template v-slot:label>
              <div class="d-flex flex-column">
                <span>{{ locale("UNSUPPORTED_IPS_EXCLUDE") }}</span>
                <span class="text-disabled text-body-small">{{ locale("UNSUPPORTED_IPS_EXCLUDE_DESC") }}</span>
              </div>
            </template>
          </v-radio>

        </v-radio-group>
      </v-card-item>
    </config-card>
  </v-sheet>
</template>
