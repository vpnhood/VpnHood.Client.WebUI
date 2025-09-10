import { lightTokens, darkTokens, lightComponentTokens, darkComponentTokens, primitiveColors } from './designTokens';
import type { ThemeColorNames } from './types';

/**
 * Theme Builder Utility
 * Provides easy methods to create and customize themes
 */

export interface ThemeBuilderOptions {
  // Brand colors
  primaryColor?: string;
  secondaryColor?: string;
  
  // Semantic overrides
  successColor?: string;
  warningColor?: string;
  errorColor?: string;
  infoColor?: string;
  
  // Background overrides
  backgroundColor?: string;
  surfaceColor?: string;
  
  // Custom color mappings
  customColors?: Partial<ThemeColorNames>;
}

export class ThemeBuilder {
  private baseTokens: typeof lightTokens | typeof darkTokens;
  private baseComponentTokens: typeof lightComponentTokens | typeof darkComponentTokens;
  private options: ThemeBuilderOptions;

  constructor(isDark: boolean = false, options: ThemeBuilderOptions = {}) {
    this.baseTokens = isDark ? darkTokens : lightTokens;
    this.baseComponentTokens = isDark ? darkComponentTokens : lightComponentTokens;
    this.options = options;
  }

  /**
   * Generate a complete theme with custom options
   */
  build(): ThemeColorNames {
    const tokens = this.applyCustomColors();
    const componentTokens = this.baseComponentTokens;
    
    return {
      // Core colors
      'background': tokens.background.primary,
      'on-background': tokens.text.primary,
      'app-bg': tokens.background.brand,
      
      // Surfaces
      'general-dialog': componentTokens.card.background,
      'on-general-dialog': tokens.text.primary,
      'general-dialog-text': tokens.text.secondary,
      
      'config-card-bg': componentTokens.card.background,
      'zebra-on-config-card-bg': tokens.surface.secondary,
      'config-card-on-expansion-panel': tokens.surface.tertiary,
      
      // Navigation
      'navigation-drawer': componentTokens.navigation.background,
      'navigation-drawer-header': tokens.surface.brand,
      'navigation-drawer-version': tokens.text.success,
      
      // App bar
      'app-bar': tokens.surface.brand,
      'on-app-bar': tokens.text.inverse,
      'home-app-bar': '#ffffff',
      'skeleton-loader': tokens.surface.secondary,
      
      // Gradients
      'home-bg-grad-1': tokens.surface.brand,
      'home-bg-grad-2': tokens.surface.brandElevated,
      'colored-bg-light': tokens.surface.brand,
      'colored-bg-dark': tokens.surface.brandElevated,
      'grad-bg-container-bg': tokens.surface.brandElevated,
      
      // Buttons - using semantic approach
      'btn-style-1': tokens.interactive.primary,      // Primary action
      'on-btn-style-1': tokens.text.inverse,
      
      'btn-style-2': tokens.interactive.secondary,    // Secondary action
      'on-btn-style-2': tokens.text.primary,
      
      'btn-style-3': tokens.interactive.success,      // Success action
      'on-btn-style-3': tokens.text.inverse,
      
      'btn-style-4': tokens.interactive.primary,      // Variant primary
      
      'btn-style-5': tokens.interactive.secondary,    // Muted action
      'on-btn-style-5': tokens.text.primary,
      
      'btn-style-6': tokens.surface.primary,          // Ghost button
      'on-btn-style-6': tokens.text.brand,
      
      'btn-style-7': tokens.text.primary,             // Text button
      
      // Interactive elements
      'tonal-icon-btn': tokens.interactive.primary,
      'switch-btn': tokens.interactive.primary,
      
      // Connection UI
      'connect-btn-disconnected-grad-1': tokens.interactive.secondary,
      'connect-btn-disconnected-grad-2': tokens.interactive.success,
      'connect-btn-connected': tokens.interactive.primary,
      'on-connect-btn-disconnected': tokens.text.primary,
      'on-connect-btn-connected': tokens.text.inverse,
      'connection-circle-border': tokens.border.primary,
      
      // Status indicators
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
      
      // Lists and panels
      'expansion-panels': componentTokens.card.background,
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
      
      // Countdown indicators
      'count-down-normal': tokens.text.success,
      'count-down-alert': tokens.text.warning,
      'count-down-warning': tokens.text.error,
      
      // Info displays
      'connection-speed': tokens.text.brand,
      'total-bandwidth': tokens.text.brand,
      
      // Warnings
      'expire-date-alert': tokens.background.warning,
      'expire-date-warning': tokens.background.error,
      
      // Config UI
      'config-btn-bg': tokens.surface.brand,
      'on-config-btn-bg': tokens.text.inverse,
      
      // Notifications
      'suppress-snackbar': tokens.background.warning,
      'on-suppress-snackbar': tokens.text.warning,
      'update-snackbar-alert': tokens.background.info,
      'update-snackbar-warning': tokens.background.warning,
      'btn-on-update-snackbar': tokens.interactive.primary,
      
      // State indicators
      'disconnect-warning': tokens.background.warning,
      'on-disconnect-warning': tokens.text.warning,
      'version-on-home-debug': tokens.background.warning,
      'on-version-on-home-debug': tokens.text.warning,
      
      // Semantic colors
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
      
      // Scrollbars
      'scroll-track': tokens.surface.secondary,
      'scroll-thumb': tokens.interactive.secondary,
      'scroll-thumb-hover': tokens.interactive.primary,
      
      // Apply custom overrides last
      ...this.options.customColors,
    };
  }

