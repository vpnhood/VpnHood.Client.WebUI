<template>
  <v-app id="mainBg">
    <v-main>
      <router-view/>
      <!-- Global Alert Dialog -->
      <alert-dialog v-model="isAlertDialogVisible" :dialog-text="$vpnHoodApp.data.uiState.alertDialogText"/>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import AlertDialog from "@/components/AlertDialog.vue";
import {ComponentName} from "@/UiConstants";

export default defineComponent({
  name: 'App',
  components: {AlertDialog},
  computed: {
    isAlertDialogVisible: {
      get(): boolean {
        return this.$vpnHoodApp.isShowComponent(ComponentName.AlertDialog);
      },
      async set(value: boolean) {
        await this.$vpnHoodApp.showComponent(value, ComponentName.AlertDialog);
      }
    }
  }
});
</script>

<style scoped>
#mainBg {
  background-image: linear-gradient(#1940b0, #122272);
  position: relative;
}

#mainBg:before {
  content: "";
  position: absolute;
  bottom: 0;
  top: 0;
  right: 0;
  left: 0;
  background: url("/src/assets/images/body-bg.png") no-repeat center center fixed;
  background-size: cover;
}

@media (max-width: 425px) {
  #mainBg:before {
    background-image: url("/src/assets/images/body-bg-mobile.png");
  }
}
</style>