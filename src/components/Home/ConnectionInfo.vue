<script setup lang="ts">
import { Util } from '@/helpers/Util';
import router from '@/services/router';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

function formatSpeed(speed: number): string | void {
  return ((speed * 10) / 1000000).toFixed(2);
}
</script>

<template>
  <v-row
    align-content="center"
    justify="center"
    dir="ltr"
    :class="[vhApp.data.isConnected ? 'opacity-100' : 'opacity-0', 'mb-2']"
  >

    <!-- ConnectionStatistics -->
    <v-col cols="12" class="d-flex justify-center align-center text-white text-body-2 opacity-40 pb-0">
      <v-btn
        :text="locale('STATISTICS')"
        :tabindex="vhApp.data.isConnected ? '3' : null"
        dir="auto"
        variant="text"
        rounded="pill"
        class="d-inline-flex"
        :append-icon="Util.getLocalizedRightChevron()"
        @click="vhApp.data.isConnected ? router.push({ name: 'STATISTICS' }) : null"
      />
    </v-col>

    <!-- Download speed -->
    <v-col cols="auto" dir="ltr" class="d-inline-flex pt-1">
      <v-icon
        color="active"
        size="small"
        icon="mdi-arrow-down-thin"
        tabindex="-1"
      />
      <span class="pe-1 text-body-2 text-white">
        {{ formatSpeed(vhApp.data.state.sessionStatus?.speed.received ?? 1) }}
      </span>
      <span class="text-white opacity-40 align-self-center" style="font-size: 10px">Mbps</span>
    </v-col>

    <!-- Upload speed -->
    <v-col cols="auto" dir="ltr" class="d-inline-flex pt-1">
      <v-icon
        color="error"
        size="small"
        icon="mdi-arrow-up-thin"
        tabindex="-1"
      />
      <span class="pe-1 text-body-2 text-white">
        {{ formatSpeed(vhApp.data.state.sessionStatus?.speed.sent ?? 1) }}
      </span>
      <span class="text-white opacity-40 order-last align-self-center" style="font-size: 10px">Mbps</span>
    </v-col>
  </v-row>
</template>
