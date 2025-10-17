<script setup lang="ts">
import { computed } from 'vue';
import i18n from '@/locales/i18n';
import type { ProxyNodeStatus } from '@/services/VpnHood.Client.Api';

const locale = i18n.global.t;

const props = defineProps<{
    status: ProxyNodeStatus | null;
}>();

const statusQuality = computed(() => {
    if (!props.status) return { text: '-', color: '' };
    
    const penalty = props.status.penalty;
    if (penalty === 0) return { text: locale('PROXY_STATUS_EXCELLENT'), color: 'success' };
    if (penalty < 10) return { text: locale('PROXY_STATUS_GOOD'), color: 'enable-premium' };
    if (penalty < 20) return { text: locale('PROXY_STATUS_NORMAL'), color: 'warning' };
    if (penalty < 100) return { text: locale('PROXY_STATUS_BAD'), color: 'error' };
    return { text: locale('PROXY_STATUS_VERY_BAD'), color: 'error' };
});

const formattedLatency = computed(() => {
    return props.status?.latency ?? '-';
});

const formattedLastUsed = computed(() => {
    if (!props.status?.lastUsedTime) return '-';
    return new Date(props.status.lastUsedTime).toLocaleString();
});
</script>

<template>
    <v-card-item v-if="!status" class="text-center text-disabled py-8">
        {{ locale('PROXY_STATUS_NO_DATA') }}
    </v-card-item>

    <v-card-item v-else class="pt-0">
        <v-list lines="two" density="comfortable">
            <v-list-item>
                <template #prepend>
                    <v-icon icon="mdi-speedometer" />
                </template>
                <v-list-item-title>{{ locale('PROXY_STATUS_QUALITY') }}</v-list-item-title>
                <v-list-item-subtitle>
                    <v-chip
                        :text="statusQuality.text"
                        :color="statusQuality.color"
                        size="small"
                        variant="tonal"
                        class="mt-1"
                    />
                </v-list-item-subtitle>
            </v-list-item>

            <v-divider />

            <v-list-item>
                <template #prepend>
                    <v-icon icon="mdi-alert-circle" />
                </template>
                <v-list-item-title>{{ locale('PROXY_STATUS_PENALTY') }}</v-list-item-title>
                <v-list-item-subtitle>{{ status.penalty }}</v-list-item-subtitle>
            </v-list-item>

            <v-divider />

            <v-list-item>
                <template #prepend>
                    <v-icon icon="mdi-check-circle" />
                </template>
                <v-list-item-title>{{ locale('PROXY_STATUS_SUCCEEDED') }}</v-list-item-title>
                <v-list-item-subtitle>{{ status.succeededCount }}</v-list-item-subtitle>
            </v-list-item>

            <v-divider />

            <v-list-item>
                <template #prepend>
                    <v-icon icon="mdi-close-circle" />
                </template>
                <v-list-item-title>{{ locale('PROXY_STATUS_FAILED') }}</v-list-item-title>
                <v-list-item-subtitle>{{ status.failedCount }}</v-list-item-subtitle>
            </v-list-item>

            <v-divider />

            <v-list-item>
                <template #prepend>
                    <v-icon icon="mdi-timer" />
                </template>
                <v-list-item-title>{{ locale('PROXY_STATUS_LATENCY') }}</v-list-item-title>
                <v-list-item-subtitle>{{ formattedLatency }}</v-list-item-subtitle>
            </v-list-item>

            <v-divider />

            <v-list-item>
                <template #prepend>
                    <v-icon icon="mdi-clock" />
                </template>
                <v-list-item-title>{{ locale('PROXY_STATUS_LAST_USED') }}</v-list-item-title>
                <v-list-item-subtitle>{{ formattedLastUsed }}</v-list-item-subtitle>
            </v-list-item>

            <v-divider v-if="status.errorMessage" />

            <v-list-item v-if="status.errorMessage">
                <template #prepend>
                    <v-icon icon="mdi-alert" color="error" />
                </template>
                <v-list-item-title>{{ locale('ERROR') }}</v-list-item-title>
                <v-list-item-subtitle class="text-error">{{ status.errorMessage }}</v-list-item-subtitle>
            </v-list-item>
        </v-list>
    </v-card-item>
</template>
