<template>
  <v-dialog
      :modelValue="modelValue"
      @update:modelValue="$emit('update:modelValue',$event)"
      :close-on-back="true"
      :fullscreen="true"
      :scrollable="true"
      :persistent="true"
  >
    <v-card  class="px-5 pt-5">
      <v-btn
          rounded="pill"
          variant="text"
          color="primary"
          :text="$t('CLOSE')"
          @click="$emit('update:modelValue',false)"
      />
      <v-card-title class="text-center pt-0 pb-2">Migration of the free public server</v-card-title>
      <v-divider/>

      <v-card-text class="text-body-2 px-2">
        <p>
          For informing users about the migration of the free public server from VpnHood to VpnHoodConnect and setting expectations regarding ads, it's crucial to communicate clearly, concisely, and with a focus on user benefit. Here's a suggested prompt that balances these aspects:
        </p>
        <v-alert class="mb-3" type="warning" text="Important Update: Your Free VPN Service is Moving!"></v-alert>
        <p>
          Dear VpnHood User,

          We're excited to announce that our free public servers are getting an upgrade! To provide you with a better, more robust VPN experience, we're transitioning our free services from VpnHood to a new, dedicated app: "VpnHood! Connect".
        </p>
        <h5>What's New?</h5>
        <ul>
          <li><strong>Enhanced Performance:</strong><br/> Enjoy faster, more reliable connections.</li>
          <li><strong>Streamlined Access:</strong><br/> Easier navigation and user interface.</li>
          <li><strong>Ad-Supported Service:</strong><br/> To keep your VPN service free, VpnHood Connect will feature occasional ads, ensuring we can continue offering top-notch security without a price tag.</li>
        </ul>

        <h5>What Do I Need to Do?</h5>
        <ol>
          <li>Download *VpnHood Connect* from Google Play.</li>
          <li>Log in with your existing VpnHood credentials.</li>
          <li>Connect and enjoy! Your favorite servers, now with improvements.</li>
        </ol>
        <p>
          We understand changes can be inconvenient, but we're here to make this transition as smooth as possible. Our support team is standing by for any questions or assistance you may need.
          <br/>
          Thank you for your trust in VpnHood. We look forward to continuing to protect your online privacy and security with VpnHood Connect.
          <br/>
          Warm regards,
          The VpnHood Team
        </p>
        <p class="text-disabled">
          This message aims to inform users about the migration, introduce the concept of ads as a necessity for a free service, and guide them through the transition process, all while maintaining a positive tone about the changes.
        </p>
      </v-card-text>

      <v-card-actions>
        <!-- Accept button -->
        <v-btn
            color="tertiary"
            variant="flat"
            size="small"
            text="Download VpnHood! Connect"
            href="https://play.google.com/store/apps/details?id=com.vpnhood.connect.android"
            class="text-primary-darken-2 text-capitalize"
        />
        <v-spacer/>
        <v-btn
            color="tertiary"
            variant="tonal"
            size="small"
            text="Continue"
            @click="continueConnect"
            class="text-primary-darken-2 text-capitalize"
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