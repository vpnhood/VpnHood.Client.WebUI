<template>
  <v-dialog
      :modelValue="modelValue"
      @update:modelValue="$emit('update:modelValue',$event)"
      :persistent="true"
      max-width="600"
  >
    <v-card
        rounded="lg"
        color="secondary"
        class="pt-0 pb-3 notice position-relative text-white">
      <v-card-text>
        <v-icon class="pe-3">mdi-alert-circle-outline</v-icon>
        <span>{{ dialogText }}</span>
      </v-card-text>
      <v-divider class="mb-3 border-opacity-25"></v-divider>
      <v-card-actions class="flex-column px-5">

        <!-- Diagnose -->
        <v-btn
            v-if="!$vpnHoodApp.data.state.logExists && $vpnHoodApp.data.state.hasProblemDetected"
            rounded="pill"
            variant="flat"
            block
            class="text-center mb-4 text-secondary"
            :text="$t('DIAGNOSE')"
            @click="diagnose"
        />

        <!-- OpenReport -->
        <v-btn
            v-if="$vpnHoodApp.data.state.logExists"
            rounded="pill"
            variant="flat"
            block
            prepend-icon="mdi-open-in-new"
            class="text-center mb-4 text-secondary"
            :href="$vpnHoodApp.data.serverUrl + logFileLocation"
            :text="$t('OPEN_REPORT')"
            target="_blank"
        />

        <!-- SendReport -->
        <v-btn
            v-if="$vpnHoodApp.data.state.logExists"
            rounded="pill"
            variant="flat"
            block
            prepend-icon="mdi-send-outline"
            class="text-center mb-4 text-secondary"
            target="_blank"
            :text="$t('SEND_REPORT')"
            @click="sendReport()"
        />

        <!-- Close -->
        <v-btn
            rounded="pill"
            variant="flat"
            block
            class="text-center text-secondary"
            :text="$t('CLOSE')"
            @click="$emit('update:modelValue',false)"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {getStorage, ref, uploadBytes} from "firebase/storage";

export default defineComponent({
  name: "AlertDialog",
  props: {
    modelValue: Boolean,
    dialogText: String,
  },
  data() {
    return {
      logFileLocation: '/api/app/log.txt',
    }
  },
  emits: [
    "update:modelValue",
    "update:dialogText",
  ],
  methods: {
    async diagnose(): Promise<void> {
      this.$emit('update:modelValue', false);
      await this.$vpnHoodApp.diagnose();
    },

    async sendReport() {
      try {
        this.$emit('update:modelValue', false);
        const reportId: string =
            this.$vpnHoodApp.data.settings.clientId.substring(0, 8) + "@" +
            new Date().toISOString().substring(0, 19).replace(/:/g, "").replace(/-/g, "") + "-" +
            Math.random().toString().substring(2,10);

        const link: string = `https://docs.google.com/forms/d/e/1FAIpQLSeOT6vs9yTqhAONM2rJg8Acae-oPZTecoVrdPrzJ-3VsgJk0A/viewform?usp=sf_link&entry.450665336=${reportId}`;
        window.open(link, "VpnHood-BugReport");

        // get report
        const url: string = this.$vpnHoodApp.data.serverUrl + this.logFileLocation;
        const response: Response = await fetch(url);
        const log: Blob = await response.blob();

        // Create a root reference
        const storage = getStorage();
        const spacePath = `logs/client/${reportId}.txt`;
        const storageRef = ref(storage, spacePath);

        // Send report
        uploadBytes(storageRef, log).then(() => {
          console.log('Report has been sent!');
        });
      } catch (ex) {
        console.error('Oops! Could not even send the report details!', ex);
      }
    },
  }
})
</script>
