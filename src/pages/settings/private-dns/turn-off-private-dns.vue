<script lang="ts" setup>
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import AppBar from '@/components/AppBar.vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;
</script>

<template>
  <v-sheet>
    <app-bar/>

    <div class="text-center my-5">
      <v-avatar size="80" color="config-card-bg">
        <v-icon icon="mdi-server-off" color="tonal-icon-btn" size="50px" />
      </v-avatar>

    </div>

    <p class="text-disabled">{{locale("PRIVATE_DNS_HOW_TO_TURN_OFF_DESC")}}</p>

      <v-card color="config-card-bg" class="my-5" rounded="xl">
        <v-card-item>
          <ol class="ms-5 d-flex flex-column ga-5 py-3 text-medium-emphasis" style="line-height: 28px">
            <li v-html="locale('PRIVATE_DNS_TURN_OFF_STEP_1')"/>
            <li v-html="locale('PRIVATE_DNS_TURN_OFF_STEP_2')"/>
            <li v-html="locale('PRIVATE_DNS_TURN_OFF_STEP_3')"/>
            <li v-html="locale('PRIVATE_DNS_TURN_OFF_STEP_4')"/>
          </ol>
        </v-card-item>
      </v-card>

    <div v-if="vhApp.data.intentFeatures.isSystemSettingsSupported" class="text-center">
      <btn-style-3
        class="w-100"
       append-icon="mdi-open-in-new"
       :text="locale('OPEN_SYSTEM_SETTINGS')"
       @click="vhApp.intentsClient.openSystemSettings()"
      />
    </div>

    <p class="text-disabled mt-5">{{locale("PRIVATE_DNS_HOW_TO_TURN_OFF_FINAL_DESC")}}</p>
  </v-sheet>
</template>
