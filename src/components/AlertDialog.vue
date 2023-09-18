<template>
  <v-dialog
      :modelValue="modelValue"
      @update:modelValue="$emit('update:modelValue',$event)"
      persistent
      width="auto">
    <v-card
        rounded="lg"
        color="master-green"
        class="pt-0 pb-3 notice position-relative text-white">
      <v-card-title>
        <v-icon class="pe-3">mdi-alert-circle-outline</v-icon>
        <span>{{$t("ERROR")}}</span>
      </v-card-title>
      <v-card-text class="pt-0">
        <p>{{ dialogText }}</p>
      </v-card-text>
      <v-divider class="mb-3 border-opacity-25"></v-divider>
      <v-card-actions class="flex-column px-5">

        <!-- Diagnose -->
        <v-btn
            v-if="!$vpnHoodApp.state.logExists && $vpnHoodApp.state.lastActiveClientProfileId"
            rounded="pill"
            variant="flat"
            block
            class="text-center mb-4 color-master-green"
            @click="diagnose && this.$emit('update:modelValue',false)"
        >
          {{ $t("DIAGNOSE") }}
        </v-btn>

        <!-- OpenReport -->
        <v-btn
            v-if="$vpnHoodApp.state.logExists"
            rounded="pill"
            variant="flat"
            block
            prepend-icon="mdi-open-in-new"
            class="text-center mb-4 color-master-green"
            :href="this.$vpnHoodApp.serverUrl + logFileLocation"
            target="_blank"
        >
          {{ $t("OPEN_REPORT") }}
        </v-btn>

        <!-- SendReport -->
        <v-btn
            v-if="$vpnHoodApp.state.logExists"
            rounded="pill"
            variant="flat"
            block
            prepend-icon="mdi-send-outline"
            class="text-center mb-4 color-master-green"
            target="_blank"
            @click="sendReport()"
        >{{ $t("SEND_REPORT") }}
        </v-btn>

        <!-- Close -->
        <v-btn
            rounded="pill"
            variant="flat"
            block
            class="text-center color-master-green"
            @click="this.$emit('update:modelValue',false)"
        >
          {{ $t("CLOSE") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: "AlertDialog",
  props: {
    modelValue: Boolean,
    dialogText: String,
  },
  data(){
    return{
      logFileLocation:'/api/log.txt',
    }
  },
  emits: [
    "update:modelValue",
    "update:dialogText",
  ],
  methods:{
    async diagnose(){
      await this.$vpnHoodApp.diagnose();
    },

    async sendReport() {
      try {
        this.$emit('update:modelValue',false);
        const reportId =
            this.$vpnHoodApp.settings.clientId.substring(0, 8) + "@" +
            new Date().toISOString().substring(0, 19).replace(/:/g, "").replace(/-/g, "") + "-" +
            this.uuidv4().substring(0, 8);
        const link = `https://docs.google.com/forms/d/e/1FAIpQLSeOT6vs9yTqhAONM2rJg8Acae-oPZTecoVrdPrzJ-3VsgJk0A/viewform?usp=sf_link&entry.450665336=${reportId}`;
        window.open(link, "VpnHood-BugReport");

        // get report
        const url = this.$vpnHoodApp.serverUrl + this.logFileLocation;
        const response = await fetch(url);
        const log = await response.text();
        console.log(log);

        // Create a root reference
       /* var storageRef = firebase.storage().ref();
        const spacePath = `logs/client/${reportId}.txt`;
        var spaceRef = storageRef.child(spacePath);

        await spaceRef.putString(log);
        console.log('Report has been sent!'); // eslint-disable-line no-console*/
      }
      catch (ex) {
        console.error('Oops! Could not even send the report details!', ex); // eslint-disable-line no-console
      }
    },

    uuidv4() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    },
  }
})
</script>
