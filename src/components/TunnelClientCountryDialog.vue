<template>
  <v-dialog
      :modelValue="modelValue"
      @update:modelValue="$emit('update:modelValue',$event)"
      max-width="600"
  >
    <v-card :color="$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect ? 'primary-darken-2' : 'white'">
      <v-card-title :class="$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect ? 'text-secondary' : 'bg-secondary'">
        {{ $t("TUNNEL_MY_COUNTRY") }}
      </v-card-title>

      <v-card-text>
        <p :class="[$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect ? 'text-disabled' : 'text-gray-lighten-2','pb-4']">{{ $t("TUNNEL_MY_COUNTRY_DESC") }}</p>

        <v-radio-group v-model="tunnelClientCountry" hide-details class="mx-n3">

          <v-radio :value="true" color="secondary">
            <template v-slot:label>
              <span>{{ $t("TUNNEL_MY_COUNTRY_ON") }}</span>
              <span :class="[$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect ? 'text-disabled' : 'text-gray-lighten-2','text-caption ms-1']">({{ $t("TUNNEL_MY_COUNTRY_ON_DESC") }})</span>
            </template>
          </v-radio>

          <v-radio :value="false" color="secondary">
            <template v-slot:label>
              <span>{{ $t("TUNNEL_MY_COUNTRY_OFF") }}</span>
              <span :class="[$vpnHoodApp.data.features.uiName === AppName.VpnHoodConnect ? 'text-disabled' : 'text-gray-lighten-2','text-caption ms-1']">({{ $t("TUNNEL_MY_COUNTRY_OFF_DESC") }})</span>
              <v-chip class="ms-2" size="small" color="secondary" :text="$t('RECOMMENDED')"/>
            </template>
          </v-radio>

        </v-radio-group>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" variant="text" :text="$t('CLOSE')" @click="$emit('update:modelValue',false)" />
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {AppName} from "@/UiConstants";

export default defineComponent({
  name: "TunnelClientCountryDialog",
  data() {
    return {
      AppName
    }
  },
  props: {
    modelValue: Boolean,
  },
  emits: [
    "update:modelValue",
  ],
  computed: {
    tunnelClientCountry: {
      get() {
        return this.$vpnHoodApp.data.settings.userSettings.tunnelClientCountry;
      },
      async set(value: boolean) {
        this.$vpnHoodApp.data.settings.userSettings.tunnelClientCountry = value;
        await this.$vpnHoodApp.saveUserSetting();
      }
    },
  }
})
</script>
