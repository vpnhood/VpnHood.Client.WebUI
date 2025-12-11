<script setup lang="ts">
import { ProxyEndPoint, ProxyProtocol } from '@/services/VpnHood.Client.Api';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { ProxySheetType } from '@/components/Proxies/ProxyUtils';
import { ref, toRef, watch } from 'vue';
import { Validators } from '@/helpers/Validators';

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


const actionButtonText = ref<string>(props.proxyType === ProxySheetType.edit ? 'OK' : 'ADD');
const proxy = toRef(props, 'selectedProxyEndPoint');

const protocolItems = [
  { value: ProxyProtocol.Http, title: 'http' },
  { value: ProxyProtocol.Https, title: 'https' },
  { value: ProxyProtocol.Socks4, title: 'socks4' },
  { value: ProxyProtocol.Socks5, title: 'socks5' }
];

const isShowAuthenticationFields = ref<boolean>(
  !Validators.isEmptyString(proxy.value.username) || !Validators.isEmptyString(proxy.value.password)
);

// Reset username and password field when the isShowAuthenticationFields switch state changed
watch(isShowAuthenticationFields, async (newVal, oldVal) => {
  if (oldVal === true && newVal === false) {
    proxy.value.username = '';
    proxy.value.password = ''
  }
});
async function addOrUpdateProxy(){
  console.log(typeof proxy.value);
  console.log(typeof proxy.value.port);
  console.log(proxy.value.port);
  return;
  if (props.proxyType === ProxySheetType.add) {
    await vhApp.proxyEndPointClient.add(proxy.value);
  }
  else {
    await vhApp.proxyEndPointClient.update(proxy.value.id, proxy.value);
  }
  emit('loadProxies');
  emit('update:modelValue',false);
}

</script>

<template>
  <v-bottom-sheet
    :modelValue="props.modelValue"
    @update:modelValue="emit('update:modelValue', $event)"
    width="100%"
    max-width="100%"
  >

    <config-card color="background" class="rounded-b-0" >

      <v-card-item>
        <h4 class="border-b pb-3 mb-2">{{ locale(props.proxyType) }}</h4>

        <div class="d-flex align-center justify-space-between">
          <span>{{ locale('PROXY_ENABLED') }}</span>
          <v-switch v-model="proxy.isEnabled" density="compact" hide-details />
        </div>

        <v-text-field
          v-model="proxy.host"
          :label="locale('PROXY_HOST')"
          hide-details="auto"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          color="highlight"
          class="mt-4"
        />

        <v-text-field
          v-model="proxy.port"
          :label="locale('PROXY_PORT')"
          type="number"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          color="highlight"
          class="mt-4"
        />

        <v-select
          v-model="proxy.protocol"
          :items="protocolItems"
          item-title="title"
          item-value="value"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          color="highlight"
          :label="locale('PROXY_PROTOCOL')"
        />

        <div class="d-flex align-center justify-space-between">
          <span>{{ locale('AUTHENTICATION') }}</span>
          <v-switch v-model="isShowAuthenticationFields" density="compact" hide-details/>
        </div>

        <template v-if="isShowAuthenticationFields">
          <v-text-field
            v-model="proxy.username"
            :label="locale('PROXY_USERNAME')"
            hide-details="auto"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            color="highlight"
            class="mt-4"
          />

          <v-text-field
            v-model="proxy.password"
            :label="locale('PROXY_PASSWORD')"
            hide-details="auto"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            color="highlight"
            class="mt-4"
            type="password"
          />
        </template>
      </v-card-item>

      <v-card-actions>
        <v-btn :text="locale('CANCEL')" variant="plain" @click="emit('update:modelValue',false)" />
        <v-btn :text="locale(actionButtonText)" @click="addOrUpdateProxy()" />
      </v-card-actions>

    </config-card>
  </v-bottom-sheet>
</template>
