<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { computed } from 'vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

const props = defineProps<{
  modelValue: boolean,
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void,
}>();

const tunnelClientCountry = computed<boolean>({
  get: () => {
    return vhApp.data.settings.userSettings.tunnelClientCountry;
  } ,
  set: async (value: boolean): Promise<void> => {
    vhApp.data.settings.userSettings.tunnelClientCountry = value;
    await vhApp.saveUserSetting();
  }
});
</script>

<template>
  <v-dialog
    :modelValue="props.modelValue"
    @update:modelValue="emit('update:modelValue',$event)"
    max-width="600"
  >
    <v-card :color="vhApp.isConnectApp() ? 'primary-darken-2' : 'white'">
      <v-card-title :class="vhApp.isConnectApp() ? 'text-secondary' : 'bg-secondary'">
        {{ locale("TUNNEL_MY_COUNTRY") }}
      </v-card-title>

      <v-card-text>
        <!-- Disconnecting alert -->
        <v-alert
          v-if="vhApp.isConnected()"
          class="mb-5 text-caption"
          density="compact"
          :icon="false"
          type="warning"
          :text="locale('DISCONNECT_REQUIRED_TO_CHANGE_SETTING')">
        </v-alert>

        <p :class="[vhApp.isConnectApp() ? 'text-disabled' : 'text-gray-lighten-1','pb-4']">
          {{ locale("TUNNEL_MY_COUNTRY_DESC") }}
        </p>

        <v-radio-group v-model="tunnelClientCountry" :hide-details="true" class="mx-n3" :disabled="vhApp.isConnected()">

          <v-radio :value="true" color="secondary" class="mb-3">
            <template v-slot:label>
              <span>{{ locale("TUNNEL_MY_COUNTRY_ON") }}</span>
              <span :class="[vhApp.isConnectApp() ? 'text-disabled' : 'text-gray-lighten-1','text-caption ms-1']">
                ({{ locale("TUNNEL_MY_COUNTRY_ON_DESC") }})
              </span>
            </template>
          </v-radio>

          <v-radio :value="false" color="secondary">
            <template v-slot:label>
              <span>{{ locale("TUNNEL_MY_COUNTRY_OFF") }}</span>
              <span :class="[vhApp.isConnectApp() ? 'text-disabled' : 'text-gray-lighten-1','text-caption ms-1']">
                ({{ locale("TUNNEL_MY_COUNTRY_OFF_DESC") }})
              </span>
              <v-chip class="ms-2" size="small" color="secondary" :text="locale('RECOMMENDED')"/>
            </template>
          </v-radio>

        </v-radio-group>
      </v-card-text>

      <v-card-actions>
        <v-spacer/>
        <v-btn
          color="secondary"
          variant="text"
          :text="locale('CLOSE')"
          @click="emit('update:modelValue',false)"
        />
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>
