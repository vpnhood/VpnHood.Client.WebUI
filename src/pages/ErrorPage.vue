<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;
function reloadUI() {
  document.location.reload();
}
</script>

<template>
  <div style="background-color: #122272;">
    <v-container class="h-screen text-center text-white">
      <!-- App name -->
      <h3>
        {{vhApp.data.features.isAccountSupported ? locale('VPN_HOOD_CONNECT_APP_NAME') : locale('VPN_HOOD_APP_NAME') }}
      </h3>

      <v-row align-content="center" justify="center" class="h-100">
        <v-col cols="11" sm="7" lg="4">
          <div style="z-index: 1;" class="d-inline-flex align-center justify-center bg-master-green rounded-lg pa-2 position-relative">
            <v-icon size="80px" color="white" icon="mdi-emoticon-sad-outline"/>
          </div>
          <v-card id="cardView" rounded="lg" class="pa-4 pt-15">
            <v-card-title>{{locale("OOPS")}}</v-card-title>
            <v-card-text>{{locale('LOAD_APP_ERROR_DESC')}}</v-card-text>
            <v-card-actions>
              <v-btn
                block color="master-green"
                variant="tonal"
                :text="locale('RELOAD_APP')"
                @click="reloadUI"
              />
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
#cardView{
  margin-top: -50px;
}
</style>
