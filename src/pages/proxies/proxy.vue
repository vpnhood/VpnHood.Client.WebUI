<route lang="json">
{
    "name": "PROXY",
    "path": "/proxies/:id"
}
</route>

<script setup lang="ts">
import { onMounted, computed, ref, onUnmounted } from 'vue';
import AppBar from '@/components/AppBar.vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { ProxyNode, ProxyProtocol, ProxyNodeDefaults, type ProxyNodeStatus } from '@/services/VpnHood.Client.Api';
import { Validators } from '@/helpers/Validators';
import router from '@/services/router';
import ProxyInfoTab from './ProxyInfoTab.vue';
import ProxyStatusTab from './ProxyStatusTab.vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const currentRoute = computed(() => router.currentRoute.value);

const proxyId = computed(() => {
    const params = currentRoute.value.params as { id?: string };
    const pathId = params.id;
    if (!pathId || pathId === 'new')
        return null;
    return pathId;
});
const isNew = computed(() => !proxyId.value);

const proxy = ref<ProxyNode>(new ProxyNode({
    id: '',
    host: '',
    port: 0,
    protocol: ProxyProtocol.Http,
    isEnabled: true,
    username: null,
    password: null,
    url: ''
}));

const hostError = ref<string | null>(null);
const portError = ref<string | null>(null);
const isSaving = ref(false);
const isDeleting = ref(false);
const isParsing = ref(false);
const currentTab = ref<'info' | 'status'>('info');
const proxyStatus = ref<ProxyNodeStatus | null>(null);

const initialProxy = ref<string>('');

const isDirty = computed(() => {
    return JSON.stringify(proxy.value) !== initialProxy.value;
});

let navigationUnregister: (() => void) | null = null;

onMounted(async () => {

    if (proxyId.value) {
        const response = await vhApp.proxyNodeClient.list();
        const match = Array.isArray(response) ? response.find(item => item.node.id === proxyId.value) : undefined;
        if (match) {
            proxy.value = new ProxyNode(match.node);
            proxyStatus.value = match.status;
        } else {
            router.back();
            return;
        }
    }

    saveInitialProxy();

    // Register navigation guard - only for add mode
    if (isNew.value) {
        navigationUnregister = router.beforeEach(async (to, from, next) => {
            if (from.path.startsWith('/proxies/') && !to.path.startsWith('/proxies/')) {
                if (isDirty.value && !isSaving.value) {
                    const confirmed = await vhApp.showConfirmDialog(
                        locale('WARNING'),
                        locale('UNSAVED_CHANGES_MESSAGE')
                    );
                    if (!confirmed) {
                        next(false);
                        return;
                    }
                }
            }
            next();
        });
    }
});

onUnmounted(() => {
    if (navigationUnregister) {
        navigationUnregister();
    }
});

function saveInitialProxy(): void {
    initialProxy.value = JSON.stringify(proxy.value);
}

async function handleHostBlur(): Promise<void> {
    if (!proxy.value.host || Validators.isEmptyString(proxy.value.host) || isParsing.value)
        return;

    try {
        isParsing.value = true;

        const defaults = new ProxyNodeDefaults();
        defaults.protocol = proxy.value.protocol;
        defaults.port = proxy.value.port || null;
        defaults.username = proxy.value.username;
        defaults.password = proxy.value.password;
        defaults.isEnabled = proxy.value.isEnabled;

        const result = await vhApp.proxyNodeClient.parse(proxy.value.host.trim(), defaults);
        if (result?.node) {
            proxy.value = new ProxyNode(result.node);
        }
    } catch (err: unknown) {
        // Silently ignore parse errors, keep current values
        console.warn('Proxy parse failed:', err);
    } finally {
        isParsing.value = false;
    }
}

function validate(): boolean {
    let valid = true;

    if (!proxy.value.host || Validators.isEmptyString(proxy.value.host)) {
        hostError.value = locale('PROXY_REQUIRED_HOST');
        valid = false;
    } else {
        hostError.value = null;
    }

    if (proxy.value.port) {
        const numericPort = proxy.value.port;
        if (Number.isNaN(numericPort) || numericPort < 1 || numericPort > 65535) {
            portError.value = locale('PROXY_INVALID_PORT');
            valid = false;
        } else {
            portError.value = null;
        }
    } else {
        portError.value = null;
    }

    return valid;
}

async function saveProxy(): Promise<void> {
    if (!validate())
        return;

    const payload = new ProxyNode(proxy.value);
    payload.host = payload.host?.trim() ?? '';
    if (payload.username)
        payload.username = payload.username.trim();


    try {
        isSaving.value = true;
        if (isNew.value) {
            await vhApp.proxyNodeClient.add(payload);
        } else {
            await vhApp.proxyNodeClient.update(payload.id, payload);
        }
        saveInitialProxy();
        router.back();
    } finally {
        isSaving.value = false;
    }
}

async function deleteProxy(): Promise<void> {
    if (isNew.value || !proxyId.value)
        return;

    const confirmed = await vhApp.showConfirmDialog(
        locale('CONFIRM_REMOVE_SERVER'),
        locale('ARE_YOU_SURE')
    );

    if (!confirmed)
        return;

    try {
        isDeleting.value = true;
        await vhApp.proxyNodeClient.delete(proxyId.value);
        router.back();
    } catch (err: unknown) {
        await vhApp.processError(err);
    } finally {
        isDeleting.value = false;
    }
}

async function handleBack(): Promise<void> {
    // In edit mode, save changes automatically on back
    if (!isNew.value && isDirty.value) {
        await saveProxy();
    } else {
        router.back();
    }
}
 </script>

<template>
    <v-sheet>
        <app-bar @back="handleBack" />

        <config-card class="pa-3">
            <v-tabs v-model="currentTab" color="highlight" align-tabs="center">
                <v-tab value="info">{{ locale('PROXY_TAB_INFO') }}</v-tab>
                <v-tab value="status" v-if="!isNew">{{ locale('PROXY_TAB_STATUS') }}</v-tab>
            </v-tabs>

            <v-window v-model="currentTab" class="mt-4">
                <v-window-item value="info">
                    <ProxyInfoTab v-model:proxy="proxy" :host-error="hostError" :port-error="portError"
                        :is-parsing="isParsing" @host-blur="handleHostBlur" />
                </v-window-item>

                <v-window-item value="status" v-if="!isNew">
                    <ProxyStatusTab :status="proxyStatus" />
                </v-window-item>
            </v-window>

            <v-card-actions class="pt-4" v-if="isNew">
                <v-spacer />
                <v-btn color="highlight" class="text-transform-none" :loading="isSaving" @click="saveProxy">
                    {{ locale('OK') }}
                </v-btn>
            </v-card-actions>

            <v-card-actions class="pt-4" v-else>
                <v-btn variant="text" color="error" class="text-transform-none" :disabled="isSaving || isDeleting"
                    :loading="isDeleting" @click="deleteProxy">
                    {{ locale('REMOVE') }}
                </v-btn>
            </v-card-actions>
        </config-card>
    </v-sheet>
</template>
