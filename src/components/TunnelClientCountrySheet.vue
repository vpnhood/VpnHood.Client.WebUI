<template>
  <v-dialog v-model="isShow" close-on-back>
    <v-card :title="$t('TUNNEL_MY_COUNTRY')">
      <v-divider class="mt-3"></v-divider>
      <v-card-text>
        <p class="pb-4 color-muted">{{ $t('TUNNEL_MY_COUNTRY_DESC') }}</p>
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
            return this.$vpnHoodApp.settings.userSettings.tunnelClientCountry;
          },
          set(value: boolean) {
            this.$vpnHoodApp.settings.userSettings.tunnelClientCountry = value;
            this.$vpnHoodApp.saveUserSetting();
          }
        },
  },
})
</script>
