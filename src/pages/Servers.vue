<template>

  <!-- Page header -->
  <AppBar :page-title="$t('SERVERS')"/>

  <v-sheet color="gray-lighten-3" class="pa-4">

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


    <!-- Servers list -->
    <v-list v-else bg-color="transparent" dir="ltr">

      <!-- Server item -->
      <v-list-item
          v-for="(item, index) in $vpnHoodApp.data.clientProfileInfos"
          :key="index"
          rounded="lg"
          lines="two"
          variant="elevated"
          @click="connect(item.clientProfileId)"
          class="mb-3"
          :style="item.clientProfileId === $vpnHoodApp.data.settings.userSettings.clientProfileId ? 'border: solid rgb(var(--v-theme-secondary)) 2px' : ''"
      >
        <!-- َActive item icon -->
        <template v-slot:prepend
                  v-if="item.clientProfileId === $vpnHoodApp.data.settings.userSettings.clientProfileId">
          <v-avatar size="25" color="rgba(var(--v-theme-secondary), .3)">
            <v-icon size="25" color="secondary">mdi-check-all</v-icon>
          </v-avatar>
        </template>

        <!-- Profile name -->
        <v-list-item-title>
          <h4>{{ item.clientProfileName }} </h4>
        </v-list-item-title>

        <!-- Support ID and Host name -->
        <v-list-item-subtitle class="text-caption">
          <p>(sid:{{ item.supportId }})</p>
          <p class="mb-0 text-caption">{{ item.hostNames ? item.hostNames[0] : "" }}</p>
        </v-list-item-subtitle>

        <!-- Menu -->
        <template v-slot:append>
          <v-btn :icon="true" size="large" variant="plain">
            <v-icon>mdi-dots-vertical</v-icon>
            <v-menu activator="parent">
              <!-- Menu items -->
              <v-list>

                <!-- Rename item -->
                <v-list-item v-if="item.tokenId !== $vpnHoodApp.data.features.builtInAccessTokenId" :title="$t('RENAME')" prepend-icon="mdi-pencil" @click="showRenameDialog(item)"/>
                <v-divider v-if="item.tokenId !== $vpnHoodApp.data.features.builtInAccessTokenId" />

                <!-- Diagnose item -->
                <v-list-item
                    :title="$t('DIAGNOSE')"
                    :disabled="!$vpnHoodApp.canDiagnose()"
                    prepend-icon="mdi-speedometer"
                    @click="diagnose(item.clientProfileId)">
                </v-list-item>
                <v-divider v-if="$vpnHoodApp.data.features.isAddAccessKeySupported"/>

                <!-- Delete item -->
                <v-list-item v-if="$vpnHoodApp.data.features.isAddAccessKeySupported" :title="$t('REMOVE')" prepend-icon="mdi-delete" @click="showConfirmDeleteDialog(item)"/>

              </v-list>
            </v-menu>
          </v-btn>
        </template>
      </v-list-item>
    </v-list>

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
              :label="$t('ENTER_NEW_NAME_FOR') + (currentClientProfileInfo.clientProfileName)"
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
    <v-dialog v-model="ComponentRouteController.create($componentName.ConfirmDeleteServerDialog).isShow" max-width="600">
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
import {ClientProfileInfo, ClientProfileUpdateParams, PatchOfString} from "@/services/VpnHood.Client.Api";
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
    }
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
.get-server-key-alert{
  background-color: #e4e4e4;
  border-radius: 5px;
  border: 1px #c8c8c8 dashed;
}
</style>