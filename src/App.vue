<template>
  <v-app>
    <v-main id="main-bg">
      <router-view id="routerView"/>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'App',

  data () {
    return {
      //
    }
  },
})
</script>

<style scoped>
#main-bg{
  background-image: linear-gradient(#1940b0, #122272);
}
#routerView{
  background: url("/src/assets/img/body-bg.png") no-repeat center center fixed;
  background-size: cover;
  height: 100%;
}
@media (max-width: 425px) {
  #routerView{
    background-image: url("/src/assets/img/body-bg-mobile.png");
  }
}
</style>