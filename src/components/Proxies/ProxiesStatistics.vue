<script setup lang="ts">
import i18n from '@/locales/i18n';
import { AppProxyEndPointManagerStatus } from '@/services/VpnHood.Client.Api';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import { ref } from 'vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;
const proxyStats = ref<AppProxyEndPointManagerStatus | null>(vhApp.data.state.proxyEndPointManagerStatus ?? null);
</script>

<template>
  <config-card>
    <v-card-item class="smallSelect">
      <span>{{ locale('PROXY_STATS_RECENT_CONNECTIONS') }}</span>
      <v-row class="mt-2" dense>
        <v-col cols="6" sm="3">
          <v-sheet class="pa-3 rounded-lg">
            <div class="text-caption text-disabled">{{ locale('PROXY_STATS_SUCCEEDED') }}</div>
            <div class="text-h6 text-success">{{ proxyStats?.sessionStatus?.succeededCount }}</div>
          </v-sheet>
        </v-col>
        <v-col cols="6" sm="3">
          <v-sheet class="pa-3 rounded-lg">
            <div class="text-caption text-disabled">{{ locale('PROXY_STATS_FAILED') }}</div>
            <div class="text-h6 text-error">{{ proxyStats?.sessionStatus?.failedCount }}</div>
          </v-sheet>
        </v-col>
        <v-col cols="12" sm="6">
          <v-sheet class="pa-3 rounded-lg">
            <div class="text-caption text-disabled mb-1">{{ locale('PROXY_STATS_SERVERS') }}</div>
            <v-row dense>
              <v-col cols="4">
                <div class="text-caption text-disabled">{{ locale('PROXY_STATS_SUCCEEDED') }}</div>
                <div class="text-subtitle-1 text-success">{{ proxyStats?.succeededServerCount }}
                </div>
              </v-col>
              <v-col cols="4">
                <div class="text-caption text-disabled">{{ locale('PROXY_STATS_FAILED') }}</div>
                <div class="text-subtitle-1 text-error">{{ proxyStats?.failedServerCount }}</div>
              </v-col>
              <v-col cols="4">
                <div class="text-caption text-disabled">{{ locale('PROXY_STATS_DISABLED') }}</div>
                <div class="text-subtitle-1 text-medium-emphasis">{{ proxyStats?.disabledServerCount
                  }}</div>
              </v-col>
            </v-row>
          </v-sheet>
        </v-col>
      </v-row>
    </v-card-item>
  </config-card>
</template>
