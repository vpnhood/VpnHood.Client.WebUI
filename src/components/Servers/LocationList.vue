<script setup lang="ts">
import { ClientProfileInfo } from '@/services/VpnHood.Client.Api';
import { VpnHoodApp } from '@/services/VpnHoodApp'
import LocationListItems from '@/components/Servers/LocationListItems.vue'
import i18n from '@/locales/i18n'
import { ref } from 'vue';

enum locationListType{
  Free = "free",
  Premium = "premium",
  All = "all"
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

// Location list array
const locationLists: string[] = listHasGroup() ? [locationListType.Free, locationListType.Premium] : [locationListType.All];

function listHasGroup(): boolean{
  if (freeLocations.length === 0)
    return false;
  return premiumLocations.length > 0;
}

</script>

<template>
  <v-list
    v-for="(listType, index) in locationLists"
    :key="index"
    :id="listType"
    v-model:opened="openedListGroupsModel"
    open-strategy="multiple"
    :bg-color="vhApp.isConnectApp() ? 'primary-darken-2' : 'gray-lighten-6'"
    class="py-0"
    :class="[vhApp.isConnectApp() ? '' : 'zebra']"
    :style="vhApp.isConnectApp() ? '' : 'border-radius: 14px;'"
  >

    <!-- Categorised locations -->
    <template v-if="listHasGroup()">

      <v-list-group
        :value="listType"
        class="text-start"
        :class="{'mb-5': (listType === locationListType.Free && openedListGroupsModel.find(x => x === locationListType.Free))}"
      >
        <!-- Group title -->
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            class="server-item-group text-caption"
            base-color="gray-lighten-1"
            :ripple="false"
          >
            <div class="d-flex align-center ga-3">
              <span>{{ listType === locationListType.Free ? locale('FREE_LOCATIONS') : locale('PREMIUM_LOCATIONS') }}</span>
              <span class="flex-grow-1 border-b-thin border-gray-lighten-1 border-opacity-25"></span>
            </div>
          </v-list-item>
        </template>

        <!-- Group items -->
        <LocationListItems
          :client-profile-id="props.clientProfile.clientProfileId"
          :locations-list="listType === locationListType.Free ? freeLocations : premiumLocations"
          :is-premium-group="listType === locationListType.Premium"
          :is-premium-location-selected="props.clientProfile.isPremiumLocationSelected ?? false"
        />
      </v-list-group>

    </template>

    <!-- If the locations does not have both the Free and Premium category -->
    <LocationListItems v-else
      :client-profile-id="props.clientProfile.clientProfileId"
      :locations-list="props.clientProfile.locationInfos"
      :is-premium-group="premiumLocations.length > 0"
      :is-premium-location-selected="props.clientProfile.isPremiumLocationSelected ?? false"
    />

  </v-list>
</template>

<!--suppress CssUnusedSymbol -->
<style>
.server-item-group>.v-list-item__overlay{display: none;}
.server-item-group .v-list-item__content{margin-right: -25px;}
.v-list-group__items .v-list-item{
  padding-inline-start: 7px !important;
  margin: 0 15px;
}
</style>
