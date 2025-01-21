<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { computed } from 'vue';
import DisconnectRequiredAlert from '@/components/DisconnectRequiredAlert.vue';

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
  >
    <v-card color="general-dialog" :title="locale('TUNNEL_MY_COUNTRY')">

      <v-card-text class="text-disabled text-caption">{{ locale("TUNNEL_MY_COUNTRY_DESC") }}</v-card-text>

      <v-card-item>

        <!-- Disconnecting alert -->
        <disconnect-required-alert class="mb-4"/>

        <v-radio-group v-model="tunnelClientCountry" :hide-details="true" class="text-general-dialog-text" color="highlight">

          <v-radio :value="true" class="mb-3">
            <template v-slot:label>
              <div class="d-flex flex-column">
                <span>{{ locale("TUNNEL_MY_COUNTRY_ON") }}</span>
                <span class="text-disabled text-caption">{{ locale("TUNNEL_MY_COUNTRY_ON_DESC") }}</span>
              </div>
            </template>
          </v-radio>

          <v-radio :value="false">
            <template v-slot:label>
              <div class="d-flex flex-column">
                <span>{{ locale("TUNNEL_MY_COUNTRY_OFF") }}</span>
                <span class="text-disabled text-caption">
                  {{ locale("TUNNEL_MY_COUNTRY_OFF_DESC") }}
                  <v-chip
                    color="highlight"
                    :text="locale('RECOMMENDED')"
                    size="small"
                    variant="tonal"
                    density="comfortable"
                  />
                </span>
              </div>
            </template>
          </v-radio>

        </v-radio-group>
      </v-card-item>

      <v-card-actions>
        <v-btn :text="locale('CLOSE')" @click="emit('update:modelValue',false)" />
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>
