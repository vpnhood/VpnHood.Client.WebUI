<template>

  <!-- Page header -->
  <AppBar :page-title="$t('SERVERS')"/>

  <v-sheet color="gray-lighten-5" class="pa-4">

    <!-- Add server button -->
    <v-btn
        v-if="$vpnHoodApp.data.features.isAddAccessKeySupported"
        block
        variant="elevated"
        color="secondary"
        class="mt-2 mb-4 py-5"
        prepend-icon="mdi-plus-circle"
        :text="$t('ADD_SERVER')"
        @click="ComponentRouteController.showComponent($componentName.AddServerDialog)"
    />

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
        v-for="(item, index) in $vpnHoodApp.data.clientProfileInfos"
        :key="index"
        v-model="expandedPanels[index]"
        flat
        :ripple="isSingleLocation(item.serverLocationInfos.length)"
        rounded="xl"
        bg-color="white"
        class="myExpansionPanel mb-4"
    >
      <v-expansion-panel
          :readonly="isSingleLocation(item.serverLocationInfos.length)"
          hide-actions
          class="text-primary-darken-1"
      >

        <!-- Country flag on collapse state -->
        <div
            v-if="!isSingleLocation(item.serverLocationInfos.length) && isCollapsed(expandedPanels[index])"
            class="bg-gray-lighten-5 mx-4 mb-4 pt-3 pb-2 px-4 text-truncate"
            style="border-radius: 14px; max-width: 311px;"
            @click="expandedPanels[index] = 0"
        >
          <span
              v-for="(region, index) in item.serverLocationInfos"
              :key="index"
              class="rounded-circle overflow-hidden d-inline-flex align-center justify-center border me-2"
              style="width: 23px; height: 23px;"
          >
            <!-- Auto select icon -->
            <v-icon v-if="isAutoSelect(region.countryCode)" icon="mdi-earth" color="primary-darken-1" size="27"></v-icon>

            <!-- Country flag -->
            <img v-else :src="require(`../assets/images/country_flags/${region.countryCode.toLowerCase()}.png`)" height="100%" alt="country flag"/>
          </span>
        </div>

        <!-- Profile title row -->
        <template v-slot:title>
          <v-row class="align-center">

            <!-- Radio button -->
            <v-col cols="auto pt-2 ps-1">
              <div
                :class="[isActiveClientProfile(item.clientProfileId)
                ? 'border-secondary'
                : 'border-gray-lighten-4'
                , 'd-flex align-center justify-center border border-opacity-100 rounded-circle text-secondary']"
                style="width: 25px; height: 25px; border-width: 3px !important;"
              >
                <!-- Check icon if is active client profile -->
                <v-icon v-if="isActiveClientProfile(item.clientProfileId)" icon="mdi-check-bold" size="15"/>
              </div>
            </v-col>

            <!-- Profile name and support id-->
            <v-col class="px-0">

              <!-- Profile name -->
              <h4 class="text-primary-darken-1 text-truncate" style="max-width: 245px;">
                {{ item.clientProfileName }}
              </h4>

              <!-- Support id -->
              <p class="text-gray-lighten-3 text-caption opacity-100">SID:{{ item.supportId }}</p>

            </v-col>

            <!-- Menu button -->
            <v-col cols="auto" class="px-0">

              <!-- Menu button -->
              <v-btn :icon="true" density="compact" variant="plain" color="gray-lighten-3">
                <v-icon>mdi-dots-vertical</v-icon>
                <v-menu activator="parent">
                  <!-- Menu items -->
                  <v-list>

                    <!-- Rename item -->
                    <v-list-item v-if="item.tokenId !== $vpnHoodApp.data.features.builtInClientProfileId"
                                 :title="$t('RENAME')" prepend-icon="mdi-pencil" @click="showRenameDialog(item)"/>
                    <v-divider v-if="item.tokenId !== $vpnHoodApp.data.features.builtInClientProfileId"/>

                    <!-- Diagnose item -->
                    <v-list-item
                        :title="$t('DIAGNOSE')"
                        :disabled="!$vpnHoodApp.canDiagnose()"
                        prepend-icon="mdi-speedometer"
                        @click="diagnose(item.clientProfileId)">
                    </v-list-item>
                    <v-divider v-if="$vpnHoodApp.data.features.isAddAccessKeySupported"/>

                    <!-- Delete item -->
                    <v-list-item v-if="$vpnHoodApp.data.features.isAddAccessKeySupported" :title="$t('REMOVE')"
                                 prepend-icon="mdi-delete" @click="showConfirmDeleteDialog(item)"/>

                  </v-list>
                </v-menu>
              </v-btn>

            </v-col>

          </v-row>
        </template>

        <!-- Profile region -->
        <template v-slot:text>
          <v-list
              v-if="item.serverLocationInfos.length > 0"
              bg-color="gray-lighten-5"
              class="py-0 mt-n2 mx-n2"
              style="border-radius: 14px;"
          >
            <!-- Region item -->
            <v-list-item
                v-for="(region, index) in item.serverLocationInfos"
                :key="index"
                :value="region.serverLocation"
                :class="[!isSingleLocation(item.serverLocationInfos.length) && index !== (item.serverLocationInfos.length - 1)
                ? 'border-b border-gray-lighten-3' : '','py-3']"
                :active="isActiveServer(region.serverLocation)"
                active-color="secondary"

            >
              <v-list-item-title class="d-flex align-center">

                <!-- Auto select icon and Country flag -->
                <span class="rounded-circle overflow-hidden d-inline-flex align-center justify-center me-2"
                      style="width: 23px; height: 23px;">

                  <!-- Auto select icon -->
                  <v-icon v-if="isAutoSelect(region.countryCode)" icon="mdi-earth" color="primary-darken-1" size="27"></v-icon>

                  <!-- Country flag -->
                  <img v-else :src="require(`../assets/images/country_flags/${region.countryCode.toLowerCase()}.png`)" height="100%"
                       alt="country flag"/>
                </span>

                <!-- Country name -->
                <span class="text-caption">{{ isAutoSelect(region.countryCode) ? $t('AUTO_SELECT') : region.countryName}}</span>

                <!-- State name -->
                <span
                    v-if="!isAutoSelect(region.countryCode) && region.regionName"
                    class="text-caption text-primary-darken-1 ms-2"
                >
                  ({{isAutoSelect(region.regionName) ? $t('AUTO_SELECT') : region.regionName}})
                </span>
                <v-spacer/>

                <!-- Status -->
                <v-chip v-if="isActiveServer(region.serverLocation)" color="secondary" variant="flat" size="x-small" :text="$t('ACTIVE')"/>

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
    }
  },

  created() {
    console.log(this.$vpnHoodApp.data.clientProfileInfos);
    this.expandedPanels = this.$vpnHoodApp.data.clientProfileInfos.map(() => 0);
  },
  methods: {
    async connect(clientProfileId: string): Promise<void> {
      this.$router.replace('/');
      this.$vpnHoodApp.data.settings.userSettings.clientProfileId = clientProfileId;
      await this.$vpnHoodApp.saveUserSetting();
      await this.$vpnHoodApp.connect();
    },

    async diagnose(clientProfileId: string): Promise<void> {
      this.$router.replace('/');
      this.$vpnHoodApp.data.settings.userSettings.clientProfileId = clientProfileId;
      await this.$vpnHoodApp.saveUserSetting();
      await this.$vpnHoodApp.diagnose();
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
      return clientProfileId === this.$vpnHoodApp.data.state.clientProfile?.clientProfileId;
    },
    isActiveServer(serverLocation: string): boolean {
      return serverLocation === this.$vpnHoodApp.data.state.clientProfile?.serverLocationInfo.serverLocation;
    },
    isAutoSelect(countryCode: string): boolean {
      return countryCode === '*';
    },
    isSingleLocation(locationCount: number): boolean {
      return locationCount < 2;
    },
    isCollapsed(expandState: number): boolean {
      return expandState !== 0;
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
</style>