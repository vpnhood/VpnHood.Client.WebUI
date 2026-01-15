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

interface MenuItem {
  title: string,
  icon: string,
  color: string,
  confirm?:{
    required: boolean,
    title: string,
    message: string
  },
  action?: () => Promise<void>,
  bulkActionType?: BulkActionType
}
enum BulkActionType{
  deleteAll,
  disableAllFailed,
  deleteAllFailed,
  deleteAllDisabled
}

const loading = toRef(props, 'isLoading');
const isResettingStates = ref(false);
const isImporting = ref(false);
const isShowAddOrEditSheet = ref(new ComponentRouteController(ComponentName.AddOrEditProxySheet));
const addOrdEditSheetType = ref<ProxySheetType>(ProxySheetType.add);
const isDisableButtons = ref(isResettingStates.value || props.isLoading || isImporting.value);
const proxyEndPoint = ref<ProxyEndPoint>(new ProxyEndPoint({
    id: '',
    host: '',
    port: 8080,
    protocol: ProxyProtocol.Http,
    isEnabled: true,
    username: '',
    password: '',
    url: ''
  })
);
const proxyStatus = ref<ProxyEndPointStatus | null>(null);
const menuItems: MenuItem[] = [
  {
    title: locale('PROXY_RESET_STATES'),
    icon: 'mdi-refresh',
    color: '',
    action: resetStates
  },
  {
    title: locale('DISABLE_ALL_FAILED'),
    icon: 'mdi-cancel',
    color: '',
    confirm:{
      required: true,
      title: locale('DISABLE_ALL_FAILED'),
      message: locale('DISABLE_ALL_FAILED_PROXIES_MSG')
    },
    bulkActionType: BulkActionType.disableAllFailed
  },
  {
    title: locale('REMOVE_ALL_FAILED'),
    icon: 'mdi-delete-alert',
    color: '',
    confirm:{
      required: true,
      title: locale('REMOVE_ALL_FAILED'),
      message: locale('REMOVE_ALL_FAILED_MSG')
    },
    bulkActionType: BulkActionType.deleteAllFailed
  },
  {
    title: locale('REMOVE_ALL_DISABLED'),
    icon: 'mdi-delete-forever',
    color: '',
    confirm:{
      required: true,
      title: locale('REMOVE_ALL_DISABLED'),
      message: locale('REMOVE_ALL_DISABLED_MSG')
    },
    bulkActionType: BulkActionType.deleteAllDisabled
  },
  {
    title: locale('REMOVE_ALL'),
    icon: 'mdi-delete',
    color: 'error',
    confirm:{
      required: true,
      title: locale('REMOVE_ALL'),
      message: locale('REMOVE_ALL_PROXIES_MSG')
    },
    bulkActionType: BulkActionType.deleteAll
  },
];

function addProxy(): void {
  addOrdEditSheetType.value = ProxySheetType.add;
  isShowAddOrEditSheet.value.show();
}
function editeProxy(selectedProxyEndPoint: ProxyEndPointInfo): void {
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

async function bulkAction(selectedItem: MenuItem): Promise<void> {
  if (selectedItem.confirm?.required && !await vhApp.showConfirmDialog(selectedItem.confirm.title,
    selectedItem.confirm.message))
    return;

  switch (selectedItem.bulkActionType) {
    case BulkActionType.disableAllFailed:
      await vhApp.proxyEndPointClient.disableAllFailed();
      break;
    case BulkActionType.deleteAll:
      await vhApp.proxyEndPointClient.deleteAll();
      break;
    case BulkActionType.deleteAllDisabled:
      await vhApp.proxyEndPointClient.deleteAll(false, false, false, true);
      break;
    case BulkActionType.deleteAllFailed:
      await vhApp.proxyEndPointClient.deleteAll(false, true);
      break;
  }
  emit('loadProxies');
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
                v-for="(item, index) in menuItems"
                prepend-gap="10px"
                :class="{'border-b': index < (menuItems.length - 1)}"
                :key="index"
                :title="item.title"
                :prepend-icon="item.icon"
                :base-color="item.color"
                @click="item.action ? item.action() : bulkAction(item)"
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
        @click="editeProxy(proxy)"
      />
    </v-list>

    <!-- Empty list message -->
    <v-card-text v-else class="text-disabled text-center">
      {{ locale('PROXY_LIST_EMPTY') }}
    </v-card-text>

  </config-card>

  <add-or-edit-proxy
    v-model="isShowAddOrEditSheet.isVisible"
    :proxy-type="addOrdEditSheetType"
    :selected-proxy-end-point="proxyEndPoint"
    :proxy-status="proxyStatus"
    @loadProxies="emit('loadProxies')"
  />

</template>
