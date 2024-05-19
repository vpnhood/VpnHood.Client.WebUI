<template>

  <!-- Page header -->
  <AppBar :page-title="$t('SERVERS')"/>

  <v-sheet color="gray-lighten-6" class="text-center pa-4">

    <!-- Add server button -->
    <v-btn
        v-if="$vpnHoodApp.data.features.isAddAccessKeySupported"
        variant="flat"
        color="white"
        class="text-primary-darken-1 mt-1 mb-5 text-capitalize"
        rounded="pill"
        :text="$t('ADD_SERVER')"
        @click="ComponentRouteController.showComponent($componentName.AddServerDialog)"
    >
      <template v-slot:prepend>
        <v-icon icon="mdi-plus-circle" size="30"/>
      </template>
    </v-btn>

    <!-- Show alert, if user does not have any server -->
    <div v-if="$vpnHoodApp.data.clientProfileInfos.length === 0">
      <v-alert
          :text="$t('NO_SERVER_AVAILABLE')"
          density="compact"
          type="warning"
          class="mb-4"
      />
      <div
          v-html="$t('GET_SERVER_KEY_METHODS_DESC')"
          class="get-server-key-alert pa-4 text-subtitle-2"
      ></div>
    </div>


    <!-- Server items -->
    <v-expansion-panels
        v-else
        v-for="(clientProfileInfo, index) in $vpnHoodApp.data.clientProfileInfos"
        :key="index"
        v-model="expandedPanels[index]"
        flat
        :ripple="isSingleLocation(clientProfileInfo.serverLocationInfos.length)"
        rounded="xl"
        bg-color="white"
        class="myExpansionPanel mb-4"
        @click="isSingleLocation(clientProfileInfo.serverLocationInfos.length) ? connect(clientProfileInfo.clientProfileId,'') : '';"
    >
      <v-expansion-panel
          :readonly="isSingleLocation(clientProfileInfo.serverLocationInfos.length)"
          hide-actions
          class="text-primary-darken-1"
      >

        <!-- Country flag on collapse state -->
        <div
            v-if="!isSingleLocation(clientProfileInfo.serverLocationInfos.length) && isCollapsed(expandedPanels[index])"
            class="d-flex align-center bg-gray-lighten-6 mx-4 mb-4 pt-3 pb-2 px-4 text-start text-truncate"
            style="border-radius: 14px; max-width: 311px;"
            @click="expandedPanels[index] = 0"
        >
          <template v-for="(serverLocationInfo, index) in clientProfileInfo.serverLocationInfos">
            <span
                v-if="!serverLocationInfo.isNestedCountry
                && !isAutoSelect(serverLocationInfo.countryCode)
                && index <= maximumLocationOnCollapsed"
                :key="index"
                class="rounded-circle overflow-hidden d-inline-flex align-center justify-center border me-2"
                style="width: 23px; height: 23px;"
            >
              <!-- Auto select icon -->
              <v-icon v-if="isAutoSelect(serverLocationInfo.countryCode)" icon="mdi-earth" color="primary-darken-1" size="27"></v-icon>

                <!-- Country flag -->
              <img v-else  :src="$vpnHoodApp.getCountryFlag(serverLocationInfo.countryCode)" height="100%" alt="country flag"/>
            </span>
          </template>
          <span v-if="calcLocationCount(clientProfileInfo) > maximumLocationOnCollapsed" class="text-caption text-lowercase">
            +{{calcLocationCount(clientProfileInfo) - maximumLocationOnCollapsed}}
          </span>
        </div>

        <!-- Profile title row -->
        <template v-slot:title>
          <v-row class="align-center">

            <!-- Radio button -->
            <v-col cols="auto py-0 ps-1">
              <div
                :class="[isActiveClientProfile(clientProfileInfo.clientProfileId)
                ? 'border-secondary'
                : 'border-gray-lighten-4'
                , 'd-flex align-center justify-center border border-opacity-100 rounded-circle text-secondary']"
                style="width: 25px; height: 25px; border-width: 3px !important;"
              >
                <!-- Check icon if is active client profile -->
                <v-icon v-if="isActiveClientProfile(clientProfileInfo.clientProfileId)" icon="mdi-check-bold" size="15"/>
              </div>
            </v-col>

            <!-- Profile name and support id-->
            <v-col class="px-0 py-0">

              <!-- Profile name -->
              <h4 class="text-primary-darken-1 text-truncate" style="max-width: 245px;">
                {{ clientProfileInfo.clientProfileName }}
              </h4>

              <!-- Support id -->
              <p class="text-gray-lighten-3 text-caption opacity-100">SID:{{ clientProfileInfo.supportId }}</p>

            </v-col>

            <!-- Menu button -->
            <v-col cols="auto" class="px-0 py-0">

              <!-- Menu button -->
              <v-btn :icon="true" density="compact" variant="plain" color="gray-lighten-3">
                <v-icon>mdi-dots-vertical</v-icon>
                <v-menu activator="parent">
                  <!-- Menu items -->
                  <v-list>

                    <!-- Rename item -->
                    <v-list-item v-if="clientProfileInfo.tokenId !== $vpnHoodApp.data.features.builtInClientProfileId"
                                 :title="$t('RENAME')" prepend-icon="mdi-pencil" @click="showRenameDialog(clientProfileInfo)"/>
                    <v-divider v-if="clientProfileInfo.tokenId !== $vpnHoodApp.data.features.builtInClientProfileId"/>

                    <!-- Diagnose item -->
                    <v-list-item
                        :title="$t('DIAGNOSE')"
                        :disabled="!$vpnHoodApp.data.state.canDiagnose"
                        prepend-icon="mdi-speedometer"
                        @click="connect(clientProfileInfo.clientProfileId, '', true)">
                    </v-list-item>
                    <v-divider v-if="$vpnHoodApp.data.features.isAddAccessKeySupported"/>

                    <!-- Delete item -->
                    <v-list-item v-if="$vpnHoodApp.data.features.isAddAccessKeySupported" :title="$t('REMOVE')"
                                 prepend-icon="mdi-delete" @click="showConfirmDeleteDialog(clientProfileInfo)"/>

                  </v-list>
                </v-menu>
              </v-btn>

            </v-col>

          </v-row>
        </template>

        <!-- Profile region -->
        <template v-slot:text v-if="clientProfileInfo.serverLocationInfos.length > 0">
          <v-list
              bg-color="gray-lighten-6"
              class="py-0 mt-n2 mx-n2 zebra"
              style="border-radius: 14px;"
          >
            <!-- Region item -->
            <v-list-item
                v-for="(serverLocationInfo, index) in clientProfileInfo.serverLocationInfos"
                :key="index"
                :value="serverLocationInfo.serverLocation"
                :class="[!isSingleLocation(clientProfileInfo.serverLocationInfos.length) && index !== (clientProfileInfo.serverLocationInfos.length - 1)
                ? 'border-b border-gray-lighten-3' : '','py-3']"
                :active="isActiveServer(serverLocationInfo.serverLocation)"
                color="secondary"
                @click="connect(clientProfileInfo.clientProfileId, serverLocationInfo.serverLocation)"
            >
              <v-list-item-title :class="[serverLocationInfo.isNestedCountry ? 'ps-3' : '' ,'d-flex align-center']">

                <!-- Auto select icon -->
                <v-icon v-if="isAutoSelect(serverLocationInfo.countryCode)" icon="mdi-earth" color="primary-darken-1" size="27" class="me-2"></v-icon>

                <!-- Country flag -->
                <span
                    v-else
                    class="overflow-hidden d-inline-flex align-center justify-center me-2"
                    :style="[serverLocationInfo.isNestedCountry
                    ? 'width: 21px; height: 15px'
                    : 'width: 23px; height: 17px;'
                    , 'border-radius: 3px;']"
                >
                  <img :src="$vpnHoodApp.getCountryFlag(serverLocationInfo.countryCode)" height="100%" alt="country flag"/>
                </span>

                <!-- Country name -->
                <span class="text-caption">
                  {{ isAutoSelect(serverLocationInfo.countryCode) ? $t('AUTO_SELECT') : serverLocationInfo.countryName}}
                </span>

                <!-- State name -->
                <span
                    v-if="!isAutoSelect(serverLocationInfo.countryCode) && serverLocationInfo.regionName"
                    class="text-caption text-primary-darken-1 ms-2"
                >
                  ({{isAutoSelect(serverLocationInfo.regionName) ? $t('AUTO_SELECT') : serverLocationInfo.regionName}})
                </span>
                <v-spacer/>

                <!-- Status -->
                <v-chip v-if="isActiveServer(serverLocationInfo.serverLocation)" color="secondary" variant="flat" size="x-small" :text="$t('ACTIVE')"/>

              </v-list-item-title>
            </v-list-item>

          </v-list>
        </template>

      </v-expansion-panel>
    </v-expansion-panels>


    <!-- Add server sheet -->
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
              v-model="currentClientProfileInfo.clientProfileName"
              spellcheck="false"
              autocomplete="off"
              color="primary"
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
              @click="saveNewClientProfileName(currentClientProfileInfo)"
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
  </v-sheet>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import AddServerDialog from "@/components/AddServerDialog.vue";
