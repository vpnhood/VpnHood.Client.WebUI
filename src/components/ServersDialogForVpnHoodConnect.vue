<template>
  <v-dialog :modelValue="modelValue" @update:modelValue="$emit('update:modelValue',$event)" max-width="600">
    <v-card>
      <v-card-title class="bg-secondary">{{ $t('SERVERS') }}</v-card-title>
      <v-card-text>

        <!-- Alert when user does not have a premium server -->
        <p v-if="$vpnHoodApp.data.userState.userAccount?.subscriptionId == null">
          {{$t('SHOW_PREMIUM_SERVER_HERE_AFTER_PURCHASING')}}
        </p>

        <!-- Servers list -->
        <v-list v-else bg-color="transparent">
          <!-- Server item -->
          <v-list-item
              v-show="item.tokenId !== $vpnHoodApp.data.features.testServerTokenId"
              v-for="(item, index) in $vpnHoodApp.data.clientProfileInfos"
              :key="index"
              rounded="lg"
              lines="two"
              variant="elevated"
              @click="connect(item.clientProfileId)"
              class="mb-3"
              :style="item.clientProfileId === $vpnHoodApp.data.settings.userSettings.defaultClientProfileId ? 'border: solid rgb(var(--v-theme-secondary)) 2px' : ''"
          >
            <!-- َActive item icon -->
            <template v-slot:prepend
                      v-if="item.clientProfileId === $vpnHoodApp.data.settings.userSettings.defaultClientProfileId">
              <v-avatar size="25" color="rgba(var(--v-theme-secondary), .3)">
                <v-icon size="25" color="secondary">mdi-check-all</v-icon>
              </v-avatar>
            </template>

            <!-- Profile name -->
            <v-list-item-title class="mb-2">
              <span class="title">{{ item.clientProfileName }} </span>
            </v-list-item-title>

            <!-- Support ID and Host name -->
            <v-list-item-subtitle class="text-caption">
              <p>(sid:{{ item.supportId }})</p>
              <p class="mb-0 text-caption">{{ item.hostNames ? item.hostNames[0] : "" }}</p>
            </v-list-item-subtitle>

          </v-list-item>
        </v-list>

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
  name: 'ServersDialogForVpnHoodConnect',
  props: {
    modelValue: Boolean,
  },
  emits: [
    "update:modelValue",
  ],
  methods:{
    async connect(clientProfileId: string): Promise<void> {
      this.$router.replace('/');
      this.$vpnHoodApp.data.settings.userSettings.defaultClientProfileId = clientProfileId;
      await this.$vpnHoodApp.saveUserSetting();
      await this.$vpnHoodApp.connect();
    },
  }
})
</script>
