<template>
  <v-bottom-sheet inset scrollable v-model="isShow" max-width="600">

    <!-- List header -->
    <v-toolbar theme="light" elevation="3" style="z-index: 1" class="rounded-t-xl">
      <v-btn icon="mdi-close" size="small" color="var(--muted-color)" @click="isShow = false"></v-btn>
      <v-toolbar-title :text="$t('SERVERS')"></v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn rounded color="var(--master-green)" @click="$refs.addServerSheet.isShow = true;">
        <v-icon size="25" class="mr-1">mdi-plus-circle</v-icon>
        {{ $t("ADD_SERVER") }}
      </v-btn>
    </v-toolbar>

    <!-- Server lists -->
    <v-list bg-color="white" class="px-5">
      <v-list-item
          v-for="(item, i) in $clientApp.clientProfileItems"
          :key="i"
          rounded
          @click="connect(item.id)"
          class="server-item d-flex rounded-lg my-4 py-4"
          :style="item.id === $clientApp.state.activeClientProfileId ? 'border: solid #23c99d 3px' : ''"
      >
        <!-- َActive item icon -->
        <template v-slot:prepend v-if="item.id === $clientApp.state.activeClientProfileId">
          <v-avatar color="#23c99d66">
            <v-icon size="30" color="var(--master-green)">mdi-check-all</v-icon>
          </v-avatar>
        </template>

        <!-- Profile name -->
        <v-list-item-title class="mb-2">
          <span>{{ item.token.name }} </span>
          <span v-if="item.token.sid != null && item.token.sid > ''" class="text-caption text-right justify-end">
                  (sid:{{ item.token.sid }})</span>
        </v-list-item-title>

        <!-- Support ID -->
        <v-list-item-subtitle v-text="redactIp(item.token.ep[0])"/>

        <!-- Manage item menu -->
        <v-list-item-action>
          <!-- Menu -->
          <!--              <ContextMenu :clientProfileId="item.clientProfile.clientProfileId" :showAddServerItem="false"
                                     :showManageServerItem="false" />-->
        </v-list-item-action>
      </v-list-item>
    </v-list>

    <AddServerSheet ref="addServerSheet"></AddServerSheet>
  </v-bottom-sheet>
</template>

<script lang="ts">
import {defineComponent} from "vue";
//import ContextMenu from "../components/ClientProfileMenu.vue";
import AddServerSheet from "@/components/AddServerSheet.vue";

export default defineComponent({
  name: 'ServersSheet',
  components: {
    AddServerSheet
  },
  data() {
    return {
      isShow: false,
    }
  },

  methods: {
    connect(clientProfileId: string) {
      this.$clientApp.connect(clientProfileId);
      this.isShow = false;
    },
    redactIp(ipAddress: string): string {
      if (ipAddress == null) return "";
      let tokens = ipAddress.split(".");
      return tokens[0] + ".*.*." + tokens[3];
    },
  }
})
</script>

<style scoped>
.server-item {
  box-shadow: 0 1px 2px 1px rgb(0 0 0 / 15%);
  background-color: #eceffb;
}

</style>