<script setup lang="ts">
import type { MyConnectPlanId } from '@/helpers/PromotePremium/MyConnectPlanIds';

const props = defineProps<{
  icon: string,
  title: string,
  description: string,
  buttonText: string,
  buttonActionPlan: MyConnectPlanId,
}>();
const emits = defineEmits<{
  (e: 'actionByPlan', planId: MyConnectPlanId): void;
}>();
</script>

<template>
  <v-row dense align="center" class="px-2 py-1 mx-0 mb-3 rounded-lg card-on-grad-bg">
    <v-col>
      <div class="d-flex align-center">
        <v-icon :icon="props.icon" color="promote-premium-color-premium" size="25" class="me-2" />
        <h4 class="text-capitalize">{{props.title}}</h4>
      </div>
      <p class="text-white opacity-40 text-caption">{{ props.description }}</p>
    </v-col>
    <v-col cols="auto" class="action-btn pe-0">
      <v-btn
        variant="flat"
        rounded="pill"
        color="promote-premium-color-premium"
        class="px-2 text-transform-none font-weight-bold"
        :text="props.buttonText"
        block
        size="small"
        @click="emits('actionByPlan', props.buttonActionPlan)"
      />
    </v-col>
  </v-row>
</template>

<style scoped>
@media (max-width: 319px) {
  .action-btn{
    width: 100% !important;
    text-align: right;
    padding-left: 4px !important;
    padding-right: 4px !important;
  }
  .v-locale--is-rtl .action-btn{
    text-align: left;
  }
}
</style>
