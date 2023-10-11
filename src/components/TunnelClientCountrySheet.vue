<template>
  <v-dialog
      :modelValue="modelValue"
      @update:modelValue="$emit('update:modelValue',$event)"
      max-width="600"
      close-on-back
  >
    <v-card>
      <v-card-title class="bg-grey-lighten-3">{{$t("TUNNEL_MY_COUNTRY")}}</v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <p class="pb-4 color-muted">{{ $t("TUNNEL_MY_COUNTRY_DESC") }}</p>

        <v-radio-group v-model="tunnelClientCountry" hide-details>
          <v-radio
              :label="$t('TUNNEL_MY_COUNTRY_ON')"
              :value="true"
              color="error"
              class="mb-4"
          ></v-radio>
          <v-radio
              :value="false"
              color="sharp-master-green"
          >
            <template v-slot:label>
              <span>{{ $t("TUNNEL_MY_COUNTRY_OFF") }}</span>
              <v-chip
                  class="ms-2"
                  color="var(--master-green)"
                  :text="$t('RECOMMENDED')"
              ></v-chip>
            </template>
          </v-radio>
        </v-radio-group>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" variant="text" @click="$emit('update:modelValue',false)">
          {{ $t("CLOSE") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: "TunnelClientCountrySheet",
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
  },
})
</script>
