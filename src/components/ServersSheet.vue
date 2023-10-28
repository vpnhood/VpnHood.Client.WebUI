<template>
  <v-bottom-sheet :inset="true" :scrollable="true" :modelValue="modelValue"
                  @update:modelValue="$emit('update:modelValue',$event)">

    <!-- Page header -->
    <v-toolbar class="rounded-t-lg" color="secondary" elevation="3" style="z-index: 1;" >

      <!-- Close button -->
      <v-btn icon="mdi-close" size="small" @click="$emit('update:modelValue',false)"></v-btn>

      <!-- Page title -->
      <v-toolbar-title class="text-body-1" :text="$t('SERVERS')"></v-toolbar-title>
      <v-spacer></v-spacer>

      <!-- Add server button -->
      <v-btn rounded variant="tonal" @click="ComponentRouteController.showComponent($componentName.AddServerDialog)">
        <v-icon size="25" class="mr-1">mdi-plus-circle</v-icon>
        {{ $t("ADD_SERVER") }}
      </v-btn>
    </v-toolbar>

    <!-- Servers list -->
    <v-card>
      <v-card-item>

        <!-- Show alert, if user has not any server -->
        <v-alert
            v-if="$vpnHoodApp.data.clientProfileItems.length === 0"
            :text="$t('NO_SERVER_AVAILABLE')"
            density="compact"
            type="warning"
            class="mb-5"
        >
        </v-alert>

        <!-- Servers list -->
        <v-list v-else>
          <!-- Server item -->
          <v-list-item
              v-for="(item, i) in $vpnHoodApp.data.clientProfileItems"
              :key="i"
              rounded
              @click="connect(item.clientProfileId)"
              class="server-item rounded-lg mb-4 py-4"
              :style="item.clientProfileId === $vpnHoodApp.data.settings.userSettings.defaultClientProfileId ? 'border: solid #23c99d 2px' : ''"
          >
            <!-- َActive item icon -->
            <template v-slot:prepend v-if="item.clientProfileId === $vpnHoodApp.data.settings.userSettings.defaultClientProfileId">
              <v-avatar size="25" color="#23c99d66">
                <v-icon size="25" color="var(--master-green)">mdi-check-all</v-icon>
              </v-avatar>
            </template>

            <!-- Profile name -->
            <v-list-item-title class="mb-2">
              <span class="title">{{ item.clientProfile.name ?? item.token.name }} </span>
            </v-list-item-title>

            <!-- Support ID -->
            <v-list-item-subtitle class="text-caption">
              <span>{{ item.token.ep ? redactIp(item.token.ep[0]) : "" }}</span>
              <span class="ms-1 text-caption text-right justify-end">(sid:{{ item.token.sid }})</span>
            </v-list-item-subtitle>

            <!-- Menu -->
            <template v-slot:append>
              <v-btn icon size="large" variant="plain">
                <v-icon>mdi-dots-vertical</v-icon>
                <v-menu activator="parent">

                  <!-- Menu items -->
                  <v-list>

                    <!-- Rename item -->
                    <v-list-item :title="$t('RENAME')" prepend-icon="mdi-pencil" @click="showRenameDialog(item)" />
                    <v-divider/>

                    <!-- Diagnose item -->
                    <v-list-item
                        :title="$t('DIAGNOSE')"
                        :disabled="!$vpnHoodApp.canDiagnose()"
                        prepend-icon="mdi-speedometer"
                        @click="diagnose(item.clientProfile.clientProfileId)">
                    </v-list-item>
                    <v-divider/>

                    <!-- Delete item -->
                    <v-list-item :title="$t('REMOVE')" prepend-icon="mdi-delete" @click="showConfirmDeleteDialog(item)" />

                  </v-list>
                </v-menu>
              </v-btn>
            </template>
          </v-list-item>
        </v-list>
      </v-card-item>
    </v-card>

    <!-- Add server sheet -->
    <AddServerDialog
        v-model="ComponentRouteController.create($componentName.AddServerDialog).isShow"
        @new-access-key-added="$emit('update:modelValue',false)">
    </AddServerDialog>

    <!-- Rename dialog -->
    <v-dialog v-model="ComponentRouteController.create($componentName.RenameServerDialog).isShow"  max-width="600">
      <v-card :title="$t('RENAME')">

        <v-card-text>
          <!-- Name text field -->
          <v-text-field
              v-model="newClientProfileName"
              :label="$t('ENTER_NEW_NAME_FOR') + (actionOnCurrentClientProfileItem.clientProfile.name ?? actionOnCurrentClientProfileItem.token.name)"
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
              @click="saveNewClientProfileName(actionOnCurrentClientProfileItem.clientProfile)">
          </v-btn>

        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirm delete server dialog -->
    <v-dialog v-model="ComponentRouteController.create($componentName.ConfirmDeleteServerDialog).isShow" max-width="600">
      <v-card>

        <v-card-title class="color-on-warning bg-warning">{{ $t('WARNING') }}</v-card-title>

        <v-card-text>
          <p class="color-muted">{{ $t("CONFIRM_REMOVE_SERVER") }}</p>
          <strong>{{ actionOnCurrentClientProfileItem.token.name }}</strong>
        </v-card-text>

        <!-- Dialog buttons -->
        <v-card-actions class="d-flex justify-space-around mt-4 mb-3">

          <!-- Confirm delete button -->
          <v-btn variant="text" @click="removeServer(actionOnCurrentClientProfileItem.clientProfileId)">
            {{ $t("YES") }}
          </v-btn>

          <!-- Cancel delete button -->
          <v-btn variant="tonal" @click="ComponentRouteController.showComponent($componentName.ConfirmDeleteServerDialog, false)">
            {{ $t("NO") }}
          </v-btn>

        </v-card-actions>

      </v-card>
    </v-dialog>

  </v-bottom-sheet>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import AddServerDialog from "@/components/AddServerDialog.vue";
import {ClientProfile, ClientProfileItem, ClientProfileUpdateParams,} from "@/services/VpnHood.Client.Api";
import { ComponentRouteController } from "@/services/ComponentRouteController";

export default defineComponent({
  name: 'ServersSheet',
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
      actionOnCurrentClientProfileItem: {} as ClientProfileItem,
      ComponentRouteController,
    }
  },

  methods: {
    async connect(clientProfileId: string): Promise<void> {
      this.$emit('update:modelValue', false);
      this.$vpnHoodApp.data.settings.userSettings.defaultClientProfileId = clientProfileId;
      await this.$vpnHoodApp.saveUserSetting();
      await this.$vpnHoodApp.connect();
    },

    async diagnose(clientProfileId: string): Promise<void> {
      this.$emit('update:modelValue', false);
      this.$vpnHoodApp.data.settings.userSettings.defaultClientProfileId = clientProfileId;
      await this.$vpnHoodApp.saveUserSetting();
      await this.$vpnHoodApp.diagnose();
    },

    // Show confirm dialog for delete server
    async showConfirmDeleteDialog(clientProfileItem: ClientProfileItem): Promise<void>{
      this.actionOnCurrentClientProfileItem = clientProfileItem;
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
    async showRenameDialog(clientProfileItem: ClientProfileItem): Promise<void>{
      this.actionOnCurrentClientProfileItem = clientProfileItem;
      await ComponentRouteController.showComponent(this.$componentName.RenameServerDialog);
    },

    // Rename server by user
    async saveNewClientProfileName(renamedClientProfile: ClientProfile): Promise<void> {
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
.server-item {
  box-shadow: 0 1px 2px 1px rgb(0 0 0 / 15%);
  background-color: #eceffb;
}
</style>