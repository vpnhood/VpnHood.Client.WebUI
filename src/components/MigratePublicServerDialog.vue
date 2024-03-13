<template>
  <v-dialog
      :modelValue="modelValue"
      @update:modelValue="$emit('update:modelValue',$event)"
      :close-on-back="true"
      :fullscreen="true"
      :scrollable="true"
      :persistent="true"
  >
    <v-card>

      <v-card-title class="text-center pt-0 pb-2 text-primary" style="background-color: #f2f2f2;">
        <v-btn icon="mdi-window-close" variant="tonal"  size="small" class="d-block mx-auto my-4" @click="$emit('update:modelValue',false)"/>
       <span>Migration of the VpnHood public server</span>
      </v-card-title>
      <v-divider/>

      <v-card-text class="text-body-2 px-5">
        <p><strong>Dear VpnHood User,</strong></p>
        <p class="mb-3">
          We're excited to announce that our free public servers are getting an upgrade! To provide you with a better, more robust VPN experience, we're transitioning our free services from VpnHood to a new, dedicated app: "VpnHood! Connect".
        </p>
        <h2>What's New?</h2>
        <ul style="list-style: disc;" class="ps-5 mb-3">
          <li><strong>Enhanced Performance:</strong> Enjoy faster, more reliable connections.</li>
          <li><strong>Streamlined Access:</strong> Easier navigation and user interface.</li>
          <li><strong>Ad-Supported Service:</strong> To keep your VPN service free, VpnHood Connect will feature occasional ads, ensuring we can continue offering top-notch security without a price tag.</li>
        </ul>

        <h2>What Do I Need to Do?</h2>
        <p>Download <strong>VpnHood! Connect</strong> from Google Play.</p>
        <p class="my-3">
          We understand changes can be inconvenient, but we're here to make this transition as smooth as possible. Our support team is standing by for any questions or assistance you may need.
          </p>
        <p class="mb-3">
          Thank you for your trust in VpnHood. We look forward to continuing to protect your online privacy and security with VpnHood Connect.
        </p>
        <p class="mb-3">
          Warm regards,<br/>
          The VpnHood Team
        </p>

        <p class="text-gray-lighten-2 text-caption font-italic">
          This message aims to inform users about the migration, introduce the concept of ads as a necessity for a free service, and guide them through the transition process, all while maintaining a positive tone about the changes.
        </p>
      </v-card-text>

      <v-card-actions class="bg-background">
        <v-spacer/>

        <v-btn
            variant="flat"
            size="small"
            text="Download VpnHood! Connect"
            href="https://play.google.com/store/apps/details?id=com.vpnhood.connect.android"
            target="_blank"
            class="text-capitalize"
            color="secondary"
            @click="$emit('update:modelValue',false)"
        />
        <v-btn
            variant="tonal"
            size="small"
            text="Continue"
            @click="continueConnect"
            class="text-capitalize"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: "MigratePublicServerDialog",
  props:{
    modelValue:Boolean,
  },
  emits: [
    "update:modelValue",
    "acceptPrivacyPolicy"
  ],
  methods:{
    async continueConnect(): Promise<void>{
      this.$emit('update:modelValue',false);
      await this.$vpnHoodApp.connect();
    },
  }
})
</script>