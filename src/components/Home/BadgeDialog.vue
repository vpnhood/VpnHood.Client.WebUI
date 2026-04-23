<script setup lang="ts">
import i18n from '@/locales/i18n';
import { Util } from '@/helpers/Util';
import type { RouteLocationRaw } from 'vue-router';
import router from '@/services/router';
import { computed } from 'vue';
import { getFeatureItems } from '@/components/Home/featureIcons';
import FeatureIconDisplay from '@/components/Home/FeatureIconDisplay.vue';

const locale = i18n.global.t;

const props = defineProps<{
  modelValue: boolean,
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void,
}>();

const featureItems = computed(() => getFeatureItems());

async function navigateByRouter(to: RouteLocationRaw){
  await router.replace(to);
}
</script>

<template>
  <v-dialog
    :modelValue="props.modelValue"
    @update:modelValue="emit('update:modelValue',$event)"
  >
    <v-card :title="locale('IN_USE_FEATURES')" color="general-dialog">

      <v-card-text class="text-disabled text-caption">{{locale('IN_USE_FEATURES_DESC')}}</v-card-text>

      <v-list id="badgeList" >
        <template v-for="(feature, index) in featureItems" :key="index">
          <v-list-item
            v-if="feature.isActive"
            :append-icon="Util.getLocalizedRightChevron()"
            :title="locale(feature.title)"
            slim
            @click="navigateByRouter(feature.pageLink)"
          >
            <template v-slot:prepend>
              <FeatureIconDisplay :icon="feature.icon" :second-icon="feature.secondIcon" class="me-4" />
            </template>
          </v-list-item>
        </template>
      </v-list>

      <v-card-actions>
        <!-- Cancel -->
        <v-btn :text="locale('CLOSE')" @click="emit('update:modelValue', false)" />
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<style scoped>
/*noinspection CssUnresolvedCustomProperty,CssUnusedSymbol*/
#badgeList .v-list-item:not(:last-child) {
  border-bottom: 1px solid rgba(var(--v-theme-on-general-dialog),.1);
}
</style>
