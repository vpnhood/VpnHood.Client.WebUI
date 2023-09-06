<template>
  <v-app id="mainBg">
    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  name: 'App',
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
  background: url("/src/assets/img/body-bg.png") no-repeat center center fixed;
  background-size: cover;
}

@media (max-width: 425px) {
  #mainBg:before {
    background-image: url("/src/assets/img/body-bg-mobile.png");
  }
}
</style>