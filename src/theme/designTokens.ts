/**
 * Design System Color Tokens
 * Following design system best practices with single source of truth
 */

// 1. PRIMITIVE COLOR PALETTE (Single source of truth)
export const primitiveColors = {
  // Neutral colors
  neutral: {
    0: '#ffffff',
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
    950: '#0f0f0f',
    1000: '#000000',
  },
  
  // Brand colors - VpnHood specific
  brand: {
    // Light theme primary (blue family)
    blue: {
      50: '#edf6ff',
      100: '#d6eaff',
      200: '#b5dcff',
      300: '#83c8ff',
      400: '#48a9ff',
      500: '#1e8bff',  // Primary brand blue
      600: '#066df5',
      700: '#0856d1',
      800: '#0d47aa',
      900: '#123e85',
      950: '#0f2751',
    },
    // Dark theme primary (purple family)
    purple: {
      50: '#f0f0ff',
      100: '#e4e4ff',
      200: '#ccccff',
      300: '#a5a5ff',
      400: '#7b7afe',
      500: '#5d4ff5',  // Primary brand purple
      600: '#4c32ea',
      700: '#3f21ce',
      800: '#341ca5',
      900: '#2d1a84',
      950: '#1a0f4b',
    },
  },
  
  // Semantic colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',  // Primary success green
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',  // Primary warning orange
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',  // Primary error red
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // Primary info blue
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
} as const;

// 2. LIGHT THEME SEMANTIC TOKENS (Direct references, no duplication)
export const lightTokens = {
  // Background colors
  background: {
    primary: primitiveColors.neutral[0],      // Pure white
    secondary: primitiveColors.neutral[50],   // Off-white
    tertiary: primitiveColors.neutral[100],   // Light gray
    inverse: primitiveColors.neutral[900],    // Dark gray
    brand: primitiveColors.brand.blue[500],   // Brand blue
    brandSubtle: primitiveColors.brand.blue[50],
    success: primitiveColors.success[50],
    warning: primitiveColors.warning[50],
    error: primitiveColors.error[50],
    info: primitiveColors.info[50],
  },
  
  // Text colors
  text: {
    primary: primitiveColors.neutral[900],    // Dark text
    secondary: primitiveColors.neutral[600],  // Medium text
    tertiary: primitiveColors.neutral[500],   // Light text
    inverse: primitiveColors.neutral[0],      // White text
    disabled: primitiveColors.neutral[400],   // Disabled text
    brand: primitiveColors.brand.blue[600],   // Brand text
    success: primitiveColors.success[700],
    warning: primitiveColors.warning[700],
    error: primitiveColors.error[700],
    info: primitiveColors.info[700],
  },
  
  // Border colors
  border: {
    primary: primitiveColors.neutral[200],
    secondary: primitiveColors.neutral[300],
    brand: primitiveColors.brand.blue[300],
    success: primitiveColors.success[300],
    warning: primitiveColors.warning[300],
    error: primitiveColors.error[300],
    info: primitiveColors.info[300],
  },
  
  // Surface colors (cards, panels, etc.)
  surface: {
    primary: primitiveColors.neutral[0],      // White surfaces
    secondary: primitiveColors.neutral[50],   // Light surfaces
    tertiary: primitiveColors.neutral[100],   // Subtle surfaces
    inverse: primitiveColors.neutral[800],    // Dark surfaces
    brand: primitiveColors.brand.blue[50],    // Brand surfaces
    brandElevated: primitiveColors.brand.blue[100],
  },
  
  // Interactive states
  interactive: {
    primary: primitiveColors.brand.blue[500],
    primaryHover: primitiveColors.brand.blue[600],
    primaryActive: primitiveColors.brand.blue[700],
    primaryDisabled: primitiveColors.neutral[300],
    
    secondary: primitiveColors.neutral[200],
    secondaryHover: primitiveColors.neutral[300],
    secondaryActive: primitiveColors.neutral[400],
    
    success: primitiveColors.success[500],
    successHover: primitiveColors.success[600],
    successActive: primitiveColors.success[700],
    
    danger: primitiveColors.error[500],
    dangerHover: primitiveColors.error[600],
    dangerActive: primitiveColors.error[700],
  },
} as const;