import {
  ClientProfileInfo,
  ClientProfileUpdateParams,
  PatchOfString
} from "@/services/VpnHood.Client.Api";
import {ComponentRouteController} from "@/services/ComponentRouteController";
import {AppName} from "@/UiConstants";
import AppBar from "@/components/AppBar.vue";

export default defineComponent({
  name: 'ServersPage',
  components: {AppBar, AddServerDialog},
  props: {
    modelValue: Boolean,
  },
  emits: [
    "update:modelValue",
  ],
  data() {
    return {
      AppName,
      ComponentRouteController,
      currentClientProfileInfo: {} as ClientProfileInfo,
      expandedPanels: [] as number[],
      maximumLocationOnCollapsed: 8,
    }
  },

  created() {
    this.expandedPanels = this.$vpnHoodApp.data.clientProfileInfos.map(() => 0);
  },
  methods: {
    async connect(clientProfileId: string, serverLocationInfo: string, isDiagnose: boolean = false): Promise<void> {
      this.$router.replace('/');
      this.$vpnHoodApp.data.settings.userSettings.clientProfileId = clientProfileId;
      this.$vpnHoodApp.data.settings.userSettings.serverLocation = serverLocationInfo === "" ? null : serverLocationInfo;
      await this.$vpnHoodApp.saveUserSetting();
      isDiagnose ? await this.$vpnHoodApp.diagnose() : await this.$vpnHoodApp.connect();
    },

    // Show confirm dialog for delete server
    async showConfirmDeleteDialog(clientProfileInfo: ClientProfileInfo): Promise<void> {
      this.currentClientProfileInfo = clientProfileInfo;
      await ComponentRouteController.showComponent(this.$componentName.ConfirmDeleteServerDialog);
    },

    // Delete server by user
    async removeServer(clientProfileId: string): Promise<void> {
      await ComponentRouteController.showComponent(this.$componentName.ConfirmDeleteServerDialog, false);
      await this.$vpnHoodApp.deleteClientProfile(clientProfileId);
    },

    // Show rename server dialog
    async showRenameDialog(clientProfileInfo: ClientProfileInfo): Promise<void> {
      this.currentClientProfileInfo = clientProfileInfo;
      await ComponentRouteController.showComponent(this.$componentName.RenameServerDialog);
    },

    // Rename server by user
    async saveNewClientProfileName(renamedClientProfile: ClientProfileInfo): Promise<void> {
      await ComponentRouteController.showComponent(this.$componentName.RenameServerDialog, false);
      await this.$vpnHoodApp.updateClientProfile(
          renamedClientProfile.clientProfileId,
          new ClientProfileUpdateParams({
            clientProfileName: new PatchOfString({
              value: this.currentClientProfileInfo.clientProfileName
            })
          })
      );
    },
    isActiveClientProfile(clientProfileId: string): boolean {
      return clientProfileId === this.$vpnHoodApp.data.settings.userSettings.clientProfileId;
    },
    isActiveServer(serverLocation: string): boolean {
      return serverLocation === this.$vpnHoodApp.data.settings.userSettings.serverLocation;
    },
    isAutoSelect(countryCode: string): boolean {
      return countryCode === '*';
    },
    isSingleLocation(locationCount: number): boolean {
      return locationCount < 2;
    },
    isCollapsed(expandState: number): boolean {
      return expandState !== 0;
    },
    calcLocationCount(clientProfileInfo: ClientProfileInfo): number {
      const excludeAutoSelect = clientProfileInfo.serverLocationInfos.filter(
          x => x.countryCode !== '*' && !x.isNestedCountry
      );
      return excludeAutoSelect.length;
    }
  }
})
</script>
<style scoped>
.get-server-key-alert {
  background-color: #e4e4e4;
  border-radius: 5px;
  border: 1px #c8c8c8 dashed;
}
</style>

<style>
/*noinspection CssUnusedSymbol*/
.v-expansion-panel-title__overlay {
  display: none !important;
}

/*noinspection CssUnusedSymbol*/
.zebra>div:not(.v-list-item--active):nth-child(even) {
  /*noinspection CssUnresolvedCustomProperty*/
  background-color: rgb(var(--v-theme-gray-lighten-5));
}
</style>