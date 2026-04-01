<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { computed } from 'vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const userAccount = computed(() => vhApp.data.userState.userAccount);
</script>

<template>
  <config-card>

    <!-- User name -->
    <v-card-title>{{ userAccount?.name }}</v-card-title>

    <!-- User email -->
    <v-card-subtitle class="text-disabled">{{ userAccount?.email }}</v-card-subtitle>

    <!-- Sign out button -->
    <v-card-actions>
      <btn-style-1
        :text="locale('SIGN_OUT')"
        :color="vhApp.data.isPremiumUser ? 'active' : 'highlight'"
        class="ms-auto"
        size="small"
        @click="vhApp.signOut()"
      />
    </v-card-actions>

  </config-card>
</template>
