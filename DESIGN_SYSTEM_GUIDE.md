# ?? VpnHood Design System - Color & Theme Architecture

This document outlines the new, maintainable color and theme system that follows design system best practices.

## ??? Architecture Overview

The new system follows a **4-layer architecture**:

```
1. Primitive Colors (Raw values)
   ?
2. Semantic Tokens (Design meaning)
   ?  
3. Component Tokens (Component-specific)
   ?
4. Theme Mappings (Final application)
```

## ?? File Structure

```
src/theme/
??? designTokens.ts        # ?? Primitive colors & semantic tokens
??? semanticThemes.ts      # ?? Semantic theme mappings
??? themeBuilder.ts        # ??? Theme builder utility
??? themes.ts              # ?? Main export & legacy compatibility
??? colors.ts              # ??  Legacy compatibility (deprecated)
??? types.ts               # ?? TypeScript definitions
```

## 1. ?? Primitive Colors (`designTokens.ts`)

Raw color values organized by purpose:

```typescript
import { primitiveColors } from '@/theme/designTokens';

// Usage examples:
primitiveColors.neutral[500]        // #9e9e9e
primitiveColors.brand.blue[500]     // #1e8bff  
primitiveColors.semantic.success[500] // #22c55e
```

### Color Categories:
- **`neutral`**: Grays for text, backgrounds, borders
- **`brand.blue`**: Primary brand colors (light theme)  
- **`brand.purple`**: Primary brand colors (dark theme)
- **`semantic.success`**: Green variants
- **`semantic.warning`**: Yellow/orange variants
- **`semantic.error`**: Red variants
- **`semantic.info`**: Blue variants

## 2. ?? Semantic Tokens

Colors with **meaning**, not just appearance:

```typescript
import { semanticTokens, darkSemanticTokens } from '@/theme/designTokens';

// Instead of: myColors.blue[200] ?
// Use: semanticTokens.interactive.primary ?

// Examples:
semanticTokens.background.primary    // Main background
semanticTokens.text.primary         // Main text color
semanticTokens.interactive.primary  // Primary buttons/links
semanticTokens.border.brand         // Brand-colored borders
```

### Token Categories:
- **`background`**: Surface colors
- **`text`**: Text colors with hierarchy
- **`border`**: Border and divider colors
- **`surface`**: Card, panel, dialog backgrounds
- **`interactive`**: Buttons, links, form controls

## 3. ??? Theme Builder

Create custom themes easily:

```typescript
import { ThemeBuilder } from '@/theme/themeBuilder';

// Simple custom theme
const customTheme = ThemeBuilder.createCustomTheme({
  isDark: false,
  primaryColor: '#ff6b35',
  successColor: '#4ade80',
});

// Advanced custom theme
const advancedTheme = new ThemeBuilder(false, {
  primaryColor: '#3b82f6',
  customColors: {
    'btn-style-1': '#ff6b35',
    'on-btn-style-1': '#ffffff',
  }
}).build();
```

## 4. ?? Usage Patterns

### ? Recommended Approach

```typescript
// 1. Use pre-built themes
import { lightThemeColors, darkThemeColors } from '@/theme/semanticThemes';

// 2. Use theme builder for customization  
import { ThemeBuilder } from '@/theme/themeBuilder';

// 3. Use helper functions
import { themeHelpers } from '@/theme/themes';

const myTheme = themeHelpers.createLightTheme({
  'btn-style-1': '#ff6b35'
});
```

### ? Legacy Approach (Deprecated)

```typescript
// Don't do this anymore:
import { myColors } from '@/theme/colors';
const buttonColor = myColors.blue['200']; // Hard to maintain
```

## ?? Migration Guide

### Step 1: Replace Hard-coded Colors

**Before:**
```vue
<v-btn class="bg-blue-200 text-white">
  Button
</v-btn>
```

**After:**
```vue
<v-btn class="bg-btn-style-1 text-on-btn-style-1">
  Button
</v-btn>
```

### Step 2: Use Semantic Color Classes

**Before:**
```css
.my-component {
  background: #1940b0;
  color: #ffffff;
}
```

**After:**
```css
.my-component {
  background: rgb(var(--v-theme-btn-style-1));
  color: rgb(var(--v-theme-on-btn-style-1));
}
```

### Step 3: Create Custom Themes

**Before:**
```typescript
// Manual color assignment
const customColors = {
  'btn-style-1': '#ff0000',
  'on-btn-style-1': '#ffffff',
  // ... 100+ more colors
};
```

**After:**
```typescript
// Semantic theme creation
const customTheme = ThemeBuilder.createCustomTheme({
  primaryColor: '#ff0000',
  // Automatically generates all related colors
});
```

## ?? Best Practices

