<script setup lang="ts">
import { ClientProfileInfo } from '@/services/VpnHood.Client.Api';
import { VpnHoodApp } from '@/services/VpnHoodApp'
import LocationListItems from '@/components/Servers/LocationListItems.vue'
import i18n from '@/locales/i18n'
import { ref } from 'vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const props = defineProps<{
  clientProfile: ClientProfileInfo
}>();

// Locations categories
const freeLocations = props.clientProfile.serverLocationInfos.filter(x => x.options.hasFree);
const premiumLocations = props.clientProfile.serverLocationInfos.filter(x => x.options.hasPremium);

// Categories open state
const openedListGroups = ref<string[]>([locale('FREE_LOCATIONS'), locale('PREMIUM_LOCATIONS')]);
const listIds: string[] = hasGroup() ? ['freeLocations', 'premiumLocations'] : ['allLocations'];

function hasGroup(): boolean{
  if (freeLocations.length === 0)
    return false;
  return premiumLocations.length > 0;
}

</script>

<template>
  <v-list
    v-for="(id, index) in listIds"
    :key="index"
    :id="id"
    v-model:opened="openedListGroups"
    open-strategy="multiple"
    :bg-color="vhApp.isConnectApp() ? 'primary-darken-2' : 'gray-lighten-6'"
    class="py-0"
    :class="[vhApp.isConnectApp() ? '' : 'zebra']"
    :style="vhApp.isConnectApp() ? '' : 'border-radius: 14px;'"
  >

    <!-- Categorised locations -->
    <template v-if="hasGroup()">

      <v-list-group
        :value="index === 0 ? locale('FREE_LOCATIONS') : locale('PREMIUM_LOCATIONS')"
        class="text-start"
        :class="{'mb-5': (index === 0 && openedListGroups.find(x => x === locale('FREE_LOCATIONS')))}"
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
              <span>{{ index === 0 ? locale('FREE_LOCATIONS') : locale('PREMIUM_LOCATIONS') }}</span>
              <span class="flex-grow-1 border-b-thin border-gray-lighten-1 border-opacity-25"></span>
            </div>
          </v-list-item>
        </template>

        <!-- Group items -->
        <LocationListItems
          :client-profile-id="props.clientProfile.clientProfileId"
          :locations-list="index === 0 ? freeLocations : premiumLocations"
          :is-premium-group="index!==0"
          :is-premium-location-selected="props.clientProfile.isPremiumLocationSelected ?? false"
        />
      </v-list-group>

    </template>

    <!-- If the locations does not have both the Free and Premium category -->
    <LocationListItems v-else
      :client-profile-id="props.clientProfile.clientProfileId"
      :locations-list="props.clientProfile.serverLocationInfos"
      :is-premium-group="false"
      :is-premium-location-selected="false"
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
