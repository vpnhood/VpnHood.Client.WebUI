<script setup lang="ts">
import LocationListItems from '@/components/Servers/LocationListItems.vue';
import type { ClientServerLocationInfo } from '@/services/VpnHood.Client.Api';

const componentProps = defineProps<{
  listType: string,
  groupTitle: string,
  clientProfileId: string,
  locationList: ClientServerLocationInfo[],
  isPremiumLocationSelected: boolean
}>();
</script>

<template>
    <config-card>
        <v-list-group :value="componentProps.listType">

          <!-- Group title -->
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              class="server-item-group text-caption"
              base-color="disabled"

            >
              <div class="d-flex align-center ga-3">
                <span>{{ componentProps.groupTitle }}</span>
                <span class="flex-grow-1 border-b border-opacity-25"></span>
              </div>
            </v-list-item>
          </template>

          <!-- Group items -->
          <LocationListItems
            :client-profile-id="componentProps.clientProfileId"
            :locations-list="componentProps.locationList"
            :is-premium-group="componentProps.listType === 'premium'"
            :is-premium-location-selected="componentProps.isPremiumLocationSelected"
          />
        </v-list-group>
    </config-card>
</template>