  /**
   * Apply custom color overrides to base tokens
   */
  private applyCustomColors() {
    const tokens = JSON.parse(JSON.stringify(this.baseTokens)); // Deep clone
    
    if (this.options.primaryColor) {
      tokens.interactive.primary = this.options.primaryColor;
      tokens.text.brand = this.options.primaryColor;
      tokens.border.brand = this.options.primaryColor;
    }
    
    if (this.options.successColor) {
      tokens.interactive.success = this.options.successColor;
      tokens.text.success = this.options.successColor;
    }
    
    if (this.options.warningColor) {
      tokens.background.warning = this.options.warningColor;
      tokens.text.warning = this.options.warningColor;
    }
    
    if (this.options.errorColor) {
      tokens.background.error = this.options.errorColor;
      tokens.text.error = this.options.errorColor;
    }
    
    if (this.options.backgroundColor) {
      tokens.background.primary = this.options.backgroundColor;
    }
    
    if (this.options.surfaceColor) {
      tokens.surface.primary = this.options.surfaceColor;
    }
    
    return tokens;
  }

  /**
   * Create a custom theme variant
   */
  static createCustomTheme(options: ThemeBuilderOptions & { isDark?: boolean }): ThemeColorNames {
    const builder = new ThemeBuilder(options.isDark || false, options);
    return builder.build();
  }

  /**
   * Create multiple theme variants at once
   */
  static createThemeVariants(variants: Record<string, ThemeBuilderOptions & { isDark?: boolean }>) {
    const themes: Record<string, ThemeColorNames> = {};
    
    for (const [name, options] of Object.entries(variants)) {
      themes[name] = ThemeBuilder.createCustomTheme(options);
    }
    
    return themes;
  }
}

// Pre-built theme variants
export const themeVariants = ThemeBuilder.createThemeVariants({
  // Standard themes
  light: { isDark: false },
  dark: { isDark: true },
  
  // Brand variants
  lightBlue: {
    isDark: false,
    primaryColor: primitiveColors.brand.blue[500],
  },
  darkPurple: {
    isDark: true,
    primaryColor: primitiveColors.brand.purple[500],
  },
  
  // Custom variants for special pages
  documentationLight: {
    isDark: false,
    backgroundColor: '#fafafa',
    surfaceColor: '#ffffff',
    primaryColor: primitiveColors.brand.blue[600],
  },
  
  highContrast: {
    isDark: true,
    backgroundColor: '#000000',
    surfaceColor: '#1a1a1a',
    primaryColor: '#ffffff',
    customColors: {
      'on-background': '#ffffff',
      'general-dialog-text': '#ffffff',
    },
  },
});

export default ThemeBuilder;
