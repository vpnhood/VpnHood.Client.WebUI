<template>
  <v-app id="mainBg">
    <v-main>
      <router-view/>
      <!-- Global Alert Dialog -->
      <alert-dialog v-model="$vpnHoodApp.vpnHoodGlobalProperty.showAlertDialog" :dialog-text="$vpnHoodApp.vpnHoodGlobalProperty.dialogText" />
      <!-- Public Server Hint -->
      <PublicServerHintDialog  v-model="$vpnHoodApp.vpnHoodGlobalProperty.showPublicServerHint"/>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import AlertDialog from "@/components/AlertDialog.vue";
import PublicServerHintDialog from "@/components/PublicServerHintDialog.vue";

export default defineComponent({
  name: 'App',
  components: {AlertDialog, PublicServerHintDialog},
})
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