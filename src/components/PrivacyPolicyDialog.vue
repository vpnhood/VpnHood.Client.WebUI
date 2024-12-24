<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';

const vhApp = VpnHoodApp.instance;

const props = defineProps<{
  modelValue: boolean,
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void,
}>();

async function accept(): Promise<void>{
  vhApp.data.settings.userSettings.isLicenseAccepted = true;
  await vhApp.saveUserSetting();
  emit('update:modelValue',false);
}
</script>

<template>
  <v-dialog
    :modelValue="props.modelValue"
    @update:modelValue="emit('update:modelValue',$event)"
    :close-on-back="true"
    :fullscreen="true"
    :scrollable="true"
    :persistent="true"
  >
    <v-card color="primary-darken-2" class="pa-5">
      <v-card-title class="text-center text-white pt-0 pb-2">VpnHood! CONNECT Privacy Policy</v-card-title>
      <v-divider/>

      <v-card-text class="text-body-2 px-2">
        <p class="pb-4 text-disabled">
          Welcome to VpnHood! CONNECT, Your privacy is of utmost importance to us. Before you proceed, we strongly encourage you to take a few moments to read through our Privacy Policy. This policy outlines the types of personal information we collect, how we use this information, and the measures we take to safeguard your data.<br/><br/>Understanding our Privacy Policy will help you make informed decisions about your use of our app. If you have any questions or concerns about our policy, please don’t hesitate to contact us.<br/><br/>Once you’ve read and understood our Privacy Policy, please click on the ‘Accept and Continue’ button to proceed with using our app. By clicking ‘Accept and Continue’, you acknowledge that you accept the terms outlined in our Privacy Policy.
        </p>
        <span>Please read our</span>
        <a
          class="text-secondary font-weight-bold ms-1"
          href="https://www.vpnhood.com/products/vpnhood-connect/privacy-policy"
          target="_blank"
        >
          Privacy Policy
          <v-icon icon="mdi-open-in-new"/>
        </a>
      </v-card-text>

      <v-card-actions>
        <!-- Accept button -->
        <v-btn
          color="tertiary"
          block
          rounded="pill"
          variant="flat"
          text="Accept and continue"
          @click="accept"
          class="text-primary-darken-2"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
