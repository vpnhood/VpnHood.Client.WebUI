<template>
  <v-dialog v-model="isOpen" max-width="500px">
    <v-card>
      <v-card-title class="headline">{{ title }}</v-card-title>
      <v-card-text>{{ message }}</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green darken-1" @click="$vpnHoodApp.data.confirmDialog.close('yes')" >Yes</v-btn>
        <v-btn color="red darken-1" @click="$vpnHoodApp.data.confirmDialog.close('no')" >No</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: 'ConfirmDialog',
  data() {
    return {
      dialog: false,
      title: '',
      message: '',
      resolve: null,
    };
  },
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
  methods: {

  },
});
</script>