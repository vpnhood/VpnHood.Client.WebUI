<template>
  <v-navigation-drawer
      @update:modelValue="$emit('update:modelValue', $event)"
      :modelValue="modelValue"
      :location="$vuetify.locale.isRtl? 'right' : 'left'"
      :color="$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect ? 'background' : 'white'"
      :temporary="true"
      :disable-route-watcher="true"
      :floating="true"
  >

    <!-- Header -->
    <div :class="[$vpnHoodApp.isConnectApp() ? 'bg-primary-darken-2' : 'bg-primary-darken-1','d-flex align-center pa-4']">

      <!-- VpnHoodConnect logo -->
      <v-img v-if="$vpnHoodApp.isConnectApp()" :eager="true"
             src="src/assets/images/logo-connect.png"
             alt="logo"
             max-width="60"
             width="60"
             height="60"
      />

      <!-- VpnHood logo -->
      <v-img v-else :eager="true"
             src="src/assets/images/logo.png"
             alt="logo"
             max-width="60"
             width="60"
             height="60"
      />

      <div class="text-white ms-3">

        <!-- App name -->
        <h4 dir="ltr" :class="$vuetify.locale.isRtl? 'text-end' : 'text-start'">
          {{ $vpnHoodApp.isConnectApp() ? $t('VPN_HOOD_CONNECT_APP_NAME') : $t('VPN_HOOD_APP_NAME') }}
        </h4>

        <!-- App full version -->
        <div class="text-secondary-lighten-1 text-caption">
          <span class="me-2">{{ $t("VERSION") }}:</span>
          <span>{{ mergedAppAndUiVersion() }}</span>
        </div>

      </div>
    </div>

    <!-- Menu items -->
    <v-list dense class="pt-0">

      <!-- Go premium or Change subscription -->
      <v-list-item
          v-if="$vpnHoodApp.data.features.isAccountSupported"
          class="bg-secondary"
          @click="goPremium"
      >
        <v-list-item-title>
          <v-icon :icon="$vpnHoodApp.data.userState.userAccount?.subscriptionId ? 'mdi-arrow-decision' : 'mdi-crown'"/>
          <span class="ms-3">
            {{
              $vpnHoodApp.data.userState.userAccount?.subscriptionId ? $t('CHANGE_SUBSCRIPTION') : $t('GO_PREMIUM')
            }}
          </span>
        </v-list-item-title>
      </v-list-item>

      <!-- Sign in button -->
      <v-list-item
          v-if="$vpnHoodApp.data.features.isAccountSupported && !$vpnHoodApp.data.userState.userAccount"
          :class="[$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect ? 'border-secondary' : '', 'border-b']"
          @click="onSignIn"
      >
        <v-list-item-title>
          <v-icon icon="mdi-account"/>
          <span class="ms-3">{{ $t('SIGN_IN_WITH_GOOGLE') }}</span>
        </v-list-item-title>
      </v-list-item>

      <!-- Sign out button -->
      <v-list-item
          v-if="$vpnHoodApp.data.features.isAccountSupported && $vpnHoodApp.data.userState.userAccount"
          :class="[$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect ? 'border-secondary' : '', 'border-b']"
          @click="showConfirmSignOut = true"
      >
        <v-list-item-title class="d-flex align-center">
          <v-icon icon="mdi-logout"/>
          <div class="d-inline-flex flex-column ms-3">
            <span>{{ $t('SIGN_OUT') }}</span>
            <span class="text-caption opacity-50">{{ $vpnHoodApp.data.userState.userAccount.email }}</span>
          </div>
        </v-list-item-title>
      </v-list-item>

      <!-- Settings -->
      <v-list-item
          :class="[$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect ? 'border-secondary' : '', 'border-b']"
          @click="$router.replace({path: '/settings'})"
      >
        <v-list-item-title>
          <v-icon icon="mdi-cog"/>
          <span class="ms-3">{{ $t('SETTINGS') }}</span>
        </v-list-item-title>
      </v-list-item>

      <!-- Diagnose -->
      <v-list-item
          :class="[$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect ? 'border-secondary' : '', 'border-b']"
          :disabled="!$vpnHoodApp.data.state.canDiagnose"
          @click="diagnose"
      >
        <v-list-item-title>
          <v-icon icon="mdi-stethoscope"/>
          <span class="ms-3">{{ $t('DIAGNOSE') }}</span>
        </v-list-item-title>
      </v-list-item>

      <!-- Check for update -->
      <v-list-item
          :class="[$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect ? 'border-secondary' : '', 'border-b']"
          @click="checkForUpdate"
      >
        <v-list-item-title>
          <v-progress-circular v-if="isCheckForUpdate" :width="2" :size="21.59" :indeterminate="true"
                               color="secondary"/>
          <v-icon v-else icon="mdi-update"/>
          <span class="ms-3">{{ $t('CHECK_FOR_UPDATE') }}</span>
        </v-list-item-title>
      </v-list-item>

      <!-- Whats new -->
      <v-list-item
          v-if="$vuetify.display.mobile || $vuetify.display.platform.win"
          :nav="true"
          density="compact"
          class="opacity-80 mt-4"
          href="https://github.com/vpnhood/VpnHood/blob/main/CHANGELOG.md"
          @click="$emit('update:modelValue',false)"
          target="_blank">

        <v-list-item-title>
          <v-icon icon="mdi-bullhorn"/>
          <span class="ms-3 text-caption">{{ $t('WHATS_NEW') }}</span>
        </v-list-item-title>
      </v-list-item>

      <!-- Send feedback -->
      <v-list-item
          v-if="$vuetify.display.mobile || $vuetify.display.platform.win"
          :nav="true"
          density="compact"
          class="opacity-80"
          href="https://docs.google.com/forms/d/e/1FAIpQLSd5AQesTSbDo23_4CkNiKmSPtPBaZIuFjAFnjqLo6XGKG5gyg/viewform?usp=sf_link"
          @click="$emit('update:modelValue',false)"
          target="_blank">

        <v-list-item-title>
          <v-icon icon="mdi-message-alert"/>
          <span class="ms-3 text-caption">{{ $t('SEND_FEEDBACK') }}</span>
        </v-list-item-title>
      </v-list-item>

      <!-- Create personal server -->
      <v-list-item
          v-if="$vpnHoodApp.data.features.uiName !== AppName.VpnHoodConnect && ($vuetify.display.mobile || $vuetify.display.platform.win)"
          :nav="true"
          density="compact"
          class="opacity-80"
          href="https://github.com/vpnhood/VpnHood/wiki/VpnHood-Access-Server"
          @click="$emit('update:modelValue',false)"
          target="_blank">

        <v-list-item-title>
          <v-icon icon="mdi-server"/>
          <span class="ms-3 text-caption">{{ $t('CREATE_PERSONAL_SERVER') }}</span>
        </v-list-item-title>
      </v-list-item>

    </v-list>

    <!-- Powered by button -->
    <a
        :class="[$vpnHoodApp.isConnectApp() ? 'text-secondary-lighten-1' : 'text-primary-darken-2',
         'text-center mb-4 text-caption position-fixed bottom-0 position-fixed w-100 text-decoration-none']"
        href="https://www.vpnhood.com"
        target="_blank"
    >
      <span>{{$t('POWERED_BY_VPNHOOD_ENGINE')}}</span>
      <v-icon icon="mdi-open-in-new" class="ms-2"/>
    </a>
  </v-navigation-drawer>

  <!-- Confirm sign-out dialog -->
  <v-dialog v-model="showConfirmSignOut" max-width="600" :persistent="true">

    <v-card color="primary-darken-2">

      <v-card-title class="text-secondary">{{ $t('CONFIRM_SIGN_OUT_TITLE') }}</v-card-title>
      <v-card-text>{{ $t("CONFIRM_SIGN_OUT_DESC") }}</v-card-text>

      <!-- Dialog buttons -->
      <v-card-actions>
        <v-spacer/>

        <!-- Confirm button -->
        <v-btn
            variant="text"
            color="secondary"
            :text="$t('YES')"
            @click="onSignOut"
        />

        <!-- Cancel button -->
        <v-btn
            variant="tonal"
            color="secondary"
            :text="$t('NO')"
            @click="showConfirmSignOut = false"
        />

      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import {AppName, ComponentName} from "@/UiConstants";
