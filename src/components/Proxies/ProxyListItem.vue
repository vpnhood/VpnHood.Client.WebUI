<script setup lang="ts">
import { computed } from 'vue';
import i18n from '@/locales/i18n';
import { AppProxyEndPointInfo } from '@/services/VpnHood.Client.Api';
import { GetStatusQualityDisplay } from '@/components/Proxies/ProxyUtils';

const locale = i18n.global.t;

const props = defineProps<{
    proxy: AppProxyEndPointInfo;
}>();

const title = computed(() => {
    const node = props.proxy.endPoint;
    const parts: string[] = [node.protocol, `${node.host}:${node.port}`];
    if (node.username)
        parts.push(node.username);
    return parts.join(' · ');
});

const statusQuality = computed(() => {
    return GetStatusQualityDisplay(props.proxy.status?.quality);
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
    <v-list-item>
      <template v-slot:title>
        <div class="d-flex align-center justify-space-between ga-2">
          <span class="text-truncate">{{title}}</span>
          <v-chip
            :text="proxy.endPoint.isEnabled ? locale('ON') : locale('OFF')"
            size="small"
            variant="tonal"
            density="comfortable"
            :color="proxy.endPoint.isEnabled ? 'enable-premium' : ''"
          />
        </div>
      </template>
      <template v-slot:subtitle>
        <p v-if="hasCounts" class="text-caption text-disabled">{{ countsText }}</p>
        <div class="d-flex align-center mt-1 text-caption">
          <span v-if="proxy.status?.quality" :class="`text-${statusQuality.color}`">{{statusQuality.text}}</span>
          <span
            v-if="hasError"
            class="text-error text-truncate"
            :class="{ 'border-s border-opacity-25 ps-2 ms-2': proxy.status?.quality}"
          >
            {{ errorMessage }}
          </span>
        </div>
      </template>
    </v-list-item>
</template>
