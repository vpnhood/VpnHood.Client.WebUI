<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import { computed } from 'vue';
import i18n from '@/locales/i18n';
import { ClientProfileUpdateParams, ConnectPlanId, PatchOfBoolean, PatchOfString } from '@/services/VpnHood.Client.Api';
import { UiConstants } from '@/helpers/UiConstants';
import LearningButton from '@/components/LearningButton.vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const props = defineProps<{
  modelValue: boolean,
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void,
}>();

const updateParams = new ClientProfileUpdateParams({
  selectedLocation: new PatchOfString({value: vhApp.data.uiState.autoLocationValue})
});
const dialogData = computed(() => vhApp.data.uiState.errorDialogData);

// Reconnect by Auto Location
async function changeLocationToAuto(clientProfileId: string): Promise<void> {
  updateParams.isPremiumLocationSelected = new PatchOfBoolean({value: false});
  await vhApp.clientProfileClient.update(clientProfileId, updateParams);
  await closeDialog();
  await vhApp.connect(clientProfileId, vhApp.data.uiState.autoLocationValue, false, ConnectPlanId.Normal);
}

// Reconnect by Try Premium
async function tryPremium(clientProfileId: string): Promise<void> {
  updateParams.isPremiumLocationSelected = new PatchOfBoolean({value: true});
  await vhApp.clientProfileClient.update(clientProfileId, updateParams);
  await closeDialog();
  await vhApp.connect(clientProfileId, vhApp.data.uiState.autoLocationValue, true, ConnectPlanId.PremiumByTrial);
}

async function diagnose(): Promise<void> {
  await closeDialog();
  await vhApp.diagnose();
}

async function sendReport(): Promise<void> {
  try {
    const clientId = vhApp.data.features.clientId.substring(0, 8);

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

async function removePremium(): Promise<void> {
  await vhApp.removePremium();
  await closeDialog();
}
async function closeDialog(): Promise<void> {
  await vhApp.clearLastError();
  emit('update:modelValue', false);
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

      <v-card-text v-if="dialogData.showSystemSettingButton" class="text-dialog-alert-text text-body-2">
        <p>{{locale("AD_BLOCKER_MSG_PART_1")}}</p>
        <p class="my-3">{{locale("AD_BLOCKER_MSG_PART_2")}}</p>
        <p>{{locale("AD_BLOCKER_MSG_PART_3")}}</p>
      </v-card-text>

      <v-card-text v-else class="text-dialog-alert-text text-body-2">
        {{ dialogData.message }}

        <learning-button
          v-if="dialogData.showTryPremium && vhApp.data.clientProfileId"
          :action="{ name: 'FREE_SERVERS_DISRUPTIONS' }"
        />

      </v-card-text>

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
          <v-btn v-if="dialogData.showChangeServerToAutoButton && vhApp.data.clientProfileId"
            variant="flat"
            :text="locale('CHANGE_TO_AUTO_AND_RECONNECT')"
            @click="changeLocationToAuto(vhApp.data.clientProfileId)"
          />

          <!-- Try premium -->
          <v-btn
            v-if="dialogData.showTryPremium && vhApp.data.clientProfileId"
           variant="flat"
           :text="locale('TRY_PREMIUM_FOR_FREE')"
           @click="tryPremium(vhApp.data.clientProfileId)"
          />

          <!-- Remove premium code or profile -->
          <div v-if="dialogData.showRemovePremium">
            <p class="text-dialog-alert-text text-body-2 mb-3">{{locale("CONFIRM_TO_SWITCH_MODE_MSG")}}</p>
            <v-btn
              variant="flat"
              :text="locale('YES_SWITCH_NOW')"
              @click="removePremium()"
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
