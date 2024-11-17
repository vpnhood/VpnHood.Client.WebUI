<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { onUpdated, ref } from 'vue';
import { ConnectManager } from '@/helpers/ConnectManager';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const props = defineProps<{
  modelValue: boolean,
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const accessKey = ref<string>('');
const accessKeyErrorMessage = ref<string>('');
const accessKeyPrefix = ref<string>('vh://');

onUpdated(() => {
  if (!props.modelValue) {
    accessKey.value = '';
    accessKeyErrorMessage.value = '';
  }
})

async function addAccessKey(): Promise<void> {

  try {
    // Add accessKey
    const clientProfileInfo = await vhApp.addAccessKey(accessKey.value);
    await connect(clientProfileInfo.clientProfileId);

  } catch (err) {
    console.error(err);
    accessKeyErrorMessage.value = locale('INVALID_ACCESS_KEY_FORMAT');
  }
}

async function connect(clientProfileId:string): Promise<void>{

  // Close current dialog
  emit('update:modelValue', false);

  accessKey.value = '';

  // Show new server added snackbar
  vhApp.data.uiState.generalSnackbarData.message = locale('NEW_SERVER_ADDED');
  vhApp.data.uiState.generalSnackbarData.isShow = true;

  // Connect to server
  await ConnectManager.connect2(clientProfileId, false);
}

</script>

<template>
  <v-bottom-sheet
    :modelValue="props.modelValue"
    @update:modelValue="emit('update:modelValue',$event)"
    id="addServerDialog"
    :inset="true"
  >

    <!-- Add Private Server -->
    <v-card class="mx-auto pb-3" width="100%" variant="flat">
      <v-card-title>
        {{ locale('ADD_ACCESS_KEY_TITLE') }}
        <v-divider class="mt-2" />
      </v-card-title>
      <v-card-text class="pt-0">{{ locale('ADD_ACCESS_KEY_SUBTITLE') }}</v-card-text>
      <v-card-actions class="px-4">
        <v-text-field
          v-model="accessKey"
          :error-messages="accessKeyErrorMessage"
          :placeholder="accessKeyPrefix"
          @input="addAccessKey()"
          append-inner-icon="mdi-key"
          spellcheck="false"
          autocomplete="off"
          dir="ltr"
          :autofocus="true"
          density="compact"
          color="secondary"
        ></v-text-field>
      </v-card-actions>
    </v-card>

  </v-bottom-sheet>
</template>
