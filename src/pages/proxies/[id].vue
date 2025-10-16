<script setup lang="ts">
import { onMounted, computed, ref, onUnmounted } from 'vue';
import AppBar from '@/components/AppBar.vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { ProxyNode, ProxyProtocol, ProxyNodeDefaults } from '@/services/VpnHood.Client.Api';
import { Validators } from '@/helpers/Validators';
import router from '@/services/router';

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

const host = ref('');
const port = ref('');
const username = ref('');
const password = ref('');
const protocol = ref<ProxyProtocol>(ProxyProtocol.Http);
const isEnabled = ref(true);
const hostError = ref<string | null>(null);
const portError = ref<string | null>(null);
const isSaving = ref(false);
const isDeleting = ref(false);
const isParsing = ref(false);

const initialValues = ref({
    host: '',
    port: '',
    username: '',
    password: '',
    protocol: ProxyProtocol.Http,
    isEnabled: true
});

const isDirty = computed(() => {
    return host.value !== initialValues.value.host ||
           port.value !== initialValues.value.port ||
           username.value !== initialValues.value.username ||
           password.value !== initialValues.value.password ||
           protocol.value !== initialValues.value.protocol ||
           isEnabled.value !== initialValues.value.isEnabled;
});

const protocolItems = computed(() => ([
    { value: ProxyProtocol.Http, title: locale('PROXY_PROTOCOL_HTTP') },
    { value: ProxyProtocol.Socks4, title: locale('PROXY_PROTOCOL_SOCKS4') },
    { value: ProxyProtocol.Socks5, title: locale('PROXY_PROTOCOL_SOCKS5') }
]));

let navigationUnregister: (() => void) | null = null;

