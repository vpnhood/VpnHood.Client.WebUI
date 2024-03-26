<template>
<!--  <v-list>
    <v-list-item
        v-model="$i18n.locale"
        v-for="locale in $i18n.availableLocales"
        :key="`locale-${locale}`"
        :value="locale"
        color="white"
        rounded="lg"
        base-color="primary-darken-2"
        variant="flat"
        class="ps-2 mb-2 border border-surface border-opacity-25"
        active-class="border border-opacity-100 border-secondary-lighten-1"
        :active="locale === $i18n.locale"
    >
      &lt;!&ndash; َActive item icon &ndash;&gt;
      <template v-slot:prepend>
        <v-radio
            v-model="$i18n.locale"
            density="compact"
            :value="locale"
            :color="locale === $i18n.locale ? 'secondary-lighten-1' : 'gray'"
            :class="[locale === $i18n.locale ? '' : 'opacity-30', 'me-3' ]"
        />
      </template>
      <v-list-item-title class="title">{{ $t(`${$t('LANGUAGE_NAME')}`) }}</v-list-item-title>

    </v-list-item>
  </v-list>-->
  <div></div>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: 'LanguagesPage',
  data() {
    return {

    }
  },

  methods: {

  }
})
</script>