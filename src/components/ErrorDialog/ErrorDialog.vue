<script setup lang="ts">
import { getStorage, ref, uploadBytes } from 'firebase/storage';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import { computed } from 'vue';
import { ConnectManager } from '@/helpers/ConnectManager';
import i18n from '@/locales/i18n';
import { ClientProfileUpdateParams, PatchOfString } from '@/services/VpnHood.Client.Api';
import { UiConstants } from '@/helpers/UiConstants';
const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const props = defineProps<{
  modelValue: boolean,
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void,
}>();

const dialogData = computed(() => vhApp.data.uiState.errorDialogData);

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
    const reportId: string =
      new Date().toISOString().substring(0, 19).replace(/:/g, '').replace(/-/g, '') + '-' +
      vhApp.data.settings.clientId.substring(0, 8) + '@' +
      Math.random().toString().substring(2, 10);

    const link: string = `https://docs.google.com/forms/d/e/1FAIpQLSeOT6vs9yTqhAONM2rJg8Acae-oPZTecoVrdPrzJ-3VsgJk0A/viewform?usp=sf_link&entry.450665336=${reportId}`;
    window.open(link, 'VpnHood-BugReport');

    // get report
    const url: string = vhApp.data.serverUrl + UiConstants.logFileLocation;
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
  >
    <v-card
      :title="locale('MESSAGE')"
      append-icon="mdi-alert-circle-outline"
      color="dialog-alert"
    >

      <v-card-text class="text-dialog-alert-text text-body-2">{{ dialogData.message || 'Oops! Could not even send the report details!' }}</v-card-text>

      <v-card-item v-if="dialogData.showChangeServerToAutoButton || (dialogData.canDiagnose &&
      !vhApp.data.state.hasDiagnoseRequested) || dialogData.promptForLog">

        <v-defaults-provider :defaults="{
          'VBtn':{
            rounded:'pill',
            variant: 'tonal',
            color: 'dialog-alert-btn',
            class: 'text-transform-none mb-3',
            block: true
          }
        }">

          <!-- Change location to auto -->
          <v-btn v-if="dialogData.showChangeServerToAutoButton"
            variant="flat"
            :text="locale('CONFIRM_CHANGE_LOCATION_TO_AUTO')"
            @click="vhApp.data.state.clientProfile?.clientProfileId
          && changeLocationToAuto(vhApp.data.state.clientProfile.clientProfileId)"
          />

          <!-- Diagnose -->
          <v-btn v-if="dialogData.canDiagnose && !vhApp.data.state.hasDiagnoseRequested"
            prepend-icon="mdi-stethoscope"
            :text="locale('DIAGNOSE')"
            @click="diagnose()"
          />

          <!-- OpenReport -->
          <v-btn v-if="dialogData.promptForLog"
            prepend-icon="mdi-open-in-new"
            :href="vhApp.data.serverUrl + UiConstants.logFileLocation"
            :text="locale('OPEN_REPORT')"
            target="_blank"
          />

          <!-- SendReport -->
          <v-btn v-if="dialogData.promptForLog"
            prepend-icon="mdi-send-outline"
            target="_blank"
            :text="locale('SEND_REPORT')"
            @click="sendReport()"
          />

        </v-defaults-provider>

      </v-card-item>

      <v-card-actions >
        <!-- Close -->
        <v-btn :text="locale('CLOSE')" @click="emit('update:modelValue', false)" />
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>
