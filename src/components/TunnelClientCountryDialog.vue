<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import i18n from '@/locales/i18n';
import { ref } from 'vue';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;
const isTunnelCountry = ref<boolean>(vhApp.data.userSettings.tunnelClientCountry);
const props = defineProps<{
  modelValue: boolean,
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void,
}>();

async function onChangeSetting(value: boolean | null): Promise<void>{
  if (vhApp.data.isConnected){
    const result = await vhApp.showConfirmDialog(locale('DISCONNECT_ALERT'), locale('DISCONNECT_ALERT_DESC'));
    if (!result){
      isTunnelCountry.value = vhApp.data.userSettings.tunnelClientCountry;
      return;
    }
  }

  if (value === null) return;
  vhApp.data.userSettings.tunnelClientCountry = value;
  await vhApp.saveUserSetting();
}
</script>

<template>
  <v-dialog
    :modelValue="props.modelValue"
    @update:modelValue="emit('update:modelValue',$event)"
  >
    <v-card color="general-dialog">
      <v-card-item>
        <v-card-title class="text-capitalize">{{locale('SPLIT_MY_COUNTRY')}}</v-card-title>
        <p class="text-disabled text-caption">{{ locale("SPLIT_MY_COUNTRY_DESC") }}</p>
      </v-card-item>

      <v-card-item>

        <v-radio-group
          v-model="isTunnelCountry"
          @update:modelValue="onChangeSetting"
          :hide-details="true"
          class="text-general-dialog-text"
          color="highlight"
        >

          <v-radio :value="false" class="mb-3">
            <template v-slot:label>
              <div class="d-flex flex-column">
                <span>{{ locale("YES") }}</span>
                <span class="text-disabled text-caption">
                  {{ locale("SPLIT_MY_COUNTRY_ON_DESC") }}
                  <v-chip
                    color="highlight"
                    :text="locale('RECOMMENDED')"
                    size="small"
                    variant="tonal"
                    density="comfortable"
                    tabindex="-1"
                  />
                </span>
              </div>
            </template>
          </v-radio>

          <v-radio :value="true">
            <template v-slot:label>
              <div class="d-flex flex-column">
                <span>{{ locale("NO") }}</span>
                <span class="text-disabled text-caption">{{ locale("SPLIT_MY_COUNTRY_OFF_DESC") }}</span>
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
