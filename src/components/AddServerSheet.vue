<template>
  <v-bottom-sheet close-on-back v-model="isShow" >

      <!-- Add Test Server -->
      <v-card v-if="testServerVisible" class="mx-auto ma-5" width="100%" max-width="600" variant="flat" >
        <v-card-title>{{ $t("ADD_TEST_SERVER") }}</v-card-title>
        <v-card-subtitle>{{ $t("ADD_TEST_SERVER_SUBTITLE") }}</v-card-subtitle>
        <v-btn variant="text" @click="addTestServer()">{{ $t("ADD") }}</v-btn>
        <v-divider class="mt-5"/>
      </v-card>

      <!-- Add Private Server -->
      <v-card class="mx-auto py-4" width="100%" max-width="600" variant="flat" >
        <v-card-title class="pb-0">{{ $t("ADD_ACCESS_KEY_TITLE") }}</v-card-title>
        <v-card-subtitle class="mb-5">{{ $t("ADD_ACCESS_KEY_SUBTITLE") }}</v-card-subtitle>
        <v-text-field
            v-model="accessKeyValue"
            :error-messages="accessKeyErrorMessage"
            :placeholder="accessKeyPrefix"
            @input="onKeyAccessChanged"
            append-inner-icon="mdi-key"
            spellcheck="false"
            autocomplete="off"
            density="compact"
            color="sharp-master-green"
            bg-color="#eceffb"
            class="mx-4"
            autofocus
        ></v-text-field>
      </v-card>

  </v-bottom-sheet>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: 'AddServerSheet',

  data() {
    return {
      isShow: false,
      accessKeyValue: null,
      accessKeyErrorMessage: "",
      accessKeyPrefix: "vh://"
    }
  },

  computed: {
    testServerVisible(): boolean {
      return !this.$clientApp.clientProfileItems.find(
          x => x.clientProfile.tokenId == this.$clientApp.features.testServerTokenId);
    }
  },

  methods: {
    async onKeyAccessChanged(value: string): Promise<void> {
      this.accessKeyErrorMessage = "";

      if (value == null || value == "")
        return;

      let validateValue = this.validateAccessKey(value);
      if (!validateValue) {
        this.accessKeyErrorMessage = this.$t("INVALID_ACCESS_KEY_FORMAT", {prefix: this.accessKeyPrefix});
        return;
      }

      try {
        //let clientProfile = await this.$clientApp.addAccessKey({accessKey: validateValue});
        //let isNew = !this.$clientApp.clientProfileItems.find(x => x.clientProfile.clientProfileId == clientProfile.clientProfileId);
        this.accessKeyValue = null;
        await this.$clientApp.loadApp();
        this.isShow = false;
        //this.$clientApp.newServerAdded = isNew;
      } catch (err: any) {
        this.accessKeyErrorMessage = err.toString();
      }
    },

    validateAccessKey(accessKey: string): string | null {
      try {
        accessKey = accessKey.replace(/(^[^A-Za-z0-9]*)|([^A-Za-z0-9=+/]*$)/g, '');
        if (accessKey.indexOf("vh://") == 0) accessKey = accessKey.substring(5);

        const json = atob(accessKey);
        return JSON.parse(json) != null ? accessKey : null;
      } catch (ex) {
        return null;
      }
    },

    async addTestServer() {
      //await this.$clientApp.addTestServer();
      this.accessKeyValue = null;
      await this.$clientApp.loadApp();
      this.isShow = false;
      //this.$clientApp.newServerAdded = true;
    },
  }
})
</script>
