import { ref, computed, watch, readonly } from 'vue';
import { useTheme as useVuetifyTheme } from 'vuetify';
import { AppName } from '@/helpers/UiConstants';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import type { AvailableThemes, ThemeMode } from '@/theme/types';
import { 
  getThemeFromMode, 
  isThemeDark, 
  saveThemeToStorage, 
  loadThemeFromStorage,
  getSystemThemePreference,
  watchSystemThemeChange,
  getThemeClassNames,
  type ThemeStorageData
} from '@/utils/themeUtils';

export type { ThemeMode, AvailableThemes };
export type AppTheme = AvailableThemes;

// Global theme state
const currentThemeMode = ref<ThemeMode>('auto');
const userPreferredTheme = ref<ThemeMode>('auto');
const forceThemeOverrides = ref<Map<string, AvailableThemes>>(new Map());

export function useTheme() {
  const vuetifyTheme = useVuetifyTheme();
  const vhApp = VpnHoodApp.instance;

  // Get system preference
  const systemPrefersDark = ref(getSystemThemePreference());

  // Listen to system theme changes
  const cleanupSystemWatcher = watchSystemThemeChange((isDark) => {
    systemPrefersDark.value = isDark;
  });

  // Determine current app theme based on app type
  const currentAppTheme = computed<AvailableThemes>(() => {
    return vhApp.isConnectApp() ? AppName.VpnHoodConnect : AppName.VpnHoodClient;
  });

  // Get effective theme considering all factors
  const effectiveTheme = computed<AvailableThemes>(() => {
    const currentRoute = getCurrentRouteName();
    
    // Check for page-specific theme override
    if (forceThemeOverrides.value.has(currentRoute)) {
      return forceThemeOverrides.value.get(currentRoute)!;
    }

    // Use theme utility to determine effective theme
    return getThemeFromMode(
      currentThemeMode.value, 
      systemPrefersDark.value, 
      currentAppTheme.value
    );
  });

  // Is current theme dark
  const isDark = computed(() => {
    return isThemeDark(effectiveTheme.value);
  });

  // Theme name for display
  const currentThemeName = computed(() => {
    return isDark.value ? 'Dark' : 'Light';
  });

  // Apply theme to Vuetify
  watch(effectiveTheme, (newTheme) => {
    vuetifyTheme.global.name.value = newTheme;
  }, { immediate: true });

  // Set theme mode
  function setThemeMode(mode: ThemeMode) {
    currentThemeMode.value = mode;
    userPreferredTheme.value = mode;
    saveThemePreference();
  }

  // Toggle theme
  function toggleTheme() {
    const newMode = isDark.value ? 'light' : 'dark';
    setThemeMode(newMode);
  }

  // Force theme for specific page/route
  function forceThemeForPage(routeName: string, theme: AvailableThemes) {
    forceThemeOverrides.value.set(routeName, theme);
    saveThemePreference();
  }

  // Remove theme override for page
  function removeThemeOverrideForPage(routeName: string) {
    forceThemeOverrides.value.delete(routeName);
    saveThemePreference();
  }

  // Clear all theme overrides
  function clearAllThemeOverrides() {
    forceThemeOverrides.value.clear();
    saveThemePreference();
  }

  // Check if page has theme override
  function hasThemeOverride(routeName: string): boolean {
    return forceThemeOverrides.value.has(routeName);
  }

  // Get current route name
  function getCurrentRouteName(): string {
    if (typeof window !== 'undefined' && window.location) {
      return window.location.pathname.replace('/', '') || 'home';
    }
    return 'home';
  }

  // Save theme preference to local storage
  function saveThemePreference() {
    const data: ThemeStorageData = {
      mode: userPreferredTheme.value,
      overrides: Array.from(forceThemeOverrides.value.entries()),
      userPreference: currentAppTheme.value
    };
    saveThemeToStorage(data);
  }

  // Load theme preference from local storage
  function loadThemePreference() {
    const saved = loadThemeFromStorage();
    if (saved) {
      currentThemeMode.value = saved.mode;
      userPreferredTheme.value = saved.mode;
      
      if (saved.overrides && Array.isArray(saved.overrides)) {
        forceThemeOverrides.value = new Map(saved.overrides);
      }
    }
  }

  // Get theme class for conditional styling
  function getThemeClass(): string {
    return getThemeClassNames(effectiveTheme.value).join(' ');
  }

  // Get theme colors for manual styling
  function getThemeColors() {
    return {
      primary: vuetifyTheme.current.value.colors.primary,
      secondary: vuetifyTheme.current.value.colors.secondary,
      background: vuetifyTheme.current.value.colors.background,
      surface: vuetifyTheme.current.value.colors.surface,
      'on-background': vuetifyTheme.current.value.colors['on-background'],
      'on-surface': vuetifyTheme.current.value.colors['on-surface']
    };
  }

  // Initialize theme system
  function initializeTheme() {
    loadThemePreference();
  }

  // Cleanup function
  function cleanup() {
    if (cleanupSystemWatcher) {
      cleanupSystemWatcher();
    }
  }

  return {
    // State
    currentThemeMode: readonly(currentThemeMode),
    userPreferredTheme: readonly(userPreferredTheme),
    systemPrefersDark: readonly(systemPrefersDark),
    currentAppTheme,
    effectiveTheme,
    isDark,
    currentThemeName,

    // Methods
    setThemeMode,
    toggleTheme,
    forceThemeForPage,
    removeThemeOverrideForPage,
    clearAllThemeOverrides,
    hasThemeOverride,
    getThemeClass,
    getThemeColors,
    initializeTheme,
    cleanup,

    // Vuetify theme instance
    vuetifyTheme
  };
}

// Global initialization
let themeInitialized = false;

export function initializeGlobalTheme() {
  if (!themeInitialized) {
    const { initializeTheme } = useTheme();
    initializeTheme();
    themeInitialized = true;
  }
}
