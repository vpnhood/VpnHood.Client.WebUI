<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const props = defineProps<{
  modelValue: boolean,
  title: string,
  message: string,
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void,
  (e: 'clickAction'): void,
}>();
</script>

<template>
    <v-dialog
      :modelValue="props.modelValue"
      @update:modelValue="emit('update:modelValue',$event)"
      :persistent="true"
      max-width="600"
      >
      <v-card
        :color="vhApp.isConnectApp() ? 'primary-darken-2' : 'white'"
        class="pt-2"
      >
        <!-- Title -->
        <v-card-title :class="vhApp.isConnectApp() ? 'text-secondary' : 'bg-secondary'">
          <div class="d-flex align-center">
            <v-icon class="pe-3" icon="mdi-alert-circle-outline"/>
            <h4 class="text-wrap">{{ props.title }}</h4>
          </div>
          <v-divider v-if="vhApp.isConnectApp()" class="mt-3 border-opacity-25"></v-divider>
        </v-card-title>

        <!-- Message -->
        <v-card-text :class="[vhApp.isConnectApp() ? 'text-disabled' : 'text-gray-lighten-2']">
          {{ props.message }}
        </v-card-text>


        <!-- Buttons -->
        <v-card-actions>

          <!-- No -->
          <v-btn
            rounded="pill"
            variant="tonal"
            max-height="32px"
            min-width="70px"
            color="secondary"
            :text="locale('NO')"
            @click="emit('update:modelValue', false)"
          />

          <!-- Yes -->
          <v-btn
            rounded="pill"
            variant="text"
            max-height="32px"
            min-width="70px"
            color="secondary"
            :text="locale('YES')"
            @click="emit('clickAction'); emit('update:modelValue', false)"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>
