<script setup lang="ts">
import AppBar from '@/components/AppBar.vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { ref } from 'vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const mb = 1000000;
const gb = 1000 * mb;
const downloadUnit = ref<string>('');
const uploadUnit = ref<string>('');

function calcUpload(traffic: number): number {
  if (traffic >= gb) {
    uploadUnit.value = 'GB';
    return Number((traffic / gb).toFixed(2));
  }
  uploadUnit.value = 'Mb';
  return Number((traffic / mb).toFixed(2));
}

function calcDownload(traffic: number): number {
  if (traffic >= gb) {
    downloadUnit.value = 'GB';
    return Number((traffic / gb).toFixed(2));
  }
  downloadUnit.value = 'Mb';
  return Number((traffic / mb).toFixed(2));
}

</script>

<template>
  <!-- Page header -->
  <AppBar :page-title="locale('PREMIUM_DETAILS')" />

  <v-sheet>
    <config-card>
      <v-card-title>Statistics</v-card-title>
      <v-card-text class="text-disabled text-caption mt-3">
        <div class="d-flex align-center justify-space-between">
          <span>Active users:</span>
          <span>{{ vhApp.data.state.sessionStatus?.activeClientCount }}</span>
        </div>
      </v-card-text>
    </config-card>

    <config-card>
      <v-card-title>Cycle traffic</v-card-title>
      <v-card-text class="text-disabled text-caption mt-3">
        <div v-if="vhApp.data.state.sessionStatus" class="d-flex justify-space-between pb-1">
          <span>Download:</span>
          <div>
            <span class="text-active me-1">{{ calcDownload(vhApp.data.state.sessionStatus.cycleTraffic.received)
              }}</span>
            <span>{{ downloadUnit }}</span>
          </div>
        </div>
        <v-divider class="pb-1" />
        <div v-if="vhApp.data.state.sessionStatus" class="d-flex justify-space-between">
          <span>Upload:</span>
          <div>
            <span class="text-error me-1">{{ calcUpload(vhApp.data.state.sessionStatus.cycleTraffic.sent) }}</span>
            <span>{{ uploadUnit }}</span>
          </div>
        </div>
      </v-card-text>
    </config-card>
  </v-sheet>
</template>
