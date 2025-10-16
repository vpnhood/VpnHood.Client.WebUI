<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue';
import i18n from '@/locales/i18n';
import { ProxyNode, ProxyProtocol, ProxyNodeDefaults } from '@/services/VpnHood.Client.Api';
import { Validators } from '@/helpers/Validators';
import { VpnHoodApp } from '@/services/VpnHoodApp';

const locale = i18n.global.t;
const vhApp = VpnHoodApp.instance;

const props = defineProps<{
    proxy: ProxyNode;
    hostError: string | null;
    portError: string | null;
}>();

const isParsing = ref(false);
const proxyModel = toRef(props, 'proxy'); //lets mutate the prop directly in a lint-safe way
const protocolItems = computed(() => ([
    { value: ProxyProtocol.Http, title: "http" },
    { value: ProxyProtocol.Https, title: "https" },
    { value: ProxyProtocol.Socks4, title: "socks4" },
    { value: ProxyProtocol.Socks5, title: "socks5" }
]));

const portItem = computed<string>({
  get: (): string => (proxyModel.value.port === 0 || proxyModel.value.port == null ? '' : String(proxyModel.value.port)),
  set: (v: string) => { proxyModel.value.port = (v === '' ? 0 : Number(v)); }
})


async function handleHostBlur(): Promise<void> {
    if (!proxyModel.value.host || Validators.isEmptyString(proxyModel.value.host) || isParsing.value)
        return;

    try {
        isParsing.value = true;

        const defaults = new ProxyNodeDefaults();
        defaults.protocol = proxyModel.value.protocol;
        defaults.port = proxyModel.value.port || null;
        defaults.username = proxyModel.value.username;
        defaults.password = proxyModel.value.password;
        defaults.isEnabled = proxyModel.value.isEnabled;

        const result = await vhApp.proxyNodeClient.parse(proxyModel.value.host.trim(), defaults);
        // Apply parsed values onto the same record reference
        const parsed = new ProxyNode(result.node);

        // Only overwrite port if it was not explicitly set and host does not include a port part
        if ((defaults.port == null) && !proxyModel.value.host.includes(':')) 
            parsed.port = 0;

        // fill other fields
        Object.assign(proxyModel.value, parsed);
    } finally {
        isParsing.value = false;
    }
}
</script>

<template>
    <v-card-item class="pb-4">
        <div class="d-flex align-center justify-space-between">
            <span>{{ locale('PROXY_ENABLED') }}</span>
            <v-switch v-model="proxyModel.isEnabled" color="highlight" hide-details />
        </div>
    </v-card-item>

    <v-card-item class="pt-0">
        <v-text-field v-model="proxyModel.host" :label="locale('PROXY_HOST')" :error="!!hostError"
            :error-messages="hostError" variant="outlined" density="comfortable" rounded="lg" color="highlight"
            class="mt-4" @blur="handleHostBlur" :loading="isParsing" />

        <v-text-field v-model="portItem" :label="locale('PROXY_PORT')" :error="!!portError"
            :error-messages="portError" type="number" variant="outlined" density="comfortable"
            rounded="lg" color="highlight"
            class="mt-4" />

        <v-select v-model="proxyModel.protocol" :items="protocolItems" item-title="title" item-value="value"
            variant="outlined" density="comfortable" rounded="lg" color="highlight" :label="locale('PROXY_PROTOCOL')" />

        <v-text-field v-model="proxyModel.username" :label="locale('PROXY_USERNAME')" variant="outlined"
            density="comfortable" rounded="lg" color="highlight" class="mt-4" />

        <v-text-field v-model="proxyModel.password" :label="locale('PROXY_PASSWORD')" variant="outlined"
            density="comfortable" rounded="lg" color="highlight" class="mt-4" type="password" />
    </v-card-item>
</template>
