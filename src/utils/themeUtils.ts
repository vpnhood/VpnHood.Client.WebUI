import { AppName } from '@/helpers/UiConstants';
import type { ThemeColorNames, AvailableThemes, ThemeMode } from '@/theme/types';

/**
 * Theme utility functions following Vuetify best practices
 */

// Theme conversion utilities
export function getThemeFromMode(mode: ThemeMode, systemPrefersDark: boolean, defaultAppTheme: AvailableThemes): AvailableThemes {
  switch (mode) {
    case 'light':
      return AppName.VpnHoodClient;
    case 'dark':
      return AppName.VpnHoodConnect;
    case 'system':
      return systemPrefersDark ? AppName.VpnHoodConnect : AppName.VpnHoodClient;
    case 'auto':
    default:
      return defaultAppTheme;
  }
}

// Check if theme is dark
export function isThemeDark(theme: AvailableThemes): boolean {
  return theme === AppName.VpnHoodConnect;
}

// Get opposite theme
export function getOppositeTheme(theme: AvailableThemes): AvailableThemes {
  return theme === AppName.VpnHoodConnect ? AppName.VpnHoodClient : AppName.VpnHoodConnect;
}

// Generate CSS custom properties from theme colors
export function generateThemeCSS(colors: ThemeColorNames): string {
  let cssVars = ':root {\n';
  
  for (const [key, value] of Object.entries(colors)) {
    cssVars += `  --v-theme-${key}: ${value};\n`;
  }
  
  cssVars += '}\n';
  return cssVars;
}

// Get theme color with fallback
export function getThemeColor(colors: ThemeColorNames, colorKey: keyof ThemeColorNames, fallback: string = '#000000'): string {
  return colors[colorKey] || fallback;
}

// Create RGB values from hex color
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Create CSS RGB string from hex
export function hexToRgbString(hex: string): string {
  const rgb = hexToRgb(hex);
  return rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : '0, 0, 0';
}

// Lighten or darken a color
export function adjustColorBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const adjust = (value: number): number => {
    const adjusted = Math.round(value * (1 + percent / 100));
    return Math.max(0, Math.min(255, adjusted));
  };

  const r = adjust(rgb.r).toString(16).padStart(2, '0');
  const g = adjust(rgb.g).toString(16).padStart(2, '0');
  const b = adjust(rgb.b).toString(16).padStart(2, '0');

  return `#${r}${g}${b}`;
}

// Get contrasting text color (black or white) for background
export function getContrastingColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';

  // Calculate relative luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

// Theme validation
export function validateTheme(theme: string): theme is AvailableThemes {
  return theme === AppName.VpnHoodClient || theme === AppName.VpnHoodConnect;
}

export function validateThemeMode(mode: string): mode is ThemeMode {
  return ['light', 'dark', 'auto', 'system'].includes(mode);
}

// Local storage helpers
export const THEME_STORAGE_KEY = 'vpnhood-theme-settings';

export interface ThemeStorageData {
  mode: ThemeMode;
  overrides: Array<[string, AvailableThemes]>;
  userPreference?: AvailableThemes;
  lastUpdate?: number;
}

export function saveThemeToStorage(data: ThemeStorageData): void {
  try {
    const storageData: ThemeStorageData = {
      ...data,
      lastUpdate: Date.now()
    };
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(storageData));
  } catch (error) {
    console.warn('Failed to save theme settings to localStorage:', error);
  }
}

export function loadThemeFromStorage(): ThemeStorageData | null {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored) as ThemeStorageData;
      
      // Validate stored data
      if (validateThemeMode(data.mode)) {
        return data;
      }
    }
  } catch (error) {
    console.warn('Failed to load theme settings from localStorage:', error);
  }
  
  return null;
}

// Media query helpers
export function getSystemThemePreference(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function watchSystemThemeChange(callback: (isDark: boolean) => void): (() => void) | null {
  if (typeof window === 'undefined' || !window.matchMedia) return null;
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handler = (e: MediaQueryListEvent) => callback(e.matches);
  
  mediaQuery.addEventListener('change', handler);
  
  // Return cleanup function
  return () => mediaQuery.removeEventListener('change', handler);
}

// CSS class utilities
export function getThemeClassNames(theme: AvailableThemes): string[] {
  const isDark = isThemeDark(theme);
  return [
    `theme-${isDark ? 'dark' : 'light'}`,
    `app-theme-${theme.toLowerCase().replace(/\s+/g, '-')}`,
    isDark ? 'dark' : 'light'
  ];
}

// Component prop helpers
export function createThemeProps() {
  return {
    theme: {
      type: String as () => AvailableThemes,
      default: undefined
    },
    forceLight: {
      type: Boolean,
      default: false
    },
    forceDark: {
      type: Boolean,
      default: false
    }
  };
}
