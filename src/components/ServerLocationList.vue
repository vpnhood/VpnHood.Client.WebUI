<template>
  <v-list
      v-if="clientProfileInfo"
      :bg-color="$vpnHoodApp.isConnectApp() ? 'primary-darken-2' : 'gray-lighten-6'"
      :class="[$vpnHoodApp.isConnectApp() ? 'connect-zebra' : 'zebra' ,'py-0 mt-n2 mx-n2']"
      :style="$vpnHoodApp.isConnectApp() && isSingleItem ? '' : 'border-radius: 14px;'"
  >
    <!-- Region item -->
    <v-list-item
        v-for="(serverLocationInfo, index) in clientProfileInfo.serverLocationInfos"
        :key="index"
        :value="serverLocationInfo.serverLocation"
        :class="
          [!Util.isSingleLocation(clientProfileInfo.serverLocationInfos.length)
          && index !== (clientProfileInfo.serverLocationInfos.length - 1)
          ? 'border-b'
          : '',
          $vpnHoodApp.isConnectApp() ? 'border-secondary' : 'border-gray-lighten-3'
          ,'py-3']"
        :active="$vpnHoodApp.isActiveServer(serverLocationInfo.serverLocation)"
        :color="$vpnHoodApp.isConnectApp() ? 'secondary-lighten-1' : 'secondary'"
        @click="$emit('connect',clientProfileInfo.clientProfileId, serverLocationInfo.serverLocation)"
    >
      <v-list-item-title :class="[serverLocationInfo.isNestedCountry ? 'ps-3' : '' ,'d-flex align-center']">

        <!-- Auto select icon -->
        <v-icon v-if="$vpnHoodApp.isLocationAutoSelected(serverLocationInfo.countryCode)" icon="mdi-earth" :color="$vpnHoodApp.isConnectApp() ? 'white' : 'primary-darken-1'" size="27" class="me-2"></v-icon>

        <!-- Country flag -->
        <span
            v-else
            class="overflow-hidden d-inline-flex align-center justify-center me-2"
            :style="[serverLocationInfo.isNestedCountry
                    ? 'width: 21px; height: 15px'
                    : 'width: 23px; height: 17px;'
                    , 'border-radius: 3px;']"
        >
                  <img :src="$vpnHoodApp.getCountryFlag(serverLocationInfo.countryCode)" height="100%" alt="country flag"/>
                </span>

        <!-- Country name -->
        <span class="text-caption">
                  {{ $vpnHoodApp.isLocationAutoSelected(serverLocationInfo.countryCode) ? $t('AUTO_SELECT') : serverLocationInfo.countryName }}
                </span>

        <!-- State name -->
        <span
            v-if="!$vpnHoodApp.isLocationAutoSelected(serverLocationInfo.countryCode) && serverLocationInfo.regionName"
            :class="[$vpnHoodApp.isConnectApp() ? 'text-secondary' : 'text-primary-darken-1' ,'text-caption ms-2']"
        >
                  ({{ $vpnHoodApp.isLocationAutoSelected(serverLocationInfo.regionName) ? $t('AUTO_SELECT') : serverLocationInfo.regionName }})
                </span>
        <v-spacer/>

        <!-- Status -->
        <v-chip v-if="$vpnHoodApp.isActiveServer(serverLocationInfo.serverLocation)" :color="$vpnHoodApp.isConnectApp() ? 'secondary-lighten-2' : 'secondary'" variant="flat" size="x-small" :text="$t('ACTIVE')"/>

      </v-list-item-title>
    </v-list-item>

  </v-list>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {AppName} from "@/UiConstants";
import {ClientProfileInfo} from "@/services/VpnHood.Client.Api";
import {Util} from "@/services/Util";

export default defineComponent({
  name: "ServerLocationList",
  props: {
    clientProfileInfo: ClientProfileInfo,
    isSingleItem: Boolean,
  },
  emits: [
    "update:clientProfileInfo",
    "update:isSingleItem",
    "connect"
  ],
  data() {
    return {
      Util,
      AppName,
    }
  },
})
</script>