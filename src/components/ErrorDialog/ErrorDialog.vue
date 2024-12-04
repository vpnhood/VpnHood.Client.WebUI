<script setup lang="ts">
import { getStorage, ref, uploadBytes } from 'firebase/storage';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import { computed } from 'vue';
import { ConnectManager } from '@/helpers/ConnectManager';
import i18n from '@/locales/i18n';
import { ClientProfileUpdateParams, PatchOfString } from '@/services/VpnHood.Client.Api';
const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const props = defineProps<{
  modelValue: boolean,
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void,
}>();

const dialogData = computed(() => vhApp.data.uiState.errorDialogData);
const logFileLocation: string = '/api/app/log.txt';

async function changeLocationToAuto(clientProfileId: string): Promise<void> {
  await vhApp.clientProfileClient.update(clientProfileId, new ClientProfileUpdateParams({
    selectedLocation: new PatchOfString({value: "*/*"})
  }));
  emit('update:modelValue', false);
  await ConnectManager.connect1(false);
}

async function diagnose(): Promise<void> {
  emit('update:modelValue', false);
  await vhApp.clearLastError();
  await vhApp.diagnose();
}

async function sendReport(): Promise<void> {
  try {
    emit('update:modelValue', false);
    const reportId: string =
      vhApp.data.settings.clientId.substring(0, 8) + '@' +
      new Date().toISOString().substring(0, 19).replace(/:/g, '').replace(/-/g, '') + '-' +
      Math.random().toString().substring(2, 10);

    const link: string = `https://docs.google.com/forms/d/e/1FAIpQLSeOT6vs9yTqhAONM2rJg8Acae-oPZTecoVrdPrzJ-3VsgJk0A/viewform?usp=sf_link&entry.450665336=${reportId}`;
    window.open(link, 'VpnHood-BugReport');

    // get report
    const url: string = vhApp.data.serverUrl + logFileLocation;
    const response: Response = await fetch(url);
    const log: Blob = await response.blob();

    // Create a root reference
    const storage = getStorage();
    const spacePath: string = `logs/${reportId}.txt`;
    const storageRef = ref(storage, spacePath);

    // Send report
    uploadBytes(storageRef, log).then(() => {
      console.log('Report has been sent!');
    });
  } catch (ex) {
    console.error('Oops! Could not even send the report details!', ex);
  }
}
</script>

<template>
  <v-dialog
    :modelValue="props.modelValue"
    @update:modelValue="emit('update:modelValue',$event)"
    :persistent="true"
    max-width="600"
  >
    <v-card
      rounded="lg"
      color="secondary"
      class="pt-0 pb-3 notice position-relative text-white">
      <v-card-text>
        <v-icon class="pe-3" icon="mdi-alert-circle-outline"/>
        <span>{{ dialogData.message }}</span>
      </v-card-text>
      <v-divider class="mb-3 border-opacity-25" />
      <v-card-actions class="flex-column px-5">

        <!-- Change location to auto -->
        <v-btn
          v-if="dialogData.showChangeServerToAutoButton"
          rounded="pill"
          variant="flat"
          block
          class="text-center mb-4 text-secondary"
          :text="locale('CONFIRM_CHANGE_LOCATION_TO_AUTO')"
          @click="vhApp.data.state.clientProfile?.clientProfileId
          && changeLocationToAuto(vhApp.data.state.clientProfile.clientProfileId)"
        />

        <!-- Diagnose -->
        <v-btn
          v-if="dialogData.canDiagnose"
          rounded="pill"
          variant="flat"
          block
          class="text-center mb-4 text-secondary"
          :text="locale('DIAGNOSE')"
          @click="diagnose()"
        />

        <!-- OpenReport -->
        <v-btn
          v-if="dialogData.logExists"
          rounded="pill"
          variant="flat"
          block
          prepend-icon="mdi-open-in-new"
          class="text-center mb-4 text-secondary"
          :href="vhApp.data.serverUrl + logFileLocation"
          :text="locale('OPEN_REPORT')"
          target="_blank"
        />

        <!-- SendReport -->
        <v-btn
          v-if="dialogData.logExists"
          rounded="pill"
          variant="flat"
          block
          prepend-icon="mdi-send-outline"
          class="text-center mb-4 text-secondary"
          target="_blank"
          :text="locale('SEND_REPORT')"
          @click="sendReport()"
        />

        <!-- Close -->
        <v-btn
          rounded="pill"
          variant="flat"
          block
          class="text-center text-secondary"
          :text="locale('CLOSE')"
          @click="emit('update:modelValue', false)"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
