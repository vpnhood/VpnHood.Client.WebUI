<script setup lang="ts">
import { ClientProfileInfo } from '@/services/VpnHood.Client.Api'
import { VpnHoodApp } from '@/services/VpnHoodApp'
import i18n from '@/locales/i18n'
import { Util } from '@/services/Util'

const VhApp = VpnHoodApp.instance;
const $t = i18n.global.t;

const props = defineProps<{
  clientProfileInfo: ClientProfileInfo,
  isSingleItem: boolean,
  isActiveProfile: boolean,
}>();

const emits = defineEmits<{
  (e: "clientProfileInfo", value: ClientProfileInfo): void;
  (e: "isSingleItem", value: boolean): void;
  (e: "isActiveProfile", value: boolean): void;
  (e: 'connect', clientProfileInfo: ClientProfileInfo, serverLocationInfo?: string, isDiagnose?: boolean): void;
}>();

function onClickLocation(clientProfileInfo: ClientProfileInfo, serverLocation: string): void {
  console.log(clientProfileInfo);
  console.log(serverLocation);
  // If app is VpnHood Client and selected server is single location, do nothing.
  // Because the parent have the connect function.
  if(Util.isSingleLocation(clientProfileInfo.serverLocationInfos.length))
    return;

  emits('connect',clientProfileInfo, serverLocation);
}
</script>

<template>
  <v-list
    v-if="props.clientProfileInfo"
    bg-color="gray-lighten-6"
    class="zebra py-0"
    :style="props.isSingleItem ? '' : 'border-radius: 14px;'"
  >
    <!-- Region item -->
    <v-list-item
      v-for="(serverLocationInfo, index) in props.clientProfileInfo.serverLocationInfos"
      :key="index"
      :value="serverLocationInfo.serverLocation"
      :class="
          [!Util.isSingleLocation(clientProfileInfo.serverLocationInfos.length)
          && index !== (clientProfileInfo.serverLocationInfos.length - 1)
          ? 'border-b'
          : '',
          'border-gray-lighten-3 px-2 py-3 pe-2']"
      :active="props.isActiveProfile && VhApp.isActiveLocation(serverLocationInfo)"
      :disabled = "serverLocationInfo.serverLocationAccess?.premiumByPurchase"
      color="secondary"
      @click="onClickLocation(props.clientProfileInfo, serverLocationInfo.serverLocation)"
    >
      <v-list-item-title :class="[serverLocationInfo.isNestedCountry ? 'ps-4' : '' ,'d-flex align-center text-body-1']">

        <!-- Auto select icon -->
        <v-icon
          v-if="VhApp.isLocationAutoSelected(serverLocationInfo.countryCode)"
          icon="mdi-lightning-bolt-outline"
          :color="(props.isActiveProfile && VhApp.isActiveLocation(serverLocationInfo)) ? 'secondary' :
          'primary-darken-1'"
          size="27"
          class="me-2"
        />

        <!-- Country flag -->
        <span
          v-else
          class="border-gray-lighten-5 me-3 overflow-hidden d-inline-flex align-center justify-center border-md item-flag"
          :class="[serverLocationInfo.isNestedCountry ? 'nested-item' : '']"
        >
          <img :src="VhApp.getCountryFlag(serverLocationInfo.countryCode)" height="100%" alt="country flag"/>
        </span>

        <!-- Country name & State name -->
        <template v-if="!serverLocationInfo.isNestedCountry">

          <!-- Country name only for auto select server -->
          <div v-if="VhApp.isLocationAutoSelected(serverLocationInfo.countryCode)" class="d-flex flex-column align-start">
            <span>{{ $t('FASTEST') }}</span>
            <span class="text-primary-darken-1 text-caption">{{ $t('RECOMMENDED') }}</span>
          </div>

          <!-- Country name -->
          <span v-else>{{ serverLocationInfo.countryName }}</span>


          <!-- Fastest info -->
          <v-btn
            v-if="VhApp.isLocationAutoSelected(serverLocationInfo.countryCode)"
            icon="mdi-information"
            size="30"
            flat
            variant="plain"
            color="gray-lighten-1"
            class="ms-4 text-caption"
          />

          <!-- Auto Select only if server has nested item -->
          <span v-if="!VhApp.isLocationAutoSelected(serverLocationInfo.countryCode)
                && VhApp.isLocationAutoSelected(serverLocationInfo.regionName)"
                class="text-primary-darken-1 text-caption ms-2"
          >
            ({{ $t('AUTO_SELECT') }})
          </span>
        </template>

        <!-- State name for nested items -->
        <span v-else class="text-caption">{{ serverLocationInfo.regionName }}</span>
        <v-spacer/>

        <!-- Status -->
        <v-chip
          v-if="props.isActiveProfile && VhApp.isActiveLocation(serverLocationInfo)"
          color="secondary"
          variant="flat" size="x-small"
          :text="$t('ACTIVE')"
        />

      </v-list-item-title>
    </v-list-item>
  </v-list>
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
