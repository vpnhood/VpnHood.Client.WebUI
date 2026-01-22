<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import router from '@/services/router';
import { Util } from '@/helpers/Util';
import { computed } from 'vue';
import CountryFlagWrapper from '@/components/CountryFlagWrapper.vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;
const currentServerCountryCode = computed((): string | undefined => vhApp.getCurrentServerLocationInfo()?.countryCode)
const isShowCountryFlag = computed((): boolean => {
  return currentServerCountryCode.value !== undefined && !vhApp.data.isLocationAutoSelected(currentServerCountryCode.value);
});
function getActiveServerNameOrLocation(): string {
  // App is VpnHoodClient
  if (!vhApp.isSingleServerMode() && !vhApp.isConnectApp())
    return (vhApp.data.state.clientProfile?.clientProfileName ?? i18n.global.t('NO_SERVER_SELECTED'));

  // App is VpnHoodCONNECT
  const serverLocationInfo = vhApp.getCurrentServerLocationInfo();

  if (!serverLocationInfo || vhApp.data.isLocationAutoSelected(serverLocationInfo.countryCode))
    return i18n.global.t('AUTO_SELECT');

  const text = vhApp.data.isLocationAutoSelected(serverLocationInfo.regionName)
    ? serverLocationInfo.countryName
    : serverLocationInfo.countryName + ' (' + serverLocationInfo.regionName + ')';

  return text.replace('United States (', 'USA (');
}

function buttonClickHandler(){
  // The server does not have a list, and only one country is available
  if (!vhApp.data.features.isAddAccessKeySupported && vhApp.data.clientProfileInfos.length < 2
    && vhApp.data.clientProfileInfos[0].locationInfos.length < 2){
    vhApp.showErrorMessage(locale('NO_ADDITIONAL_LOCATION_AVAILABLE'));
    return;
  }

  router.push({ name: 'SERVERS' });
}
</script>

<template>
  <home-config-btn
    id="serverButton"
    prepend-icon="mdi-earth"
    tabindex="5"
    class="align-center mb-1"
    @click="buttonClickHandler()"
  >
    <span class="config-btn-title" tabindex="-1">
      {{ vhApp.isSingleServerMode() ? locale('LOCATION') : locale('SERVER') }}
    </span>
    <v-icon :icon="Util.getLocalizedRightChevron()" />
    <span class="config-btn-value text-white text-capitalize text-caption text-truncate limited-width-to-truncate opacity-50">
      {{ getActiveServerNameOrLocation() }}
    </span>

    <template v-slot:append>
      <!-- Country flag -->
      <country-flag-wrapper v-if="isShowCountryFlag" :country-code="currentServerCountryCode" />

      <!-- Auto server -->
      <v-chip
        v-else
        :text="locale('AUTO')"
        color="white"
        variant="tonal"
        size="small"
        density="compact"
        class="text-capitalize opacity-50 px-2"
        tabindex="-1"
      />
    </template>

  </home-config-btn>
</template>
