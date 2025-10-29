<route lang="json">{
    "name": "PROXY",
    "path": "/proxies/:id"
}</route>

<script setup lang="ts">
import { onMounted, computed, ref, onUnmounted } from 'vue';
import AppBar from '@/components/AppBar.vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { ProxyEndPoint, ProxyProtocol, type ProxyEndPointStatus } from '@/services/VpnHood.Client.Api';
import { Validators } from '@/helpers/Validators';
import router from '@/services/router';
import ProxyInfoTab from '../../components/Proxies/ProxyInfoTab.vue';
import ProxyStatusTab from '../../components/Proxies/ProxyStatusTab.vue';

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
const isDevice = computed(() => {
    const params = currentRoute.value.params as { id?: string };
    return params?.id === 'device';
});
const isReadonly = computed(() => isDevice.value);

const proxy = ref<ProxyEndPoint>(new ProxyEndPoint({
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
const currentTab = ref<'info' | 'status'>('info');
const proxyStatus = ref<ProxyEndPointStatus | null>(null);
const initialProxy = ref<string>('');

const isDirty = computed(() => {
    return JSON.stringify(proxy.value) !== initialProxy.value;
});

let navigationUnregister: (() => void) | null = null;

onMounted(async () => {

    if (isDevice.value) {
        const deviceInfo = await vhApp.proxyNodeClient.getDevice();
        if (!deviceInfo) {
            router.back();
            return;
        }
        proxy.value = new ProxyEndPoint(deviceInfo.endPoint);
        proxyStatus.value = deviceInfo.status;
        currentTab.value = 'status';
    } else if (proxyId.value) {
        const response = await vhApp.proxyNodeClient.list();
        const match = Array.isArray(response) ? response.find(item => item.endPoint.id === proxyId.value) : undefined;
        if (match) {
            proxy.value = new ProxyEndPoint(match.endPoint);
            proxyStatus.value = match.status;
        } else {
            router.back();
            return;
        }
    }

    saveInitialProxy();

    // Register navigation guard
    navigationUnregister = router.beforeEach(async (to, from, next) => {
            console.log('Saving changes before navigation...');

        if (!isDirty.value || isSaving.value || !from.path.startsWith('/proxies/')) {
            next();
            return;
        }

            console.log('Saving changes before navigation...');

        if (isReadonly.value) {
            next();
            return;
        }
            console.log('Saving changes before navigation2...');


        // Add mode: prompt if dirty for new entries
        if (isNew.value) {
            const confirmed = await vhApp.showConfirmDialog(
                locale('WARNING'),
                locale('UNSAVED_CHANGES_MESSAGE')
            );

            next(confirmed);
            return;
        }

        // Edit mode: prompt if could not validate successfully
        if (!validate()) {
            const confirmed = await vhApp.showConfirmDialog(
                locale('WARNING'),
                locale('UNSAVED_CHANGES_MESSAGE')
            );
            next(confirmed);
            return;
        }

        // In edit mode, save changes automatically on navigation
        try {
            await save();
            next();
        } catch {
            const confirmed = await vhApp.showConfirmDialog(
                locale('WARNING'),
                locale('UNSAVED_CHANGES_MESSAGE')
            );
            next(confirmed);
        }

    });
});

onUnmounted(() => {
    if (navigationUnregister) {
        navigationUnregister();
    }
});

function saveInitialProxy(): void {
    initialProxy.value = JSON.stringify(proxy.value);
}

function validate(): boolean {
    let valid = true;

    hostError.value = null;
    if (!proxy.value.host || Validators.isEmptyString(proxy.value.host)) {
        hostError.value = locale('PROXY_REQUIRED_HOST');
        valid = false;
    }

    portError.value = null;
    if (proxy.value.port) {
        const numericPort = proxy.value.port;
        if (Number.isNaN(numericPort) || numericPort < 1 || numericPort > 65535) {
            portError.value = locale('PROXY_INVALID_PORT');
            valid = false;
        }
    }

    return valid;
}

async function save(): Promise<boolean> {
    if (isReadonly.value)
        return true;
    if (!validate())
        return false;

    const payload = new ProxyEndPoint(proxy.value);
    payload.host = payload.host?.trim() ?? '';

    try {
        isSaving.value = true;
        if (proxyId.value === null) {
            await vhApp.proxyNodeClient.add(payload);
        } else {
            await vhApp.proxyNodeClient.update(proxyId.value, payload);
        }
        saveInitialProxy();
        return true;
    }
    finally {
        isSaving.value = false;
    }
}


async function saveAndClose(): Promise<void> {
    if (await save())
        router.back();
}

async function deleteProxy(): Promise<void> {
    if (!proxyId.value)
        return;

    if (isReadonly.value)
        return;

    if (!await vhApp.showConfirmDialog(locale('CONFIRM_REMOVE_SERVER'), locale('ARE_YOU_SURE')))
        return;

    try {
        isDeleting.value = true;
        await vhApp.proxyNodeClient.delete(proxyId.value);
        saveInitialProxy();
        router.back();
    }
    finally {
        isDeleting.value = false;
    }
}

async function handleBack(): Promise<void> {
    router.back();
}
</script>

<template>
    <v-sheet>
        <app-bar @back="handleBack" />

        <config-card class="pa-3">
            <v-tabs v-model="currentTab" color="highlight" align-tabs="center">
                <v-tab value="info" v-if="!isDevice">{{ locale('PROXY_TAB_INFO') }}</v-tab>
                <v-tab value="status" v-if="!isNew">{{ locale('PROXY_TAB_STATUS') }}</v-tab>
            </v-tabs>

            <v-window v-model="currentTab" class="mt-4">
                <v-window-item value="info" v-if="!isDevice">
                    <ProxyInfoTab :proxy="proxy" :host-error="hostError" :port-error="portError" />
                </v-window-item>

                <v-window-item value="status" v-if="!isNew">
                    <ProxyStatusTab :status="proxyStatus" />
                </v-window-item>
            </v-window>

            <v-card-actions class="pt-4" v-if="isNew && !isReadonly">
                <v-spacer />
                <v-btn color="highlight" class="text-transform-none" :loading="isSaving" @click="saveAndClose">
                    {{ locale('OK') }}
                </v-btn>
            </v-card-actions>

            <v-card-actions class="pt-4" v-else-if="!isReadonly">
                <v-btn variant="text" color="error" class="text-transform-none" :disabled="isSaving || isDeleting"
                    :loading="isDeleting" @click="deleteProxy">
                    {{ locale('REMOVE') }}
                </v-btn>
            </v-card-actions>
        </config-card>
    </v-sheet>
</template>
