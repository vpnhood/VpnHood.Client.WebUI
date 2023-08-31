<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center bg-medium-blue pa-4">
      <v-img src="../assets/img/new-logo-cropped.png" max-width="60px"/>
      <!-- App full version -->
      <div class="text-white ms-3">
        <h3>{{ $t("APP_NAME") }}</h3>
        <div class="color-sharp-master-green txt-small-2">
          <span class="me-2">{{ this.$t("VERSION") }}:</span>
          <span>{{ $clientApp.appVersion(true) }}</span>
        </div>
      </div>
    </div>

    <!-- Menu items -->
    <v-list dense class="pt-0" >
      <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :href="item.link"
          target="_blank"
          :title="$t(item.title)"
          :prepend-icon="item.icon"
          class="menu-item color-gray txt-small-1"
      >
      </v-list-item>
    </v-list>

  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  data: () => ({
      menuItems: [
        {
          title: 'WHATS_NEW',
          icon: 'mdi-bullhorn',
          link: 'https://github.com/vpnhood/VpnHood/blob/main/CHANGELOG.md',
        },
        {
          title: 'SEND_FEEDBACK',
          icon: 'mdi-message-alert',
          link: 'https://docs.google.com/forms/d/e/1FAIpQLSd5AQesTSbDo23_4CkNiKmSPtPBaZIuFjAFnjqLo6XGKG5gyg/viewform?usp=sf_link',
        },
        {
          title: 'CREATE_PERSONAL_SERVER',
          icon: 'mdi-shield-account-variant',
          link: 'https://github.com/vpnhood/VpnHood/wiki/VpnHood-Access-Server',
        },
      ],
  }),
  computed: {

  },
  methods: {}
});
</script>

<style scoped>
.menu-item{
  border-bottom: 1px #e8e8e8 solid;
}
</style>
