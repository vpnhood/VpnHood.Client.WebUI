<script setup lang="ts">
import { computed } from 'vue';
import i18n from '@/locales/i18n';
import { ProxyProtocol } from '@/services/VpnHood.Client.Api';

const locale = i18n.global.t;

defineProps<{
    host: string;
    port: string;
    protocol: ProxyProtocol;
    username: string;
    password: string;
    isEnabled: boolean;
    hostError: string | null;
    portError: string | null;
    isParsing: boolean;
}>();

const emit = defineEmits<{
    'update:host': [value: string];
    'update:port': [value: string];
    'update:protocol': [value: ProxyProtocol];
    'update:username': [value: string];
    'update:password': [value: string];
    'update:isEnabled': [value: boolean];
    'hostBlur': [];
}>();

const protocolItems = computed(() => ([
    { value: ProxyProtocol.Http, title: locale('PROXY_PROTOCOL_HTTP') },
    { value: ProxyProtocol.Socks4, title: locale('PROXY_PROTOCOL_SOCKS4') },
    { value: ProxyProtocol.Socks5, title: locale('PROXY_PROTOCOL_SOCKS5') }
]));
</script>

<template>
    <v-card-item class="pb-4">
        <div class="d-flex align-center justify-space-between">
            <span>{{ locale('PROXY_ENABLED') }}</span>
            <v-switch
                :model-value="isEnabled"
                @update:model-value="$event !== null && emit('update:isEnabled', $event)"
                color="highlight"
                hide-details
            />
        </div>
    </v-card-item>

    <v-card-item class="pt-0">
        <v-text-field
            :model-value="host"
            @update:model-value="emit('update:host', $event)"
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
            :model-value="port"
            @update:model-value="emit('update:port', $event)"
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
            :model-value="protocol"
            @update:model-value="emit('update:protocol', $event)"
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
            :model-value="username"
            @update:model-value="emit('update:username', $event)"
            :label="locale('PROXY_USERNAME')"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            color="highlight"
            class="mt-4"
        />

        <v-text-field
            :model-value="password"
            @update:model-value="emit('update:password', $event)"
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
