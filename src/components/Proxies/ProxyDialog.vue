<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { ProxyEndPoint, ProxyProtocol, type ProxyEndPointStatus } from '@/services/VpnHood.Client.Api';
import { Validators } from '@/helpers/Validators';
import ProxyInfoTab from './ProxyInfoTab.vue';
import ProxyStatusTab from './ProxyStatusTab.vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const props = defineProps<{
    modelValue: boolean;
    proxyId?: string | null;
}>();

const emit = defineEmits<{
    'update:modelValue': [value: boolean];
    'saved': [];
}>();

const isNew = computed(() => !props.proxyId);
const isDevice = computed(() => props.proxyId === 'device');
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

watch(() => props.modelValue, async (newValue) => {
    if (newValue) {
        await loadProxy();
    } else {
        resetForm();
    }
});

async function loadProxy(): Promise<void> {
    if (isDevice.value) {
        const deviceInfo = await vhApp.proxyEndPointClient.getDevice();
        if (!deviceInfo) {
            closeDialog();
            return;
        }
        proxy.value = new ProxyEndPoint(deviceInfo.endPoint);
        proxyStatus.value = deviceInfo.status;
        currentTab.value = 'status';
    } else if (props.proxyId) {
        const proxyInfo = await vhApp.proxyEndPointClient.get(props.proxyId);
        if (proxyInfo) {
            proxy.value = new ProxyEndPoint(proxyInfo.endPoint);
            proxyStatus.value = proxyInfo.status;
        } else {
            closeDialog();
            return;
        }
    }

    saveInitialProxy();
}

function resetForm(): void {
    proxy.value = new ProxyEndPoint({
        id: '',
        host: '',
        port: 0,
        protocol: ProxyProtocol.Http,
        isEnabled: true,
        username: null,
        password: null,
        url: ''
    });
    hostError.value = null;
    portError.value = null;
    currentTab.value = 'info';
    proxyStatus.value = null;
    initialProxy.value = '';
}

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
        if (props.proxyId === null || props.proxyId === undefined) {
            await vhApp.proxyEndPointClient.add(payload);
        } else {
            await vhApp.proxyEndPointClient.update(props.proxyId, payload);
        }
        saveInitialProxy();
        return true;
    }
    finally {
        isSaving.value = false;
    }
}

async function saveAndClose(): Promise<void> {
    if (await save()) {
        emit('saved');
        closeDialog();
    }
}

async function deleteProxy(): Promise<void> {
    if (!props.proxyId)
        return;

    if (isReadonly.value)
        return;

    if (!await vhApp.showConfirmDialog(locale('CONFIRM_REMOVE_SERVER'), locale('ARE_YOU_SURE')))
        return;

    try {
        isDeleting.value = true;
        await vhApp.proxyEndPointClient.delete(props.proxyId);
        saveInitialProxy();
        emit('saved');
        closeDialog();
    }
    finally {
        isDeleting.value = false;
    }
}

async function handleBack(): Promise<void> {
    if (isDirty.value && !isReadonly.value) {
        if (isNew.value) {
            const confirmed = await vhApp.showConfirmDialog(
                locale('WARNING'),
                locale('UNSAVED_CHANGES_MESSAGE')
            );
            if (!confirmed) return;
        } else {
            if (validate()) {
                const saved = await save();
                if (saved) {
                    emit('saved');
                }
            } else {
                const confirmed = await vhApp.showConfirmDialog(
                    locale('WARNING'),
                    locale('UNSAVED_CHANGES_MESSAGE')
                );
                if (!confirmed) return;
            }
        }
    }
    closeDialog();
}

function closeDialog(): void {
    emit('update:modelValue', false);
}
</script>

<template>
    <v-dialog
        :model-value="props.modelValue"
        @update:model-value="emit('update:modelValue', $event)"
        max-width="600"
        :persistent="isDirty"
    >
        <v-card>
            <v-card-title class="d-flex align-center">
                <v-btn icon="mdi-arrow-left" variant="text" @click="handleBack" class="me-2" />
                <span>{{ isNew ? locale('PROXY_ADD') : locale('PROXY_EDIT') }}</span>
            </v-card-title>

            <v-divider />

            <v-card-text class="pa-0">
                <v-tabs v-model="currentTab" color="highlight" align-tabs="center">
                    <v-tab value="info" v-if="!isDevice">{{ locale('PROXY_TAB_INFO') }}</v-tab>
                    <v-tab value="status" v-if="!isNew">{{ locale('PROXY_TAB_STATUS') }}</v-tab>
                </v-tabs>

                <v-window v-model="currentTab" class="mt-4 px-4">
                    <v-window-item value="info" v-if="!isDevice">
                        <ProxyInfoTab :proxy="proxy" :host-error="hostError" :port-error="portError" />
                    </v-window-item>

                    <v-window-item value="status" v-if="!isNew">
                        <ProxyStatusTab :status="proxyStatus" />
                    </v-window-item>
                </v-window>
            </v-card-text>

            <v-card-actions class="pa-4" v-if="isNew && !isReadonly">
                <v-spacer />
                <v-btn color="highlight" class="text-transform-none" :loading="isSaving" @click="saveAndClose">
                    {{ locale('OK') }}
                </v-btn>
            </v-card-actions>

            <v-card-actions class="pa-4" v-else-if="!isReadonly">
                <v-btn variant="text" color="error" class="text-transform-none" :disabled="isSaving || isDeleting"
                    :loading="isDeleting" @click="deleteProxy">
                    {{ locale('REMOVE') }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
