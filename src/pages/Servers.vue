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
        v-for="(item, index) in myClientProfilesInfo"
        :key="index"
        v-model="expandedPanels[index]"
        flat
        :ripple="item.regions.length < 2"
        rounded="xl"
        bg-color="white"
        class="myExpansionPanel mb-4"
    >
      <v-expansion-panel
          :readonly="item.regions.length < 2"
          hide-actions
          class="text-primary-darken-1"
      >

        <!-- Country flag on collapse state -->
        <div
            v-if="item.regions.length > 1 && expandedPanels[index] !== 0"
            class="bg-gray-lighten-5 mx-4 mb-4 pt-3 pb-2 px-4 text-truncate"
            style="border-radius: 14px; max-width: 311px;"
            @click="expandedPanels[index] = 0"
        >
          <span
              v-for="(region) in item.regions"
              :key="region.regionId"
              class="rounded-circle overflow-hidden d-inline-flex align-center justify-center border me-2"
              style="width: 23px; height: 23px;"
          >
            <img :src="require(`../assets/images/country_flags/${region.countryCode}.png`)" height="100%" alt="country flag"/>
          </span>
        </div>

        <!-- Profile title row -->
        <template v-slot:title>
          <v-row class="align-center">

            <!-- Radio button -->
            <v-col cols="auto pt-2 ps-1">
              <div
                  :class="[item.clientProfileId === $vpnHoodApp.data.state.clientProfile?.clientProfileId
              ? 'border-secondary'
              : 'border-gray-lighten-4'
              , 'd-flex align-center justify-center border border-opacity-100 rounded-circle text-secondary']"
                  style="width: 25px; height: 25px; border-width: 3px !important;"
              >
                <v-icon v-if="item.clientProfileId === $vpnHoodApp.data.state.clientProfile?.clientProfileId"
                        icon="mdi-check-bold" size="15"/>
              </div>
            </v-col>

            <!-- Profile name and support id-->
            <v-col class="px-0">

              <!-- Profile name -->
              <h4 class="text-primary-darken-1 text-truncate"
                  :style="[item.regions.length > 1 ? 'max-width: 208px;' : 'max-width: 245px;']">
                {{ item.clientProfileName }}</h4>

              <!-- Support id -->
              <p class="text-gray-lighten-3 text-caption opacity-100">SID:{{ item.supportId }}</p>

            </v-col>

            <!-- Region count and menu button -->
            <v-col cols="auto" class="px-0">

              <!-- Region count -->
<!--              <v-chip
                  v-if="item.regions.length > 1"
                  color="gray-lighten-4"
                  variant="flat"
                  density="compact"
                  size="small"
                  class="text-primary-darken-1 px-2"
              >
                <v-icon icon="mdi-map-marker"/>
                <span>{{ '+' + item.regions.length }}</span>
              </v-chip>-->

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
              v-if="item.regions.length > 0"
              bg-color="gray-lighten-5"
              class="py-0 mt-n2 mx-n2"
              style="border-radius: 14px;"
          >
            <!-- Region item -->
            <v-list-item
                v-for="(region, index) in item.regions"
                :key="region.regionId"
                :value="region.regionId"
                :class="[item.regions.length > 1 && index !== (item.regions.length - 1) ? 'border-b border-gray-lighten-3' : '','py-3']"
            >
              <v-list-item-title class="d-flex align-center">

                <!-- Country flag -->
                <span class="rounded-circle overflow-hidden d-inline-flex align-center justify-center me-2"
                      style="width: 23px; height: 23px;">
                  <img :src="require(`../assets/images/country_flags/${region.countryCode}.png`)" height="100%"
                       alt="country flag"/>
                </span>

                <!-- Region name -->
                <span class="text-caption">{{ region.regionName }}</span>

                <!-- State name -->
                <!--                <span v-if="region.stateName?">{{region.regionName}}</span>-->
                <v-spacer/>

                <!-- Status -->
                <v-chip color="secondary" variant="flat" size="x-small" :text="$t('ACTIVE')"/>

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
  HostRegionInfo,
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
      myClientProfilesInfo: {} as ClientProfileInfo[],
      expandedPanels: [] as number[],
    }
  },

  created() {
    let clientProfileInfos = this.$vpnHoodApp.data.clientProfileInfos;
    clientProfileInfos.forEach(item => {
      if (item.clientProfileName === "Hesam.M") {
        item.regions.push(
            new HostRegionInfo({regionId: "123", regionName: "United States (Virginia)", countryCode: "us"}),
            new HostRegionInfo({regionId: "345", regionName: "United Kingdom (London)", countryCode: "gb"}),
            new HostRegionInfo({regionId: "346", regionName: "Iran (Tehran)", countryCode: "ir"}),
            new HostRegionInfo({regionId: "347", regionName: "France (Paris)", countryCode: "fr"}),
            new HostRegionInfo({regionId: "348", regionName: "Australia (Sidney)", countryCode: "au"}),
        )
      } else {
        item.regions.push(
            new HostRegionInfo({regionId: "123", regionName: "Iran (Tehran)", countryCode: "ir"}),
        )
      }
    });
    this.myClientProfilesInfo = clientProfileInfos;
    this.expandedPanels = this.myClientProfilesInfo.map(() => 0);
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