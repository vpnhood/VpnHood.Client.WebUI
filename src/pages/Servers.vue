<template>

  <!-- Page header -->
  <AppBar :page-title="$t('SERVERS')"/>

  <v-sheet
      :color="$vpnHoodApp.isConnectApp() ? 'primary-darken-2' : 'gray-lighten-6'"
      :class="[$vpnHoodApp.isSingleServerMode() ? 'py-0 px-0' : 'pa-4','text-center']"
  >

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
    <div v-if="$vpnHoodApp.data.features.isAddAccessKeySupported && $vpnHoodApp.data.clientProfileInfos.length === 0">
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


    <!-- Only for VpnHoodCONNECT -->
    <!-- Single mode server item -->
    <template v-else-if="$vpnHoodApp.isSingleServerMode()">
      <ServerLocationList
          :client-profile-info="$vpnHoodApp.data.clientProfileInfos[0]"
          :is-single-item="true"
          :is-active-profile="true"
          @connect="connect"
      />
    </template>

    <!-- Multi server items -->
    <v-expansion-panels
        v-else
        v-for="(clientProfileInfo, index) in $vpnHoodApp.data.clientProfileInfos"
        :key="index"
        v-model="expandedPanels[index]"
        flat
        rounded="xl"
        :bg-color="$vpnHoodApp.isConnectApp() ? 'primary' : 'white'"
        class="mb-4"
        @click="connect(clientProfileInfo,'')"
    >
      <v-expansion-panel
          :readonly="Util.isSingleLocation(clientProfileInfo.serverLocationInfos.length) || $vpnHoodApp.isConnectApp()"
          hide-actions
          class="text-primary-darken-1 pa-4"
      >

        <!-- Country flag on collapse state -->
        <div
            v-if="!Util.isSingleLocation(clientProfileInfo.serverLocationInfos.length)
            && Util.isCollapsed(expandedPanels[index])
            && !$vpnHoodApp.isConnectApp()"
            class="d-flex align-center bg-gray-lighten-6 py-3 px-2 text-start text-truncate"
            style="border-radius: 14px; max-width: 311px;"
            @click="expandedPanels[index] = 0"
        >
          <template v-for="(serverLocationInfo, index) in clientProfileInfo.serverLocationInfos">
            <span
                v-if="!serverLocationInfo.isNestedCountry
                && !$vpnHoodApp.isLocationAutoSelected(serverLocationInfo.countryCode)
                && index <= maximumLocationOnCollapsed"
                :key="index"
                class="rounded-circle overflow-hidden d-inline-flex align-center justify-center border me-2"
                style="width: 23px; height: 23px;"
            >
              <!-- Auto select icon -->
              <v-icon v-if="$vpnHoodApp.isLocationAutoSelected(serverLocationInfo.countryCode)" icon="mdi-earth"
                      color="primary-darken-1" size="27"></v-icon>

              <!-- Country flag -->
              <img v-else :src="$vpnHoodApp.getCountryFlag(serverLocationInfo.countryCode)" height="100%"
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
                  :class="[$vpnHoodApp.isActiveClientProfile(clientProfileInfo.clientProfileId)
                ? 'border-secondary'
                : 'border-gray-lighten-4'
                , 'd-flex align-center justify-center border border-opacity-100 rounded-circle text-secondary']"
                  style="width: 25px; height: 25px; border-width: 3px !important;"
              >
                <!-- Check icon if is active client profile -->
                <v-icon v-if="$vpnHoodApp.isActiveClientProfile(clientProfileInfo.clientProfileId)"
                        icon="mdi-check-bold" size="15"/>
              </div>
            </v-col>

            <!-- Profile name -->
            <v-col class="px-0 py-0">
              <h4 :class="[$vpnHoodApp.isConnectApp() ? 'text-white' : 'text-primary-darken-1' ,'text-truncate text-capitalize']"
                  style="max-width: 190px;">
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
                        v-if="clientProfileInfo.clientProfileId !== $vpnHoodApp.data.features.builtInClientProfileId"
                        :title="$t('RENAME')" prepend-icon="mdi-pencil" @click="showRenameDialog(clientProfileInfo)"/>
                    <v-divider
                        v-if="clientProfileInfo.clientProfileId !== $vpnHoodApp.data.features.builtInClientProfileId"/>

                    <!-- Diagnose item -->
                    <v-list-item
                        :title="$t('DIAGNOSE')"
                        :disabled="!$vpnHoodApp.data.state.canDiagnose"
                        prepend-icon="mdi-speedometer"
                        @click="connect(clientProfileInfo, '', true)">
                    </v-list-item>
                    <v-divider v-if="$vpnHoodApp.data.features.isAddAccessKeySupported"/>

                    <!-- Delete item -->
                    <v-list-item v-if="$vpnHoodApp.data.features.isAddAccessKeySupported" :title="$t('REMOVE')"
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
          <ServerLocationList
              :client-profile-info="clientProfileInfo"
              :is-single-item="false"
              :is-active-profile="$vpnHoodApp.isActiveClientProfile(clientProfileInfo.clientProfileId)"
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
import {AppName, SubscriptionPlansId} from "@/UiConstants";
import AppBar from "@/components/AppBar.vue";
import ServerLocationList from "@/components/ServerLocationList.vue";
import {Util} from "@/services/Util";

