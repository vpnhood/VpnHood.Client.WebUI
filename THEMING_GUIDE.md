# VpnHood Theming System - Best Practices Guide

This guide explains the improved theming system implemented for the VpnHood application, following Vuetify best practices.

## ?? Overview

The new theming system provides:
- **Reactive theme switching** between light and dark modes
- **Page-specific theme overrides** for special requirements
- **System preference detection** and automatic theme selection
- **Persistent theme preferences** saved to localStorage
- **Type-safe theme management** with full TypeScript support

## ?? File Structure

```
src/
??? composables/
?   ??? useTheme.ts              # Main theme composable
??? components/
?   ??? ThemeProvider.vue        # Theme provider component
?   ??? ThemeToggle.vue          # Theme toggle controls
??? utils/
?   ??? themeUtils.ts            # Theme utility functions
??? theme/
?   ??? types.ts                 # Theme type definitions
?   ??? themes.ts                # Theme color definitions
?   ??? vuetify.ts               # Vuetify configuration
??? pages/
    ??? ThemeDemo.vue            # Example page with theme overrides
```

## ?? Quick Start

### 1. Basic Theme Usage

```vue
<script setup lang="ts">
import { useTheme } from '@/composables/useTheme';

const { isDark, currentThemeName, toggleTheme } = useTheme();
</script>

<template>
  <div>
    <p>Current theme: {{ currentThemeName }}</p>
    <button @click="toggleTheme">Toggle Theme</button>
  </div>
</template>
```

### 2. Using Theme Toggle Component

```vue
<template>
  <!-- Simple toggle button -->
  <ThemeToggle show-toggle-button />
  
  <!-- Full mode selector -->
  <ThemeToggle show-mode-selector show-status />
</template>
```

### 3. Page-Specific Theme Override

```vue
<template>
  <!-- Force this page to always use light theme -->
  <ThemeProvider page-theme-override="light">
    <v-container>
      <h1>This page is always light themed</h1>
      <!-- Page content -->
    </v-container>
  </ThemeProvider>
</template>
```

### 4. Component-Level Theme Override

```vue
<template>
  <!-- Force a specific section to use dark theme -->
  <ThemeProvider force-theme="dark">
    <v-card class="bg-general-dialog">
      <v-card-title class="text-on-general-dialog">
        Dark Section
      </v-card-title>
      <v-card-text>
        This section always uses dark theme
      </v-card-text>
    </v-card>
  </ThemeProvider>
</template>
```

## ??? Theme Modes

The system supports four theme modes:

- **`auto`** (default): Uses app-specific theme (VpnHoodClient = light, VpnHoodConnect = dark)
- **`light`**: Forces light theme
- **`dark`**: Forces dark theme  
- **`system`**: Follows system preference (prefers-color-scheme)

## ?? Advanced Usage

### Custom Theme Logic

```ts
import { useTheme } from '@/composables/useTheme';

const {
  setThemeMode,
  forceThemeForPage,
  getThemeColors,
  hasThemeOverride
} = useTheme();

// Set theme mode programmatically
setThemeMode('dark');

// Force theme for specific page
forceThemeForPage('settings', 'VpnHoodClient');

// Get current theme colors
const colors = getThemeColors();
console.log('Primary color:', colors.primary);

// Check if page has override
if (hasThemeOverride('home')) {
  console.log('Home page has theme override');
}
```

### Theme-Aware Styling

```vue
<template>
  <div :class="getThemeClass()">
    <!-- Content adapts to theme -->
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '@/composables/useTheme';

const { getThemeClass, isDark } = useTheme();
</script>

<style scoped>
.theme-light .special-element {
  background: #ffffff;
  color: #000000;
}

.theme-dark .special-element {
  background: #1a1a1a;
  color: #ffffff;
}
</style>
```

## ?? Theme Colors

### Using Theme Colors in Templates

```vue
<template>
  <!-- Use semantic color names -->
  <v-card class="bg-general-dialog">
    <v-card-title class="text-on-general-dialog">
      Title
    </v-card-title>
    <v-card-text class="text-general-dialog-text">
      Content
    </v-card-text>
  </v-card>
  
  <!-- Use button styles -->
  <v-btn class="bg-btn-style-1 text-on-btn-style-1">
    Primary Action
  </v-btn>
</template>
```

