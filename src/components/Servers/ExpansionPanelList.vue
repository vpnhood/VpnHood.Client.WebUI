<script setup lang="ts">
import { Util } from '@/services/Util'
import { VpnHoodApp } from '@/services/VpnHoodApp'
import {
  ClientProfileInfo,
  ClientProfileUpdateParams,
  ClientServerLocationInfo,
  PatchOfString
} from '@/services/VpnHood.Client.Api';
import { ref } from 'vue'
import { ComponentRouteController } from '@/services/ComponentRouteController'
import AddServerDialog from '@/components/Servers/AddServerDialog.vue'
import { ComponentName, ServerLocationGroup } from '@/UiConstants';
import i18n from '@/locales/i18n'
import LocationList from '@/components/Servers/LocationList.vue'

const VhApp = VpnHoodApp.instance;
const $t = i18n.global.t;
const maximumLocationOnCollapsed: number = 9;

const props = defineProps<{
  expandedPanels: number[];
}>();

const emits = defineEmits<{
  (e: 'connect', clientProfileInfo: ClientProfileInfo, serverLocationInfo: ClientServerLocationInfo | null,
   group: ServerLocationGroup | null, isDiagnose: boolean): void;
}>();

const currentClientProfileInfo = ref<ClientProfileInfo>(new ClientProfileInfo());
const newClientProfileName = ref<string>("");
const localExpandedPanels = ref([...props.expandedPanels]);

// Show confirm dialog for delete server
async function showConfirmDeleteDialog(clientProfileInfo: ClientProfileInfo): Promise<void> {
  currentClientProfileInfo.value = clientProfileInfo;
  await ComponentRouteController.showComponent(ComponentName.ConfirmDeleteServerDialog);
}

// Delete server by user
async function removeServer(clientProfileId: string): Promise<void> {
  await ComponentRouteController.showComponent(ComponentName.ConfirmDeleteServerDialog, false);
  await VhApp.deleteClientProfile(clientProfileId);
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
  await VhApp.updateClientProfile(currentClientProfileInfo.value.clientProfileId, new
    ClientProfileUpdateParams(
      { clientProfileName: new PatchOfString({ value: newClientProfileName.value }
        )
      })
  );
}

function connect(clientProfileInfo: ClientProfileInfo, serverLocationInfo: ClientServerLocationInfo | null,
                 group: ServerLocationGroup | null, isDiagnose: boolean): void {
  emits('connect', clientProfileInfo, serverLocationInfo, group, isDiagnose);
}
</script>

