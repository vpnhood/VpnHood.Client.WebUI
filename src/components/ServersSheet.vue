<template>
  <v-bottom-sheet inset scrollable close-on-back :modelValue="modelValue"
                  @update:modelValue="$emit('update:modelValue',$event)" max-width="600">

    <!-- List header -->
    <v-toolbar theme="light" elevation="3" style="z-index: 1" class="rounded-t-xl">
      <v-btn icon="mdi-close" size="small" color="var(--muted-color)" @click="$emit('update:modelValue',false)"></v-btn>
      <v-toolbar-title :text="$t('SERVERS')"></v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn rounded color="var(--master-green)" @click="isShowAddServerSheet = true;">
        <v-icon size="25" class="mr-1">mdi-plus-circle</v-icon>
        {{ $t("ADD_SERVER") }}
      </v-btn>
    </v-toolbar>

    <!-- Server lists -->
    <v-list class="px-5">
      <v-list-item
          v-for="(item, i) in $vpnHoodApp.clientProfileItems"
          :key="i"
          rounded
          @click="connect(item.id)"
          class="server-item rounded-lg my-4 py-4"
          :style="item.id === $vpnHoodApp.state.defaultClientProfileId ? 'border: solid #23c99d 3px' : ''"
      >
        <!-- َActive item icon -->
        <template v-slot:prepend v-if="item.id === $vpnHoodApp.state.defaultClientProfileId">
          <v-avatar size="25" color="#23c99d66">
            <v-icon size="25" color="var(--master-green)">mdi-check-all</v-icon>
          </v-avatar>
        </template>

        <!-- Profile name -->
        <v-list-item-title class="mb-2">
          <span class="title me-1">{{ item.clientProfile.name ?? item.token.name }} </span>
          <span class="text-caption text-right justify-end">(sid:{{ item.token.sid }})</span>
        </v-list-item-title>

        <!-- Support ID -->
        <v-list-item-subtitle>{{ redactIp(item.token.ep[0]) }}</v-list-item-subtitle>

        <!-- Menu -->
        <template v-slot:append>
          <v-btn icon size="large" variant="plain">
            <v-icon>mdi-dots-vertical</v-icon>
            <v-menu activator="parent">
              <v-list>

                <!-- Rename -->
                <v-list-item :title="$t('RENAME')" prepend-icon="mdi-pencil" link>

                  <v-dialog v-model="showRename" activator="parent" close-on-back>
                    <v-card :title="$t('RENAME')">
                      <v-card-text>
                        <v-text-field v-model="newClientProfileName"
                                      :label="$t('ENTER_NEW_NAME_FOR') + (item.clientProfile.name ?? item.token.name)"
                                      spellcheck="false" autocomplete="off" color="blue darken-1"
                                      clearable></v-text-field>
                      </v-card-text>
                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="blue darken-1" variant="text" :text="$t('CANCEL')"
                               @click="showRename = false"></v-btn>
                        <v-btn color="blue darken-1" variant="text" :text="$t('SAVE')"
                               @click="saveNewClientProfileName(item.clientProfile)"></v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-list-item>
                <v-divider/>

                <!-- Diagnose -->
                <v-list-item :title="$t('DIAGNOSE')" :disabled="$vpnHoodApp.state.hasDiagnoseStarted"
                             prepend-icon="mdi-speedometer" link
                             @click="diagnose(item.clientProfile.clientProfileId)"></v-list-item>
                <v-divider/>

                <!-- Delete -->
                <v-list-item :title="$t('REMOVE')" prepend-icon="mdi-delete" link>
                  <!-- Confirm delete server dialog -->
                  <v-dialog v-model="showConfirmDelete" activator="parent" close-on-back>
                    <v-card>
                      <v-card-title id="deleteConfirmTitle">{{ $t('WARNING') }}</v-card-title>
                      <v-card-text>
                        <p class="color-muted">{{ $t("CONFIRM_REMOVE_SERVER") }}</p>
                        <strong>{{ item.token.name }}</strong>
                      </v-card-text>
                      <v-card-actions class="d-flex justify-space-around mt-4 mb-3">
                        <v-btn variant="text" @click="removeServer(item.clientProfile.clientProfileId)">
                          {{ $t("YES") }}
                        </v-btn>
                        <v-btn color="blue" variant="text" @click="showConfirmDelete = false">
                          {{ $t("NO") }}
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-list-item>

              </v-list>
            </v-menu>
          </v-btn>
        </template>
      </v-list-item>
    </v-list>

    <!-- Add server sheet -->
    <AddServerSheet v-model="isShowAddServerSheet"
                    @new-access-key-added="$emit('update:modelValue',false)"></AddServerSheet>

  </v-bottom-sheet>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import AddServerSheet from "@/components/AddServerSheet.vue";
import {ClientProfile, RemoveClientProfileParam, SetClientProfileParam} from "@/hood/VpnHood.Client.Api";

export default defineComponent({
  name: 'ServersSheet',
  components: {AddServerSheet},
  props: {
    modelValue: Boolean,
  },
  emits: [
    "update:modelValue",
  ],
  data() {
    return {
      isShowAddServerSheet: false,
      showConfirmDelete: false,
      showRename: false,
      newClientProfileName: null,
    }
  },

  methods: {
    async connect(clientProfileId: string): Promise<void> {
      this.$emit('update:modelValue', false);
      this.$vpnHoodApp.settings.userSettings.defaultClientProfileId = clientProfileId;
      await this.$vpnHoodApp.saveUserSetting();
      await this.$vpnHoodApp.connect();
    },

    async diagnose(clientProfileId: string): Promise<void> {
      this.$emit('update:modelValue', false)
      this.$vpnHoodApp.settings.userSettings.defaultClientProfileId = clientProfileId;
      await this.$vpnHoodApp.saveUserSetting();
      await this.$vpnHoodApp.diagnose();
    },

    async removeServer(clientProfileId: string): Promise<void> {
      await this.$vpnHoodApp.removeClientProfile(new RemoveClientProfileParam({
        clientProfileId: clientProfileId
      }));
      this.showConfirmDelete = false;
    },

    // Hidden full ip in the servers list
    redactIp(ipAddress: string): string {
      if (ipAddress == null) return "";
      let tokens = ipAddress.split(".");
      return tokens[0] + ".*.*." + tokens[3];
    },

    // Rename client profile name by user
    async saveNewClientProfileName(renamedClientProfile: ClientProfile): Promise<void> {
      this.showRename = false;
      const clientProfile = this.$vpnHoodApp.clientProfileItems.find(x => x.clientProfile.clientProfileId === renamedClientProfile.clientProfileId)?.clientProfile;
      if (!clientProfile)
        throw new Error("Could not find client profile id.");

      this.newClientProfileName == "" ? clientProfile.name = null : clientProfile.name = this.newClientProfileName;
      await this.$vpnHoodApp.setClientProfile(new SetClientProfileParam({clientProfile}));
    }
  }
})
</script>

<style scoped>
.server-item {
  box-shadow: 0 1px 2px 1px rgb(0 0 0 / 15%);
  background-color: #eceffb;
}

#deleteConfirmTitle {
  background-color: #FB8C00;
  color: white;
}

</style>