### Available Color Categories

- **Background colors**: `bg-app-bg`, `bg-general-dialog`, `bg-config-card-bg`
- **Text colors**: `text-on-background`, `text-general-dialog-text`
- **Button styles**: `bg-btn-style-1` through `bg-btn-style-7`
- **State colors**: `bg-active-server`, `bg-fastest-server`
- **Alert colors**: `bg-dialog-alert`, `bg-warning`

## ?? Responsive Theme Controls

### Navigation Drawer Integration

The theme system is integrated into the NavigationDrawer:

```vue
<!-- Theme selector in navigation -->
<v-list-item class="border-b">
  <v-list-item-title class="d-flex align-center justify-space-between">
    <div class="d-flex align-center">
      <v-icon icon="mdi-palette" />
      <span class="ms-3">Theme: {{ currentThemeName }}</span>
    </div>
    <ThemeToggle show-toggle-button size="small" />
  </v-list-item-title>
</v-list-item>
```

## ?? Migration Guide

### From Old System

**Before:**
```vue
<!-- Static theme based on app type -->
<v-app>
  <div class="bg-app-bg">
    Content
  </div>
</v-app>
```

**After:**
```vue
<!-- Dynamic theme with user control -->
<v-app :class="getThemeClass()">
  <div class="bg-app-bg">
    <ThemeToggle show-toggle-button />
    Content
  </div>
</v-app>
```

### Adding Theme Override to Existing Pages

1. Wrap page content with `ThemeProvider`
2. Set `page-theme-override` prop for pages requiring specific themes
3. Use semantic color classes instead of hardcoded colors

## ?? Best Practices

### 1. Use Semantic Color Names
```vue
<!-- ? Good -->
<v-card class="bg-general-dialog text-on-general-dialog">

<!-- ? Avoid -->
<v-card class="bg-white text-black">
```

### 2. Provide Theme Controls
```vue
<!-- ? Good - Give users control -->
<ThemeToggle show-toggle-button />

<!-- ? Avoid - Forcing users into specific themes -->
<div class="force-dark-theme">
```

### 3. Respect System Preferences
```ts
// ? Good - Use system mode when appropriate
setThemeMode('system');

// ? Avoid - Ignoring user preferences
setThemeMode('dark'); // Always
```

### 4. Handle Special Cases Gracefully
```vue
<!-- ? Good - Specific pages can override when needed -->
<ThemeProvider page-theme-override="light" v-if="isDocumentationPage">
  <DocumentationContent />
</ThemeProvider>
```

## ?? Troubleshooting

### Common Issues

1. **Theme not persisting**: Check localStorage permissions
2. **Colors not updating**: Ensure components use theme classes
3. **System preference not detected**: Verify browser support for `prefers-color-scheme`

### Debug Information

```ts
import { useTheme } from '@/composables/useTheme';

const theme = useTheme();
console.log('Current theme:', theme.effectiveTheme.value);
console.log('Is dark:', theme.isDark.value);
console.log('System prefers dark:', theme.systemPrefersDark.value);
```

## ?? API Reference

### useTheme Composable

```ts
const {
  // State
  currentThemeMode,      // Current theme mode
  isDark,               // Is current theme dark
  currentThemeName,     // Display name of current theme
  effectiveTheme,       // Actual theme being used
  
  // Methods
  setThemeMode,         // Set theme mode
  toggleTheme,          // Toggle between light/dark
  forceThemeForPage,    // Override theme for specific page
  getThemeClass,        // Get CSS classes for current theme
  getThemeColors,       // Get current theme color values
} = useTheme();
```

### ThemeProvider Props

```ts
interface Props {
  forceTheme?: 'light' | 'dark' | AvailableThemes;
  pageThemeOverride?: 'light' | 'dark' | AvailableThemes;
  routeName?: string;
  inherit?: boolean;
}
```

### ThemeToggle Props

```ts
interface Props {
  showModeSelector?: boolean;  // Show full mode selector
  showToggleButton?: boolean;  // Show simple toggle button
  showStatus?: boolean;        // Show current theme status
  size?: 'small' | 'default' | 'large';
}
```

This theming system provides a flexible, user-friendly way to handle themes while maintaining the specific requirements of different pages and app contexts.