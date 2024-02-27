<template>
  <v-dialog :modelValue="modelValue" @update:modelValue="$emit('update:modelValue',$event)" max-width="600">
    <v-card color="primary-darken-2" :flat="true" rounded="lg">
      <v-card-title class="text-secondary border-secondary border-b text-center">{{ $t('YOUR_PREMIUM_SERVERS') }}</v-card-title>
      <v-card-text class="pb-0">

        <!-- Servers list -->
        <v-list bg-color="transparent" class="pb-0">
          <!-- Server item -->
          <v-list-item
              v-model="defaultClientProfileId"
              v-show="item.tokenId !== $vpnHoodApp.data.features.testServerTokenId"
              v-for="(item, index) in $vpnHoodApp.data.clientProfileInfos"
              :key="index"
              rounded="15"
              base-color="primary-darken-2"
              variant="flat"
              class="ps-2 mb-2 border border-surface border-opacity-25"
              active-class="border border-opacity-100 border-secondary-lighten-1"
              :active="item.clientProfileId === defaultClientProfileId"
              @click="defaultClientProfileId = item.clientProfileId"
          >
            <!-- َActive item icon -->
            <template v-slot:prepend>
              <v-radio
                  v-model="defaultClientProfileId"
                  density="compact"
                  :value="item.clientProfileId"
                  :color="item.clientProfileId === defaultClientProfileId ? 'secondary-lighten-1' : 'gray'"
                  :class="[item.clientProfileId === defaultClientProfileId ? '' : 'opacity-30', 'me-3' ]"
              />
            </template>

            <!-- Profile name -->
            <v-list-item-title class="title">{{ item.clientProfileName }}</v-list-item-title>

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
  computed: {
    defaultClientProfileId:
        {
          get() {
            return this.$vpnHoodApp.data.settings.userSettings.defaultClientProfileId;
          },
          async set(value: string) {
            this.$vpnHoodApp.data.settings.userSettings.defaultClientProfileId = value;
            await this.$vpnHoodApp.saveUserSetting();
            this.$router.replace('/');
            await this.$vpnHoodApp.connect();
          }
        },
  },
})
</script>
