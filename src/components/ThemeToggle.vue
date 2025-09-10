<template>
  <div class="theme-controls">
    <!-- Theme Mode Selector -->
    <v-btn-toggle
      v-if="showModeSelector"
      v-model="selectedThemeMode"
      mandatory
      variant="outlined"
      class="mb-2"
    >
      <v-btn value="auto" size="small">
        <v-icon>mdi-brightness-auto</v-icon>
        <span class="ml-1">Auto</span>
      </v-btn>
      <v-btn value="light" size="small">
        <v-icon>mdi-brightness-7</v-icon>
        <span class="ml-1">Light</span>
      </v-btn>
      <v-btn value="dark" size="small">
        <v-icon>mdi-brightness-4</v-icon>
        <span class="ml-1">Dark</span>
      </v-btn>
      <v-btn value="system" size="small">
        <v-icon>mdi-cog</v-icon>
        <span class="ml-1">System</span>
      </v-btn>
    </v-btn-toggle>

    <!-- Simple Toggle Button -->
    <v-btn
      v-if="showToggleButton"
      :icon="isDark ? 'mdi-brightness-7' : 'mdi-brightness-4'"
      :title="isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'"
      variant="text"
      @click="toggleTheme"
    />

    <!-- Theme Status Chip -->
    <v-chip
      v-if="showStatus"
      :color="isDark ? 'primary' : 'secondary'"
      size="small"
      class="ml-2"
    >
      <v-icon start>
        {{ isDark ? 'mdi-brightness-4' : 'mdi-brightness-7' }}
      </v-icon>
      {{ currentThemeName }}
    </v-chip>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTheme, type ThemeMode } from '@/composables/useTheme';

interface Props {
  /** Show full theme mode selector */
  showModeSelector?: boolean;
  /** Show simple toggle button */
  showToggleButton?: boolean;
  /** Show current theme status */
  showStatus?: boolean;
  /** Size variant for controls */
  size?: 'small' | 'default' | 'large';
}

const props = withDefaults(defineProps<Props>(), {
  showModeSelector: false,
  showToggleButton: true,
  showStatus: false,
  size: 'default'
});

const {
  currentThemeMode,
  isDark,
  currentThemeName,
  setThemeMode,
  toggleTheme
} = useTheme();

// Two-way binding for theme mode selector
const selectedThemeMode = computed<ThemeMode>({
  get: () => currentThemeMode.value,
  set: (value: ThemeMode) => setThemeMode(value)
});
</script>

<style scoped>
.theme-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
