<template>
  <v-bottom-sheet v-model="isShow">
    <v-sheet>
      <!-- Add Test Server -->
      <v-card v-if="testServerVisible" class="mx-auto ma-5" max-width="600" variant="flat">
        <v-card-title>{{ $t("addTestServer") }}</v-card-title>
        <v-card-subtitle>{{ $t("addTestServerSubtitle") }}</v-card-subtitle>
        <v-btn variant="text" @click="addTestServer()">{{ $t("add") }}</v-btn>
        <v-divider class="mt-5"/>
      </v-card>

      <!-- Add Private Server -->
      <v-card class="mx-auto" max-width="600" variant="flat">
        <v-card-title>{{ $t("addAcessKeyTitle") }}</v-card-title>
        <v-card-subtitle>{{ $t("addAcessKeySubtitle") }}</v-card-subtitle>
        <v-text-field v-model="accessKeyValue" spellcheck="false" autocomplete="off"
                      :error-messages="accessKeyErrorMessage" class="mx-5" @input="onKeyAccessChanged"
                      append-icon="vpn_key"
                      :placeholder="accessKeyPrefix" solo autofocus></v-text-field>
      </v-card>
    </v-sheet>
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
        this.accessKeyErrorMessage = this.$t("invalidAccessKeyFormat", {prefix: this.accessKeyPrefix});
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
        if (accessKey.indexOf("vh://") == 0) accessKey = accessKey.substr(5);

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
