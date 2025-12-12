<script setup lang="ts">
import { AppProxyEndPointInfo, ProxyEndPoint } from '@/services/VpnHood.Client.Api';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { ProxySheetType } from '@/components/Proxies/ProxyUtils';
import { computed, ref, toRef, watch } from 'vue';
import { Validators } from '@/helpers/Validators';
import ProxyFields from '@/components/Proxies/ProxyFields.vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const props = defineProps<{
  modelValue: boolean,
  proxyType: ProxySheetType,
  selectedProxyEndPoint: ProxyEndPoint,
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void,
  (e: 'loadProxies'): void;
}>();

const proxy = toRef(props, 'selectedProxyEndPoint');
const isFieldDirty = ref(false);
const isProcessing = ref(false);
const oldProxyId = ref('');
const proxyList = ref('');
const isAddButtonAvailable = computed((): boolean => {
  if (isProcessing.value) return false;
  if (props.proxyType === ProxySheetType.addList) return !Validators.isEmptyString(proxyList.value);
  return fieldRules.host() === true && fieldRules.port() === true;
});

const fieldRules = {
  host: () => !Validators.isEmptyString(proxy.value.host) || locale('PROXY_REQUIRED_HOST'),
  port: () => proxy.value.port > 0 && proxy.value.port <= 65535 || locale('PROXY_INVALID_PORT')
};

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    // Reset fields when opening
    oldProxyId.value = props.selectedProxyEndPoint.id;
  }
})

async function processHostField(): Promise<void> {
  isFieldDirty.value = true;
  if (Validators.isEmptyString(proxy.value.host) || fieldRules.port() !== true || isProcessing.value)
    return;

  try {
    isProcessing.value = true;
    const result: AppProxyEndPointInfo = await vhApp.proxyEndPointClient.parse(proxy.value.host.trim(), proxy.value);
    Object.assign(proxy.value, result.endPoint);
    isFieldDirty.value = false;
  } finally {
    isProcessing.value = false;
  }
}

async function addOrUpdateProxy(){
  isProcessing.value = true;
  switch (props.proxyType) {
    case ProxySheetType.add:
      await vhApp.proxyEndPointClient.add(proxy.value);
      break;
    case ProxySheetType.addList:
      await vhApp.proxyEndPointClient.import(proxyList.value);
      break;
    default:
      await vhApp.proxyEndPointClient.update(oldProxyId.value, proxy.value);
      break;
  }
  closeSheet();
}

async function deleteProxy(): Promise<void> {
  if (!await vhApp.showConfirmDialog(locale('REMOVE_PROXY'), locale('REMOVE_PROXY_MSG')))
    return;

  try {
    isProcessing.value = true;
    await vhApp.proxyEndPointClient.delete(proxy.value.id);
    closeSheet();
  }
  finally {
    isProcessing.value = false;
  }
}


function closeSheet(){
  emit('update:modelValue',false);
  emit('loadProxies');
  isProcessing.value = false;
}

</script>

<template>
  <v-bottom-sheet
    :modelValue="props.modelValue"
    @update:modelValue="emit('update:modelValue', $event)"
    width="100%"
    max-width="100%"
  >

    <config-card color="background" class="rounded-b-0" :disabled="isProcessing" :loading="isProcessing">

      <v-card-item>
        <div class="d-flex align-center justify-space-between border-b pb-3 mb-2">
          <!-- Page title -->
          <h4>{{ locale(props.proxyType) }}</h4>

          <!-- Remove button on the edit mode -->
          <v-btn
            v-if="props.proxyType === ProxySheetType.edit"
            :text="locale('REMOVE')"
            variant="text"
            density="comfortable"
            color="error"
            @click="deleteProxy()"
          />
        </div>

        <!-- Add proxy list -->
        <p class="text-caption text-disabled mb-3">{{locale('PROXY_IMPORT_DESC')}}</p>
        <v-textarea
          v-if="props.proxyType === ProxySheetType.addList"
          v-model="proxyList"
          :label="locale('PROXY_IMPORT_LABEL')"
          variant="outlined"
          hide-details="auto"
          auto-grow
          rows="6"
        />

        <!-- Add or update proxy fields -->
        <proxy-fields
          v-else
          :field-rules="fieldRules"
          :proxy-end-point="proxy"
          @process-host-field="processHostField"
        />

      </v-card-item>

      <v-card-actions>

        <!-- Cancel button -->
        <v-btn
          :text="locale('CANCEL')"
          variant="plain"
          @click="emit('update:modelValue',false)"
        />

        <!-- Add or update button -->
        <v-btn
          :text="locale(props.proxyType === ProxySheetType.edit ? 'OK' : 'ADD')"
          :disabled="!isAddButtonAvailable"
          @click="addOrUpdateProxy()"
        />

      </v-card-actions>
    </config-card>
  </v-bottom-sheet>
</template>
