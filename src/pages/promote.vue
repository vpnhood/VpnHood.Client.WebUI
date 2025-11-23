<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import router from '@/services/router';
import i18n from '@/locales/i18n';
import { Util } from '@/helpers/Util';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;
</script>

<template>
    <grad-sheet>
        <!-- Back button -->
        <tonal-icon-btn v-if="!vhApp.data.features.isTv" :icon="Util.getLocalizedLeftChevron()"
            class="position-absolute mt-3" style="z-index: 999" @click="router.go(-1)" />

        <div class="d-flex align-center justify-center flex-grow-1 pa-4">
            <v-img eager :src="vhApp.data.uiState.promoteImageUrl" max-width="100%" max-height="100%" contain />
        </div>

        <!-- Go premium button -->
        <card-on-grad class="pb-2">
            <!-- Button -->
            <v-card-item>
                <btn-style-1 prepend-icon="mdi-crown" block :text="locale('GET_THE_DEAL')" tabindex="0"
                    @click="router.push({ name: 'PURCHASE_SUBSCRIPTION' })" />
            </v-card-item>

        </card-on-grad>

    </grad-sheet>
</template>
