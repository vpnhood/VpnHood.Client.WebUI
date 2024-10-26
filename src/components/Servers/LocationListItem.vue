<script setup lang="ts">
import { Util } from '@/services/Util'
import { ClientServerLocationInfo } from '@/services/VpnHood.Client.Api'
import { VpnHoodApp } from '@/services/VpnHoodApp'
import i18n from '@/locales/i18n'

const vhApp = VpnHoodApp.instance;
const $t = i18n.global.t;

const props = defineProps<{
  locationsList: ClientServerLocationInfo[],
  isPremium: boolean,
  isActiveProfile: boolean,
}>();

const emits = defineEmits<{
  (e: 'onClickLocation', serverLocationInfo: string, isDiagnose: boolean): void;
}>();

function isActiveItem(location: ClientServerLocationInfo): boolean{
  if (!props.isActiveProfile)
    return false;
  return vhApp.isActiveLocation(location);
}

</script>

<template>
  <v-list-item
    v-for="(location, index) in props.locationsList"
    :key="index"
    :value="location.serverLocation"
    class="py-3 pe-2"
    :class="[(!Util.isSingleLocation(props.locationsList.length) && index !== (props.locationsList.length - 1) ?
      'border-b' : ''), (vhApp.isConnectApp() ? 'border-secondary' : 'border-gray-lighten-3 px-2')]"
    :active="isActiveItem(location)"
    :color="vhApp.isConnectApp() ? 'secondary-lighten-1' : 'secondary'"
    @click="emits('onClickLocation', location.serverLocation, false)"
  >

    <v-list-item-title class="d-flex align-center text-subtitle-1" :class="[location.isNestedCountry ? 'ps-4' : '']">

      <!-- Fastest item -->
      <template v-if="vhApp.isLocationAutoSelected(location.countryCode)">
        <v-icon
          icon="mdi-lightning-bolt-outline"
          size="35"
          class="me-2"
          :class="{'flasher': !isActiveItem(location)}"
          :color="isActiveItem(location)
            ? ''
            : (vhApp.isConnectApp() ? 'secondary' : 'primary-darken-1')"
        />

        <!-- Title and subtitle -->
        <div class="d-flex align-center ga-1">
          <span>{{ $t('FASTEST') }}</span>
          <span :class="[vhApp.isConnectApp() ? 'text-secondary' : 'text-primary-darken-1' ,'text-caption']">
              ({{ $t('RECOMMENDED') }})
          </span>
        </div>

        <!-- Descriptions -->
      </template>

      <!-- Location items -->
      <template v-else>
        <!-- Country flag -->
        <span
          class="overflow-hidden d-inline-flex align-center justify-center border-md item-flag me-4"
          :class="[
          (vhApp.isConnectApp() ? 'border-secondary' : 'border-gray-lighten-5'),
           (location.isNestedCountry ? 'nested-item' : '')
           ]"
        >
        <img :src="vhApp.getCountryFlag(location.countryCode)" height="100%" alt="country flag"/>
      </span>

        <!-- Country name & State name -->
        <template v-if="!location.isNestedCountry">

          <!-- Country name -->
          <span>{{ location.countryName }}</span>

          <!-- Only if server has nested item -->
          <span
            v-if="vhApp.isLocationAutoSelected(location.regionName)"
            class="text-caption ms-1"
            :class="[vhApp.isConnectApp() ? 'text-secondary' : 'text-primary-darken-1']"
          >
          ({{ $t('AUTO_SELECT') }})
        </span>

        </template>

        <!-- State name for nested items -->
        <span v-else class="text-subtitle-2">{{ location.regionName }}</span>
      </template>

      <v-spacer/>

      <!-- Status -->
      <v-chip
        v-if="isActiveItem(location)"
        :color="vhApp.isConnectApp() ? 'secondary-lighten-2' : 'secondary'"
        variant="flat"
        size="x-small"
        :text="$t('ACTIVE')"
      >
        <template v-slot:append v-if="props.isPremium">
          <v-icon icon="mdi-crown" size="13"/>
        </template>
      </v-chip>

      <v-icon v-else-if="props.isPremium" size="20" icon="mdi-crown" color="tertiary" />

    </v-list-item-title>
  </v-list-item>
</template>

<style scoped>
.item-flag {
  width: 27px;
  height: 20px;
  border-radius: 4px;
}

/*noinspection CssUnusedSymbol*/
.item-flag.nested-item {
  width: 25px;
  height: 18px;
  border-radius: 4px;
}
</style>