onMounted(async () => {
    if (!proxyId.value) {
        saveInitialValues();
    } else {
        try {
            const response = await vhApp.proxyNodeClient.list();
            const match = Array.isArray(response) ? response.find(item => item.node.id === proxyId.value) : undefined;
            if (match) {
                applyProxy(match.node);
                saveInitialValues();
            } else {
                await router.replace({ path: '/proxies' });
            }
        } catch (err: unknown) {
            await vhApp.processError(err);
        }
    }

    // Register navigation guard
    navigationUnregister = router.beforeEach(async (to, from, next) => {
        if (from.path.startsWith('/proxies/') && !to.path.startsWith('/proxies/')) {
            if (isDirty.value && !isSaving.value && !isDeleting.value) {
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
});

onUnmounted(() => {
    if (navigationUnregister) {
        navigationUnregister();
    }
});

function applyProxy(node: ProxyNode): void {
    host.value = node.host ?? '';
    port.value = node.port ? node.port.toString() : '';
    username.value = node.username ?? '';
    password.value = node.password ?? '';
    protocol.value = node.protocol ?? ProxyProtocol.Http;
    isEnabled.value = node.isEnabled ?? true;
}

function saveInitialValues(): void {
    initialValues.value = {
        host: host.value,
        port: port.value,
        username: username.value,
        password: password.value,
        protocol: protocol.value,
        isEnabled: isEnabled.value
    };
}

async function handleHostBlur(): Promise<void> {
    if (!host.value || Validators.isEmptyString(host.value) || isParsing.value)
        return;

    try {
        isParsing.value = true;
        
        const defaults = new ProxyNodeDefaults();
        defaults.protocol = protocol.value;
        defaults.port = port.value ? Number(port.value) : null;
        defaults.username = username.value || null;
        defaults.password = password.value || null;
        defaults.isEnabled = isEnabled.value;

        const result = await vhApp.proxyNodeClient.parse(host.value.trim(), defaults);
        if (result?.node) {
            applyProxy(result.node);
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

    if (!host.value || Validators.isEmptyString(host.value)) {
        hostError.value = locale('PROXY_REQUIRED_HOST');
        valid = false;
    } else {
        hostError.value = null;
    }

    if (port.value) {
        const numericPort = Number(port.value);
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

function buildProxyUrl(node: ProxyNode): string {
    const protocolScheme = node.protocol.toLowerCase();
    const credentials = node.username
        ? `${encodeURIComponent(node.username)}${node.password ? `:${encodeURIComponent(node.password)}` : ''}@`
        : '';
    return `${protocolScheme}://${credentials}${node.host}:${node.port}`;
}

function createPayload(): ProxyNode {
    const node = new ProxyNode();
    node.id = proxyId.value ?? (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : Math.random().toString(36).substring(2));
    node.host = host.value.trim();
    node.port = port.value ? Number(port.value) : 0;
    node.protocol = protocol.value;
    node.isEnabled = isEnabled.value;
    node.username = username.value && !Validators.isEmptyString(username.value) ? username.value.trim() : null;
    node.password = password.value && !Validators.isEmptyString(password.value) ? password.value : null;
    node.url = buildProxyUrl(node);
    return node;
}

async function saveProxy(): Promise<void> {
    if (!validate())
        return;

    const payload = createPayload();

    try {
        isSaving.value = true;
        if (isNew.value) {
            await vhApp.proxyNodeClient.add(payload);
        } else {
            await vhApp.proxyNodeClient.update(payload.id, payload);
        }
        saveInitialValues();
        await router.push({ path: '/proxies' });
    } catch (err: unknown) {
        await vhApp.processError(err);
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
        await router.push({ path: '/proxies' });
    } catch (err: unknown) {
        await vhApp.processError(err);
    } finally {
        isDeleting.value = false;
    }
}

async function cancel(): Promise<void> {
    if (isDirty.value) {
        const confirmed = await vhApp.showConfirmDialog(
            locale('WARNING'),
            locale('UNSAVED_CHANGES_MESSAGE')
        );
        if (!confirmed)
            return;
    }
    await router.push({ path: '/proxies' });
}
</script>

<template>
    <v-sheet>
        <app-bar />

        <config-card class="pa-3">
            <v-card-item class="pb-4">
                <div class="d-flex align-center justify-space-between">
                    <span>{{ locale('PROXY_ENABLED') }}</span>
                    <v-switch v-model="isEnabled" color="highlight" hide-details />
                </div>
            </v-card-item>

            <v-card-item class="pt-0">
                <v-text-field v-model="host" :label="locale('PROXY_HOST')" :error="!!hostError" :error-messages="hostError"
                variant="outlined" density="comfortable" rounded="lg" color="highlight" class="mt-4"
                @blur="handleHostBlur" :loading="isParsing" />

                <v-text-field v-model="port" :label="locale('PROXY_PORT')" :error="!!portError"
                    :error-messages="portError" type="number" variant="outlined" density="comfortable" rounded="lg"
                    color="highlight" class="mt-4" />

                <v-select v-model="protocol" :items="protocolItems" item-title="title" item-value="value"
                    variant="outlined" density="comfortable" rounded="lg" color="highlight"
                    :label="locale('PROXY_PROTOCOL')" />

                <v-text-field v-model="username" :label="locale('PROXY_USERNAME')" variant="outlined"
                    density="comfortable" rounded="lg" color="highlight" class="mt-4" />

                <v-text-field v-model="password" :label="locale('PROXY_PASSWORD')" variant="outlined"
                    density="comfortable" rounded="lg" color="highlight" class="mt-4" type="password" />
            </v-card-item>

            <v-card-actions class="pt-4">
                <v-btn v-if="!isNew" variant="text" color="error" class="text-transform-none" 
                    :disabled="isSaving || isDeleting" :loading="isDeleting" @click="deleteProxy">
                    {{ locale('REMOVE') }}
                </v-btn>
                <v-btn variant="text" class="text-transform-none" :disabled="isSaving || isDeleting" @click="cancel">
                    {{ locale('CANCEL') }}
                </v-btn>
                <v-spacer />
                <v-btn color="highlight" class="text-transform-none" :loading="isSaving" :disabled="isDeleting" @click="saveProxy">
                    {{ locale('OK') }}
                </v-btn>
            </v-card-actions>
        </config-card>
    </v-sheet>
</template>
