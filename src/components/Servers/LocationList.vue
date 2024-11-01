<script setup lang="ts">
import { ClientProfileInfo, ClientServerLocationInfo } from '@/services/VpnHood.Client.Api';
import { VpnHoodApp } from '@/services/VpnHoodApp'
import { Util } from '@/services/Util'
import LocationListItem from '@/components/Servers/LocationListItem.vue'
import i18n from '@/locales/i18n'
import { ref } from 'vue'

const vhApp = VpnHoodApp.instance;
const $t = i18n.global.t;

const props = defineProps<{
  clientProfileInfo: ClientProfileInfo,
}>();

const emits = defineEmits<{
  (e: 'connect', clientProfileInfo: ClientProfileInfo, serverLocationInfo: ClientServerLocationInfo | null,
   isPremium: boolean, isDiagnose: boolean): void;
}>();

const isActiveClientProfile = vhApp.isActiveClientProfile(props.clientProfileInfo.clientProfileId);

// Locations categories
const freeLocations = props.clientProfileInfo.serverLocationInfos.filter(x => x.options.hasFree);
const premiumLocations = props.clientProfileInfo.serverLocationInfos.filter(x => x.options.hasPremium);

// Categories open state
const openedListGroups = ref<string[]>([$t('FREE_LOCATIONS'), $t('PREMIUM_LOCATIONS')]);
const listIds: string[] = hasGroup() ? ['freeLocations', 'premiumLocations'] : ['allLocations'];

async function onClickLocation(serverLocationInfo: ClientServerLocationInfo, isPremium: boolean, isDiagnose: boolean):
  Promise<void> {
  // If app is VpnHood Client and selected server is single location, do nothing.
  // Because the parent have the connect function.
  if(Util.isSingleLocation(props.clientProfileInfo.serverLocationInfos.length))
    return;

  // Call the parent component function
  emits('connect', props.clientProfileInfo, serverLocationInfo, isPremium, isDiagnose);
}

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
    :bg-color="vhApp.isConnectApp() ? 'primary-darken-2' : 'gray-lighten-6'"
    class="py-0"
    :class="[vhApp.isConnectApp() ? '' : 'zebra']"
    :style="vhApp.isConnectApp() ? '' : 'border-radius: 14px;'"
  >

    <!-- Categorised locations -->
    <template v-if="hasGroup()">

      <v-list-group
        :value="index === 0 ? $t('FREE_LOCATIONS') : $t('PREMIUM_LOCATIONS')"
        class="text-start"
        :class="{'mb-5': (index === 0 && openedListGroups.find(x => x === $t('FREE_LOCATIONS')))}"
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
              <span>{{index === 0 ? $t('FREE_LOCATIONS') : $t('PREMIUM_LOCATIONS')}}</span>
              <span class="flex-grow-1 border-b-thin border-gray-lighten-1 border-opacity-25"></span>
            </div>
          </v-list-item>
        </template>

        <!-- Group items -->
        <LocationListItem
          :locations-list="index === 0 ? freeLocations : premiumLocations"
          :is-active-profile="isActiveClientProfile"
          :is-premium="index!==0"
          :has-group="true"
          @on-click-location="onClickLocation"
        />
      </v-list-group>

    </template>

    <!-- If the locations does not have both the Free and Premium category -->
    <LocationListItem v-else
      :locations-list="props.clientProfileInfo.serverLocationInfos"
      :is-active-profile="isActiveClientProfile"
      :is-premium="false"
      :has-group = "false"
      @on-click-location="onClickLocation"
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
