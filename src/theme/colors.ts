/**
 * @deprecated
 * Legacy color system - use designTokens.ts instead
 * This file is kept for backward compatibility only
 */

import { primitiveColors } from './designTokens';

// Map legacy color names to new primitive colors for backward compatibility
export const myColors = {
  gray: {
    100: primitiveColors.neutral[100],
    200: primitiveColors.neutral[200],
    300: primitiveColors.neutral[300],
    400: primitiveColors.neutral[400],
    500: primitiveColors.neutral[500],
    600: primitiveColors.neutral[600],
    700: primitiveColors.neutral[700],
    800: primitiveColors.neutral[800],
  },
  blue: {
    20: primitiveColors.brand.blue[50],
    100: primitiveColors.brand.blue[400],
    200: primitiveColors.brand.blue[600],
    300: primitiveColors.brand.blue[700],
    400: primitiveColors.brand.blue[800],
    500: primitiveColors.brand.blue[900],
  },
  purple: {
    20: primitiveColors.brand.purple[50],
    100: primitiveColors.brand.purple[300],
    200: primitiveColors.brand.purple[400],
    300: primitiveColors.brand.purple[600],
    400: primitiveColors.brand.purple[700],
    500: primitiveColors.brand.purple[800],
    600: primitiveColors.brand.purple[900],
  },
  green: {
    20: primitiveColors.success[50],
    100: primitiveColors.success[400],
    200: primitiveColors.success[500],
    300: primitiveColors.success[600],
    400: primitiveColors.success[700],
  },
  yellow: {
    50: primitiveColors.warning[200],
    100: primitiveColors.warning[300],
    200: primitiveColors.warning[400],
    300: primitiveColors.warning[700],
  },
  cream: {
    100: primitiveColors.warning[300],
  },
  red: {
    100: primitiveColors.error[500],
  },
} as const satisfies Record<string, Record<string, string>>;
