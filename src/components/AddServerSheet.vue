<template>
  <v-bottom-sheet close-on-back :modelValue="modelValue" @update:modelValue="$emit('update:modelValue',$event)" max-width="600" >

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
            @input="addAccessKey"
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
import {AddClientProfileParam} from "@/hood/VpnHood.Client.Api";

export default defineComponent({
  name: 'AddServerSheet',
  props:{
    modelValue:Boolean,
  },
  emits: [
    "update:modelValue",
    "newClientProfileId",
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
      return !this.$vpnHoodApp.clientProfileItems.find(
          x => x.clientProfile.tokenId == this.$vpnHoodApp.features.testServerTokenId);
    }
  },

  methods: {
    async addAccessKey(): Promise<void>{

      // Check is text field value started with vh://
      if (this.accessKeyValue != null && this.accessKeyValue.substring(0, 5) !== this.accessKeyPrefix){
        this.accessKeyErrorMessage = this.$t("INVALID_ACCESS_KEY_PREFIX")+this.accessKeyPrefix;
        return;
      }

      // Remove vh:// from text field value
      const accessKey = this.accessKeyValue?.substring(5);

      try {
        // Check AccessKey is valid base64 format
        const validateAccessKey = JSON.parse(atob(accessKey));
        if (validateAccessKey != null){
          // Add accessKey and connect to it
          await this.$vpnHoodApp.addAccessKey(new AddClientProfileParam({accessKey: accessKey}));
          // Find new added client profile ID
          const clientProfileId = this.$vpnHoodApp.clientProfileItems.find(x => x.token.sid == validateAccessKey.sid);
          if (clientProfileId){
            // Pass client profile ID to the parent
            this.$emit('update:modelValue', false, 'newClientProfileId', clientProfileId.id);
          }
          else throw new Error("Could not found new client profile id");
        }
      }
      catch (err){
        // if accessKey is not valid base64 format
        console.log(err);
        this.accessKeyErrorMessage = this.$t("INVALID_ACCESS_KEY_FORMAT");
        return;
      }
    },

    //TODO Complete addTestServer function
    async addTestServer() {
      //await this.$vpnHoodApp.addTestServer();
      //this.accessKeyValue = null;
      await this.$vpnHoodApp.loadApp();
      this.$emit('update:modelValue', false);
      //this.$vpnHoodApp.newServerAdded = true;
    },
  }
})
</script>
