<script setup lang="ts">
import type { ConnectPlanId } from '@/services/VpnHood.Client.Api';

const props = defineProps<{
  icon: string,
  title: string,
  description: string,
  buttonText: string,
  buttonActionPlan: ConnectPlanId,
}>();
const emits = defineEmits<{
  (e: 'actionByPlan', planId: ConnectPlanId): void;
}>();
</script>

<template>
  <v-row dense align="center" class="button-wrapper border border-purple-lighten-1 px-1 mx-0 mb-3 rounded-lg">
    <v-col cols="auto">
      <v-icon :icon="props.icon" color="tertiary" size="30" />
    </v-col>
    <v-col>
      <h4 class="text-capitalize">{{props.title}}</h4>
      <p class="text-disabled text-caption" style="line-height: 1.3">{{ props.description }}</p>
    </v-col>
    <v-col cols="auto" class="action-btn">
      <v-btn
        :text="props.buttonText"
        color="secondary-lighten-1"
        class="text-primary-darken-2 px-2"
        size="small"
        rounded="pill"
        variant="flat"
        @click="emits('actionByPlan', props.buttonActionPlan)"
      />
    </v-col>
  </v-row>
</template>

<style scoped>
@media (max-width: 358px) {
  .button-wrapper{
    padding-top: 5px;
    padding-bottom: 5px;
  }
  .action-btn{
    width: 100% !important;
    text-align: right;
  }
  .v-locale--is-rtl .action-btn{
    text-align: left;
  }
}
</style>
