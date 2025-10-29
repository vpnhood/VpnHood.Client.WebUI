<script setup lang="ts">
import { computed } from 'vue';
import i18n from '@/locales/i18n';
import { Util } from '@/helpers/Util';
import { AppProxyEndPointInfo } from '@/services/VpnHood.Client.Api';

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
    const status = props.proxy.status;
    const penalty = status?.penalty;

    if (penalty === undefined || penalty === null || status?.succeededCount === 0) {
        return { text: locale('PROXY_STATUS_NO_DATA'), color: '' };
    }
    if (penalty === 0) {
        return { text: locale('PROXY_STATUS_EXCELLENT'), color: 'success' };
    }
    if (penalty < 10) {
        return { text: locale('PROXY_STATUS_GOOD'), color: 'enable-premium' };
    }
    if (penalty < 20) {
        return { text: locale('PROXY_STATUS_NORMAL'), color: 'warning' };
    }
    if (penalty < 100) {
        return { text: locale('PROXY_STATUS_BAD'), color: 'error' };
    }
    return { text: locale('PROXY_STATUS_VERY_BAD'), color: 'error' };
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
</script>

<template>
    <v-list-item
        :title="proxy.endPoint.host"
        @click="emit('click')"
        rounded="lg"
    >
        <template #subtitle>
            <div>{{ subtitle }}</div>
            <div v-if="hasCounts" class="text-caption text-disabled mt-1">{{ countsText }}</div>
        </template>
        <template #append>
            <v-chip 
                v-if="proxy.status?.penalty !== undefined"
                :text="statusQuality.text" 
                size="small" 
                variant="tonal"
                density="comfortable" 
                :color="statusQuality.color" 
                class="me-2" 
            />
            <v-chip 
                :text="proxy.endPoint.isEnabled ? locale('ON') : locale('OFF')" 
                size="small"
                variant="tonal" 
                density="comfortable"
                :color="proxy.endPoint.isEnabled ? 'enable-premium' : ''" 
                class="me-2" 
            />
            <v-icon :icon="Util.getLocalizedRightChevron()" />
        </template>
    </v-list-item>
</template>