<template>
  <v-expansion-panels
    v-for="(clientProfileInfo, index) in VhApp.data.clientProfileInfos"
    :key="index"
    v-model="localExpandedPanels[index]"
    flat
    rounded="xl"
    bg-color="white"
    class="mb-4"
    @click="connect(clientProfileInfo, null, null, false)"
  >
    <v-expansion-panel
      :readonly="Util.isSingleLocation(clientProfileInfo.serverLocationInfos.length)"
      hide-actions
      class="text-primary-darken-1 pa-4"
    >

      <!-- Country flag on collapse state -->
      <div v-if="!Util.isSingleLocation(clientProfileInfo.serverLocationInfos.length)
            && Util.isCollapsed(localExpandedPanels[index])"
        class="d-flex align-center bg-gray-lighten-6 py-3 px-2 text-start text-truncate"
        style="border-radius: 14px; max-width: 311px;"
        @click="localExpandedPanels[index] = 0"
      >
        <template v-for="(serverLocationInfo, index) in clientProfileInfo.serverLocationInfos">
            <span
              v-if="!serverLocationInfo.isNestedCountry
                && !VhApp.isLocationAutoSelected(serverLocationInfo.countryCode)
                && index <= maximumLocationOnCollapsed"
              :key="index"
              class="rounded-circle overflow-hidden d-inline-flex align-center justify-center border me-2"
              style="width: 23px; height: 23px;"
            >
              <!-- Auto select icon -->
              <v-icon v-if="VhApp.isLocationAutoSelected(serverLocationInfo.countryCode)" icon="mdi-earth"
                      color="primary-darken-1" size="27"></v-icon>

              <!-- Country flag -->
              <img v-else :src="VhApp.getCountryFlag(serverLocationInfo.countryCode)" height="100%"
                   alt="country flag"/>
            </span>
        </template>
        <span v-if="Util.calcLocationCount(clientProfileInfo) > maximumLocationOnCollapsed"
              class="text-caption text-lowercase">
            +{{ Util.calcLocationCount(clientProfileInfo) - maximumLocationOnCollapsed }}
          </span>
      </div>

      <!-- Profile title row -->
      <template v-slot:title>
        <v-row class="align-center">

          <!-- Radio button -->
          <v-col cols="auto py-0">
            <div
              :class="[VhApp.isActiveClientProfile(clientProfileInfo.clientProfileId)
                ? 'border-secondary'
                : 'border-gray-lighten-4'
                , 'd-flex align-center justify-center border border-opacity-100 rounded-circle text-secondary']"
              style="width: 25px; height: 25px; border-width: 3px !important;"
            >
              <!-- Check icon if is active client profile -->
              <v-icon v-if="VhApp.isActiveClientProfile(clientProfileInfo.clientProfileId)"
                      icon="mdi-check-bold" size="15"/>
            </div>
          </v-col>

          <!-- Profile name -->
          <v-col class="px-0 py-0">
            <h4 class="text-primary-darken-1 text-truncate text-capitalize" style="max-width: 190px;">
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
                    v-if="clientProfileInfo.clientProfileId !== VhApp.data.features.builtInClientProfileId"
                    :title="$t('RENAME')" prepend-icon="mdi-pencil" @click="showRenameDialog(clientProfileInfo)"/>
                  <v-divider
                    v-if="clientProfileInfo.clientProfileId !== VhApp.data.features.builtInClientProfileId"/>

                  <!-- Diagnose item -->
                  <v-list-item
                    :title="$t('DIAGNOSE')"
                    :disabled="!VhApp.data.state.canDiagnose"
                    prepend-icon="mdi-speedometer"
                    @click="connect(clientProfileInfo, null, null,true)">
                  </v-list-item>
                  <v-divider v-if="VhApp.data.features.isAddAccessKeySupported"/>

                  <!-- Delete item -->
                  <v-list-item v-if="VhApp.data.features.isAddAccessKeySupported" :title="$t('REMOVE')"
                               prepend-icon="mdi-delete" @click="showConfirmDeleteDialog(clientProfileInfo)"/>

                </v-list>
              </v-menu>
            </v-btn>

            <!-- Expand/Collapse button -->
            <template v-if="!Util.isSingleLocation(clientProfileInfo.serverLocationInfos.length)">
              <v-icon v-if="localExpandedPanels[index] === 0" size="28" icon="mdi-minus-circle-outline" />
              <v-icon v-else icon="mdi-plus-circle-outline" size="28" />
            </template>
          </v-col>

        </v-row>
      </template>

      <!-- Profile region -->
      <template v-slot:text v-if="Util.isServerHaveLocation(clientProfileInfo.serverLocationInfos)">
        <LocationList
          :client-profile-info="clientProfileInfo"
          @connect="connect"
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
    v-model="ComponentRouteController.create($componentName.AddServerDialog).isShow"
    @new-access-key-added="$router.replace('/')">
  </AddServerDialog>

  <!-- Rename dialog -->
  <v-dialog v-model="ComponentRouteController.create($componentName.RenameServerDialog).isShow" max-width="600">
    <v-card :title="$t('RENAME')">

      <v-card-text>
        <!-- Name text field -->
        <v-text-field
          v-model="newClientProfileName"
          spellcheck="false"
          autocomplete="off"
          color="primary"
          :hint="$t('SAVE_EMPTY_TO_DISPLAY_DEFAULT_NAME')"
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
          :text="$t('CANCEL')"
          @click="ComponentRouteController.showComponent($componentName.RenameServerDialog, false)"
        />

        <!-- Save rename button -->
        <v-btn
          color="primary"
          variant="text"
          :text="$t('SAVE')"
          @click="saveNewClientProfileName"
        />

      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Confirm delete server dialog -->
  <v-dialog v-model="ComponentRouteController.create($componentName.ConfirmDeleteServerDialog).isShow"
            max-width="600">
    <v-card>

      <v-card-title class="text-on-warning bg-warning">{{ $t('WARNING') }}</v-card-title>

      <v-card-text>
        <p class="color-muted">{{ $t("CONFIRM_REMOVE_SERVER") }}</p>
        <strong>{{ currentClientProfileInfo.clientProfileName }}</strong>
      </v-card-text>

      <!-- Dialog buttons -->
      <v-card-actions class="d-flex justify-space-around mt-4 mb-3">

        <!-- Confirm delete button -->
        <v-btn
          variant="text"
          :text="$t('YES')"
          @click="removeServer(currentClientProfileInfo.clientProfileId)"
        />

        <!-- Cancel delete button -->
        <v-btn
          variant="tonal"
          :text="$t('NO')"
          @click="ComponentRouteController.showComponent($componentName.ConfirmDeleteServerDialog, false)"
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
