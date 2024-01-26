<template>

  <!-- Page header -->
  <v-app-bar color="secondary" density="compact" elevation="3">

    <!-- Close button -->
    <v-app-bar-nav-icon icon="mdi-close" color="white" @click="$router.replace('/')"></v-app-bar-nav-icon>

    <!-- Page title -->
    <v-app-bar-title class="text-body-1 text-white">{{$t('SERVERS')}}</v-app-bar-title>

    <!-- Add server button -->
    <template v-slot:append v-if="!$vpnHoodApp.data.uiState.isGoogleSignInSupported">
      <v-btn rounded variant="tonal" @click="ComponentRouteController.showComponent($componentName.AddServerDialog)">
        <v-icon size="25" class="mr-1">mdi-plus-circle</v-icon>
        {{ $t("ADD_SERVER") }}
      </v-btn>
    </template>

  </v-app-bar>

  <v-sheet>

    <!-- Show alert, if user has not any server -->
    <v-alert
        v-if="$vpnHoodApp.data.clientProfileInfos.length === 0"
        :text="$t('NO_SERVER_AVAILABLE')"
        density="compact"
        type="warning"
        class="mb-5"
    >
    </v-alert>

    <!-- Servers list -->
    <v-list v-else bg-color="transparent">
      <!-- Server item -->
      <v-list-item
          v-for="(item, index) in $vpnHoodApp.data.clientProfileInfos"
          :key="index"
          rounded="lg"
          lines="two"
          variant="elevated"
          @click="connect(item.clientProfileId)"
          class="mb-3"
          :style="item.clientProfileId === $vpnHoodApp.data.settings.userSettings.defaultClientProfileId ? 'border: solid #23c99d 2px' : ''"
      >
        <!-- َActive item icon -->
        <template v-slot:prepend
                  v-if="item.clientProfileId === $vpnHoodApp.data.settings.userSettings.defaultClientProfileId">
          <v-avatar size="25" color="#23c99d66">
            <v-icon size="25" color="var(--master-green)">mdi-check-all</v-icon>
          </v-avatar>
        </template>

        <!-- Profile name -->
        <v-list-item-title class="mb-2">
          <span class="title">{{ item.clientProfileName }} </span>
        </v-list-item-title>

        <!-- Support ID and Host name -->
        <v-list-item-subtitle class="text-caption">
          <p>(sid:{{ item.supportId }})</p>
          <p class="mb-0 text-caption">{{ item.hostNames ? item.hostNames[0] : "" }}</p>
        </v-list-item-subtitle>

        <!-- Menu -->
        <template v-slot:append>
          <v-btn icon size="large" variant="plain">
            <v-icon>mdi-dots-vertical</v-icon>
            <v-menu activator="parent">

              <!-- Menu items -->
              <v-list>

                <!-- Rename item -->
                <v-list-item v-if="item.tokenId !== $vpnHoodApp.data.features.testServerTokenId" :title="$t('RENAME')" prepend-icon="mdi-pencil" @click="showRenameDialog(item)"/>
                <v-divider v-if="item.tokenId !== $vpnHoodApp.data.features.testServerTokenId" />

                <!-- Diagnose item -->
                <v-list-item
                    :title="$t('DIAGNOSE')"
                    :disabled="!$vpnHoodApp.canDiagnose()"
                    prepend-icon="mdi-speedometer"
                    @click="diagnose(item.clientProfileId)">
                </v-list-item>
                <v-divider v-if="!$vpnHoodApp.data.uiState.isGoogleSignInSupported"/>

                <!-- Delete item -->
                <v-list-item v-if="!$vpnHoodApp.data.uiState.isGoogleSignInSupported" :title="$t('REMOVE')" prepend-icon="mdi-delete" @click="showConfirmDeleteDialog(item)"/>

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
              v-model="newClientProfileName"
              :label="$t('ENTER_NEW_NAME_FOR') + (actionOnCurrentClientProfileInfo.clientProfileName)"
              spellcheck="false"
              autocomplete="off" color="primary"
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
              @click="ComponentRouteController.showComponent($componentName.RenameServerDialog, false)">
          </v-btn>

          <!-- Save rename button -->
          <v-btn
              color="primary"
              variant="text"
              :text="$t('SAVE')"
              @click="saveNewClientProfileName(actionOnCurrentClientProfileInfo)">
          </v-btn>

        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirm delete server dialog -->
    <v-dialog v-model="ComponentRouteController.create($componentName.ConfirmDeleteServerDialog).isShow"
              max-width="600">
      <v-card>

        <v-card-title class="color-on-warning bg-warning">{{ $t('WARNING') }}</v-card-title>

        <v-card-text>
          <p class="color-muted">{{ $t("CONFIRM_REMOVE_SERVER") }}</p>
          <strong>{{ actionOnCurrentClientProfileInfo.clientProfileName }}</strong>
        </v-card-text>

        <!-- Dialog buttons -->
        <v-card-actions class="d-flex justify-space-around mt-4 mb-3">

          <!-- Confirm delete button -->
          <v-btn variant="text" @click="removeServer(actionOnCurrentClientProfileInfo.clientProfileId)">
            {{ $t("YES") }}
          </v-btn>

          <!-- Cancel delete button -->
          <v-btn variant="tonal"
                 @click="ComponentRouteController.showComponent($componentName.ConfirmDeleteServerDialog, false)">
            {{ $t("NO") }}
          </v-btn>

        </v-card-actions>

      </v-card>
    </v-dialog>

  </v-sheet>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import AddServerDialog from "@/components/AddServerDialog.vue";
