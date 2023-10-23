<template>
  <v-navigation-drawer
      @update:modelValue="$emit('update:modelValue', $event)"
      :modelValue="modelValue"
      location="left"
      :temporary="true"
      :disable-route-watcher="true"
      :floating="true">
    <!-- Header -->
    <div class="d-flex align-center bg-medium-blue pa-4">

      <!-- App logo -->
      <v-img :eager="true" src="../assets/images/logo.png" alt="logo" max-width="60" width="60" height="60"/>

      <div class="text-white ms-3">

        <!-- App name -->
        <h3>{{ $t("APP_NAME") }}</h3>

        <!-- App full version -->
        <div class="color-sharp-master-green text-caption">
          <span class="me-2">{{ $t("VERSION") }}:</span>
          <span>{{ mergedAppAndUiVersion() }}</span>
        </div>

      </div>
    </div>

    <!-- Menu items -->
    <v-list dense class="pt-0">

      <!-- Settings -->
      <v-list-item
          :title="$t('SETTINGS')"
          prepend-icon="mdi-cog"
          class="menu-item color-gray"
          @click="openSettingsPage"
      >
      </v-list-item>

      <!-- Diagnose -->
      <v-list-item
          :title="$t('DIAGNOSE')"
          prepend-icon="mdi-speedometer"
          class="menu-item color-gray"
          :disabled="!$vpnHoodApp.canDiagnose()"
          @click="diagnose"
      >
      </v-list-item>

      <!-- Whats new -->
      <v-list-item
          :title="$t('WHATS_NEW')"
          prepend-icon="mdi-bullhorn"
          class="menu-item color-gray"
          href="https://github.com/vpnhood/VpnHood/blob/main/CHANGELOG.md"
          @click="$emit('update:modelValue',false)"
          target="_blank"
      >
      </v-list-item>

      <!-- Send feedback -->
      <v-list-item
          :title="$t('SEND_FEEDBACK')"
          prepend-icon="mdi-message-alert"
          class="menu-item color-gray"
          href="https://docs.google.com/forms/d/e/1FAIpQLSd5AQesTSbDo23_4CkNiKmSPtPBaZIuFjAFnjqLo6XGKG5gyg/viewform?usp=sf_link"
          @click="$emit('update:modelValue',false)"
          target="_blank"
      >
      </v-list-item>

      <!-- Create personal server -->
      <v-list-item
          :title="$t('CREATE_PERSONAL_SERVER')"
          prepend-icon="mdi-shield-account-variant"
          class="menu-item color-gray"
          href="https://github.com/vpnhood/VpnHood/wiki/VpnHood-Access-Server"
          @click="$emit('update:modelValue',false)"
          target="_blank"
      >
      </v-list-item>

    </v-list>

  </v-navigation-drawer>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import {ComponentRouteController} from '@/services/ComponentRouteController';

export default defineComponent({
  props: {
    modelValue: Boolean,
  },
  emits: [
    "update:modelValue"
  ],
  methods: {
    async openSettingsPage(): Promise<void> {
      this.$emit('update:modelValue', false);
      await ComponentRouteController.showComponent(this.$componentName.SettingSheet);
    },

    async diagnose(): Promise<void> {
      this.$emit('update:modelValue', false);
      await this.$vpnHoodApp.diagnose();
    },

    mergedAppAndUiVersion(): string {
      const appVersion = this.$vpnHoodApp.data.features.version.split('.');
      const uiVersion = process.env["VUE_APP_VERSION"]?.split('.');
      if (uiVersion) {
        appVersion[appVersion.length - 1] = uiVersion[2];
        return appVersion.join('.');
      } else {
        return this.$vpnHoodApp.data.features.version;
      }
    }
  }
});
</script>

<style scoped>
.menu-item {
  border-bottom: 1px #e8e8e8 solid;
}
</style>
