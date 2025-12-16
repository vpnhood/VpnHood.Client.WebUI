<script setup lang="ts">
import ProxyListItem from '@/components/Proxies/ProxyListItem.vue';
import { ProxySheetType } from '@/components/Proxies/ProxyUtils';
import { ref, toRef } from 'vue';
import i18n from '@/locales/i18n';
import {
  type AppProxyEndPointInfo,
  ProxyEndPoint,
  ProxyEndPointInfo,
  type ProxyEndPointStatus,
  ProxyProtocol
} from '@/services/VpnHood.Client.Api';
import { ComponentRouteController } from '@/services/ComponentRouteController';
import { ComponentName } from '@/helpers/UiConstants';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import AddOrEditProxy from '@/components/Proxies/Manual/AddOrEditProxy.vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const props = defineProps<{
  isLoading: boolean,
  proxies: AppProxyEndPointInfo[],
}>();

const emit = defineEmits<{
  (event: 'loadProxies'): void;
}>();

const loading = toRef(props, 'isLoading');
const isResettingStates = ref(false);
const isImporting = ref(false);
const isShowAddOrEditSheet = ref(new ComponentRouteController(ComponentName.AddOrEditProxySheet));
const addOrdEditSheetType = ref<ProxySheetType>(ProxySheetType.add);
const isDisableButtons = ref(isResettingStates.value || props.isLoading || isImporting.value);
const proxyEndPoint = ref<ProxyEndPoint | null>(null);
const proxyStatus = ref<ProxyEndPointStatus | null>(null);

function addProxy(): void {
  proxyEndPoint.value = new ProxyEndPoint({
    id: '',
    host: '',
    port: 8080,
    protocol: ProxyProtocol.Http,
    isEnabled: true,
    username: '',
    password: '',
    url: ''
  });

  addOrdEditSheetType.value = ProxySheetType.add;
  isShowAddOrEditSheet.value.show();
}
function edditProxy(selectedProxyEndPoint: ProxyEndPointInfo): void {
  proxyStatus.value = selectedProxyEndPoint.status;
  proxyEndPoint.value =  selectedProxyEndPoint.endPoint;
  addOrdEditSheetType.value = ProxySheetType.edit;
  isShowAddOrEditSheet.value.show();
}
function addProxyList(): void {
  addOrdEditSheetType.value = ProxySheetType.addList;
  isShowAddOrEditSheet.value.show();
}
async function resetStates(): Promise<void> {
  try {
    isResettingStates.value = true;
    await vhApp.proxyEndPointClient.resetStates();
    emit('loadProxies');
  } finally {
    isResettingStates.value = false;
  }
}
async function deleteAllProxies(): Promise<void> {
  if (!await vhApp.showConfirmDialog(locale('REMOVE_ALL_PROXIES'), locale('REMOVE_ALL_PROXIES_MSG')))
    return;

  try {
    loading.value = true;
    await vhApp.proxyEndPointClient.deleteAll();
    emit('loadProxies');
  }
  catch {
    loading.value = false;
  }
}

</script>

<template>
  <!-- Proxies list -->
  <config-card :loading="loading ? 'highlight' : false">
    <v-card-item>

      <!-- Title and Menu button -->
      <div class="d-flex align-center justify-space-between">
        <span>{{ locale('PROXIES') }}</span>
        <v-btn
          v-if="props.proxies.length"
          icon
          density="compact"
          variant="plain"
          :disabled="isDisableButtons"
        >
          <v-icon>mdi-dots-vertical</v-icon>
          <v-menu activator="parent">
            <!-- Menu items -->
            <v-list>

              <!-- Reset states -->
              <v-list-item
                :title="locale('PROXY_RESET_STATES')"
                prepend-gap="10px"
                prepend-icon="mdi-refresh"
                @click="resetStates()"
              />

              <v-divider />

              <!-- Delete all -->
              <v-list-item
                :title="locale('PROXY_DELETE_ALL')"
                prepend-gap="10px"
                prepend-icon="mdi-delete"
                base-color="error"
                @click="deleteAllProxies()"
              />

            </v-list>
          </v-menu>
        </v-btn>
      </div>

      <!-- Add proxy buttons -->
      <v-row class="my-2" dense>

        <!-- Add single proxy -->
        <v-col cols="6">
          <v-btn
            block
            rounded="pill"
            variant="tonal"
            color="highlight"
            class="text-transform-none"
            prepend-icon="mdi-plus"
            :disabled="isDisableButtons"
            :text="locale('ADD')"
            @click="addProxy()"
          />
        </v-col>

        <!-- Add proxy list -->
        <v-col cols="6">
          <v-btn
            block
            rounded="pill"
            variant="tonal"
            color="highlight"
            class="text-capitalize"
            prepend-icon="mdi-playlist-plus"
            :disabled="isDisableButtons"
            :text="locale('ADD_LIST')"
            @click="addProxyList()"
          />
        </v-col>

      </v-row>

    </v-card-item>

    <!-- Proxy list loading skeleton -->
    <template v-if="loading">
      <v-skeleton-loader color="config-card-bg" type="list-item-two-line"></v-skeleton-loader>
      <v-skeleton-loader color="config-card-bg" type="list-item-two-line"></v-skeleton-loader>
      <v-skeleton-loader color="config-card-bg" type="list-item-two-line"></v-skeleton-loader>
      <v-skeleton-loader color="config-card-bg" type="list-item-two-line"></v-skeleton-loader>
    </template>

    <!-- Proxy list -->
    <v-list v-else-if="props.proxies.length" lines="three" bg-color="transparent">
      <proxy-list-item
        v-for="(proxy, index) in props.proxies"
        :key="proxy.endPoint.id"
        :proxy="proxy"
        :class="{'border-b': index !== props.proxies.length - 1}"
        @click="edditProxy(proxy)"
      />
    </v-list>

    <!-- Empty list message -->
    <v-card-text v-else class="text-disabled text-center">
      {{ locale('PROXY_LIST_EMPTY') }}
    </v-card-text>

  </config-card>

  <add-or-edit-proxy
    v-if="proxyEndPoint"
    v-model="isShowAddOrEditSheet.isVisible"
    :proxy-type="addOrdEditSheetType"
    :selected-proxy-end-point="proxyEndPoint"
    :proxy-status="proxyStatus"
    @loadProxies="emit('loadProxies')"
  />

</template>