import {ComponentRouteController} from "@/services/ComponentRouteController";

export default defineComponent({
  data() {
    return {
      AppName,
      ComponentName,
      ComponentRouteController,
      isCheckForUpdate: false,
      showConfirmSignOut: false,
    }
  },
  props: {
    modelValue: Boolean,
  },
  emits: [
    "update:modelValue"
  ],

  watch: {
    modelValue(newVal) {
      if (newVal)
        window.addEventListener('keydown', this.closeByKeyboardEscape);
      else
        window.removeEventListener('keydown', this.closeByKeyboardEscape);
    }
  },

  methods: {
    goPremium(){
      this.$router.replace("/purchase-subscription");
      this.$emit('update:modelValue', false);
    },
    async diagnose(): Promise<void> {
      this.$emit('update:modelValue', false);
      await this.$vpnHoodApp.diagnose();
    },

    mergedAppAndUiVersion(): string {
      const appVersion = this.$vpnHoodApp.data.features.version.split('.');
      const uiVersion = import.meta.env.PACKAGE_VERSION?.split('.');
      if (uiVersion) {
        appVersion[appVersion.length - 1] = uiVersion[2];
        return appVersion.join('.');
      } else {
        return this.$vpnHoodApp.data.features.version;
      }
    },

    async checkForUpdate() {
      try {
        this.isCheckForUpdate = true;
        await this.$vpnHoodApp.checkForUpdate();
      } catch (err: unknown) {
        throw err;
      } finally {
        this.isCheckForUpdate = false;
        this.$emit('update:modelValue', false);
      }
    },

    async onSignIn() {
      try {
        this.$vpnHoodApp.data.uiState.showLoadingDialog = true;
        await this.$vpnHoodApp.signIn();
        this.$emit('update:modelValue', false);
      } finally {
        this.$vpnHoodApp.data.uiState.showLoadingDialog = false;
      }
    },

    onSignOut() {
      this.showConfirmSignOut = false;
      this.$vpnHoodApp.signOut();
      this.$emit('update:modelValue', false);
    },

    closeByKeyboardEscape(event: KeyboardEvent) {
      if (event.code === 'Escape')
        this.$emit('update:modelValue', false);
    }

  }
});
</script>
