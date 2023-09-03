<template>
  <v-dialog
      :model-value="modelValue"
      value="true"
      close-on-content-click
      close-on-back
  >
    <v-card>
      <v-toolbar class="headline grey lighten-2">
        <v-btn icon @click="close()">
          <v-icon small>close</v-icon>
        </v-btn>
        <v-toolbar-title>{{ $t("TUNNEL_MY_COUNTRY") }}</v-toolbar-title>
      </v-toolbar>
      <v-radio-group v-model="tunnelClientCountry">
        <v-card-text>{{ $t("TUNNEL_MY_COUNTRY_DESC") }}</v-card-text>
        <v-card-text>
          <v-radio
              :label="$t('TUNNEL_MY_COUNTRY_ON')"
              :value="true"
              class="my-4"
          ></v-radio>
          <v-radio
              :label="$t('TUNNEL_MY_COUNTRY_OFF')"
              :value="false"
              class="my-4"
          >
          </v-radio>
        </v-card-text>
      </v-radio-group>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="this.$emit('update:modelValue',false)">
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
            return this.$clientApp.Settings?.userSettings.tunnelClientCountry;
          },
          set(value: boolean) {
            this.$clientApp.Settings.userSettings.tunnelClientCountry = value;
            /*this.$clientApp.setUserSetting({tunnelClientCountry: true});*/
          }
        },
})
</script>
