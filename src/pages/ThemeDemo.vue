<template>
  <!-- Example: A page that always uses light theme regardless of global theme -->
  <ThemeProvider page-theme-override="light">
    <v-container class="pa-8">
      <div class="d-flex justify-space-between align-center mb-6">
        <h1 class="text-h4">Settings Page</h1>
        <ThemeToggle 
          show-mode-selector
          show-status 
        />
      </div>

      <v-row>
        <v-col cols="12" md="6">
          <v-card class="bg-general-dialog" elevation="2">
            <v-card-title class="text-on-general-dialog">
              Theme Configuration
            </v-card-title>
            <v-card-text class="text-general-dialog-text">
              <p>This page demonstrates theme override functionality:</p>
              <ul>
                <li>This page is forced to use light theme</li>
                <li>The theme toggle affects the global theme</li>
                <li>Page-specific overrides take precedence</li>
              </ul>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <!-- Example: A section with dark theme override -->
          <ThemeProvider force-theme="dark">
            <v-card class="bg-general-dialog" elevation="2">
              <v-card-title class="text-on-general-dialog">
                Dark Section
              </v-card-title>
              <v-card-text class="text-general-dialog-text">
                <p>This section always uses dark theme:</p>
                <v-btn 
                  variant="elevated" 
                  class="bg-btn-style-1 text-on-btn-style-1"
                >
                  Dark Theme Button
                </v-btn>
              </v-card-text>
            </v-card>
          </ThemeProvider>
        </v-col>
      </v-row>

      <!-- Example: Conditional theme based on app type -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-card class="bg-config-card-bg" elevation="2">
            <v-card-title class="text-on-expansion-panels">
              Current App Context
            </v-card-title>
            <v-card-text>
              <p>App Type: {{ vhApp.isConnectApp() ? 'VpnHood Connect' : 'VpnHood Client' }}</p>
              <p>Current Theme: {{ currentThemeName }}</p>
              <p>Is Dark: {{ isDark ? 'Yes' : 'No' }}</p>
              
              <div class="mt-4">
                <v-btn 
                  variant="elevated" 
                  class="bg-btn-style-2 text-on-btn-style-2 mr-2"
                  @click="toggleThemeDemo"
                >
                  Toggle Global Theme
                </v-btn>
                
                <v-btn 
                  variant="outlined" 
                  class="border-highlight"
                  @click="showThemeInfo"
                >
                  Show Theme Info
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </ThemeProvider>
</template>

<script setup lang="ts">
import { VpnHoodApp } from '@/services/VpnHoodApp';
import { useTheme } from '@/composables/useTheme';
import ThemeProvider from '@/components/ThemeProvider.vue';
import ThemeToggle from '@/components/ThemeToggle.vue';

const vhApp = VpnHoodApp.instance;
const { 
  isDark, 
  currentThemeName, 
  toggleTheme, 
  getThemeColors 
} = useTheme();

function toggleThemeDemo() {
  toggleTheme();
}

function showThemeInfo() {
  const colors = getThemeColors();
  alert(`Current Theme Colors:\nPrimary: ${colors.primary}\nBackground: ${colors.background}`);
}
</script>

<style scoped>
/* Page-specific styles that work with theme system */
.theme-demo-section {
  transition: background-color 0.3s ease;
}
</style>
