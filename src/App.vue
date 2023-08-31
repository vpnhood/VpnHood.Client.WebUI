<template>
  <v-app id="mainBg">
    <v-navigation-drawer
        v-model="drawer"
        location="left"
        temporary
        floating
    >
      <NavigationPane/>
    </v-navigation-drawer>

    <v-app-bar
        color="transparent"
        elevation="0"
    >
      <template v-slot:prepend>
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      </template>

      <v-spacer></v-spacer>
      <h6>{{ $t("APP_NAME") }}</h6>
      <v-spacer></v-spacer>

      <span class="opacity-30 txt-small-1">v {{ $clientApp.appVersion(false) }}</span>

      <v-btn icon>
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import NavigationPane from "@/components/NavigationPane.vue";

export default defineComponent({
  name: 'App',
  components: {NavigationPane},
  data: () => ({
    drawer: false,
  }),
  async created() {
    await this.$clientApp.loadApp({
      withState: true,
      withFeatures: true,
      withSettings: true,
      withClientProfileItems: true
    });
  },

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