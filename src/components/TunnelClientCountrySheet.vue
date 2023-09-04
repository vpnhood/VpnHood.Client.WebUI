<template>
  <v-dialog
      v-model="isShow"
      close-on-back
  >
    <v-card :title="$t('TUNNEL_MY_COUNTRY')">
      <v-divider class="mt-3"></v-divider>
      <v-card-text>
        <p class="pb-4 color-muted">{{$t('TUNNEL_MY_COUNTRY_DESC')}}</p>
        <v-radio-group v-model="tunnelClientCountry" hide-details>
          <v-radio
              :label="$t('TUNNEL_MY_COUNTRY_ON')"
              :value="true"
              color="info"
              class="mb-4"
          ></v-radio>
          <v-radio
              :label="$t('TUNNEL_MY_COUNTRY_OFF')"
              :value="false"
              color="info"
          >
          </v-radio>
        </v-radio-group>
        <v-chip
            color="var(--master-green)"
            :text="$t('RECOMMENDED')"
            class="w-100 justify-center"
        ></v-chip>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" variant="text" @click="isShow = false">
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
  data() {
    return {
      isShow: false,
    }
  },
  computed: {
    tunnelClientCountry:
        {
          get() {
            return this.$clientApp.settings.userSettings.tunnelClientCountry;
          },
          set(value: boolean) {
            this.$clientApp.settings.userSettings.tunnelClientCountry = value;
          }
        },
  },
})
</script>
