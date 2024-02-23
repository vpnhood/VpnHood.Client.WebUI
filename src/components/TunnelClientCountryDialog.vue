<template>
  <v-dialog
      :modelValue="modelValue"
      @update:modelValue="$emit('update:modelValue',$event)"
      max-width="600"
  >
    <v-card>
      <v-card-title class="bg-secondary">{{ $t("TUNNEL_MY_COUNTRY") }}</v-card-title>

      <v-card-text>
        <p class="pb-4 color-muted">{{ $t("TUNNEL_MY_COUNTRY_DESC") }}</p>

        <v-radio-group v-model="tunnelClientCountry" hide-details>
          <v-radio
              :label="$t('TUNNEL_MY_COUNTRY_ON')"
              :value="true"
              color="secondary"
          ></v-radio>
          <v-radio
              :value="false"
              color="secondary"
          >
            <template v-slot:label>
              <span>{{ $t("TUNNEL_MY_COUNTRY_OFF") }}</span>
              <v-chip
                  class="ms-2"
                  color="secondary"
                  :text="$t('RECOMMENDED')"
              ></v-chip>
            </template>
          </v-radio>
        </v-radio-group>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" variant="text" @click="$emit('update:modelValue',false)">
          {{ $t("CLOSE") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: "TunnelClientCountryDialog",
  props: {
    modelValue: Boolean,
  },
  emits: [
    "update:modelValue",
  ],
  computed: {
    tunnelClientCountry:
        {
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
