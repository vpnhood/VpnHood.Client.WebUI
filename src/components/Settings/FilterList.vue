<script setup lang="ts">
import { computed, ref } from 'vue';
import i18n from '@/locales/i18n';
import { VpnHoodApp } from '@/services/VpnHoodApp';

const vhApp = VpnHoodApp.instance;
const locale = i18n.global.t;

export interface IListItemInfo {
  id: string;
  name: string;
  icon: string;
  isSelected: boolean;
}

const props = defineProps<{
  list: IListItemInfo[];
  loading: boolean;
  iconSize: string;
  isIconAsFlag?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:list', value: IListItemInfo[]): void;
}>();

const search = ref<string | null>(null);
const isShowSearchBox = ref<boolean>(!vhApp.data.features.isTv);

/*** Filters the list items based on search input. ***/
const filteredListItem = computed(() => {
  if (!search.value) return props.list;
  const searchText = search.value.toLowerCase();
  return props.list.filter(x => x.name.toLowerCase().includes(searchText));
});

/*** Toggles a single item selection and notifies parent ***/
const toggleListItem = async (x: IListItemInfo) => {
  if (!await vhApp.disconnectAlert()) return;
  const updatedList = props.list.map(item =>
    item.id === x.id ? { ...item, isSelected: !item.isSelected } : item
  );
  emit('update:list', updatedList);
};

/*** Select all items and notifies parent ***/
async function onSelectAll() {
  if (!await vhApp.disconnectAlert()) return;
  const result = await vhApp.showConfirmDialog(locale('SELECT_ALL_ITEMS'), locale('ARE_YOU_SURE'));
  if (result)
    emit('update:list', props.list.map(x => ({ ...x, isSelected: true })));
}

/*** Deselect all items and notifies parent ***/
async function onClearAll() {
  if (!await vhApp.disconnectAlert()) return;
  const result = await vhApp.showConfirmDialog(locale('CLEAR_ALL_ITEMS'), locale('ARE_YOU_SURE'));
  if (result)
    emit('update:list', props.list.map(x => ({ ...x, isSelected: false })));
}
</script>

<template>
  <config-card :loading="loading" class="pt-3">
    <v-card-item>
      <div class="d-flex flex-wrap ga-2">
        <!-- Select all apps button -->
        <btn-style-5
          prepend-icon="mdi-select-all"
          class="flex-grow-1 text-caption"
          :text="locale('SELECT_ALL')"
          @click="onSelectAll()"
        />

        <!-- Clear all apps button -->
        <btn-style-5
          prepend-icon="mdi-select-remove"
          class="flex-grow-1 text-caption"
          :text="locale('CLEAR_ALL')"
          @click="onClearAll()"
        />

        <!-- Search button -->
        <btn-style-5
          v-if="!isShowSearchBox"
          prepend-icon="mdi-magnify"
          class="flex-grow-1 text-caption"
          :text="locale('SEARCH')"
          @click="isShowSearchBox = !isShowSearchBox"
        />
      </div>
    </v-card-item>

    <v-card-item v-if="isShowSearchBox">
      <v-text-field
        v-model="search"
        single-line
        clearable
        hide-details
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        rounded="pill"
        color="highlight"
        class="my-search-field"
        :placeholder="locale('SEARCH')"
      />
    </v-card-item>

    <template v-if="loading">
      <v-skeleton-loader
        v-for="i in 8"
        :key="i"
        color="config-card-bg"
        type="list-item-avatar"
      />
    </template>

    <v-list
      v-else
      class="mt-3"
      select-strategy="classic"
      bg-color="transparent"
      selectable
    >
      <v-list-item
        v-for="(item, index) in filteredListItem"
        :key="item.id"
        :value="item.id"
        :title="item.name"
        :ripple="true"
        :active="false"
        class="text-caption"
        :class="{'border-b': filteredListItem.length > index + 1}"
        @click="toggleListItem(item)"
      >
        <template v-if="props.isIconAsFlag" v-slot:prepend>
          <span class="overflow-hidden d-inline-flex align-center justify-center item-flag me-2">
          <img :src="item.icon" height="100%" alt=""/>
        </span>
        </template>

        <template v-else v-slot:prepend>
          <v-avatar :size="props.iconSize">
            <v-img
              :src="item.icon"
              alt=""
            />
          </v-avatar>
        </template>

        <template v-slot:append>
          <v-switch
            :model-value="item.isSelected"
            :hide-details="true"
            tabindex="-1"
            readonly
            density="compact"
          />
        </template>
      </v-list-item>
    </v-list>
  </config-card>
</template>

<style scoped>
.my-search-field :deep(input) {
  font-size: 13px;
}
.item-flag {
  width: 26px;
  height: 18px;
  border-radius: 2px;
}
</style>
