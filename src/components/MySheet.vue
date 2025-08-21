<script setup lang="ts">
import { useAttrs } from 'vue'
import { VpnHoodApp } from '@/services/VpnHoodApp';


const attrs = useAttrs();

</script>

<template>
  <!--  Add padding to the pages for handle edge-to-edge feature-->
  <v-sheet v-bind="attrs"
           :style="[
             VpnHoodApp.instance.getEdgeToEdgeTopHeight()
             ? 'padding-top:' + VpnHoodApp.instance.getEdgeToEdgeTopHeight() + 'px !important;'
             : '',
           VpnHoodApp.instance.getEdgeToEdgeBottomHeight()
           ? 'padding-bottom:' + VpnHoodApp.instance.getEdgeToEdgeBottomHeight() + 'px !important;'
           : ''
           ]">
    <slot />
  </v-sheet>
</template>

