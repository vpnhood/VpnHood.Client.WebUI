<script setup lang="ts">
import { computed } from 'vue';
import i18n from '@/locales/i18n';
import { Util } from '@/helpers/Util';
import { AppProxyEndPointInfo } from '@/services/VpnHood.Client.Api';
import { getStatusQualityDisplay } from './ProxyUtils';

const locale = i18n.global.t;

const props = defineProps<{
    proxy: AppProxyEndPointInfo;
}>();

const emit = defineEmits<{
    click: [];
}>();

const subtitle = computed(() => {
    const node = props.proxy.endPoint;
    const parts: string[] = [node.protocol, `${node.host}:${node.port}`];
    if (node.username)
        parts.push(node.username);
    return parts.join(' · ');
});

const statusQuality = computed(() => {
    return getStatusQualityDisplay(props.proxy.status?.quality);
});

const hasCounts = computed(() => {
    const status = props.proxy.status;
    return status?.succeededCount != null || status?.failedCount != null;
});

const countsText = computed(() => {
    const status = props.proxy.status;
    if (!status) return '';
    const parts: string[] = [];
    if (status.succeededCount != null)
        parts.push(`${locale('PROXY_STATUS_SUCCEEDED')}: ${status.succeededCount}`);
    if (status.failedCount != null)
        parts.push(`${locale('PROXY_STATUS_FAILED')}: ${status.failedCount}`);
    return parts.join(' · ');
});

const hasError = computed(() => {
    return props.proxy.status?.errorMessage != null;
});

const errorMessage = computed(() => {
    return props.proxy.status?.errorMessage || '';
});
</script>

<template>
    <v-list-item @click="emit('click')" rounded="lg">
        <template #title>
            <div>{{ subtitle }}</div>
        </template>
        <template #subtitle>
            <div v-if="hasCounts" class="text-caption text-disabled mt-1">{{ countsText }}</div>
            <div v-if="hasError" class="text-caption text-error mt-1 d-flex align-center text-no-wrap">
                <v-icon icon="mdi-alert-circle" size="x-small" class="me-1" />
                <span class="text-truncate">{{ errorMessage }}</span>
            </div>
        </template>
        <template #append>
            <v-chip v-if="proxy.status?.quality" :text="statusQuality.text" size="small" variant="tonal"
                density="comfortable" :color="statusQuality.color" class="me-2" />
            <v-chip :text="proxy.endPoint.isEnabled ? locale('ON') : locale('OFF')" size="small" variant="tonal"
                density="comfortable" :color="proxy.endPoint.isEnabled ? 'enable-premium' : ''" class="me-2" />
            <v-icon :icon="Util.getLocalizedRightChevron()" />
        </template>
    </v-list-item>
</template>
