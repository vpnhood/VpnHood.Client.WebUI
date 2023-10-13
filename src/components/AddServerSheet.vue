<template>
  <v-dialog max-width="600" close-on-back :modelValue="modelValue"
            @update:modelValue="$emit('update:modelValue',$event)">

    <!-- Add Test Server -->
    <v-card v-if="testServerVisible" class="mx-auto mb-5 pb-3" width="100%" variant="flat">
      <v-card-title>
        {{ $t("ADD_TEST_SERVER") }}
        <v-divider class="mt-2"/>
      </v-card-title>
      <v-card-text class="pt-0">{{ $t("ADD_TEST_SERVER_SUBTITLE") }}</v-card-text>
      <v-card-actions class="px-4">
        <v-btn variant="tonal" :block="true" color="master-green" @click="addTestServer()">{{ $t("ADD") }}</v-btn>
      </v-card-actions>
    </v-card>

    <!-- Add Private Server -->
    <v-card class="mx-auto pb-3" width="100%" variant="flat">
      <v-card-title>
        {{ $t("ADD_ACCESS_KEY_TITLE") }}
        <v-divider class="mt-2"/>
      </v-card-title>
      <v-card-text class="pt-0">{{ $t("ADD_ACCESS_KEY_SUBTITLE") }}</v-card-text>
      <v-card-actions class="px-4">
        <v-text-field
            v-model="accessKeyValue"
            :error-messages="accessKeyErrorMessage"
            :placeholder="accessKeyPrefix"
            @input="addAccessKey"
            append-inner-icon="mdi-key"
            spellcheck="false"
            autocomplete="off"
            density="compact"
            color="sharp-master-green"
            bg-color="#eceffb"
            :autofocus="true"
        ></v-text-field>
      </v-card-actions>
    </v-card>

  </v-dialog>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: 'AddServerSheet',
  props: {
    modelValue: Boolean,
  },
  emits: [
    "update:modelValue",
    "newAccessKeyAdded",
  ],
  data() {
    return {
      accessKeyValue: "",
      accessKeyErrorMessage: "",
      accessKeyPrefix: "vh://",
    }
  },
  computed: {
    testServerVisible(): boolean {
      return !this.$vpnHoodApp.data.clientProfileItems.find(
          x => x.clientProfile.tokenId === this.$vpnHoodApp.data.features.testServerTokenId);
    }
  },

  methods: {
    async addAccessKey(): Promise<void> {

      // Remove 'vh://' from text field value if exists
      const accessKey = this.accessKeyValue?.substring(0, 5) === this.accessKeyPrefix
          ? this.accessKeyValue.substring(5)
          : this.accessKeyValue;

      try {
        // Check AccessKey is valid base64 format
        const validateAccessKey = JSON.parse(atob(accessKey));

        try {
          // Add accessKey
          await this.$vpnHoodApp.addAccessKey(accessKey);

          // Find new added client profile ID
          const clientProfileItem = this.$vpnHoodApp.data.clientProfileItems.find(x => x.token.sid === validateAccessKey.sid);

          // Connect to the server if new client profile is added
          if (clientProfileItem)
            await this.connect(clientProfileItem.clientProfileId);

          else throw Error;

        } catch (err) {
          // Check is text field value started with vh://
          if (this.accessKeyValue?.substring(0, 5) !== this.accessKeyPrefix)
            this.accessKeyErrorMessage = this.$t("INVALID_ACCESS_KEY_PREFIX") + this.accessKeyPrefix;

          else throw Error;
        }
      } catch (err) {
        // If accessKey is not valid base64 format or invalid
        console.error(err);
        this.accessKeyErrorMessage = this.$t("INVALID_ACCESS_KEY_FORMAT");
      }
    },

    async connect(clientProfileId: string) {
      this.$vpnHoodApp.data.settings.userSettings.defaultClientProfileId = clientProfileId;
      await this.$vpnHoodApp.saveUserSetting();

      // Close parent sheet
      this.$emit('newAccessKeyAdded');

      // Close current sheet
      this.$emit('update:modelValue', false);

      // Show new server added snackbar
      this.$vpnHoodApp.data.uiState.showNewServerAdded = true;

      // Connect to server
      await this.$vpnHoodApp.connect();
    },

    async addTestServer() {

      // Add public server
      await this.$vpnHoodApp.addTestServer();

      // Connect to the server
      const clientProfileItem = this.$vpnHoodApp.data.clientProfileItems.find(x => x.clientProfile.tokenId === this.$vpnHoodApp.data.features.testServerTokenId);
      if (clientProfileItem?.clientProfileId) {
        await this.connect(clientProfileItem.clientProfileId);
      }
    },
  }
})
</script>