export default defineComponent({
  name: 'ServersPage',
  components: {ServerLocationList, AppBar, AddServerDialog},
  data() {
    return {
      Util,
      AppName,
      SubscriptionPlansId,
      ComponentRouteController,
      currentClientProfileInfo: {} as ClientProfileInfo,
      expandedPanels: [] as number[],
      maximumLocationOnCollapsed: 8,
      newClientProfileName: "",
    }
  },
  created() {
    // Create open state for each clientProfileInfo item
    this.expandedPanels = this.$vpnHoodApp.data.clientProfileInfos.map(() => 0);
  },
  methods: {
    // Connect or diagnose selected client profile
    async connect(clientProfileInfo: ClientProfileInfo, serverLocationInfo: string, isDiagnose: boolean = false): Promise<void> {

      // App is VpnHoodCONNECT and client profile have multi location, but user select server card instead location
      // Show snackbar message
      if (this.$vpnHoodApp.isConnectApp() && serverLocationInfo === "" && !Util.isSingleLocation(clientProfileInfo.serverLocationInfos.length)){
        // TODO show snackbar message
        console.log("not implemented");
      }

      // App is VpnHoodClient and Client profile have multi location, but user select server card instead location
      // Do nothing because expansion panel has action collapse/expand
      if (serverLocationInfo === "" && !Util.isSingleLocation(clientProfileInfo.serverLocationInfos.length))
        return;

      this.$router.replace('/');
      this.$vpnHoodApp.data.settings.userSettings.clientProfileId = clientProfileInfo.clientProfileId;
      // If the serverLocation is empty, it will be connected to Auto
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
      this.newClientProfileName = clientProfileInfo.clientProfileName;
      await ComponentRouteController.showComponent(this.$componentName.RenameServerDialog);
    },

    // Rename server by user
    async saveNewClientProfileName(): Promise<void> {
      await ComponentRouteController.showComponent(this.$componentName.RenameServerDialog, false);
      await this.$vpnHoodApp.updateClientProfile(
          this.currentClientProfileInfo.clientProfileId,
          new ClientProfileUpdateParams({
            clientProfileName: new PatchOfString({
              value: this.newClientProfileName,
            })
          })
      );
    },
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
.zebra > div:not(.v-list-item--active):nth-child(even) {
  /*noinspection CssUnresolvedCustomProperty*/
  background-color: rgb(var(--v-theme-gray-lighten-5));
}

/*noinspection CssUnusedSymbol*/
.connect-zebra > div:not(.v-list-item--active):nth-child(even) {
  /*noinspection CssUnresolvedCustomProperty*/
  background-color: rgb(20 13 60);
}
</style>