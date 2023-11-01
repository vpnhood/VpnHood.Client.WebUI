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
          class="menu-item has-border"
          @click="$router.replace({path: '/settings'})">

        <v-list-item-title>
          <v-icon>mdi-cog</v-icon>
          <span class="ms-3">{{$t('SETTINGS')}}</span>
        </v-list-item-title>

      </v-list-item>

      <!-- Diagnose -->
      <v-list-item class="menu-item has-border" :disabled="!$vpnHoodApp.canDiagnose()" @click="diagnose">

        <v-list-item-title>
          <v-icon>mdi-stethoscope</v-icon>
          <span class="ms-3">{{$t('DIAGNOSE')}}</span>
        </v-list-item-title>
      </v-list-item>

      <!-- Whats new -->
      <v-list-item
          :nav="true"
          density="compact"
          class="menu-item mt-4"
          href="https://github.com/vpnhood/VpnHood/blob/main/CHANGELOG.md"
          @click="$emit('update:modelValue',false)"
          target="_blank">

        <v-list-item-title>
          <v-icon>mdi-bullhorn</v-icon>
          <span class="ms-3 text-caption">{{$t('WHATS_NEW')}}</span>
        </v-list-item-title>
      </v-list-item>

      <!-- Send feedback -->
      <v-list-item
          :nav="true"
          density="compact"
          class="menu-item"
          href="https://docs.google.com/forms/d/e/1FAIpQLSd5AQesTSbDo23_4CkNiKmSPtPBaZIuFjAFnjqLo6XGKG5gyg/viewform?usp=sf_link"
          @click="$emit('update:modelValue',false)"
          target="_blank">

        <v-list-item-title>
          <v-icon>mdi-message-alert</v-icon>
          <span class="ms-3 text-caption">{{$t('SEND_FEEDBACK')}}</span>
        </v-list-item-title>
      </v-list-item>

      <!-- Create personal server -->
      <v-list-item
          :nav="true"
          density="compact"
          class="menu-item"
          href="https://github.com/vpnhood/VpnHood/wiki/VpnHood-Access-Server"
          @click="$emit('update:modelValue',false)"
          target="_blank">

        <v-list-item-title>
          <v-icon>mdi-server</v-icon>
          <span class="ms-3 text-caption">{{$t('CREATE_PERSONAL_SERVER')}}</span>
        </v-list-item-title>
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
  color: var(--gray);
}
.menu-item.has-border{
  border-bottom: 1px #e8e8e8 solid;
}
.menu-item i{
  opacity: .8;
}
</style>