// 3. DARK THEME SEMANTIC TOKENS (Different color mappings)
export const darkTokens = {
  // Background colors
  background: {
    primary: primitiveColors.neutral[900],     // Dark background
    secondary: primitiveColors.neutral[800],   // Medium dark
    tertiary: primitiveColors.neutral[700],    // Lighter dark
    inverse: primitiveColors.neutral[50],      // Light background
    brand: primitiveColors.brand.purple[600],  // Purple for dark theme
    brandSubtle: primitiveColors.brand.purple[950],
    success: primitiveColors.success[950],
    warning: primitiveColors.warning[950],
    error: primitiveColors.error[950],
    info: primitiveColors.info[950],
  },
  
  // Text colors
  text: {
    primary: primitiveColors.neutral[50],      // Light text on dark
    secondary: primitiveColors.neutral[300],   // Medium light text
    tertiary: primitiveColors.neutral[400],    // Dimmed text
    inverse: primitiveColors.neutral[900],     // Dark text
    disabled: primitiveColors.neutral[600],    // Disabled text
    brand: primitiveColors.brand.purple[400],  // Purple brand text
    success: primitiveColors.success[400],
    warning: primitiveColors.warning[400],
    error: primitiveColors.error[400],
    info: primitiveColors.info[400],
  },
  
  // Border colors
  border: {
    primary: primitiveColors.neutral[700],
    secondary: primitiveColors.neutral[600],
    brand: primitiveColors.brand.purple[500],
    success: primitiveColors.success[600],
    warning: primitiveColors.warning[600],
    error: primitiveColors.error[600],
    info: primitiveColors.info[600],
  },
  
  // Surface colors
  surface: {
    primary: primitiveColors.neutral[800],     // Dark surfaces
    secondary: primitiveColors.neutral[700],   // Medium surfaces
    tertiary: primitiveColors.neutral[600],    // Lighter surfaces
    inverse: primitiveColors.neutral[100],     // Light surfaces
    brand: primitiveColors.brand.purple[900],  // Purple surfaces
    brandElevated: primitiveColors.brand.purple[800],
  },
  
  // Interactive states
  interactive: {
    primary: primitiveColors.brand.purple[500],
    primaryHover: primitiveColors.brand.purple[400],
    primaryActive: primitiveColors.brand.purple[300],
    primaryDisabled: primitiveColors.neutral[600],
    
    secondary: primitiveColors.neutral[600],
    secondaryHover: primitiveColors.neutral[500],
    secondaryActive: primitiveColors.neutral[400],
    
    success: primitiveColors.success[500],
    successHover: primitiveColors.success[400],
    successActive: primitiveColors.success[300],
    
    danger: primitiveColors.error[500],
    dangerHover: primitiveColors.error[400],
    dangerActive: primitiveColors.error[300],
  },
} as const;

// 4. COMPONENT TOKEN BUILDER (No duplication, uses semantic tokens)
function createComponentTokens<T extends typeof lightTokens | typeof darkTokens>(tokens: T) {
  return {
    button: {
      primary: {
        background: tokens.interactive.primary,
        text: tokens.text.inverse,
        border: tokens.interactive.primary,
        hover: {
          background: tokens.interactive.primaryHover,
          text: tokens.text.inverse,
          border: tokens.interactive.primaryHover,
        },
      },
      secondary: {
        background: 'transparent',
        text: tokens.interactive.primary,
        border: tokens.border.primary,
        hover: {
          background: tokens.surface.secondary,
          text: tokens.interactive.primaryHover,
          border: tokens.border.brand,
        },
      },
      success: {
        background: tokens.interactive.success,
        text: tokens.text.inverse,
        border: tokens.interactive.success,
        hover: {
          background: tokens.interactive.successHover,
          text: tokens.text.inverse,
          border: tokens.interactive.successHover,
        },
      },
      danger: {
        background: tokens.interactive.danger,
        text: tokens.text.inverse,
        border: tokens.interactive.danger,
        hover: {
          background: tokens.interactive.dangerHover,
          text: tokens.text.inverse,
          border: tokens.interactive.dangerHover,
        },
      },
    },
    
    card: {
      background: tokens.surface.primary,
      border: tokens.border.primary,
      shadow: tokens === lightTokens ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.3)',
    },
    
    navigation: {
      background: tokens.surface.primary,
      border: tokens.border.primary,
      text: tokens.text.primary,
      textActive: tokens.interactive.primary,
      backgroundActive: tokens.surface.brand,
    },
  } as const;
}

// 5. GENERATED COMPONENT TOKENS (No duplication)
export const lightComponentTokens = createComponentTokens(lightTokens);
export const darkComponentTokens = createComponentTokens(darkTokens);

// Legacy exports for backward compatibility
export const semanticTokens = lightTokens;
export const darkSemanticTokens = darkTokens;
export const componentTokens = lightComponentTokens;

// Type exports for better developer experience
export type PrimitiveColorToken = keyof typeof primitiveColors;
export type SemanticTokens = typeof lightTokens;
export type ComponentTokens = typeof lightComponentTokens;