import {ClientProfileInfo, ClientProfileUpdateParams,} from "@/services/VpnHood.Client.Api";
import {ComponentRouteController} from "@/services/ComponentRouteController";

export default defineComponent({
  name: 'ServersPage',
  components: {AddServerDialog},
  props: {
    modelValue: Boolean,
  },
  emits: [
    "update:modelValue",
  ],
  data() {
    return {
      newClientProfileName: "",
      actionOnCurrentClientProfileInfo: {} as ClientProfileInfo,
      ComponentRouteController,
    }
  },

  methods: {
    async connect(clientProfileId: string): Promise<void> {
      this.$router.replace('/');
      this.$vpnHoodApp.data.settings.userSettings.defaultClientProfileId = clientProfileId;
      await this.$vpnHoodApp.saveUserSetting();
      await this.$vpnHoodApp.connect();
    },

    async diagnose(clientProfileId: string): Promise<void> {
      this.$router.replace('/');
      this.$vpnHoodApp.data.settings.userSettings.defaultClientProfileId = clientProfileId;
      await this.$vpnHoodApp.saveUserSetting();
      await this.$vpnHoodApp.diagnose();
    },

    // Show confirm dialog for delete server
    async showConfirmDeleteDialog(clientProfileInfo: ClientProfileInfo): Promise<void> {
      this.actionOnCurrentClientProfileInfo = clientProfileInfo;
      await ComponentRouteController.showComponent(this.$componentName.ConfirmDeleteServerDialog);
    },

    // Delete server by user
    async removeServer(clientProfileId: string): Promise<void> {
      await ComponentRouteController.showComponent(this.$componentName.ConfirmDeleteServerDialog, false);
      await this.$vpnHoodApp.removeClientProfile(clientProfileId);
    },

    // Hidden full ip in the servers list
    redactIp(ipAddress: string): string {
      let tokens = ipAddress.split(".");
      return tokens[0] + ".*.*." + tokens[3];
    },

    // Show rename server dialog
    async showRenameDialog(clientProfileInfo: ClientProfileInfo): Promise<void> {
      this.actionOnCurrentClientProfileInfo = clientProfileInfo;
      await ComponentRouteController.showComponent(this.$componentName.RenameServerDialog);
    },

    // Rename server by user
    async saveNewClientProfileName(renamedClientProfile: ClientProfileInfo): Promise<void> {
      await ComponentRouteController.showComponent(this.$componentName.RenameServerDialog, false);
      await this.$vpnHoodApp.updateClientProfile(
          renamedClientProfile.clientProfileId,
          new ClientProfileUpdateParams({name: this.newClientProfileName})
      );
      this.newClientProfileName = "";
    }
  }
})
</script>

<style scoped>
/*noinspection CssUnusedSymbol*/
.server-item {
  box-shadow: 0 1px 2px 1px rgb(0 0 0 / 15%);
  background-color: #eceffb;
}
</style>