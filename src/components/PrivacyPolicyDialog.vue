<script setup lang="ts">
import {LocalStorage} from "@/helper/UiConstants";
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const props = defineProps<{
  modelValue: boolean,
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void,
}>();

async function accept(): Promise<void>{
  localStorage.setItem(LocalStorage.acceptedPrivacyPolicy, "true");
  try {
    await vhApp.loadAccount();
  }
  finally {
    emit('update:modelValue',false);
  }
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
      <v-card-title class="text-center text-white pt-0 pb-2">
        {{locale("VPNHOOD_CONNECT_PRIVACY_POLICY_TITLE")}}
      </v-card-title>
      <v-divider/>

      <v-card-text class="text-body-2 px-2">
        <p class="pb-4 text-disabled" v-html="locale('VPNHOOD_CONNECT_PRIVACY_POLICY_DESC')"></p>
        <span>{{ locale("READ_PRIVACY_POLICY") }}</span>
        <a class="text-secondary font-weight-bold ms-1" href="https://www.vpnhood.com/products/vpnhood-connect/privacy-policy" target="_blank">
          {{ locale("PRIVACY_POLICY") }}
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
          :text="locale('ACCEPT')"
          @click="accept"
          class="text-primary-darken-2"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
