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
        <v-icon :icon="props.icon" color="promote-connect-btn-icon" size="25" class="me-2" />
        <h4 class="text-capitalize">{{props.title}}</h4>
      </div>
      <p class="text-disabled text-caption">{{ props.description }}</p>
    </v-col>
    <v-col cols="auto" class="action-btn pe-0">
      <v-btn
        :text="props.buttonText"
        color="secondary-lighten-1"
        class="text-primary-darken-2 px-2"
        block
        size="small"
        rounded="pill"
        variant="flat"
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
