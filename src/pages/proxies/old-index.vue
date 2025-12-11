<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import AppBar from '@/components/AppBar.vue';
import ProxyListItem from '@/components/Proxies/ProxyListItem.vue';
import ProxyImportDialog from '@/components/Proxies/ProxyImportDialog.vue';
import ProxyDialog from '@/components/Proxies/ProxyDialog.vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { Util } from '@/helpers/Util';
import { AppProxyEndPointInfo, AppProxyEndPointManagerStatus, AppProxyMode } from '@/services/VpnHood.Client.Api';
import { ComponentRouteController } from '@/services/ComponentRouteController';
import { ComponentName } from '@/helpers/UiConstants';
import AddByUrl from '@/components/Proxies/AddByUrl.vue';


const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const proxyDialogModel = ref(new ComponentRouteController(ComponentName.ProxyDialog));
let refreshInterval: ReturnType<typeof setInterval> | null = null;
const isLoading = ref(false);
const isDeletingAll = ref(false);
const isResettingStates = ref(false);
const isImportDialogOpen = ref(false);
const importText = ref('');
const isImporting = ref(false);
const canImportProxies = computed(() => importText.value.trim().length > 0 && !isImporting.value);
const proxies = ref<AppProxyEndPointInfo[]>([]);
const deviceProxy = ref<AppProxyEndPointInfo | null>(null);
const isCustomMode = computed(() => proxyMode.value === AppProxyMode.Manual);
const autoUpdateUrl = ref('');
const autoUpdateInterval = ref('');
const previousUrl = ref('');
const selectedProxyId = ref<string | null>(null);
const proxyStats: AppProxyEndPointManagerStatus | null | undefined = computed(() =>
  vhApp.data.state.proxyEndPointManagerStatus).value;

const isShowProxyDialog = computed<boolean>({
  get: () => proxyDialogModel.value.isVisible,
  set: async (value: boolean) => {
    if (!value) selectedProxyId.value = null;
    await proxyDialogModel.value.show(value);
  }
});

const proxyMode = computed<AppProxyMode>({
  get: () => vhApp.data.userSettings.proxySettings.mode ?? AppProxyMode.NoProxy,
  set: async (value: AppProxyMode) => {
    const proxySettings = vhApp.data.userSettings.proxySettings;
    const previous = proxySettings.mode;
    if (previous === value)
      return;

    proxySettings.mode = value;
    try {
      await vhApp.saveUserSetting();
      // Don't load here - let the watchers handle it to avoid double loading
    } catch (err: unknown) {
      proxySettings.mode = previous;
      throw err;
    }
  }
});

const proxyModeItems = computed(() => ([
  { value: AppProxyMode.NoProxy, title: locale('PROXY_MODE_NOPROXY') },
  { value: AppProxyMode.Device, title: locale('PROXY_MODE_DEVICE') },
  { value: AppProxyMode.Manual, title: locale('PROXY_MODE_MANUAL') }
]));



async function loadProxies(showLoading = true): Promise<void> {
  if (isLoading.value)
    return;

  try {
    isLoading.value = showLoading;
    const response = await vhApp.proxyEndPointClient.list();
    proxies.value = Array.isArray(response) ? response : [];
  } catch (err: unknown) {
    proxies.value = [];
    throw err;
  } finally {
    isLoading.value = false;
  }
}

async function loadDeviceProxy(showLoading = true): Promise<void> {
  if (isLoading.value)
    return;

  try {
    isLoading.value = showLoading;
    const response = await vhApp.proxyEndPointClient.getDevice();
    deviceProxy.value = response ?? null;
  } catch (err: unknown) {
    deviceProxy.value = null;
    throw err;
  } finally {
    isLoading.value = false;
  }
}

async function deleteAllProxies(): Promise<void> {
  if (!proxies.value.length || isDeletingAll.value)
    return;

  if (!await vhApp.showConfirmDialog(locale('CONFIRM_REMOVE_ALL_PROXIES'), locale('ARE_YOU_SURE')))
    return;

  try {
    isDeletingAll.value = true;
    await vhApp.proxyEndPointClient.deleteAll();
    await loadProxies();
  } finally {
    isDeletingAll.value = false;
  }
}

async function resetStates(): Promise<void> {
  if (!proxies.value.length || isResettingStates.value)
    return;

  try {
    isResettingStates.value = true;
    await vhApp.proxyEndPointClient.resetStates();
    await loadProxies();
  } finally {
    isResettingStates.value = false;
  }
}

function openImportDialog(): void {
  isImportDialogOpen.value = true;
}

function closeImportDialog(): void {
  if (isImporting.value)
    return;

  isImportDialogOpen.value = false;
}

async function importProxies(): Promise<void> {
  if (!canImportProxies.value)
    return;

  try {
    isImporting.value = true;
    await vhApp.proxyEndPointClient.import(importText.value);
    await loadProxies();
    isImportDialogOpen.value = false;
  } finally {
    importText.value = '';
    isImporting.value = false;
  }
}

