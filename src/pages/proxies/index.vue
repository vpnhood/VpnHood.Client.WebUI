<script setup lang="ts">
import { onActivated, onMounted, computed, ref } from 'vue';
import AppBar from '@/components/AppBar.vue';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import router from '@/services/router';
import { Util } from '@/helpers/Util';
import { AppProxyMode, AppProxyNodeInfo, AppProxySettings } from '@/services/VpnHood.Client.Api';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

function ensureProxySettings(): AppProxySettings {
  if (!vhApp.data.userSettings.proxySettings) {
    vhApp.data.userSettings.proxySettings = new AppProxySettings({ mode: AppProxyMode.Disabled });
  }
  return vhApp.data.userSettings.proxySettings;
}

const isLoading = ref(false);
const proxies = ref<AppProxyNodeInfo[]>([]);

const proxyMode = computed<AppProxyMode>({
  get: () => ensureProxySettings().mode ?? AppProxyMode.Disabled,
  set: async (value: AppProxyMode) => {
    const proxySettings = ensureProxySettings();
    const previous = proxySettings.mode;
    if (previous === value)
      return;

    proxySettings.mode = value;
    try {
      await vhApp.saveUserSetting();
      if (value === AppProxyMode.Custom) {
        await loadProxies();
      }
    } catch (err: unknown) {
      proxySettings.mode = previous;
      await vhApp.processError(err);
    }
  }
});

const modeItems = computed(() => ([
  { value: AppProxyMode.Disabled, title: locale('PROXY_MODE_DISABLED') },
  { value: AppProxyMode.System, title: locale('PROXY_MODE_SYSTEM') },
  { value: AppProxyMode.Custom, title: locale('PROXY_MODE_CUSTOM') }
]));

const isCustomMode = computed(() => proxyMode.value === AppProxyMode.Custom);

async function loadProxies(): Promise<void> {
  if (isLoading.value)
    return;

  isLoading.value = true;
  try {
    const response = await vhApp.proxyNodeClient.list();
    proxies.value = Array.isArray(response) ? response : [];
  } catch (err: unknown) {
    proxies.value = [];
    await vhApp.processError(err);
  } finally {
    isLoading.value = false;
  }
}

onMounted(async () => {
  if (isCustomMode.value)
    await loadProxies();
});

onActivated(async () => {
  if (isCustomMode.value)
    await loadProxies();
});

function formatProxySubtitle(proxy: AppProxyNodeInfo): string {
  const node = proxy.node;
  const parts: string[] = [node.protocol, `${node.host}:${node.port}`];
  if (node.username)
    parts.push(node.username);
  return parts.join(' · ');
}

function openProxy(proxyId?: string): void {
  if (proxyId) {
    router.push({ path: `/proxies/${proxyId}` });
  } else {
    router.push({ path: '/proxies/new' });
  }
}
</script>

<template>
  <v-sheet>
    <app-bar />

    <config-card class="pa-3">
      <v-card-item class="pb-0">
        <span>{{ locale('PROXY_MODE') }}</span>
      </v-card-item>
      <v-card-subtitle class="text-disabled text-caption pb-2">
        {{ locale('PROXIES_DESC') }}
      </v-card-subtitle>
      <v-select
        v-model="proxyMode"
        :items="modeItems"
        item-title="title"
        item-value="value"
        variant="outlined"
        density="comfortable"
        rounded="lg"
        hide-details
        color="highlight"
      />
    </config-card>

    <config-card v-if="isCustomMode" class="mt-4 pa-0">
      <v-progress-linear v-if="isLoading" color="highlight" indeterminate />

      <template v-else>
        <v-card-text v-if="!proxies.length" class="text-disabled">
          {{ locale('PROXY_LIST_EMPTY') }}
        </v-card-text>

        <v-list v-else lines="two" density="comfortable">
          <v-list-item
            v-for="proxy in proxies"
            :key="proxy.node.id"
            :title="proxy.node.host"
            :subtitle="formatProxySubtitle(proxy)"
            @click="openProxy(proxy.node.id)"
            rounded="lg"
          >
            <template #append>
              <v-chip
                :text="proxy.node.isEnabled ? locale('ON') : locale('OFF')"
                size="small"
                variant="tonal"
                density="comfortable"
                :color="proxy.node.isEnabled ? 'enable-premium' : ''"
                class="me-2"
              />
              <v-icon :icon="Util.getLocalizedRightChevron()" />
            </template>
          </v-list-item>
        </v-list>
      </template>

      <v-divider class="mt-3" />

      <v-card-actions class="pa-3">
        <btn-style-4
          block
          :text="locale('PROXY_ADD')"
          :append-icon="Util.getLocalizedRightChevron()"
          @click="openProxy()"
        />
      </v-card-actions>
    </config-card>
  </v-sheet>
</template>
