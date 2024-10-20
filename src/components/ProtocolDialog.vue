<template>
  <v-dialog
      :modelValue="modelValue"
      @update:modelValue="$emit('update:modelValue',$event)"
      max-width="600"
  >
    <v-card :color="$vpnHoodApp.isConnectApp() ? 'primary-darken-2' : 'white'">
      <v-card-title :class="$vpnHoodApp.isConnectApp() ? 'text-secondary' : 'bg-secondary'">
        {{ $t("PROTOCOL") }}
      </v-card-title>

      <v-card-text>
        <p :class="[$vpnHoodApp.isConnectApp() ? 'text-disabled' : 'text-gray-lighten-2','pb-4']">{{ $t("PROTOCOL_DESC") }}</p>

        <!-- UDP not supported alert -->
        <v-alert
            v-if="isUdpUnsupported()"
            class="mb-3 text-caption"
            :icon="false"
            type="warning"
            :text="$t('UDP_NOT_SUPPORTED_MESSAGE')"
        />

        <v-radio-group :hide-details="true" v-model="useUdpChannel" :disabled="isUdpUnsupported()" class="mx-n3">

          <v-radio :value="true" color="secondary" class="mb-3">
            <template v-slot:label>
              <span>{{ $t("PROTOCOL_UDP_ON") }}</span>
              <span :class="[$vpnHoodApp.isConnectApp() ? 'text-disabled' : 'text-gray-lighten-2','text-caption ms-1']">
                ({{ $t('LESS_LATENCY') }})
              </span>
            </template>
          </v-radio>

          <v-radio :value="false" color="secondary">
            <template v-slot:label>
              <span>{{ $t("PROTOCOL_UDP_OFF") }}</span>
              <span :class="[$vpnHoodApp.isConnectApp() ? 'text-disabled' : 'text-gray-lighten-2','text-caption ms-1']">({{ $t('MORE_RELIABLE') }})</span>
              <v-chip class="ms-2" size="small" color="secondary" :text="$t('DEFAULT')"></v-chip>
            </template>
          </v-radio>

        </v-radio-group>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" variant="text" :text="$t('CLOSE')" @click="$emit('update:modelValue',false)"/>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {AppConnectionState} from "@/services/VpnHood.Client.Api";
import {AppName} from "@/UiConstants";

export default defineComponent({
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
    useUdpChannel: {
      get() {
        if (this.$vpnHoodApp.data.state.connectionState === AppConnectionState.Connected &&
            this.$vpnHoodApp.data.state.isUdpChannelSupported === false)
          return false;

        return this.$vpnHoodApp.data.settings.userSettings.useUdpChannel;
      },
      async set(value: boolean) {
        this.$vpnHoodApp.data.settings.userSettings.useUdpChannel = value;
        await this.$vpnHoodApp.saveUserSetting();
      }
    },
  },
  methods: {
    isUdpUnsupported(): boolean {
      return this.$vpnHoodApp.data.state.connectionState === AppConnectionState.Connected &&
          this.$vpnHoodApp.data.state.isUdpChannelSupported === false;
    }
  }
})
</script>
