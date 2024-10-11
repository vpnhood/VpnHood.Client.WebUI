<template>
  <v-list
      v-if="clientProfileInfo"
      :bg-color="$vpnHoodApp.isConnectApp() ? 'primary-darken-2' : 'gray-lighten-6'"
      :class="[$vpnHoodApp.isConnectApp() ? 'connect-zebra' : 'zebra' ,'py-0']"
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
          $vpnHoodApp.isConnectApp() ? 'border-secondary' : 'border-gray-lighten-3 px-2'
          ,'py-3']"
        :active="isActiveProfile && $vpnHoodApp.isActiveLocation(serverLocationInfo)"
        :color="$vpnHoodApp.isConnectApp() ? 'secondary-lighten-1' : 'secondary'"
        @click="onClickLocation(clientProfileInfo, serverLocationInfo.serverLocation)"
    >
      <v-list-item-title :class="[serverLocationInfo.isNestedCountry ? 'ps-4' : '' ,'d-flex align-center']">

        <!-- Auto select icon -->
        <v-icon
            v-if="$vpnHoodApp.isLocationAutoSelected(serverLocationInfo.countryCode)"
            icon="mdi-earth"
            :color="$vpnHoodApp.isConnectApp() ? 'white' : 'primary-darken-1'"
            :size="$vpnHoodApp.isConnectApp() ? 29 : 27"
            :class="[$vpnHoodApp.isConnectApp() ? 'me-5' : 'me-2']"/>

        <!-- Country flag -->
        <span
            v-else
            :class="[$vpnHoodApp.isConnectApp()
                    ? 'border-secondary me-5'
                    : 'border-gray-lighten-5 me-3'
                    , 'overflow-hidden d-inline-flex align-center justify-center border-md item-flag'
                    , serverLocationInfo.isNestedCountry ? 'nested-item' : '']"
        >
          <img :src="$vpnHoodApp.getCountryFlag(serverLocationInfo.countryCode)" height="100%" alt="country flag"/>
        </span>

        <!-- Country name & State name -->
        <template v-if="!serverLocationInfo.isNestedCountry">

          <!-- Country name -->
          <span>
            {{$vpnHoodApp.isLocationAutoSelected(serverLocationInfo.countryCode)
              ? $t('AUTO_SELECT')
              : serverLocationInfo.countryName }}
          </span>

          <!-- Auto Select only if server has nested item -->
          <span v-if="!$vpnHoodApp.isLocationAutoSelected(serverLocationInfo.countryCode)
                && $vpnHoodApp.isLocationAutoSelected(serverLocationInfo.regionName)"
                :class="[$vpnHoodApp.isConnectApp() ? 'text-secondary' : 'text-primary-darken-1' ,'text-caption ms-2']"
          >
            ({{ $t('AUTO_SELECT') }})
          </span>

          <!-- Recommended only for auto select server -->
          <span v-if="$vpnHoodApp.isLocationAutoSelected(serverLocationInfo.countryCode)"
                :class="[$vpnHoodApp.isActiveLocation(serverLocationInfo) ? '' : 'flasher',
                $vpnHoodApp.isConnectApp() ? 'text-secondary' : 'text-primary-darken-1' ,'text-caption ms-2']"
          >
            ({{ $t('RECOMMENDED') }})
          </span>

        </template>

        <!-- State name for nested items -->
        <span v-else class="text-caption">{{ serverLocationInfo.regionName }}</span>

        <v-spacer/>

        <!-- Status -->
        <v-chip v-if="isActiveProfile && $vpnHoodApp.isActiveLocation(serverLocationInfo)"
                :color="$vpnHoodApp.isConnectApp() ? 'secondary-lighten-2' : 'secondary'" variant="flat" size="x-small"
                :text="$t('ACTIVE')"/>

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
  props: {
    clientProfileInfo: ClientProfileInfo,
    isSingleItem: Boolean,
    isActiveProfile: Boolean,
  },
  emits: [
    "update:clientProfileInfo",
    "update:isSingleItem",
    "update:isActiveProfile",
    "connect"
  ],
  data() {
    return {
      Util,
      AppName,
    }
  },
  methods:{
    onClickLocation(clientProfileInfo: ClientProfileInfo, serverLocation: string): void {
      console.log(clientProfileInfo);
      console.log(serverLocation);
      // If app is VpnHood Client and selected server is single location, do nothing.
      // Because the parent have the connect function.
      if(!this.$vpnHoodApp.isConnectApp() && this.Util.isSingleLocation(clientProfileInfo.serverLocationInfos.length))
        return;

      this.$emit('connect',clientProfileInfo, serverLocation)
    }
  }
})
</script>
<style scoped>
.item-flag {
  width: 27px;
  height: 20px;
  border-radius: 5px;
}

.VpnHoodConnect .item-flag {
  width: 31px;
  height: 24px;
  border-radius: 5px;
}

/*noinspection CssUnusedSymbol*/
.item-flag.nested-item {
  width: 25px;
  height: 18px;
  border-radius: 4px;
}

/*noinspection CssUnusedSymbol*/
/*.VpnHoodConnect .item-flag.nested-item {
  width: 29px;
  height: 22px;
  border-radius: 3px;
}*/
</style>