async function saveAutoUpdateSettings(): Promise<void> {
  try {
    const proxySettings = vhApp.data.userSettings.proxySettings;
    proxySettings.autoUpdateOptions.url = autoUpdateUrl.value.trim() || null;
    proxySettings.autoUpdateOptions.interval = autoUpdateInterval.value.trim() || null;
    await vhApp.saveUserSetting();
  } catch (err: unknown) {
    throw err;
  }
}

function loadAutoUpdateSettings(): void {
  const options = vhApp.data.userSettings.proxySettings.autoUpdateOptions;
  autoUpdateUrl.value = options.url ?? '';
  autoUpdateInterval.value = options.interval ?? '';
  previousUrl.value = autoUpdateUrl.value;
}

function startPeriodicRefresh(): void {
  if (refreshInterval) return;

  refreshInterval = setInterval(async () => {
    // Only refresh if page is visible, in custom mode, connected, and no dialog is open
    if (!document.hidden && isCustomMode.value && vhApp.data.isConnected && !isShowProxyDialog.value) {
      try {
        await loadProxies(false); // Don't show loading indicator on periodic refresh
      } catch {
        // Ignore errors on periodic refresh
      }
    }
  }, 3000);
}

function stopPeriodicRefresh(): void {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

onMounted(async () => {
  try {
    if (isCustomMode.value) {
      await loadProxies();
      startPeriodicRefresh();
    } else if (proxyMode.value === AppProxyMode.Device) {
      await loadDeviceProxy();
    }
  } catch (err: unknown) {
    await vhApp.processError(err);
  }
});

onUnmounted(() => {
  stopPeriodicRefresh();
});

// Watch mode changes to start/stop refresh and load data
watch(proxyMode, async (newMode, oldMode) => {
  if (newMode === oldMode)
    return;

  stopPeriodicRefresh();

  try {
    if (newMode === AppProxyMode.Manual) {
      loadAutoUpdateSettings();
      await loadProxies(true);
      startPeriodicRefresh();
    } else if (newMode === AppProxyMode.Device) {
      await loadDeviceProxy(true);
    } else {
      proxies.value = [];
      deviceProxy.value = null;
    }
  } catch (err: unknown) {
    await vhApp.processError(err);
  }
});

// Watch URL and interval changes to auto-save
watch([autoUpdateUrl, autoUpdateInterval], async () => {
  if (!isCustomMode.value)
    return;

  try {
    await saveAutoUpdateSettings();
  } catch (err: unknown) {
    await vhApp.processError(err);
  }
});

// Watch dialog close to refresh the specific proxy or list
watch(isShowProxyDialog, async (isOpen) => {
  if (!isOpen && isCustomMode.value && selectedProxyId.value) {
    try {
      await updateSingleProxy(selectedProxyId.value);
    } catch (err: unknown) {
      await vhApp.processError(err);
    }
  }
});

// Watch connection state changes to refresh the list
watch(() => vhApp.data.connectionState, async () => {
  if (!isCustomMode.value)
    return;

  try {
    await loadProxies(false);
  } catch {
    // Ignore errors on connection state change
  }
});

async function updateSingleProxy(proxyId: string): Promise<void> {
  try {
    const updatedProxy = await vhApp.proxyEndPointClient.get(proxyId);
    if (updatedProxy) {
      const index = proxies.value.findIndex(p => p.endPoint.id === proxyId);
      if (index !== -1) {
        proxies.value[index] = updatedProxy;
      }
    } else {
      // Proxy was deleted, remove from list
      proxies.value = proxies.value.filter(p => p.endPoint.id !== proxyId);
    }
  } catch {
    // If proxy not found (404), remove from list
    proxies.value = proxies.value.filter(p => p.endPoint.id !== proxyId);
  }
}

async function openProxy(proxyId?: string): Promise<void> {
  selectedProxyId.value = proxyId ?? null;
  isShowProxyDialog.value = true;
}

async function handleProxySaved(): Promise<void> {
  try {
    if (isCustomMode.value) {
      if (selectedProxyId.value) {
        // Update single proxy instead of reloading entire list
        await updateSingleProxy(selectedProxyId.value);
      } else {
        // New proxy was added, reload the list
        await loadProxies(true);
      }
    } else if (proxyMode.value === AppProxyMode.Device) {
      await loadDeviceProxy(true);
    }
  } catch (err: unknown) {
    await vhApp.processError(err);
  }
}
</script>

<template>
  <v-sheet>
    <app-bar />

    <!-- Proxy mode select-->
    <config-card>
      <v-card-item class="smallSelect">
        <div class="d-flex align-center justify-space-between">
          <span>{{ locale('PROXY_MODE') }}</span>

          <v-select
            v-model="proxyMode"
            :items="proxyModeItems"
            item-title="title"
            item-value="value"
            variant="plain"
            density="compact"
            single-line
            color="highlight"
            hide-details
            class="flex-grow-0 text-highlight"
          />
        </div>
      </v-card-item>
    </config-card>

    <add-by-url v-if="proxyMode == AppProxyMode.Manual" @load-proxies="loadProxies()" />

    <config-card v-if="isCustomMode">

      <v-card-actions class="pa-3 pb-0 d-flex flex-column ga-2">
        <btn-style-4 block :text="locale('PROXY_ADD')" :append-icon="Util.getLocalizedRightChevron()"
                     @click="openProxy()" />
        <v-btn block variant="text" color="highlight" class="text-transform-none"
               :disabled="isLoading || isImporting" @click="openImportDialog">
          {{ locale('PROXY_IMPORT') }}
        </v-btn>
        <v-btn block variant="text" color="highlight" class="text-transform-none"
               :disabled="!proxies.length || isResettingStates || isLoading" :loading="isResettingStates"
               @click="resetStates">
          {{ locale('PROXY_RESET_STATES') }}
        </v-btn>
        <v-btn block variant="text" color="error" class="text-transform-none"
               :disabled="!proxies.length || isDeletingAll || isLoading" :loading="isDeletingAll"
               @click="deleteAllProxies">
          {{ locale('PROXY_DELETE_ALL') }}
        </v-btn>
      </v-card-actions>

      <config-card v-if="isCustomMode && proxies.length > 5" class="mt-4 pa-3">
        <v-card-item class="pb-0">
          <span>{{ locale('PROXY_STATS_RECENT_CONNECTIONS') }}</span>
        </v-card-item>
        <v-row class="mt-2" dense>
          <v-col cols="6" sm="3">
            <v-sheet class="pa-3 rounded-lg">
              <div class="text-caption text-disabled">{{ locale('PROXY_STATS_SUCCEEDED') }}</div>
              <div class="text-h6 text-success">{{ proxyStats?.sessionStatus?.succeededCount }}</div>
            </v-sheet>
          </v-col>
          <v-col cols="6" sm="3">
            <v-sheet class="pa-3 rounded-lg">
              <div class="text-caption text-disabled">{{ locale('PROXY_STATS_FAILED') }}</div>
              <div class="text-h6 text-error">{{ proxyStats?.sessionStatus?.failedCount }}</div>
            </v-sheet>
          </v-col>
          <v-col cols="12" sm="6">
            <v-sheet class="pa-3 rounded-lg">
              <div class="text-caption text-disabled mb-1">{{ locale('PROXY_STATS_SERVERS') }}</div>
              <v-row dense>
                <v-col cols="4">
                  <div class="text-caption text-disabled">{{ locale('PROXY_STATS_SUCCEEDED') }}</div>
                  <div class="text-subtitle-1 text-success">{{ proxyStats?.succeededServerCount }}
                  </div>
                </v-col>
                <v-col cols="4">
                  <div class="text-caption text-disabled">{{ locale('PROXY_STATS_FAILED') }}</div>
                  <div class="text-subtitle-1 text-error">{{ proxyStats?.failedServerCount }}</div>
                </v-col>
                <v-col cols="4">
                  <div class="text-caption text-disabled">{{ locale('PROXY_STATS_DISABLED') }}</div>
                  <div class="text-subtitle-1 text-medium-emphasis">{{ proxyStats?.disabledServerCount
                    }}</div>
                </v-col>
              </v-row>
            </v-sheet>
          </v-col>
        </v-row>
      </config-card>


      <v-divider class="mt-3" />

      <v-progress-linear v-if="isLoading" color="highlight" indeterminate />

      <template v-else>
        <v-card-text v-if="!proxies.length" class="text-disabled">
          {{ locale('PROXY_LIST_EMPTY') }}
        </v-card-text>

        <v-list v-else lines="three" bg-color="transparent">
          <ProxyListItem v-for="proxy in proxies" :key="proxy.endPoint.id" :proxy="proxy"
                         @click="openProxy(proxy.endPoint.id)" />
        </v-list>
      </template>
    </config-card>

    <config-card v-else-if="proxyMode === AppProxyMode.Device">

      <v-progress-linear v-if="isLoading" color="highlight" indeterminate />

      <v-card-text v-else-if="!deviceProxy" class="text-disabled">
        {{ locale('NO_SYSTEM_PROXY') }}
      </v-card-text>

      <v-list v-else lines="three" bg-color="transparent">
        <ProxyListItem :proxy="deviceProxy" @click="openProxy('device')" />
      </v-list>

    </config-card>

    <proxy-import-dialog
      v-model="isImportDialogOpen"
      v-model:text="importText"
      :is-importing="isImporting"
      :can-import="canImportProxies"
      @confirm="importProxies"
      @cancel="closeImportDialog"
    />

    <proxy-dialog v-model="isShowProxyDialog" :proxy-id="selectedProxyId" @saved="handleProxySaved" />
  </v-sheet>
</template>


<!--suppress CssUnusedSymbol -->
<style>
.smallSelect .v-field{
  font-size: 14px;
}
.smallSelect .v-field__input{
  padding-top: 0;
  padding-inline-end: 0;
  padding-bottom: 0;
}
.smallSelect .v-field.v-field--variant-plain .v-field__append-inner{
  padding-top: 6px;
}
</style>
