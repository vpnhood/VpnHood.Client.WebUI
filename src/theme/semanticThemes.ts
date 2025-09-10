import { lightTokens, darkTokens, lightComponentTokens, darkComponentTokens } from './designTokens';
import type { ThemeColorNames } from './types';

/**
 * Theme mapping using semantic design tokens
 * This provides a clean, maintainable way to define themes
 */

type SemanticTokens = typeof lightTokens;
type ComponentTokens = typeof lightComponentTokens;

// Helper function to create theme colors with semantic meaning
function createThemeMapping(
  tokens: SemanticTokens, 
  componentColors: ComponentTokens, 
  customOverrides: Partial<ThemeColorNames> = {}
): ThemeColorNames {
  const baseMapping: ThemeColorNames = {
    // Core background colors
    'background': tokens.background.primary,
    'on-background': tokens.text.primary,
    'app-bg': tokens.background.brand,
    
    // Surface colors (cards, panels)
    'general-dialog': componentColors.card.background,
    'on-general-dialog': tokens.text.primary,
    'general-dialog-text': tokens.text.secondary,
    
    'config-card-bg': componentColors.card.background,
    'zebra-on-config-card-bg': tokens.surface.secondary,
    'config-card-on-expansion-panel': tokens.surface.tertiary,
    
    // Navigation colors
    'navigation-drawer': componentColors.navigation.background,
    'navigation-drawer-header': tokens.surface.brand,
    'navigation-drawer-version': tokens.text.success,
    
    // App bar
    'app-bar': tokens.surface.brand,
    'on-app-bar': tokens.text.inverse,
    'home-app-bar': tokens.surface.primary,
    'skeleton-loader': tokens.surface.secondary,
    
    // Gradient backgrounds
    'home-bg-grad-1': tokens.surface.brand,
    'home-bg-grad-2': tokens.surface.brandElevated,
    'colored-bg-light': tokens.surface.brand,
    'colored-bg-dark': tokens.surface.brandElevated,
    'grad-bg-container-bg': tokens.surface.brandElevated,
    
    // Button styles using semantic names
    'btn-style-1': componentColors.button.primary.background,
    'on-btn-style-1': componentColors.button.primary.text,
    
    'btn-style-2': componentColors.button.secondary.background,
    'on-btn-style-2': componentColors.button.secondary.text,
    
    'btn-style-3': tokens.interactive.success,
    'on-btn-style-3': tokens.text.inverse,
    
    'btn-style-4': tokens.interactive.primary,
    
    'btn-style-5': tokens.interactive.secondary,
    'on-btn-style-5': tokens.text.primary,
    
    'btn-style-6': tokens.surface.primary,
    'on-btn-style-6': tokens.text.brand,
    
    'btn-style-7': tokens.text.primary,
    
    // Interactive elements
    'tonal-icon-btn': tokens.interactive.primary,
    'switch-btn': tokens.interactive.primary,
    
    // Connection states
    'connect-btn-disconnected-grad-1': tokens.interactive.secondary,
    'connect-btn-disconnected-grad-2': tokens.interactive.success,
    'connect-btn-connected': tokens.interactive.primary,
    'on-connect-btn-disconnected': tokens.text.primary,
    'on-connect-btn-connected': tokens.text.inverse,
    'connection-circle-border': tokens.border.primary,
    
    // Status colors
    'active': tokens.interactive.success,
    'on-active': tokens.text.inverse,
    'highlight': tokens.interactive.primary,
    'active-server': tokens.interactive.success,
    'fastest-server': tokens.interactive.primary,
    'active-server-chip': tokens.interactive.success,
    'on-active-server-chip': tokens.text.inverse,
    
    // Premium features
    'go-premium-btn': tokens.interactive.success,
    'on-go-premium-btn': tokens.text.inverse,
    'enable-premium': tokens.interactive.success,
    'disable-premium': tokens.interactive.secondary,
    'promote-premium-border': tokens.border.brand,
    'promote-premium-color-premium': tokens.interactive.success,
    'on-promote-premium-color-premium': tokens.text.inverse,
    'promote-premium-color-free': tokens.interactive.primary,
    'on-promote-premium-color-free': tokens.text.inverse,
    'premium-features-icon': tokens.interactive.primary,
    'premium-code-btn': tokens.interactive.primary,
    'purchase-subscription-btn': tokens.interactive.success,
    'on-purchase-subscription-btn': tokens.text.inverse,
    'activate-code-btn': tokens.interactive.primary,
    'on-activate-code-btn': tokens.text.inverse,
    
    // Expansion panels and lists
    'expansion-panels': componentColors.card.background,
    'on-expansion-panels': tokens.text.primary,
    'expansion-panels-servers-list': tokens.surface.secondary,
    'active-profile-radio': tokens.interactive.success,
    'inactive-profile-radio': tokens.interactive.secondary,
    'profile-menu-btn': tokens.interactive.secondary,
    
    // Dialog variants
    'dialog-light': tokens.background.success,
    'on-dialog-light': tokens.text.inverse,
    'dialog-light-text': tokens.text.inverse,
    
    'dialog-dark': tokens.background.brand,
    'on-dialog-dark': tokens.text.inverse,
    'dialog-dark-text': tokens.text.inverse,
    
    'dialog-alert': tokens.background.warning,
    'on-dialog-alert': tokens.text.warning,
    'dialog-alert-text': tokens.text.warning,
    'dialog-alert-btn': tokens.interactive.primary,
    
    // Card variants
    'card-on-grad-bg': tokens.surface.brandElevated,
    'on-card-on-grad-bg': tokens.text.inverse,
    
    // Countdown and status indicators
    'count-down-normal': tokens.text.success,
    'count-down-alert': tokens.text.warning,
    'count-down-warning': tokens.text.error,
    
    // Connection info
    'connection-speed': tokens.text.brand,
    'total-bandwidth': tokens.text.brand,
    
    // Expiration warnings
    'expire-date-alert': tokens.background.warning,
    'expire-date-warning': tokens.background.error,
    
    // Configuration
    'config-btn-bg': tokens.surface.brand,
    'on-config-btn-bg': tokens.text.inverse,
    
    // Snackbars
    'suppress-snackbar': tokens.background.warning,
    'on-suppress-snackbar': tokens.text.warning,
    'update-snackbar-alert': tokens.background.info,
    'update-snackbar-warning': tokens.background.warning,
    'btn-on-update-snackbar': tokens.interactive.primary,
    
    // Warnings and notifications
    'disconnect-warning': tokens.background.warning,
    'on-disconnect-warning': tokens.text.warning,
    'version-on-home-debug': tokens.background.warning,
    'on-version-on-home-debug': tokens.text.warning,
    
    // Semantic alert colors
    'info': tokens.background.info,
    'on-info': tokens.text.info,
    'note': tokens.background.info,
    'on-note': tokens.text.info,
    'error': tokens.background.error,
    'warning': tokens.background.warning,
    'on-warning': tokens.text.warning,
    
    // Special elements
    'rate-icon': tokens.interactive.primary,
    'rate-dialog-border': tokens.border.brand,
    'rate-dialog-thanks': tokens.interactive.success,
    'sample-ip-filter-bg': tokens.surface.tertiary,
    'sample-ip-filter-text': tokens.text.secondary,
    
    // Scrollbar
    'scroll-track': tokens.surface.secondary,
    'scroll-thumb': tokens.interactive.secondary,
    'scroll-thumb-hover': tokens.interactive.primary,
  };

  // Apply custom overrides
  return { ...baseMapping, ...customOverrides };
}

// Light theme using semantic tokens
export const lightThemeColors = createThemeMapping(
  lightTokens,
  lightComponentTokens,
  {
    // Custom overrides for light theme if needed
    'home-app-bar': '#ffffff',
  }
);

// Dark theme using semantic tokens
export const darkThemeColors = createThemeMapping(
  darkTokens,
  darkComponentTokens,
  {
    // Custom overrides for dark theme if needed
    'home-app-bar': '#ffffff',
  }
);

// Legacy compatibility - map to old theme names
export const vhClientThemeColors = lightThemeColors;
export const vhConnectThemeColors = darkThemeColors;
