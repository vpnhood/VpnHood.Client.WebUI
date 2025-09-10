import { lightThemeColors, darkThemeColors } from './semanticThemes';
import { ThemeBuilder, themeVariants } from './themeBuilder';
import type { ThemeColorNames } from './types';

// Export the new semantic-based themes
export const vhClientThemeColors = lightThemeColors;
export const vhConnectThemeColors = darkThemeColors;

// Export pre-built theme variants
export { themeVariants };

// Export the theme builder for custom themes
export { ThemeBuilder };

/**
 * @deprecated Use lightThemeColors or darkThemeColors instead
 * Legacy color system - kept for backward compatibility
 */
export const legacyColors = {
  // Keep old myColors reference for any remaining legacy code
  myColors: {
    gray: {
      100: "#f3f3f3",
      200: "#efefef",
      300: "#eaeaea",
      400: "#bebebe",
      500: "#929292",
      600: "#888888ff",
      700: "#3f3f3f",
      800: "#1e1e1e",
    },
    blue: {
      20:  "#eaeff6",
      100: "#16a3fe",
      200: "#1940b0",
      300: "#122272",
      400: "#06124b",
      500: "#030b30",
    },
    purple: {
      20:  "#e1e1ff",
      100: "#8d9fe4",
      200: "#7b7afe",
      300: "#2f296e",
      400: "#211951",
      500: "#150e3d",
      600: "#0b0b24",
    },
    green: {
      20:  "#d3eee7",
      100: "#3ff6a9",
      200: "#15f5ba",
      300: "#23c99d",
      400: "#078362",
    },
    yellow: {
      50:  "#fce68f",
      100: "#ffe066",
      200: "#ffe648",
      300: "#704d00",
    },
    cream: {
      100: "#e7b481",
    },
    red: {
      100: "#ff5252",
    },
  }
};

/**
 * Helper function to create custom themes easily
 */
export function createCustomTheme(name: string, options: Parameters<typeof ThemeBuilder.createCustomTheme>[0]): ThemeColorNames {
  return ThemeBuilder.createCustomTheme(options);
}

/**
 * Quick theme creation functions
 */
export const themeHelpers = {
  createLightTheme: (overrides?: Partial<ThemeColorNames>) => 
    new ThemeBuilder(false, { customColors: overrides }).build(),
    
  createDarkTheme: (overrides?: Partial<ThemeColorNames>) => 
    new ThemeBuilder(true, { customColors: overrides }).build(),
    
  createBrandedTheme: (primaryColor: string, isDark: boolean = false) =>
    new ThemeBuilder(isDark, { primaryColor }).build(),
};

// Re-export everything from the new design system
export * from './designTokens';
export * from './semanticThemes';
