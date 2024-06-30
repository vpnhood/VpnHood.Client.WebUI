<template>
  <v-bottom-sheet
      id="addServerDialog"
      @update:modelValue="$emit('update:modelValue',$event)"
      :inset="true"
      :modelValue="modelValue"
  >

    <!-- Add Private Server -->
    <v-card class="mx-auto pb-3" width="100%" variant="flat">
      <v-card-title>
        {{ $t("ADD_ACCESS_KEY_TITLE") }}
        <v-divider class="mt-2"/>
      </v-card-title>
      <v-card-text class="pt-0">{{ $t("ADD_ACCESS_KEY_SUBTITLE") }}</v-card-text>
      <v-card-actions class="px-4">
        <v-text-field
            v-model="accessKey"
            :error-messages="accessKeyErrorMessage"
            :placeholder="accessKeyPrefix"
            @input="addAccessKey"
            append-inner-icon="mdi-key"
            spellcheck="false"
            autocomplete="off"
            dir="ltr"
            :autofocus="true"
            density="compact"
            color="secondary"
        ></v-text-field>
      </v-card-actions>
    </v-card>

  </v-bottom-sheet>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  props: {
    modelValue: Boolean,
  },
  emits: [
    "update:modelValue",
    "newAccessKeyAdded",
  ],
  data() {
    return {
      accessKey: "",
      accessKeyErrorMessage: "",
      accessKeyPrefix: "vh://",
    }
  },

  updated() {
    if (!this.modelValue) {
      this.accessKey = "";
      this.accessKeyErrorMessage = "";
    }
  },

  methods: {
    async addAccessKey(): Promise<void> {

      try {

        // Add accessKey
        const clientProfileInfo = await this.$vpnHoodApp.addAccessKey(this.accessKey);

        // Connect to the server if new client profile is added
        if (clientProfileInfo)
          await this.connect(clientProfileInfo.clientProfileId);

        else throw Error;

      } catch (err) {
        // If accessKey is not valid base64 format or invalid
        console.error(err);
        this.accessKeyErrorMessage = this.$t("INVALID_ACCESS_KEY_FORMAT");
      }
    },

    async connect(clientProfileId: string) {
      this.$vpnHoodApp.data.settings.userSettings.clientProfileId = clientProfileId;
      await this.$vpnHoodApp.saveUserSetting();

      // Close current sheet
      this.$emit('update:modelValue', false);

      // Close parent sheet
      this.$emit('newAccessKeyAdded');

      this.accessKey = "";

      // Show new server added snackbar
      this.$vpnHoodApp.data.uiState.showNewServerAdded = true;

      // Connect to server
      await this.$vpnHoodApp.connect();
    },
  }
})
</script>
