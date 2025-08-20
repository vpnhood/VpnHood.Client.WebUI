<script setup lang="ts">
import { ClientProfileInfo } from '@/services/VpnHood.Client.Api';
import { VpnHoodApp } from '@/services/VpnHoodApp'
import LocationListItems from '@/components/Servers/LocationListItems.vue'
import i18n from '@/locales/i18n'
import { ref } from 'vue';
import LocationGroup from '@/components/Servers/LocationGroup.vue';

enum locationListType{
  Free = "free",
  Premium = "premium"
}

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const props = defineProps<{
  clientProfile: ClientProfileInfo
}>();

// Locations groups
const freeLocations = props.clientProfile.locationInfos.filter(x => x.options.hasFree);
const premiumLocations = props.clientProfile.locationInfos.filter(x => x.options.hasPremium);

// Group open state
const openedListGroupsModel = ref<string[]>([locationListType.Free, locationListType.Premium]);

function listHasGroup(): boolean{
  if (freeLocations.length === 0)
    return false;
  return premiumLocations.length > 0;
}

</script>

<template>

  <v-list
    v-model:opened="openedListGroupsModel"
    open-strategy="multiple"
    bg-color="transparent"
    :class="{'rounded-lg': !vhApp.isConnectApp()}"
  >
    <!-- Categorised locations -->
    <template v-if="listHasGroup()">

      <!-- Free locations group -->
      <location-group
        v-if="!vhApp.isPremiumAccount()"
        :list-type="locationListType.Free"
        :group-title="locale('FREE_LOCATIONS')"
        :client-profile-id="props.clientProfile.clientProfileId"
        :location-list="freeLocations"
        :is-premium-location-selected="props.clientProfile.isPremiumLocationSelected ?? false"
      />

      <!-- Premium locations group -->
      <location-group
        :list-type="locationListType.Premium"
        :group-title="locale('PREMIUM_LOCATIONS')"
        :client-profile-id="props.clientProfile.clientProfileId"
        :location-list="premiumLocations"
        :is-premium-location-selected="props.clientProfile.isPremiumLocationSelected ?? false"
      />

    </template>


    <!-- If the locations does not have both the Free and Premium category -->
    <config-card v-else>
      <LocationListItems
        :client-profile-id="props.clientProfile.clientProfileId"
        :locations-list="props.clientProfile.locationInfos"
        :is-premium-group="premiumLocations.length > 0"
        :is-premium-location-selected="props.clientProfile.isPremiumLocationSelected ?? false"
      />
    </config-card>

  </v-list>

</template>

<!--suppress CssUnusedSymbol -->
<style>
.server-item-group>.v-list-item__overlay{display: none;}
.server-item-group .v-list-item__append > .v-icon ~ .v-list-item__spacer{
  width: 10px;
}
</style>
