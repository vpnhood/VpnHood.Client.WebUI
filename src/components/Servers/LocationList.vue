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
    v-model:opened="openedListGroupsModel"
    open-strategy="multiple"
    bg-color="background"
    :class="{'rounded-lg': !vhApp.isConnectApp()}"
  >
    <!-- Categorised locations -->
    <template v-if="listHasGroup()">
      <config-card v-for="(listType, index) in locationLists" :key="index">
        <v-card-item class="py-0">
          <v-list-group :value="listType">
            <!-- Group title -->
            <template v-slot:activator="{ props }">
              <v-list-item
                v-bind="props"
                class="server-item-group text-caption px-0"
                base-color="disabled"
                :ripple="false"
              >
                <div class="d-flex align-center ga-3">
                  <span>{{ listType === locationListType.Free ? locale('FREE_LOCATIONS') : locale('PREMIUM_LOCATIONS') }}</span>
                  <span class="flex-grow-1 border-b border-opacity-25"></span>
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
        </v-card-item>
      </config-card>
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
.v-list-group__items .v-list-item{
  padding-inline-start: 7px !important;
}
</style>
