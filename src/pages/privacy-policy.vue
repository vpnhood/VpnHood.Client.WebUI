<script setup lang="ts">
const emit = defineEmits<{
  (e: 'accept', value: boolean): void,
}>();
</script>

<template>
  <v-sheet class="pt-4">
    <v-card color="transparent" class="d-flex flex-column justify-space-between fill-height">
      <div>
        <v-card-title class="text-center">VpnHood! CONNECT Privacy Policy</v-card-title>
        <v-divider/>

        <v-card-text class="text-body-2 px-2">
          <p class="pb-4 text-disabled">
            Welcome to VpnHood! CONNECT, Your privacy is of utmost importance to us. Before you proceed, we strongly encourage you to take a few moments to read through our Privacy Policy. This policy outlines the types of personal information we collect, how we use this information, and the measures we take to safeguard your data.<br/><br/>Understanding our Privacy Policy will help you make informed decisions about your use of our app. If you have any questions or concerns about our policy, please don’t hesitate to contact us.<br/><br/>Once you’ve read and understood our Privacy Policy, please click on the ‘Accept and Continue’ button to proceed with using our app. By clicking ‘Accept and Continue’, you acknowledge that you accept the terms outlined in our Privacy Policy.
          </p>
          <span>Please read our</span>
          <a
            class="text-highlight font-weight-bold ms-1"
            href="https://www.vpnhood.com/products/vpnhood-connect/privacy-policy"
            target="_blank"
          >
            Privacy Policy
            <v-icon icon="mdi-open-in-new"/>
          </a>
        </v-card-text>
      </div>


      <v-card-actions>
        <!-- Accept button -->
        <btn-style-3
          block
          text="Accept and continue"
          @click="emit('accept', true)"
        />
      </v-card-actions>
    </v-card>
  </v-sheet>
</template>
