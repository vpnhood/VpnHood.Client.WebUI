<script setup lang="ts">
import { Util } from '@/helper/Util'
import { VpnHoodApp } from '@/services/VpnHoodApp'
import { ClientProfileInfo, ClientProfileUpdateParams, PatchOfString } from '@/services/VpnHood.Client.Api';
import { onMounted, ref } from 'vue';
import { ComponentRouteController } from '@/services/ComponentRouteController'
import AddServerDialog from '@/components/Servers/AddServerDialog.vue'
import { ComponentName } from '@/helper/UiConstants';
import i18n from '@/locales/i18n'
import LocationList from '@/components/Servers/LocationList.vue'
import { ConnectManager } from '@/helper/ConnectManager';
import router from '@/services/router';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;
const maximumLocationOnCollapsed: number = 14;

const currentClientProfileInfo = ref<ClientProfileInfo>(new ClientProfileInfo());
const newClientProfileName = ref<string>("");
const expandedPanels = ref<number[]>([]);

onMounted(() => {
  // Create open state if client profile is active or has single location
  expandedPanels.value = vhApp.data.clientProfileInfos.map(x => {
     return vhApp.isActiveClientProfile(x.clientProfileId) || Util.isSingleLocation(x.serverLocationInfos.length) ? 0 : 1
  });
});


// Show confirm dialog for delete server
async function showConfirmDeleteDialog(clientProfileInfo: ClientProfileInfo): Promise<void> {
  currentClientProfileInfo.value = clientProfileInfo;
  await ComponentRouteController.showComponent(ComponentName.ConfirmDeleteServerDialog);
}

// Delete server by user
async function removeServer(clientProfileId: string): Promise<void> {
  await ComponentRouteController.showComponent(ComponentName.ConfirmDeleteServerDialog, false);
  await vhApp.deleteClientProfile(clientProfileId);
}

// Show rename server dialog
async function showRenameDialog(clientProfileInfo: ClientProfileInfo): Promise<void> {
  currentClientProfileInfo.value = clientProfileInfo;
  newClientProfileName.value = clientProfileInfo.clientProfileName;
  await ComponentRouteController.showComponent(ComponentName.RenameServerDialog);
}

// Rename server by user
async function saveNewClientProfileName(): Promise<void> {
  await ComponentRouteController.showComponent(ComponentName.RenameServerDialog, false);
  await vhApp.updateClientProfile(currentClientProfileInfo.value.clientProfileId, new
    ClientProfileUpdateParams({
    clientProfileName: new PatchOfString({ value: newClientProfileName.value })
    })
  );
}
</script>

