<template>
  <v-app-bar color="transparent" elevation="0" absolute>

    <!-- Navigation drawer button -->
    <v-app-bar-nav-icon @click="ComponentRouteController.showComponent($componentName.NavigationDrawer)" class="ms-0"/>

    <!-- App name -->
    <v-spacer></v-spacer>
    <h3 dir="ltr">
      {{ $vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect ? $t('VPN_HOOD_CONNECT_APP_NAME') : $t('VPN_HOOD_APP_NAME') }}
    </h3>
    <v-spacer></v-spacer>

    <!-- App mini version -->
    <span
        @click="openDebugDialog"
        tabindex="-1"
        :class="[$vpnHoodApp.data.settings.userSettings.debugData1 !== null || $vpnHoodApp.data.settings.userSettings.debugData2 !== null
         ? 'bg-warning border border-on-warning  text-black rounded-pill px-1' : 'text-disabled','text-caption me-3']"
    >
      {{ $t("ABBREVIATION_VERSION") }}
      {{$vpnHoodApp.getAppVersion(false) }}
    </span>

  </v-app-bar>

  <v-dialog v-model="isShowDebugDialog" :persistent="true" max-width="600">
    <v-card rounded="lg" color="gray" class="py-0">
      <v-card-title>Only for developers</v-card-title>

      <v-card-item class="mb-8">
        <v-text-field v-model="debugData1" clearable hide-details label="DebugData1" class="mb-4"/>
        <v-text-field v-model="debugData2" clearable hide-details label="DebugData2"/>
      </v-card-item>

      <v-divider class="border-opacity-25"></v-divider>
      <v-card-actions>
        <v-spacer/>
        <!-- Save and closeDialog -->
        <v-btn
            rounded="pill"
            variant="text"
            class="px-4"
            text="Ok"
            @click="saveDebugData()"
        />

        <!-- Cancel -->
        <v-btn
            rounded="pill"
            variant="tonal"
            class="px-4"
            text="Cancel"
            @click="isShowDebugDialog = false"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {ComponentRouteController} from "@/services/ComponentRouteController";
import {AppName, UiConstants} from "@/UiConstants";

export default defineComponent({
  name: "HomeAppBar",
  data() {
    return {
      AppName,
      ComponentRouteController,
      UiConstants,
      isShowDebugDialog: false,
      openDebugDialogCounter: 0,
    }
  },
  computed:{
    debugData1:{
      get(): string | null | undefined{
        return this.$vpnHoodApp.data.settings.userSettings.debugData1;
      },
      set(value: string | null) {
        this.$vpnHoodApp.data.settings.userSettings.debugData1 = value === "" ? null : value;
      }
    },
    debugData2:{
      get(): string | null | undefined{
        return this.$vpnHoodApp.data.settings.userSettings.debugData2;
      },
      set(value: string | null) {
        this.$vpnHoodApp.data.settings.userSettings.debugData2 = value === "" ? null : value;
      }
    }
  },
  methods: {
    openDebugDialog(){
      this.openDebugDialogCounter++;
      if (this.$vpnHoodApp.data.settings.userSettings.debugData1 || this.$vpnHoodApp.data.settings.userSettings.debugData2)
        this.isShowDebugDialog = true;

      else if(this.openDebugDialogCounter === 5)
        this.isShowDebugDialog = true;

      // reset counter if no click within 1 second
      setTimeout(()=>{
        this.openDebugDialogCounter = 0;
      },3000)
    },

    async saveDebugData() {
      await this.$vpnHoodApp.saveUserSetting();
      this.isShowDebugDialog = false;
    }
  }
})
</script>