<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref, watch } from 'vue';
import AppBar from '@/components/AppBar.vue';
import ProxyListItem from '@/components/Proxies/ProxyListItem.vue';
import ProxyImportDialog from '@/components/Proxies/ProxyImportDialog.vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import router from '@/services/router';
import { Util } from '@/helpers/Util';
import { AppProxyMode, AppProxyEndPointInfo } from '@/services/VpnHood.Client.Api';


const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

let refreshInterval: ReturnType<typeof setInterval> | null = null;
const isLoading = ref(false);
const isDeletingAll = ref(false);
const isImportDialogOpen = ref(false);
const importText = ref('');
const isImporting = ref(false);
const canImportProxies = computed(() => importText.value.trim().length > 0 && !isImporting.value);
const proxies = ref<AppProxyEndPointInfo[]>([]);
const deviceProxy = ref<AppProxyEndPointInfo | null>(null);
const isCustomMode = computed(() => proxyMode.value === AppProxyMode.Manual);
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

const modeItems = computed(() => ([
    { value: AppProxyMode.NoProxy, title: locale('PROXY_MODE_NOPROXY') },
    { value: AppProxyMode.Device, title: locale('PROXY_MODE_DEVICE') },
    { value: AppProxyMode.Manual, title: locale('PROXY_MODE_MANUAL') }
]));



async function loadProxies(showLoading = true): Promise<void> {
    if (isLoading.value)
        return;

    try {
        isLoading.value = showLoading;
        const response = await vhApp.proxyNodeClient.list();
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
        const response = await vhApp.proxyNodeClient.getDevice();
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
        await vhApp.proxyNodeClient.deleteAll();
        await loadProxies();
    } finally {
        isDeletingAll.value = false;
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
        await vhApp.proxyNodeClient.import(importText.value);
        await loadProxies();
        isImportDialogOpen.value = false;
    } finally {
        importText.value = '';
        isImporting.value = false;
    }
}

function startPeriodicRefresh(): void {
    if (refreshInterval) return;

    refreshInterval = setInterval(async () => {
        // Only refresh if page is visible and in custom mode and connected
        if (!document.hidden && isCustomMode.value && vhApp.data.isConnected) {
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

// Watch route changes to reload data when returning from proxy detail page
watch(() => router.currentRoute.value.fullPath, async (newPath, oldPath) => {
    if (newPath !== '/proxies' || !oldPath?.startsWith('/proxies/'))
        return;

    try {
        if (isCustomMode.value) {
            await loadProxies(true);
            startPeriodicRefresh();
        } else if (proxyMode.value === AppProxyMode.Device) {
            await loadDeviceProxy(true);
        }
    } catch (err: unknown) {
        await vhApp.processError(err);
    }
});

// Watch mode changes to start/stop refresh and load data
watch(proxyMode, async (newMode, oldMode) => {
    if (newMode === oldMode)
        return;

    stopPeriodicRefresh();

    try {
        if (newMode === AppProxyMode.Manual) {
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

function openProxy(proxyId?: string): void {
    const id = proxyId ?? 'new';
    router.push({ path: `/proxies/${encodeURIComponent(id)}` });
}
</script>

<template>
    <v-sheet>
        <app-bar />

        <config-card class="pa-3">
            <v-card-item class="pb-0">
                <span>{{ locale('PROXY_MODE') }}</span>
            </v-card-item>
            <v-card-subtitle class="text-disabled text-caption pb-2">
                {{ locale('PROXIES_DESC') }}
            </v-card-subtitle>
            <v-select v-model="proxyMode" :items="modeItems" item-title="title" item-value="value" variant="outlined"
                density="comfortable" rounded="lg" hide-details color="highlight" />
        </config-card>

        <config-card v-if="isCustomMode" class="mt-4 pa-0">
            <v-card-actions class="pa-3 pb-0 d-flex flex-column ga-2">
                <btn-style-4 block :text="locale('PROXY_ADD')" :append-icon="Util.getLocalizedRightChevron()"
                    @click="openProxy()" />
                <v-btn block variant="text" color="highlight" class="text-transform-none"
                    :disabled="isLoading || isImporting" @click="openImportDialog">
                    {{ locale('PROXY_IMPORT') }}
                </v-btn>
                <v-btn block variant="text" color="error" class="text-transform-none"
                    :disabled="!proxies.length || isDeletingAll || isLoading" :loading="isDeletingAll"
                    @click="deleteAllProxies">
                    {{ locale('PROXY_DELETE_ALL') }}
                </v-btn>
            </v-card-actions>

            <v-divider class="mt-3" />

            <v-progress-linear v-if="isLoading" color="highlight" indeterminate />

            <template v-else>
                <v-card-text v-if="!proxies.length" class="text-disabled">
                    {{ locale('PROXY_LIST_EMPTY') }}
                </v-card-text>

                <v-list v-else lines="two" density="comfortable">
                    <ProxyListItem v-for="proxy in proxies" :key="proxy.endPoint.id" :proxy="proxy"
                        @click="openProxy(proxy.endPoint.id)" />
                </v-list>
            </template>
        </config-card>

        <config-card v-else-if="proxyMode === AppProxyMode.Device" class="mt-4 pa-0">
            <v-progress-linear v-if="isLoading" color="highlight" indeterminate />

            <template v-else>
                <v-card-text v-if="!deviceProxy" class="text-disabled">
                    {{ locale('NO_SYSTEM_PROXY') }}
                </v-card-text>
                <v-list v-else lines="two" density="comfortable">
                    <ProxyListItem :proxy="deviceProxy" @click="openProxy('device')" />
                </v-list>
            </template>
        </config-card>

        <proxy-import-dialog v-model="isImportDialogOpen" v-model:text="importText" :is-importing="isImporting"
            :can-import="canImportProxies" @confirm="importProxies" @cancel="closeImportDialog" />
    </v-sheet>
</template>
