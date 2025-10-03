<script setup lang="ts">
import { Util } from '@/helpers/Util'
import { VpnHoodApp } from '@/services/VpnHoodApp'
import {
  ApiException,
  ClientProfileInfo,
  ClientProfileUpdateParams,
  PatchOfString,
  PatchOfStringOf
} from '@/services/VpnHood.Client.Api';
import { onMounted, ref } from 'vue';
import { ComponentRouteController } from '@/services/ComponentRouteController'
import { ComponentName } from '@/helpers/UiConstants';
import i18n from '@/locales/i18n'
import LocationList from '@/components/Servers/LocationList.vue'
import { ConnectManager } from '@/helpers/ConnectManager';
import ExpansionPanelCollapsed from '@/components/Servers/ExpansionPanelCollapsed.vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const currentClientProfileInfo = ref<ClientProfileInfo>(new ClientProfileInfo());
const newClientProfileName = ref<string>("");
const expandedPanels = ref<number[]>([]);
const customEndpoint = ref<string | null>(null);
const invalidIpError = ref<string | null>(null);

onMounted(() => {
  // Create open state if client profile is active or has a single location
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

// Show endpoint dialog
async function showEndpointDialog(clientProfileInfo: ClientProfileInfo): Promise<void> {
  currentClientProfileInfo.value = clientProfileInfo;
  const endpoint = clientProfileInfo.customServerEndpoints;
  customEndpoint.value = (endpoint && endpoint.length > 0) ? endpoint[0] : null;
  await ComponentRouteController.showComponent(ComponentName.CustomEndpoint);
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

// Change client profile custom endpoint
async function saveCustomEndpoint(): Promise<void> {
  try {
    const endpointValue = customEndpoint.value?.trim();
    const newEndpoint = endpointValue ? [endpointValue] : null;
    const params = new ClientProfileUpdateParams({
      customServerEndpoints: new PatchOfStringOf({ value: newEndpoint })
    });
    await vhApp.updateClientProfile(currentClientProfileInfo.value.clientProfileId, params);
    await closeCustomEndpointDialog();
  }
  catch(err: unknown){
    if (err instanceof ApiException) {
      invalidIpError.value = err.message;
      return;
    }
    invalidIpError.value = locale('CUSTOM_ENDPOINT_VALIDATION_ERROR');
  }
}

async function closeCustomEndpointDialog(): Promise<void> {
  await ComponentRouteController.showComponent(ComponentName.CustomEndpoint, false);
}

function expansionPanelClick(clientProfileInfo: ClientProfileInfo): void{
  if (!Util.isSingleLocation(clientProfileInfo.locationInfos.length))
    return;
  ConnectManager.connect2(clientProfileInfo.clientProfileId, false);
}
</script>

<template>
  <v-expansion-panels
    v-for="(clientProfileInfo, index) in vhApp.data.clientProfileInfos"
    :key="index"
    v-model="expandedPanels[index]"
    flat
    rounded="xl"
    bg-color="config-card-bg"
    class="mb-4"
  >
    <v-expansion-panel
      :readonly="Util.isSingleLocation(clientProfileInfo.locationInfos.length)"
      hide-actions
      class="py-4"
      @click="expansionPanelClick(clientProfileInfo)"
    >

      <!-- Country flag on collapse state -->
      <expansion-panel-collapsed
        v-if="!Util.isSingleLocation(clientProfileInfo.locationInfos.length) && expandedPanels[index] !== 0"
        @click="expandedPanels[index] = 0"
        :client-profile-info="clientProfileInfo"
      />

      <!-- Profile title row -->
      <template v-slot:title>
        <v-row class="align-center mx-0">

          <!-- Radio button -->
          <v-col cols="auto">
              <!-- Active -->
              <v-icon
                v-if="vhApp.isActiveClientProfile(clientProfileInfo.clientProfileId)"
                icon="mdi-check-circle-outline"
                size="28"
                color="active-profile-radio"
              />

              <!-- Inactive -->
              <v-icon
                v-else
                icon="mdi-circle-outline"
                size="28"
                color="inactive-profile-radio"
                opacity=".6"
              />
          </v-col>

          <!-- Profile name -->
          <v-col class="px-0 text-truncate limited-width-to-truncate">
            <h4
              class="text-truncate text-capitalize"
              :class="{'opacity-60': !vhApp.isActiveClientProfile(clientProfileInfo.clientProfileId)}"
            >
              {{ clientProfileInfo.clientProfileName }}
            </h4>
          </v-col>

          <!-- Menu button -->
          <v-col cols="auto">
            <v-btn :icon="true" density="compact" variant="plain">
              <v-icon>mdi-dots-vertical</v-icon>
              <v-menu activator="parent">
                <!-- Menu items -->
                <v-list>

                  <!-- Rename item -->
                  <v-list-item
                    v-if="clientProfileInfo.clientProfileId !== vhApp.data.features.builtInClientProfileId"
                    :title="locale('RENAME')" prepend-icon="mdi-pencil"
                    @click="showRenameDialog(clientProfileInfo)"
                  />
                  <v-divider v-if="clientProfileInfo.clientProfileId !== vhApp.data.features.builtInClientProfileId"/>

                  <!-- Diagnose item -->
                  <v-list-item
                    :title="locale('DIAGNOSE')"
                    :disabled="!vhApp.data.state.canDiagnose"
                    prepend-icon="mdi-speedometer"
                    @click="ConnectManager.connect2(clientProfileInfo.clientProfileId, true)"
                  />
                  <v-divider v-if="vhApp.data.features.isAddAccessKeySupported"/>

                  <!-- Custom endpoint -->
                  <v-list-item
                    :title="locale('CUSTOM_ENDPOINT')"
                    prepend-icon="mdi-ip-outline"
                    @click="showEndpointDialog(clientProfileInfo)"
                  />
                  <v-divider />

                  <!-- Delete item -->
                  <v-list-item v-if="vhApp.data.features.isAddAccessKeySupported"
                               :title="locale('REMOVE')"
                               prepend-icon="mdi-delete"
                               @click="showConfirmDeleteDialog(clientProfileInfo)"
                  />
                </v-list>
              </v-menu>
            </v-btn>
          </v-col>

          <!-- Expand/Collapse button -->
          <v-col v-if="!Util.isSingleLocation(clientProfileInfo.locationInfos.length)" cols="auto" class="ps-0">
              <v-icon v-if="expandedPanels[index] === 0" size="27" opacity=".6" icon="mdi-minus-circle-outline" />
              <v-icon v-else icon="mdi-plus-circle-outline" opacity=".6" size="27" />
          </v-col>

        </v-row>
      </template>

      <!-- Countries list -->
      <template v-slot:text>
        <LocationList :client-profile="clientProfileInfo"/>
      </template>

      <!-- Support id &  -->
      <div class="d-flex align-center justify-space-between text-disabled text-caption px-4 mt-2">
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

        <!-- Cancel button -->
        <v-btn
          :text="locale('CANCEL')"
          @click="ComponentRouteController.showComponent(ComponentName.RenameServerDialog, false)"
        />

        <!-- Save button -->
        <v-btn :text="locale('SAVE')" @click="saveNewClientProfileName" variant="plain"/>

      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Endpoint dialog -->
  <v-dialog v-model="ComponentRouteController.create(ComponentName.CustomEndpoint).isShow" max-width="600">
    <v-card :title="locale('CUSTOM_ENDPOINT')" color="general-dialog">

      <v-card-text class="text-general-dialog-text">
        <!-- IP text field -->
        <v-locale-provider :rtl="false">
          <v-text-field
            v-model="customEndpoint"
            :error-messages="invalidIpError"
            :placeholder="locale('CUSTOM_ENDPOINT_PLACE_HOLDER')"
            spellcheck="false"
            autocomplete="off"
            color="highlight"
            :clearable="true">
          </v-text-field>
        </v-locale-provider>

        <p class="text-caption mb-2">{{locale('CUSTOM_ENDPOINT_DESC')}}</p>
        <div class="d-flex flex-wrap ga-2">
          <v-chip
            density="compact"
            color="sample-ip-filter-bg"
            size="small"
            class="px-1 border border-opacity-25 text-sample-ip-filter-text"
            style="border-radius: 3px; letter-spacing: 1px;"
            variant="flat"
            text="IPv4: 192.0.2.1:443"
          />
          <v-chip
            density="compact"
            color="sample-ip-filter-bg"
            size="small"
            class="px-1 border border-opacity-25 text-sample-ip-filter-text"
            style="border-radius: 3px; letter-spacing: 1px;"
            variant="flat"
            text="IPv6: [2001:db8::1]:443"
          />
        </div>
      </v-card-text>

      <v-card-actions>

        <!-- Cancel button -->
        <v-btn :text="locale('CANCEL')" @click="closeCustomEndpointDialog()" />

        <!-- Save button -->
        <v-btn :text="locale('SAVE')" @click="saveCustomEndpoint()"/>

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
