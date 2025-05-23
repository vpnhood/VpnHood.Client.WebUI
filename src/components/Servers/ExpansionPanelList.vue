<script setup lang="ts">
import { Util } from '@/helpers/Util'
import { VpnHoodApp } from '@/services/VpnHoodApp'
import { ClientProfileInfo, ClientProfileUpdateParams, PatchOfString } from '@/services/VpnHood.Client.Api';
import { onMounted, ref } from 'vue';
import { ComponentRouteController } from '@/services/ComponentRouteController'
import { ComponentName } from '@/helpers/UiConstants';
import i18n from '@/locales/i18n'
import LocationList from '@/components/Servers/LocationList.vue'
import { ConnectManager } from '@/helpers/ConnectManager';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;
const maximumLocationOnCollapsed: number = 8;

const currentClientProfileInfo = ref<ClientProfileInfo>(new ClientProfileInfo());
const newClientProfileName = ref<string>("");
const expandedPanels = ref<number[]>([]);

onMounted(() => {
  // Create open state if client profile is active or has single location
  expandedPanels.value = vhApp.data.clientProfileInfos.map(x => {
     return vhApp.isActiveClientProfile(x.clientProfileId) || Util.isSingleLocation(x.locationInfos.length) ?
       0 : 1
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
    bg-color="expansion-panels"
    class="mb-4"
  >
    <v-expansion-panel
      :readonly="Util.isSingleLocation(clientProfileInfo.locationInfos.length)"
      hide-actions
      class="pa-4"
      @click="Util.isSingleLocation(clientProfileInfo.locationInfos.length) ?
      ConnectManager.connect2(clientProfileInfo.clientProfileId, false) : ''"
    >

      <!-- Country flag on collapse state -->
      <div v-if="!Util.isSingleLocation(clientProfileInfo.locationInfos.length)
            && expandedPanels[index] !== 0"
        class="d-flex align-center bg-expansion-panels-servers-list py-3 px-2 text-start rounded-lg"
        @click="expandedPanels[index] = 0"
      >
        <template v-for="(serverLocationInfo, index) in clientProfileInfo.locationInfos">
            <span
              v-if="!serverLocationInfo.isNestedCountry
                && !Util.isLocationAutoSelected(serverLocationInfo.countryCode)
                && index <= maximumLocationOnCollapsed"
              :key="index"
              class="rounded-circle overflow-hidden d-inline-flex align-center me-1 justify-center border"
              style="width: 25px; height: 25px;"
            >
              <!-- Auto select icon -->
              <v-icon v-if="Util.isLocationAutoSelected(serverLocationInfo.countryCode)" icon="mdi-earth"
                      color="fastest-server" size="27"></v-icon>

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
                ? 'border-active-profile-radio'
                : 'border-inactive-profile-radio'
                , 'd-flex align-center justify-center border border-opacity-100 rounded-circle text-active-profile-radio']"
              style="width: 25px; height: 25px; border-width: 3px !important;"
            >
              <!-- Check icon if is active client profile -->
              <v-icon v-if="vhApp.isActiveClientProfile(clientProfileInfo.clientProfileId)"
                      icon="mdi-check-bold" size="15"/>
            </div>
          </v-col>

          <!-- Profile name -->
          <v-col class="px-0 py-0 text-truncate limited-width-to-truncate">
            <h4 class="text-truncate text-capitalize">
              {{ clientProfileInfo.clientProfileName }}
            </h4>
          </v-col>

          <!-- Menu button and Expand/Collapse button -->
          <v-col cols="auto" class="py-0">
            <!-- Menu button -->
            <v-btn :icon="true" density="compact" variant="plain" color="profile-menu-btn">
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
            <template v-if="!Util.isSingleLocation(clientProfileInfo.locationInfos.length)">
              <v-icon v-if="expandedPanels[index] === 0" size="28" icon="mdi-minus-circle-outline" />
              <v-icon v-else icon="mdi-plus-circle-outline" size="28" />
            </template>
          </v-col>

        </v-row>
      </template>

      <!-- Profile region -->
      <template v-slot:text>
        <LocationList :client-profile="clientProfileInfo"/>
      </template>

      <!-- Support id &  -->
      <div class="d-flex align-center justify-space-between text-disabled text-caption px-1 mt-2">
        <span>SID:{{ clientProfileInfo.supportId }}</span>
        <span>{{ clientProfileInfo.hostNames[0] }}</span>
      </div>
    </v-expansion-panel>
  </v-expansion-panels>

  <!-- Rename dialog -->
  <v-dialog v-model="ComponentRouteController.create(ComponentName.RenameServerDialog).isShow" max-width="600">
    <v-card :title="locale('RENAME')" color="general-dialog">

      <v-card-text class="text-general-dialog-text">
        <!-- Name text field -->
        <v-text-field
          v-model="newClientProfileName"
          spellcheck="false"
          autocomplete="off"
          color="highlight"
          :hint="locale('SAVE_EMPTY_TO_DISPLAY_DEFAULT_NAME')"
          persistent-hint
          :clearable="true">
        </v-text-field>
      </v-card-text>

      <v-card-actions>

        <!-- Cancel rename button -->
        <v-btn
          :text="locale('CANCEL')"
          @click="ComponentRouteController.showComponent(ComponentName.RenameServerDialog, false)"
        />

        <!-- Save rename button -->
        <v-btn :text="locale('SAVE')" @click="saveNewClientProfileName" variant="plain"/>

      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Confirm delete server dialog -->
  <v-dialog v-model="ComponentRouteController.create(ComponentName.ConfirmDeleteServerDialog).isShow">
    <v-card color="general-dialog" :title="locale('WARNING')">

      <v-card-text class="text-general-dialog-text">
        <p class="text-caption mb-3">{{ locale("CONFIRM_REMOVE_SERVER") }}</p>
        <strong>{{ currentClientProfileInfo.clientProfileName }}</strong>
      </v-card-text>

      <!-- Dialog buttons -->
      <v-card-actions>

        <!-- Cancel delete button -->
        <v-btn :text="locale('NO')"
          @click="ComponentRouteController.showComponent(ComponentName.ConfirmDeleteServerDialog, false)"
        />

        <!-- Confirm delete button -->
        <v-btn :text="locale('YES')" @click="removeServer(currentClientProfileInfo.clientProfileId)" variant="plain"/>

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
