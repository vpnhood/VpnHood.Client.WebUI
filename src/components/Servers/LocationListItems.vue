<script setup lang="ts">
import { Util } from '@/helpers/Util'
import { ClientServerLocationInfo } from '@/services/VpnHood.Client.Api';
import { VpnHoodApp } from '@/services/VpnHoodApp'
import i18n from '@/locales/i18n'
import { ConnectManager } from '@/helpers/ConnectManager';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const props = defineProps<{
  clientProfileId: string,
  locationsList: ClientServerLocationInfo[],
  isPremiumGroup: boolean,
  isPremiumLocationSelected: boolean,
}>();

function internalConnect(location: ClientServerLocationInfo): void {
  if (!vhApp.isConnectApp() && Util.isSingleLocation(props.locationsList.length))
    return;

  // User is currently connected to the selected location
  if (vhApp.data.isConnected && isActiveItem(location)){
    vhApp.showGeneralSnackbar(i18n.global.t('ALREADY_CONNECTED_TO_LOCATION'), "active");
    return;
  }
  ConnectManager.connect3(props.clientProfileId, location.serverLocation, props.isPremiumGroup, false);
}
function isActiveItem(location: ClientServerLocationInfo): boolean{
  // This situation happened in the Client app
  if (!vhApp.isActiveClientProfile(props.clientProfileId))
    return false;

  // Check premium items
  if (props.isPremiumLocationSelected){
    return (location.serverLocation === vhApp.data.state.clientProfile?.selectedLocationInfo?.serverLocation &&
        props.isPremiumGroup)
      ?? (location.isDefault && props.isPremiumGroup);
  }

  // Check free items
  return (location.serverLocation === vhApp.data.state.clientProfile?.selectedLocationInfo?.serverLocation &&
      !props.isPremiumGroup) ??
    (location.isDefault && !props.isPremiumGroup );
}
</script>

<template>
  <v-list-item
    v-for="(location, index) in props.locationsList"
    :key="index"
    tabindex="0"
    :value="isPremiumGroup ? 'premium_'+location.serverLocation : 'free_'+location.serverLocation"
    class="pa-2"
    :class="{'border-b': !Util.isSingleLocation(props.locationsList.length) && index !== (props.locationsList.length - 1)}"
    :active="isActiveItem(location)"
    color="active-server"
    @click="internalConnect(location)"
  >

    <v-list-item-title
      class="d-flex align-center justify-space-between text-subtitle-2"
      :class="{'ps-4': location.isNestedCountry}"
    >

      <!------------------------------- Location flag ------------------------------->
        <!---- Fastest icon ---->
        <v-icon
          v-if="Util.isLocationAutoSelected(location.countryCode)"
          icon="mdi-lightning-bolt-outline"
          size="31"
          :color="!isActiveItem(location) ? 'fastest-server' : ''"
        />

        <!-- Country flag -->
        <span v-else
          class="overflow-hidden d-inline-flex align-center justify-center item-flag me-2"
          :class="{'nested-item': location.isNestedCountry}"
        >
          <img :src="vhApp.getCountryFlag(location.countryCode)" height="100%" alt="country flag"/>
        </span>
      <!---------------------------- End of location flag ---------------------------->

      <!------------------------------- Location name -------------------------------->
        <div :class="[{'text-caption': location.isNestedCountry},'text-truncate flex-1-1-0']">

          <!---- Fastest name ---->
          <template v-if="Util.isLocationAutoSelected(location.countryCode)" >
            <span>{{ locale('FASTEST') }}</span>
            <span class="flasher text-disabled text-caption ms-1">({{ locale('RECOMMENDED') }})</span>
          </template>

          <!---- Country name ---->
          <span v-else >
            {{ location.isNestedCountry ? location.regionName : location.countryName }}
          </span>

        </div>
      <!------------------------------ End of location name ---------------------------->

      <!------------------------------- Location status -------------------------------->
      <div class="d-flex align-center text-no-wrap ga-1">

        <!---- Active location badge ---->
        <v-chip v-if="isActiveItem(location)"
                color="active-server-chip"
                variant="flat"
                :text="locale('ACTIVE')"
                size="x-small"
                tabindex="-1"
        />

        <!---- Unblockable location icon ---->
        <v-icon v-if="location.options.hasUnblockable" icon="mdi-sword-cross" size="16"
                :color="vhApp.premiumIconColor()" />

        <!---- Premium location icon ---->
        <premium-icon v-if="props.isPremiumGroup" :color="vhApp.premiumIconColor()" />
      </div>
      <!---------------------------- End of location status ---------------------------->

    </v-list-item-title>
  </v-list-item>
</template>

<!--suppress CssUnusedSymbol -->
<style scoped>
.item-flag {
  width: 24px;
  height: 16px;
  border-radius: 2px;
}
.item-flag.nested-item {
  width: 22px;
  height: 14px;
}
</style>
