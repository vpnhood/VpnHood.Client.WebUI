<template>
  <v-theme-provider :theme="computedTheme">
    <slot />
  </v-theme-provider>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { useTheme, type AvailableThemes } from '@/composables/useTheme';
import { AppName } from '@/helpers/UiConstants';

interface Props {
  /** Force a specific theme for this component and its children */
  forceTheme?: AvailableThemes | 'light' | 'dark';
  /** Override theme for current page/route */
  pageThemeOverride?: AvailableThemes | 'light' | 'dark';
  /** Route name for page override (defaults to current route) */
  routeName?: string;
  /** Whether to inherit parent theme or create new context */
  inherit?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  inherit: true
});

const { 
  forceThemeForPage, 
  removeThemeOverrideForPage, 
  effectiveTheme
} = useTheme();

// Convert theme names to AvailableThemes values
function normalizeTheme(theme: AvailableThemes | 'light' | 'dark'): AvailableThemes {
  switch (theme) {
    case 'light':
      return AppName.VpnHoodClient;
    case 'dark':
      return AppName.VpnHoodConnect;
    default:
      return theme;
  }
}

// Get current route name
const currentRoute = computed(() => {
  return props.routeName || getCurrentRouteName();
});

function getCurrentRouteName(): string {
  if (typeof window !== 'undefined' && window.location) {
    return window.location.pathname.replace('/', '') || 'home';
  }
  return 'home';
}

// Computed theme for this provider
const computedTheme = computed<AvailableThemes>(() => {
  // Force theme takes highest priority
  if (props.forceTheme) {
    return normalizeTheme(props.forceTheme);
  }
  
  // Use effective theme from composable
  return effectiveTheme.value;
});

// Set up page theme override
onMounted(() => {
  if (props.pageThemeOverride) {
    const normalizedTheme = normalizeTheme(props.pageThemeOverride);
    forceThemeForPage(currentRoute.value, normalizedTheme);
  }
});

// Clean up page theme override
onUnmounted(() => {
  if (props.pageThemeOverride) {
    removeThemeOverrideForPage(currentRoute.value);
  }
});
</script>
