<template>
  <v-bottom-sheet inset scrollable close-on-back v-model="isShow" max-width="600">

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
    <v-list class="px-5">
      <v-list-item
          v-for="(item, i) in $clientApp.clientProfileItems"
          :key="i"
          rounded
          @click="connect(item.id)"
          class="server-item rounded-lg my-4 py-4"
          :style="item.id === $clientApp.state.activeClientProfileId ? 'border: solid #23c99d 3px' : ''"
      >
        <!-- َActive item icon -->
        <template v-slot:prepend v-if="item.id === $clientApp.state.activeClientProfileId">
          <v-avatar size="25" color="#23c99d66">
            <v-icon size="25" color="var(--master-green)">mdi-check-all</v-icon>
          </v-avatar>
        </template>

        <!-- Profile name -->
        <v-list-item-title class="mb-2">
          <span class="title">{{ item.token.name }} </span>
          <span v-if="item.token.sid != null && item.token.sid > ''" class="text-caption text-right justify-end">
                  (sid:{{ item.token.sid }})</span>
        </v-list-item-title>

        <!-- Support ID -->
        <v-list-item-subtitle v-text="redactIp(item.token.ep[0])"/>

        <!-- Menu -->
        <template v-slot:append>
          <v-btn icon size="large" variant="plain">
            <v-icon>mdi-dots-vertical</v-icon>
            <v-menu activator="parent">
              <v-list>
                <!-- Rename -->
                <v-list-item :title="$t('RENAME')" prepend-icon="mdi-pencil" link></v-list-item>
                <v-divider/>
                <!-- Diagnose -->
                <v-list-item :title="$t('DIAGNOSE')" :disabled="$clientApp.state.hasDiagnoseStarted" prepend-icon="mdi-wifi-alert" link></v-list-item>
                <v-divider/>
                <!-- Delete -->
                <v-list-item :title="$t('REMOVE')" prepend-icon="mdi-delete" link @click="$clientApp.removeClientProfile(item.clientProfile)"></v-list-item>
              </v-list>
            </v-menu>
          </v-btn>
        </template>

      </v-list-item>
    </v-list>

    <AddServerSheet ref="addServerSheet"></AddServerSheet>
  </v-bottom-sheet>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import AddServerSheet from "@/components/AddServerSheet.vue";

export default defineComponent({
  name: 'ServersSheet',
  components: {AddServerSheet},
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