<template>
  <v-expansion-panels
    v-for="(clientProfileInfo, index) in vhApp.data.clientProfileInfos"
    :key="index"
    v-model="expandedPanels[index]"
    flat
    rounded="xl"
    bg-color="white"
    class="mb-4"
  >
    <v-expansion-panel
      :readonly="Util.isSingleLocation(clientProfileInfo.serverLocationInfos.length)"
      hide-actions
      class="text-primary-darken-1 pa-4"
    >

      <!-- Country flag on collapse state -->
      <div v-if="!Util.isSingleLocation(clientProfileInfo.serverLocationInfos.length)
            && Util.isCollapsed(expandedPanels[index])"
        class="d-flex align-center bg-gray-lighten-6 py-3 px-2 text-start"
        style="border-radius: 14px;"
        @click="expandedPanels[index] = 0"
      >
        <template v-for="(serverLocationInfo, index) in clientProfileInfo.serverLocationInfos">
            <span
              v-if="!serverLocationInfo.isNestedCountry
                && !vhApp.isLocationAutoSelected(serverLocationInfo.countryCode)
                && index <= maximumLocationOnCollapsed"
              :key="index"
              class="rounded-circle overflow-hidden d-inline-flex align-center justify-center border me-n2 elevation-2"
              style="width: 23px; height: 23px;"
            >
              <!-- Auto select icon -->
              <v-icon v-if="vhApp.isLocationAutoSelected(serverLocationInfo.countryCode)" icon="mdi-earth"
                      color="primary-darken-1" size="27"></v-icon>

              <!-- Country flag -->
              <img v-else :src="vhApp.getCountryFlag(serverLocationInfo.countryCode)" height="100%"
                   alt="country flag"/>
            </span>
        </template>
        <span v-if="Util.calcLocationCount(clientProfileInfo) > maximumLocationOnCollapsed"
              class="text-caption text-lowercase ps-3">
            +{{ Util.calcLocationCount(clientProfileInfo) - maximumLocationOnCollapsed }}
          </span>
      </div>

      <!-- Profile title row -->
      <template v-slot:title>
        <v-row class="align-center">

          <!-- Radio button -->
          <v-col cols="auto py-0">
            <div
              :class="[vhApp.isActiveClientProfile(clientProfileInfo.clientProfileId)
                ? 'border-secondary'
                : 'border-gray-lighten-4'
                , 'd-flex align-center justify-center border border-opacity-100 rounded-circle text-secondary']"
              style="width: 25px; height: 25px; border-width: 3px !important;"
            >
              <!-- Check icon if is active client profile -->
              <v-icon v-if="vhApp.isActiveClientProfile(clientProfileInfo.clientProfileId)"
                      icon="mdi-check-bold" size="15"/>
            </div>
          </v-col>

          <!-- Profile name -->
          <v-col class="px-0 py-0 text-truncate limited-width-to-truncate">
            <h4 class="text-primary-darken-1 text-truncate text-capitalize">
              {{ clientProfileInfo.clientProfileName }}
            </h4>
          </v-col>

          <!-- Menu button and Expand/Collapse button -->
          <v-col cols="auto" class="py-0">
            <!-- Menu button -->
            <v-btn :icon="true" density="compact" variant="plain" color="gray-lighten-3">
              <v-icon>mdi-dots-vertical</v-icon>
              <v-menu activator="parent">
                <!-- Menu items -->
                <v-list>

                  <!-- Rename item -->
                  <v-list-item
                    v-if="clientProfileInfo.clientProfileId !== vhApp.data.features.builtInClientProfileId"
                    :title="locale('RENAME')" prepend-icon="mdi-pencil" @click="showRenameDialog(clientProfileInfo)"/>
                  <v-divider
                    v-if="clientProfileInfo.clientProfileId !== vhApp.data.features.builtInClientProfileId"/>

                  <!-- Diagnose item -->
                  <v-list-item
                    :title="locale('DIAGNOSE')"
                    :disabled="!vhApp.data.state.canDiagnose"
                    prepend-icon="mdi-speedometer"
                    @click="ConnectManager.connect2(clientProfileInfo.clientProfileId, true)">
                  </v-list-item>
                  <v-divider v-if="vhApp.data.features.isAddAccessKeySupported"/>

                  <!-- Delete item -->
                  <v-list-item v-if="vhApp.data.features.isAddAccessKeySupported" :title="locale('REMOVE')"
                               prepend-icon="mdi-delete" @click="showConfirmDeleteDialog(clientProfileInfo)"/>
                </v-list>
              </v-menu>
            </v-btn>

            <!-- Expand/Collapse button -->
            <template v-if="!Util.isSingleLocation(clientProfileInfo.serverLocationInfos.length)">
              <v-icon v-if="expandedPanels[index] === 0" size="28" icon="mdi-minus-circle-outline" />
              <v-icon v-else icon="mdi-plus-circle-outline" size="28" />
            </template>
          </v-col>

        </v-row>
      </template>

      <!-- Profile region -->
      <template v-slot:text v-if="Util.isServerHaveLocation(clientProfileInfo.serverLocationInfos)">
        <LocationList
          :client-profile-id="clientProfileInfo.clientProfileId"
          :server-location-infos="clientProfileInfo.serverLocationInfos"
        />
      </template>

      <!-- Support id &  -->
      <div class="d-flex align-center justify-space-between text-gray-lighten-3 text-caption px-1 mt-2">
        <span>SID:{{ clientProfileInfo.supportId }}</span>
        <span>{{ clientProfileInfo.hostNames[0] }}</span>
      </div>
    </v-expansion-panel>
  </v-expansion-panels>

  <!-- Add server dialog -->
  <AddServerDialog
    v-model="ComponentRouteController.create(ComponentName.AddServerDialog).isShow"
    @new-access-key-added="router.replace('/')">
  </AddServerDialog>

  <!-- Rename dialog -->
  <v-dialog v-model="ComponentRouteController.create(ComponentName.RenameServerDialog).isShow" max-width="600">
    <v-card :title="locale('RENAME')">

      <v-card-text>
        <!-- Name text field -->
        <v-text-field
          v-model="newClientProfileName"
          spellcheck="false"
          autocomplete="off"
          color="primary"
          :hint="locale('SAVE_EMPTY_TO_DISPLAY_DEFAULT_NAME')"
          persistent-hint
          :clearable="true">
        </v-text-field>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>

        <!-- Cancel rename button -->
        <v-btn
          color="primary"
          variant="text"
          :text="locale('CANCEL')"
          @click="ComponentRouteController.showComponent(ComponentName.RenameServerDialog, false)"
        />

        <!-- Save rename button -->
        <v-btn
          color="primary"
          variant="text"
          :text="locale('SAVE')"
          @click="saveNewClientProfileName"
        />

      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Confirm delete server dialog -->
  <v-dialog v-model="ComponentRouteController.create(ComponentName.ConfirmDeleteServerDialog).isShow"
            max-width="600">
    <v-card>

      <v-card-title class="text-on-warning bg-warning">{{ locale('WARNING') }}</v-card-title>

      <v-card-text>
        <p class="color-muted">{{ locale("CONFIRM_REMOVE_SERVER") }}</p>
        <strong>{{ currentClientProfileInfo.clientProfileName }}</strong>
      </v-card-text>

      <!-- Dialog buttons -->
      <v-card-actions class="d-flex justify-space-around mt-4 mb-3">

        <!-- Confirm delete button -->
        <v-btn
          variant="text"
          :text="locale('YES')"
          @click="removeServer(currentClientProfileInfo.clientProfileId)"
        />

        <!-- Cancel delete button -->
        <v-btn
          variant="tonal"
          :text="locale('NO')"
          @click="ComponentRouteController.showComponent(ComponentName.ConfirmDeleteServerDialog, false)"
        />

      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<style>
/*noinspection CssUnusedSymbol*/
.v-expansion-panel-title__overlay{
  display: none !important;
}
</style>