### 1. **Use Semantic Names**
```typescript
// ? Good - Semantic meaning
'btn-style-1'              // Primary button
'general-dialog'           // Standard dialog background
'interactive-primary'      // Main interactive color

// ? Bad - Appearance-based
'blue-200'                 // What if brand changes?
'light-gray'               // Relative to what?
```

### 2. **Layer Your Customizations**
```typescript
// ? Good - Layered approach
const baseTheme = new ThemeBuilder(false);
const customTheme = new ThemeBuilder(false, {
  primaryColor: '#ff6b35',
  customColors: {
    'special-button': '#purple',
  }
});

// ? Bad - All custom colors at once
const theme = { /* 100+ color definitions */ };
```

### 3. **Use Pre-built Variants**
```typescript
// ? Good - Use existing variants
import { themeVariants } from '@/theme/themeBuilder';
const theme = themeVariants.documentationLight;

// ? Bad - Recreate from scratch
const theme = ThemeBuilder.createCustomTheme({ /* everything custom */ });
```

## ?? Creating New Themes

### Basic Theme
```typescript
import { ThemeBuilder } from '@/theme/themeBuilder';

const brandTheme = ThemeBuilder.createCustomTheme({
  isDark: false,
  primaryColor: '#ff6b35',    // Your brand color
  successColor: '#10b981',    // Custom success color
});
```

### Advanced Theme
```typescript
const advancedTheme = new ThemeBuilder(false, {
  primaryColor: '#3b82f6',
  backgroundColor: '#fafafa',
  surfaceColor: '#ffffff',
  customColors: {
    // Override specific components
    'navigation-drawer': '#f8f9fa',
    'btn-style-1': '#ff6b35',
    'active-server': '#10b981',
  }
}).build();
```

### Page-Specific Theme
```typescript
// For documentation pages that need light theme
const docsTheme = themeVariants.documentationLight;

// For high-contrast accessibility
const accessibleTheme = themeVariants.highContrast;
```

## ?? Color Token Reference

### Background Tokens
- `background.primary` - Main app background
- `background.secondary` - Secondary surfaces  
- `background.brand` - Brand-colored backgrounds
- `background.success/warning/error` - Status backgrounds

### Text Tokens  
- `text.primary` - Main content text
- `text.secondary` - Subdued text
- `text.brand` - Brand-colored text
- `text.inverse` - Text on dark backgrounds

### Interactive Tokens
- `interactive.primary` - Main buttons, links
- `interactive.secondary` - Secondary actions
- `interactive.success` - Positive actions
- `interactive.danger` - Destructive actions

### Surface Tokens
- `surface.primary` - Cards, dialogs
- `surface.brand` - Brand-colored surfaces
- `surface.brandElevated` - Elevated brand surfaces

## ?? Component Color Mapping

### Buttons
```typescript
'btn-style-1'  // Primary action (brand color)
'btn-style-2'  // Secondary action  
'btn-style-3'  // Success action (green)
'btn-style-4'  // Alternative primary
'btn-style-5'  // Muted action
'btn-style-6'  // Ghost button
'btn-style-7'  // Text button
```

### Status Indicators
```typescript
'active-server'    // Success state (green)
'fastest-server'   // Highlighted state (brand)
'warning'          // Warning state (yellow)
'error'           // Error state (red)
```

### Dialogs & Surfaces
```typescript
'general-dialog'      // Standard dialog
'config-card-bg'      // Configuration cards
'navigation-drawer'   // Side navigation
'expansion-panels'    // Expandable lists
```

## ?? Quick Start Examples

### 1. Use Existing Theme
```typescript
import { lightThemeColors } from '@/theme/semanticThemes';
// Already perfect for most use cases
```

### 2. Simple Brand Change
```typescript
import { themeHelpers } from '@/theme/themes';

const myBrandTheme = themeHelpers.createBrandedTheme('#ff6b35');
```

### 3. Custom Documentation Theme
```typescript
import { themeVariants } from '@/theme/themeBuilder';

// Use pre-built documentation theme
const docsTheme = themeVariants.documentationLight;
```

### 4. Complex Custom Theme
```typescript
import { ThemeBuilder } from '@/theme/themeBuilder';

const complexTheme = new ThemeBuilder(false, {
  primaryColor: '#6366f1',
  successColor: '#10b981', 
  warningColor: '#f59e0b',
  customColors: {
    'navigation-drawer': '#f8fafc',
    'btn-style-1': '#6366f1',
    'active-server': '#10b981',
  }
}).build();
```

This new system makes it **much easier** to:
- ? Maintain consistent colors across the app
- ? Create new themes quickly  
- ? Change brand colors globally
- ? Ensure proper contrast ratios
- ? Support both light and dark modes
- ? Add new color variations

The old `myColors.cream['100']` approach is now replaced with semantic, maintainable tokens! ??