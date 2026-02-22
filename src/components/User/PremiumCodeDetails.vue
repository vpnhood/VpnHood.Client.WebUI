<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { onMounted, ref } from 'vue';
import { Util } from '@/helpers/Util';
import router from '@/services/router';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;
const showCopyIcon = ref(true);
const premiumCode = ref("");

onMounted(async () => {
  const clientProfileId = vhApp.data.clientProfileId;
  if (!clientProfileId){
    premiumCode.value = locale("COULD_NOT_GET_PREMIUM_CODE");
    return;
  }
  const code = await vhApp.clientProfileClient.getAccessCode(clientProfileId);
  premiumCode.value = code.match(/.{1,4}/g)?.join('-') || '';
})

async function copyPremiumCode(){
  await navigator.clipboard.writeText(premiumCode.value);
  showCopyIcon.value = false;
  setTimeout(() => {
    showCopyIcon.value = true;
  }, 2000);
}
</script>

<template>
  <config-card>
    <v-card-title>{{locale('PREMIUM_CODE_DETAILS')}}</v-card-title>
    <v-card-text>
      <ul id="premiumCodeInfoList">

        <!-- Code -->
        <li>
          <span class="text-subtitle-2 text-disabled">{{ locale('CODE') }}:</span>
          <span class="text-subtitle-2 text-active">
                {{premiumCode}}
                <v-btn
                  size="small"
                  density="comfortable"
                  :icon="showCopyIcon ? 'mdi-content-copy' : 'mdi-check'"
                  :class="[showCopyIcon ? 'text-disabled' : 'text-active']"
                  @click="copyPremiumCode()"
                />
              </span>
        </li>

        <template v-if="vhApp.data.state.sessionInfo?.accessInfo">
          <!-- Max Device -->
          <li>
            <span class="text-subtitle-2 text-disabled">{{ locale('MAX_DEVICE') }}:</span>
            <span class="text-subtitle-2 text-active">
                  {{ vhApp.data.state.sessionInfo.accessInfo.maxDeviceCount > 0
              ? vhApp.data.state.sessionInfo.accessInfo.maxDeviceCount
              : locale('UNLIMITED')}}
                </span>
          </li>

          <!-- Used device -->
          <li>
            <span class="text-subtitle-2 text-disabled">{{locale('USED_DEVICE')}}:</span>
            <span v-if="vhApp.data.state.sessionInfo.accessInfo.devicesSummary?.hasMoreDevices" class="text-highlight">
                  {{locale('MORE_THAN_X_DEVICES', {x: vhApp.data.state.sessionInfo.accessInfo.devicesSummary?.deviceCount})}}
                </span>
            <span v-else class="text-highlight">
                  {{ vhApp.data.state.sessionInfo.accessInfo.devicesSummary?.deviceCount }}
                </span>
          </li>

          <!-- Activation time -->
          <li>
            <span class="text-subtitle-2 text-disabled">{{ locale('ACTIVATED_ON') }}:</span>
            <span class="text-subtitle-2 text-active">
                  {{Util.getShortDate(vhApp.data.state.sessionInfo.accessInfo.createdTime) }}
                </span>
          </li>

          <!-- Expiration time -->
          <li>
            <span class="text-subtitle-2 text-disabled">{{ locale('EXPIRATION_DATE') }}:</span>
            <span :class="[vhApp.data.state.sessionInfo.accessInfo.expirationTime ? 'text-error' : 'text-active']">
                  {{ vhApp.data.state.sessionInfo.accessInfo.expirationTime
              ? Util.getShortDate(vhApp.data.state.sessionInfo.accessInfo.expirationTime)
              : locale('NEVER') }}
                </span>
          </li>

          <!-- Last use -->
          <li>
            <span class="text-subtitle-2 text-disabled">{{ locale('LAST_USED') }}:</span>
            <span class="text-highlight">
                  {{ Util.getShortDate(vhApp.data.state.sessionInfo.accessInfo.lastUsedTime) }}
                </span>
          </li>
        </template>
      </ul>

      <!-- If disconnected -->
      <div v-if="!vhApp.data.state.sessionInfo?.accessInfo" class="text-center text-caption text-disabled mt-4">
        <v-icon icon="mdi-information-outline" size="30"/>
        <p class="mt-3">{{locale('DISPLAY_INFO_AFTER_CONNECTION')}}</p>
      </div>

    </v-card-text>

    <!-- More details -->
    <v-card-actions v-if="vhApp.data.state.sessionInfo?.accessInfo">
      <btn-style-1
        class="ms-auto"
        :append-icon="Util.getLocalizedRightChevron()"
        :text="locale('MORE_DETAILS')"
        size="small"
        @click="router.push({name: 'STATISTICS'})"
      />
    </v-card-actions>

  </config-card>
</template>

<style scoped>
#premiumCodeInfoList{
  list-style: none;
}
#premiumCodeInfoList > li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 7px;
}

#premiumCodeInfoList > li:nth-child(odd) {
  /*noinspection CssUnresolvedCustomProperty*/
  background-color: rgb(var(--v-theme-zebra-on-config-card-bg));
}
</style>
