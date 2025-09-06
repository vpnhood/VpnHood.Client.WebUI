<script lang="ts" setup>
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import router from '@/services/router';
import { Util } from '@/helpers/Util';
import AppBar from '@/components/AppBar.vue';
import { type NavigationGuardNext, onBeforeRouteLeave, type RouteLocationNormalized, } from 'vue-router';
import { AppFeature, DnsMode } from '@/services/VpnHood.Client.Api';
import PremiumIcon from '@/components/PremiumIcon.vue';
import { computed, ref, watch } from 'vue';
import { formatIpInput, isEmptyString, validateIp } from '@/helpers/Validators';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const isPrivateDnsActive = computed(() => vhApp.data.state.systemPrivateDns?.isActive);
const isAdapterDnsAvailable = computed(() => selectedDnsMode.value == DnsMode.AdapterDns);

const dns1 = ref<string | null>(vhApp.data.userSettings.dnsServers[0] ?? null);
const dns2 = ref<string | null>(vhApp.data.userSettings.dnsServers[1] ?? null);
const dns1Error = ref<string | null>(null);
const selectedDnsMode = ref<DnsMode>(vhApp.data.userSettings.dnsMode);

const validateDns1 = (value: string | null): true | string => {
  if (isAdapterDnsAvailable.value && (!value || isEmptyString(value))) {
    return locale('DNS1_REQUIRED');
  }
  return validateIp(value, locale('INVALID_IP'));
};

const dns1Rules = [validateDns1];
const dns2Rules = [(value: string | null) => validateIp(value, locale('INVALID_IP'))];

async function saveSettings() {
  vhApp.data.userSettings.dnsMode = selectedDnsMode.value;
  vhApp.data.userSettings.dnsServers = [dns1.value, dns2.value].filter((v): v is string => !!v && !isEmptyString(v));
  await vhApp.saveUserSetting();
}

onBeforeRouteLeave(
  async (_to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
    const result = validateDns1(dns1.value);
    if (result !== true) {
      dns1Error.value = result;
      next(false);
      return;
    }

    dns1Error.value = null;

    try {
      await saveSettings();
      next();
    } catch (err: unknown) {
      next(false);
      await vhApp.processError(err);
    }
  }
);

// Dns1 Live formatting
watch(dns1, (newVal) => {
  if (!newVal) return;
  const formatted = formatIpInput(newVal);
  if (formatted !== newVal) dns1.value = formatted;
});
// Dns2 Live formatting
watch(dns2, (newVal) => {
  if (!newVal) return;
  const formatted = formatIpInput(newVal);
  if (formatted !== newVal) dns2.value = formatted;
});

</script>

<template>
  <v-sheet>
    <app-bar/>

    <!-- Private DNS card -->
    <config-card @click="router.push({name: 'PRIVATE_DNS'})" class="pa-3">
        <!-- Title, status and premium icon -->
        <div class="d-flex align-center justify-space-between pb-1">

          <!-- Title and status (If available) -->
          <div class="d-flex align-center justify-space-between ga-2">

            <!-- title -->
            <span>{{ locale('PRIVATE_DNS') }}</span>

            <!-- Status -->
            <v-chip
              v-if="vhApp.data.intentFeatures.isSystemPrivateDnsSettingsSupported"
              :text="isPrivateDnsActive ? locale('ON') : locale('OFF')"
              :disabled="!isPrivateDnsActive"
              :color="isPrivateDnsActive ? 'enable-premium' : ''"
              size="small"
              variant="tonal"
              density="comfortable"
            />
          </div>

          <!-- Premium icon for premium features -->
          <premium-icon :is-premium="AppFeature.CustomDns"/>

        </div>

        <!-- Item description (Show chevron icon if the item does not have the model) -->
        <v-card-subtitle class="d-flex align-center justify-space-between ga-3 pa-0">
          {{ locale('PRIVATE_DNS_DESC') }}
          <v-icon :icon="Util.getLocalizedRightChevron()"/>
        </v-card-subtitle>

    </config-card>


    <config-card class="pa-3" >

      <!-- Title, status and premium icon -->
      <div class="d-flex align-center justify-space-between pb-1">
        <!-- Title -->
        <span>{{ locale('ADAPTER_DNS') }}</span>

        <!-- Premium icon for premium features -->
        <premium-icon :is-premium="AppFeature.CustomDns"/>
      </div>

      <v-card-subtitle class="ga-3 pa-0">{{ locale('ADAPTER_DNS_DESC') }}</v-card-subtitle>

      <alert-warning v-if="isPrivateDnsActive" :text="locale('ADAPTER_DNS_DISABLE_ALERT_MSG')" class="my-3" />

      <v-radio-group
        v-model="selectedDnsMode"
        :hide-details="true"
        :disabled="isPrivateDnsActive"
        color="highlight"
        class="my-5"
      >

        <v-radio :value="DnsMode.Default" class="mb-5">
          <template v-slot:label>
            <div class="d-flex flex-column align-start">
              <span>{{ locale("DEFAULT") }}</span>
              <span class="text-disabled text-caption">{{ locale("ADAPTER_DNS_AUTO_DESC") }}</span>
            </div>
          </template>
        </v-radio>

        <v-radio :value="DnsMode.AdapterDns">
          <template v-slot:label>
            <div class="d-flex flex-column align-start">
              <span>{{ locale("CUSTOM") }}</span>
              <span class="text-disabled text-caption">{{ locale("ADAPTER_DNS_CUSTOM_DESC") }}</span>
            </div>
          </template>
        </v-radio>

      </v-radio-group>

      <v-card-item v-if="isAdapterDnsAvailable" :class="{'opacity-50': isPrivateDnsActive}">
        <v-locale-provider :rtl="false">
          <p>DNS 1</p>
          <v-text-field
            v-model="dns1"
            :error="!!dns1Error"
            :error-messages="dns1Error"
            :rules="dns1Rules"
            :disabled="isPrivateDnsActive"
            rounded="lg"
            variant="outlined"
            color="highlight"
            placeholder="8.8.8.8"
            density="compact"
            clearable
          />
          <p class="mt-2">DNS 2</p>
          <v-text-field
            v-model="dns2"
            :rules="dns2Rules"
            :disabled="isPrivateDnsActive"
            rounded="lg"
            variant="outlined"
            color="highlight"
            placeholder="8.8.4.4"
            density="compact"
            clearable
          />
        </v-locale-provider>
      </v-card-item>
    </config-card>

  </v-sheet>
</template>
