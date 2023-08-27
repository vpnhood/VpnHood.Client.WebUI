<template>
  <v-container class="d-flex flex-column justify-space-between pb-5 h-100">

    <div id="topSection">

    </div>

    <div id="middleSection">
      <!-- Speed -->
      <div id="speedSection" class="text-center d-inline-flex mb-8">
        <div class="mx-2">
          <span class="speedLabel">{{ $t("downloadSpeed") }}:</span>
          <span class="speedValue">  </span>
          <span class="speedUnit">Mbps</span>
        </div>
        <div class="mx-2">
          <span class="speedLabel">{{ $t("uploadSpeed") }}:</span>
          <span class="speedValue"> </span>
          <span class="speedUnit">Mbps</span>
        </div>
      </div>
      <!-- Circle -->
      <div id="circleOuter" class="">
        <div id="circle">
          <div id="circleContent" class="align-center">
            <span id="stateText"></span>
            <!-- usage -->
            <div >
              <div id="bandwidthUsage">
                <span> of</span>
              </div>
              <div id="bandwithTotal" >
                <span></span>
              </div>
            </div>
            <!-- check -->
            <v-icon class="state-icon" size="50" color="white">
            </v-icon>
          </div>
        </div>
      </div>
    </div>

    <div id="bottomSection">

    </div>

  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'HomeView',
});
</script>
