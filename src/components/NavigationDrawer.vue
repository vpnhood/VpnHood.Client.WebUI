<template>
  <v-navigation-drawer
      @update:modelValue="$emit('update:modelValue', $event)"
      :modelValue="modelValue"
      location="left"
      :temporary="true"
      :disable-route-watcher="true"
      :floating="true">
    <!-- Header -->
    <div class="d-flex align-center bg-primary-darken-1 pa-4">

      <!-- App logo -->
      <v-img :eager="true" src="../assets/images/logo.png" alt="logo" max-width="60" width="60" height="60"/>

      <div class="text-white ms-3">

        <!-- App name -->
        <h3>{{ $t("VPN_HOOD_APP_NAME") }}</h3>

        <!-- App full version -->
        <div class="text-secondary-lighten-1 text-caption">
          <span class="me-2">{{ $t("VERSION") }}:</span>
          <span>{{ mergedAppAndUiVersion() }}</span>
        </div>

      </div>
    </div>

    <!-- Menu items -->
    <v-list dense class="pt-0">

      <!-- Settings -->
      <v-list-item class="border-b" @click="$router.replace({path: '/settings'})">
        <v-list-item-title>
          <v-icon class="opacity-80">mdi-cog</v-icon>
          <span class="ms-3">{{$t('SETTINGS')}}</span>
        </v-list-item-title>
      </v-list-item>

      <!-- Diagnose -->
      <v-list-item class="border-b" :disabled="!$vpnHoodApp.canDiagnose()" @click="diagnose">
        <v-list-item-title>
          <v-icon>mdi-stethoscope</v-icon>
          <span class="ms-3">{{$t('DIAGNOSE')}}</span>
        </v-list-item-title>
      </v-list-item>

      <!-- Check for update -->
      <v-list-item class="border-b" @click="checkForUpdate">
        <v-list-item-title>
          <v-progress-circular v-if="isCheckForUpdate" :width="2" :size="21.59" :indeterminate="true" color="secondary"/>
          <v-icon v-else>mdi-update</v-icon>
          <span class="ms-3">{{$t('CHECK_FOR_UPDATE')}}</span>
        </v-list-item-title>
      </v-list-item>

      <!-- Sign in button -->
      <v-list-item v-if="$vpnHoodApp.data.uiState.isGoogleSignInSupported && !$vpnHoodApp.data.userState.userAccount" class="border-b" @click="onSignIn">
        <v-list-item-title>
          <v-icon>mdi-login</v-icon>
          <span class="ms-3">{{$t('SIGN_IN_WITH_GOOGLE')}}</span>
        </v-list-item-title>
      </v-list-item>

      <!-- Sign out button -->
      <v-list-item v-if="$vpnHoodApp.data.uiState.isGoogleSignInSupported && $vpnHoodApp.data.userState.userAccount" class="border-b" @click="onSignOut">
        <v-list-item-title class="d-flex align-center">
          <v-icon>mdi-logout</v-icon>
          <div class="d-inline-flex flex-column ms-3">
            <span>{{$t('SIGN_OUT')}}</span>
            <span class="text-caption opacity-50">{{$vpnHoodApp.data.userState.userAccount.email}}</span>
          </div>
        </v-list-item-title>
      </v-list-item>

      <!-- Whats new -->
      <v-list-item
          :nav="true"
          density="compact"
          class="opacity-80 mt-4"
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
          class="opacity-80"
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
          class="opacity-80"
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

export default defineComponent({
  data(){
    return{
      isCheckForUpdate: false,
    }
  },
  props: {
    modelValue: Boolean,
  },
  emits: [
    "update:modelValue"
  ],
  methods: {

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
    },

    async checkForUpdate(){
      try {
        this.isCheckForUpdate = true;
        await this.$vpnHoodApp.checkForUpdate();
      }
      catch (err: any){
        throw new Error(err);
      }
      finally {
        this.isCheckForUpdate = false;
        this.$emit('update:modelValue', false);
      }
    },

    async onSignIn(){
      try {
        this.$vpnHoodApp.data.uiState.showLoadingDialog = true;
        await this.$vpnHoodApp.signIn();
        this.$emit('update:modelValue', false);
      }
      finally {
        this.$vpnHoodApp.data.uiState.showLoadingDialog = false;
      }
    },

    onSignOut(){
      this.$vpnHoodApp.signOut();
      this.$emit('update:modelValue', false);
    }
  }
});
</script>
