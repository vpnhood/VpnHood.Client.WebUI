<template>
  <v-container class="h-screen bg-dark-blue text-center text-white">
    <!-- App name -->
    <h6>{{ $t("APP_NAME") }}</h6>

    <v-row align-content="center" justify="center" class="h-100">
      <v-col cols="10">
        <div style="z-index: 1;" class="d-inline-flex align-center justify-center bg-master-green rounded-lg pa-2 position-relative">
          <v-icon size="80px" color="white">mdi-emoticon-sad-outline</v-icon>
        </div>
        <v-card id="cardView" rounded="lg" class="pa-4 pt-15">
          <v-card-title>{{$t("OOPS")}}</v-card-title>
          <v-card-text>{{$t('LOAD_APP_ERROR_DESC')}}</v-card-text>
          <v-card-actions>
            <v-btn :block="true" color="master-green" variant="tonal" :text="$t('RELOAD_APP')" @click="reloadUI"></v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: "ErrorPage",
  methods:{
    reloadUI() {
      document.location.reload();
    }
  }
})
</script>

<style scoped>
#cardView{
  margin-top: -50px;
}
</style>