<script setup lang="ts">
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
    const clientId = vhApp.data.settings.clientId.substring(0, 8);

    // get the report file content.
    const url: string = vhApp.data.serverUrl + UiConstants.logFileLocation;
    const response: Response = await fetch(url);
    const fileContent: string = await response.text();

    await vhApp.vhFirebase?.sendReport(fileContent, clientId, 'logs', vhApp.data.features.isTv);
  }
  catch (ex) {
    console.error('Oops! Could not even send the report details!', ex);
  }
}
async function closeDialog(): Promise<void> {
  await vhApp.clearLastError();
  emit('update:modelValue', false)
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

      <v-card-text class="text-dialog-alert-text text-body-2">{{ dialogData.message }}</v-card-text>

      <v-card-item class="py-1">

          <v-defaults-provider :defaults="{
          'VBtn':{
            'rounded':'pill',
            'variant': 'tonal',
            'color': 'dialog-alert-btn',
            'class': 'text-transform-none mb-3',
            'block': true
            }
        }"
          >

          <!-- Change location to auto -->
          <v-btn v-if="dialogData.showChangeServerToAutoButton"
            variant="flat"
            :text="locale('CONFIRM_CHANGE_LOCATION_TO_AUTO')"
            @click="vhApp.data.state.clientProfile?.clientProfileId
          && changeLocationToAuto(vhApp.data.state.clientProfile.clientProfileId)"
          />

          <!-- Remove premium code or profile -->
          <div v-if="dialogData.showRemovePremium">
            <p class="text-dialog-alert-text text-body-2 mb-3">{{locale("CONFIRM_TO_SWITCH_MODE_MSG")}}</p>
            <v-btn
              variant="flat"
              :text="locale('YES_SWITCH_NOW')"
              @click="vhApp.removePremium(); closeDialog()"
            />
          </div>

          <!-- Diagnose -->
          <v-btn v-if="dialogData.showDiagnoseButton"
            prepend-icon="mdi-stethoscope"
            :text="locale('DIAGNOSE')"
            @click="diagnose()"
          />

          <!-- OpenReport -->
          <v-btn v-if="dialogData.showLogButton && (!vhApp.data.features.isTv)"
            prepend-icon="mdi-open-in-new"
            :href="vhApp.data.serverUrl + UiConstants.logFileLocation"
            :text="locale('OPEN_REPORT')"
            target="_blank"
          />

          <!-- SendReport -->
          <v-btn v-if="dialogData.showLogButton"
            prepend-icon="mdi-send-outline"
            target="_blank"
            :text="locale('SEND_REPORT')"
            @click="sendReport()"
          />

        </v-defaults-provider>

      </v-card-item>

      <v-card-actions >
        <!-- Close -->
        <v-btn :text="locale('CLOSE')" @click="closeDialog()" />
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>
