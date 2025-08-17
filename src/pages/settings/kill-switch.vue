<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import router from '@/services/router';
import { Util } from '@/helpers/Util';
import { AppName } from '@/helpers/UiConstants';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;
</script>

<template>
  <v-sheet color="grad-bg-container-bg" class="pt-4">

    <v-card :class="Util.getSpecialPageCardClass()" class="px-3 pb-3">

      <!-- Back button -->
      <tonal-icon-btn
        v-if="!vhApp.data.features.isTv"
        :icon="Util.getLocalizedLeftChevron()"
        class="mt-3 "
        @click="router.go(-1)"
      />

      <div class="text-center">
        <h3 class="mb-2" v-html="locale('KILL_SWITCH_COLORED')" />
        <p>{{locale("KILL_SWITCH_DESC")}}</p>
      </div>

      <v-img
        :eager="true"
        :src="vhApp.getImageUrl('kill-switch.webp')"
        alt="DNS Icon"
        width="100%"
        max-width="500px"
        class="mx-auto"
      />
      <config-card class="pb-2">
        <v-card-item>
          <ol class="ms-3 d-flex flex-column ga-3 text-caption" style="line-height: 22px">
            <li v-html="locale('KILL_SWITCH_HOW_TO_TURN_ON_STEP_1')"/>
            <li v-html="locale('KILL_SWITCH_HOW_TO_TURN_ON_STEP_2',{
              appName: vhApp.isConnectApp() ? AppName.VpnHoodConnect : AppName.VpnHoodClient,
             icon: '⚙️'
            })"/>
            <li v-html="locale('KILL_SWITCH_HOW_TO_TURN_ON_STEP_3')"/>
          </ol>
        </v-card-item>
        <v-card-item>
          <btn-style-1
            :text="locale('KILL_SWITCH_TURN_ON')"
            block
            @click="vhApp.intentsClient.openSystemKillSwitchSettings()"
          />
        </v-card-item>
      </config-card>

    </v-card>
  </v-sheet>
</template>
