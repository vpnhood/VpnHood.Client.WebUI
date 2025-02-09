<script setup lang="ts">
import { ref, watch } from 'vue';
import router from '@/services/router';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import vuetify from '@/services/vuetify';
import { AppName } from '@/helpers/UiConstants';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const props = defineProps<{
  modelValue: boolean
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const closeByKeyboardEscape = (event: KeyboardEvent) => {
  if (event.code === 'Escape')
    emit('update:modelValue', false);
};

const isCheckForUpdate = ref<boolean>(false);

watch(() => props.modelValue, (newVal) => {
  if (newVal)
    window.addEventListener('keydown', closeByKeyboardEscape);
  else
    window.removeEventListener('keydown', closeByKeyboardEscape);
});

async function diagnose(): Promise<void> {
  emit('update:modelValue', false);
  await vhApp.diagnose();
}

function mergedAppAndUiVersion(): string {
  const appVersion = vhApp.data.features.version.split('.');
  const uiVersion = import.meta.env.PACKAGE_VERSION?.split('.');
  if (uiVersion) {
    appVersion[appVersion.length - 1] = uiVersion[2];
    return appVersion.join('.');
  } else {
    console.error('could not find UI package version.');
    return vhApp.data.features.version;
  }
}

async function checkForUpdate() {
  try {
    isCheckForUpdate.value = true;
    await vhApp.checkForUpdate();
  }
  finally {
    isCheckForUpdate.value = false;
    emit('update:modelValue', false);
  }
}

async function onSignIn() {
  try {
    // TODO: show loader issue
    emit('update:modelValue', false);
    vhApp.data.uiState.showLoadingDialog = true;
    await vhApp.signIn();
  } finally {
    vhApp.data.uiState.showLoadingDialog = false;
  }
}
function navigateByRouter(address: string){
  emit('update:modelValue', false);
  router.replace(address);
}
</script>

<template>
  <v-navigation-drawer
    @update:modelValue="emit('update:modelValue', $event)"
    :modelValue="modelValue"
    :location="vuetify.locale.isRtl.value? 'right' : 'left'"
    color="navigation-drawer"
    :temporary="true"
    :disable-route-watcher="true"
    :floating="true"
  >
    <!-- Header -->
    <div class="bg-navigation-drawer-header d-flex align-center pa-4">

      <v-img
        :src="vhApp.getImageUrl(`${vhApp.data.features.uiName ?? AppName.VpnHoodClient}-logo.png`)"
        :eager="true"
        alt="logo"
        max-width="50"
        width="50"
        height="50"
      />

      <div class="ms-3">
        <!-- App name -->
        <h4 dir="ltr" :class="vuetify.locale.isRtl.value? 'text-end' : 'text-start'">
          {{ vhApp.isConnectApp() ? locale('VPN_HOOD_CONNECT_APP_NAME') : locale('VPN_HOOD_APP_NAME') }}
        </h4>

        <!-- App full version -->
        <div class="text-navigation-drawer-version text-caption">
          <span class="me-2">{{ locale('VERSION') }}:</span>
          <span>{{ mergedAppAndUiVersion() }}</span>
        </div>
      </div>

    </div>

    <!-- TODO: create component -->
    <!-- Menu items -->
    <v-list>

      <!-- Go premium -->
      <v-list-item
        v-if="vhApp.data.features.isPremiumFlagSupported &&
        vhApp.data.state.clientProfile?.selectedLocationInfo?.options.canGoPremium"
        class="border-b"
        @click="navigateByRouter('/purchase-subscription')"
      >
        <v-list-item-title>
          <v-icon icon="mdi-crown" />
          <span class="ms-3">{{locale('GO_PREMIUM') }}</span>
        </v-list-item-title>
      </v-list-item>

      <!-- Sign in or account button -->
      <v-list-item
        v-if="vhApp.data.features.isAccountSupported"
        class="border-b"
        @click="vhApp.data.userState.userAccount ? navigateByRouter('/account') : onSignIn()"
      >
        <v-list-item-title class="d-flex align-center">
          <v-icon icon="mdi-account" />
          <span class="ms-3 d-flex flex-column">
            <span>{{ vhApp.data.userState.userAccount ? locale('ACCOUNT') : locale('SIGN_IN_WITH_GOOGLE') }}</span>
            <span v-if="vhApp.data.userState.userAccount" class="text-disabled text-caption text-truncate" style="max-width: 195px">
              {{vhApp.data.userState.userAccount.email}}
            </span>
          </span>
        </v-list-item-title>
      </v-list-item>

      <!-- Settings -->
      <v-list-item
        class="border-b"
        @click="navigateByRouter('/settings')"
      >
        <v-list-item-title>
          <v-icon icon="mdi-cog" />
          <span class="ms-3">{{ locale('SETTINGS') }}</span>
        </v-list-item-title>
      </v-list-item>

      <!-- Diagnose -->
      <v-list-item
        class="border-b"
        :disabled="!vhApp.data.state.canDiagnose"
        @click="diagnose"
      >
        <v-list-item-title>
          <v-icon icon="mdi-stethoscope" />
          <span class="ms-3">{{ locale('DIAGNOSE') }}</span>
        </v-list-item-title>
      </v-list-item>

      <!-- Check for update -->
      <v-list-item
        class="border-b"
        @click="checkForUpdate"
      >
        <v-list-item-title>
          <v-progress-circular v-if="isCheckForUpdate" :width="2" :size="21.59" :indeterminate="true" color="highlight" />
          <v-icon v-else icon="mdi-update" />
          <span class="ms-3">{{ locale('CHECK_FOR_UPDATE') }}</span>
        </v-list-item-title>
      </v-list-item>

      <!-- Whats new -->
      <v-list-item
        v-if="vuetify.display.mobile.value || vuetify.display.platform.value.win"
        :nav="true"
        density="compact"
        class="opacity-80 mt-4"
        href="https://github.com/vpnhood/VpnHood/blob/main/CHANGELOG.md"
        @click="emit('update:modelValue',false)"
        target="_blank">

        <v-list-item-title>
          <v-icon icon="mdi-bullhorn" />
          <span class="ms-3 text-caption">{{ locale('WHATS_NEW') }}</span>
        </v-list-item-title>
      </v-list-item>

      <!-- Send feedback -->
      <!-- Do not show on TV -->
      <v-list-item
        v-if="vuetify.display.mobile.value || vuetify.display.platform.value.win"
        :nav="true"
        density="compact"
        class="opacity-80"
        href="https://docs.google.com/forms/d/e/1FAIpQLSd5AQesTSbDo23_4CkNiKmSPtPBaZIuFjAFnjqLo6XGKG5gyg/viewform?usp=sf_link"
        @click="emit('update:modelValue',false)"
        target="_blank">

        <v-list-item-title>
          <v-icon icon="mdi-message-alert" />
          <span class="ms-3 text-caption">{{ locale('SEND_FEEDBACK') }}</span>
        </v-list-item-title>
      </v-list-item>

      <!-- Create personal server -->
      <!-- Do not show on TV -->
      <v-list-item
        v-if="!vhApp.isConnectApp() && (vuetify.display.mobile.value || vuetify.display.platform.value.win)"
        :nav="true"
        density="compact"
        class="opacity-80"
        href="https://github.com/vpnhood/VpnHood/wiki/VpnHood-Manager"
        @click="emit('update:modelValue',false)"
        target="_blank">

        <v-list-item-title>
          <v-icon icon="mdi-server" />
          <span class="ms-3 text-caption">{{ locale('CREATE_PERSONAL_SERVER') }}</span>
        </v-list-item-title>
      </v-list-item>

      <!-- Website -->
      <v-list-item
        :nav="true"
        density="compact"
        class="opacity-80"
        href="https://www.vpnhood.com/home"
        @click="emit('update:modelValue',false)"
        target="_blank">

        <v-list-item-title>
          <v-icon icon="mdi-web" />
          <span class="ms-3 text-caption">vpnhood.com</span>
        </v-list-item-title>
      </v-list-item>

    </v-list>

    <!-- Bottom section -->
    <div class="text-center position-fixed bottom-0 w-100">

      <!-- Social icons -->
<!--      <div class="d-flex justify-center ga-3 mb-5">

        &lt;!&ndash; Website &ndash;&gt;
        <v-btn
          icon
          size="small"
          variant="tonal"
          density="comfortable"
          href="https://www.vpnhood.com"
          target="_blank"
        >
          <template v-slot:default>
            <Icon icon="proicons:globe" width="20" />
          </template>
        </v-btn>

        &lt;!&ndash; Instagram &ndash;&gt;
        <v-btn
          icon
          size="small"
          variant="tonal"
          density="comfortable"
          href="https://www.instagram.com/vpnhood/"
          target="_blank"
        >
          <template v-slot:default>
            <Icon icon="proicons:instagram" width="20" />
          </template>
        </v-btn>

        &lt;!&ndash; Twitter &ndash;&gt;
        <v-btn
          icon
          size="small"
          variant="tonal"
          density="comfortable"
          href="https://x.com/vpnhood"
          target="_blank"
        >
          <template v-slot:default>
            <Icon icon="proicons:x-twitter" width="17" />
          </template>
        </v-btn>
      </div>-->

      <!-- Powered by button -->
      <a
        class="d-block mb-2 text-caption text-decoration-none text-active"
        href="https://github.com/vpnhood/VpnHood"
        target="_blank"
      >
        <span class="text-highlight">{{ locale('POWERED_BY') }}</span><br/>
        <span>{{locale('VPNHOOD_ENGINE')}}</span>
        <v-icon icon="mdi-open-in-new" class="ms-1" size="13" />
      </a>
    </div>
  </v-navigation-drawer>

</template>
