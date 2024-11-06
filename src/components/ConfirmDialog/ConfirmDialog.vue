<template>
  <v-dialog v-model="isOpen" :persistent="true" max-width="600">
    <v-card
        :color="$vpnHoodApp.isConnectApp() ? 'primary-darken-2' : 'white'"
        :class="$vpnHoodApp.isConnectApp() ? 'pa-3' : ''"
    >
      <!-- Title -->
      <v-card-title :class="$vpnHoodApp.isConnectApp() ? 'text-secondary' : 'bg-secondary'">
        <div class="d-flex align-center">
          <v-icon class="pe-3">mdi-alert-circle-outline</v-icon>
          <h3>{{ $vpnHoodApp.data.confirmDialog.title }}</h3>
        </div>
        <v-divider v-if="$vpnHoodApp.isConnectApp()" class="mt-3 border-opacity-25"></v-divider>
      </v-card-title>

      <!-- Message -->
      <v-card-text :class="[$vpnHoodApp.isConnectApp() ? 'text-disabled' : 'text-gray-lighten-2']">
        {{ $vpnHoodApp.data.confirmDialog.message }}
      </v-card-text>


      <!-- Buttons -->
      <v-card-actions>

        <!-- No -->
        <v-btn
            rounded="pill"
            variant="tonal"
            max-height="32px"
            min-width="70px"
            color="secondary"
            :text="$t('NO')"
            @click="$vpnHoodApp.data.confirmDialog.closeDialog(false)"
        />

        <!-- Yes -->
        <v-btn
            rounded="pill"
            variant="text"
            max-height="32px"
            min-width="70px"
            color="secondary"
            :text="$t('YES')"
            @click="$vpnHoodApp.data.confirmDialog.closeDialog(true)"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: 'ConfirmDialog',
  computed:{
    isOpen: {
      get() {
          return this.$vpnHoodApp.data.confirmDialog.isOpen;
      },
      set(value: boolean) {
        this.$vpnHoodApp.data.confirmDialog.isOpen = value;
      }
    },
  },
});
</script>