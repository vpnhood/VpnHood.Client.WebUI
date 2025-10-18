<script setup lang="ts">
import { onActivated, onDeactivated, onMounted, onUnmounted, computed, ref, watch } from 'vue';
import AppBar from '@/components/AppBar.vue';
import ProxyListItem from '@/components/Proxies/ProxyListItem.vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import router from '@/services/router';
import { Util } from '@/helpers/Util';
import { AppProxyMode, AppProxyNodeInfo } from '@/services/VpnHood.Client.Api';


const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

let refreshInterval: ReturnType<typeof setInterval> | null = null;
const isLoading = ref(false);
const proxies = ref<AppProxyNodeInfo[]>([]);
const isCustomMode = computed(() => proxyMode.value === AppProxyMode.Custom);
const proxyMode = computed<AppProxyMode>({
    get: () => vhApp.data.userSettings.proxySettings.mode ?? AppProxyMode.Disabled,
    set: async (value: AppProxyMode) => {
        const proxySettings = vhApp.data.userSettings.proxySettings;
        const previous = proxySettings.mode;
        if (previous === value)
            return;

        proxySettings.mode = value;
        try {
            await vhApp.saveUserSetting();
            if (value === AppProxyMode.Custom) {
                await loadProxies();
            }
        } catch (err: unknown) {
            proxySettings.mode = previous;
            throw err;
        }
    }
});

const modeItems = computed(() => ([
    { value: AppProxyMode.Disabled, title: locale('PROXY_MODE_DISABLED') },
    { value: AppProxyMode.Device, title: locale('PROXY_MODE_DEVICE') },
    { value: AppProxyMode.Custom, title: locale('PROXY_MODE_CUSTOM') }
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
    if (isCustomMode.value) {
        await loadProxies();
        startPeriodicRefresh();
    }
});

onActivated(async () => {
    if (isCustomMode.value) {
        await loadProxies();
        startPeriodicRefresh();
    }
});

onDeactivated(() => {
    stopPeriodicRefresh();
});

onUnmounted(() => {
    stopPeriodicRefresh();
});

// Watch mode changes to start/stop refresh
watch(isCustomMode, (isCustom) => {
    if (isCustom) {
        loadProxies(true);
        startPeriodicRefresh();
    } else {
        stopPeriodicRefresh();
    }
});

function openProxy(proxyId?: string): void {
    if (proxyId) {
        router.push({ path: `/proxies/${proxyId}` });
    } else {
        router.push({ path: '/Proxies/new' });
    }
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
            <v-card-actions class="pa-3 pb-0">
                <btn-style-4 block :text="locale('PROXY_ADD')" :append-icon="Util.getLocalizedRightChevron()"
                    @click="openProxy()" />
            </v-card-actions>

            <v-divider class="mt-3" />

            <v-progress-linear v-if="isLoading" color="highlight" indeterminate />

            <template v-else>
                <v-card-text v-if="!proxies.length" class="text-disabled">
                    {{ locale('PROXY_LIST_EMPTY') }}
                </v-card-text>

                <v-list v-else lines="two" density="comfortable">
                    <ProxyListItem v-for="proxy in proxies" :key="proxy.node.id" :proxy="proxy"
                        @click="openProxy(proxy.node.id)" />
                </v-list>
            </template>
        </config-card>
    </v-sheet>
</template>
