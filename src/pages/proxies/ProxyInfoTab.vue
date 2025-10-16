<script setup lang="ts">
import { computed } from 'vue';
import i18n from '@/locales/i18n';
import { ProxyNode, ProxyProtocol } from '@/services/VpnHood.Client.Api';

const locale = i18n.global.t;

const props = defineProps<{
    proxy: ProxyNode;
    hostError: string | null;
    portError: string | null;
    isParsing: boolean;
}>();

const emit = defineEmits<{
    'update:proxy': [value: ProxyNode];
    'hostBlur': [];
}>();

const protocolItems = computed(() => ([
    { value: ProxyProtocol.Http, title: "http" },
    { value: ProxyProtocol.Https, title: "https" },
    { value: ProxyProtocol.Socks4, title: "socks4" },
    { value: ProxyProtocol.Socks5, title: "socks5" }
]));

function updateField<K extends keyof ProxyNode>(field: K, value: ProxyNode[K]): void {
    const updated = new ProxyNode(props.proxy);
    updated[field] = value;
    emit('update:proxy', updated);
}
</script>

<template>
    <v-card-item class="pb-4">
        <div class="d-flex align-center justify-space-between">
            <span>{{ locale('PROXY_ENABLED') }}</span>
            <v-switch
                :model-value="proxy.isEnabled"
                @update:model-value="$event !== null && updateField('isEnabled', $event)"
                color="highlight"
                hide-details
            />
        </div>
    </v-card-item>

    <v-card-item class="pt-0">
        <v-text-field
            :model-value="proxy.host"
            @update:model-value="updateField('host', $event)"
            :label="locale('PROXY_HOST')"
            :error="!!hostError"
            :error-messages="hostError"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            color="highlight"
            class="mt-4"
            @blur="emit('hostBlur')"
            :loading="isParsing"
        />

        <v-text-field
            :model-value="proxy.port?.toString() ?? ''"
            @update:model-value="updateField('port', $event ? Number($event) : 0)"
            :label="locale('PROXY_PORT')"
            :error="!!portError"
            :error-messages="portError"
            type="number"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            color="highlight"
            class="mt-4"
        />

        <v-select
            :model-value="proxy.protocol"
            @update:model-value="updateField('protocol', $event)"
            :items="protocolItems"
            item-title="title"
            item-value="value"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            color="highlight"
            :label="locale('PROXY_PROTOCOL')"
        />

        <v-text-field
            :model-value="proxy.username ?? ''"
            @update:model-value="updateField('username', $event || null)"
            :label="locale('PROXY_USERNAME')"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            color="highlight"
            class="mt-4"
        />

        <v-text-field
            :model-value="proxy.password ?? ''"
            @update:model-value="updateField('password', $event || null)"
            :label="locale('PROXY_PASSWORD')"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            color="highlight"
            class="mt-4"
            type="password"
        />
    </v-card-item>
</template>
