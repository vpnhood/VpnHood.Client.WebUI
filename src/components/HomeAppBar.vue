<template>
  <v-app-bar color="transparent" elevation="0">

    <!-- Navigation drawer button -->
    <v-app-bar-nav-icon @click="ComponentRouteController.showComponent($componentName.NavigationDrawer)" class="ms-0"/>

    <!-- App name -->
    <v-spacer></v-spacer>
      <h3 dir="ltr">
        {{ $vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect ? $t('VPN_HOOD_CONNECT_APP_NAME') : $t('VPN_HOOD_APP_NAME')}}
      </h3>
    <v-spacer></v-spacer>

    <!-- App mini version -->
    <span class="text-disabled text-caption me-3">{{$t("ABBREVIATION_VERSION")}}{{ $vpnHoodApp.getAppVersion(false) }}</span>

  </v-app-bar>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {ComponentRouteController} from "@/services/ComponentRouteController";
import {AppName} from "@/UiConstants";

export default defineComponent({
  name: "HomeAppBar",
  computed: {
    AppName() {
      return AppName
    }
  },
  data(){
    return{
      ComponentRouteController
    }
  },
})
</script>