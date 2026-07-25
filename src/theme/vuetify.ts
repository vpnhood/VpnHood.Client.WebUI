import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import { en, fa } from 'vuetify/locale';
// Components rendered as <v-*> are imported by vite-plugin-vuetify's autoImport. These four are
// imported by hand because the aliases below reference them as values, not as template tags.
import { VCard, VAlert, VBtn, VSheet } from 'vuetify/components';
import { AppName } from '@/helpers/UiConstants';
import { vhClientThemeColors, vhConnectThemeColors } from '@/theme/themes';
import { vuetifyDefaults, buttonAliases } from '@/theme/defaults';

export default createVuetify({
  locale: {
    locale: 'en',
    fallback: 'en',
    messages: { en, fa },
    rtl: { ar: true, fa: true, isRtl: true },
  },
  aliases: {
    GradSheet: VSheet,
    TonalIconBtn: VBtn,
    HomeConfigBtn: VBtn,
    ConfigCard: VCard,
    CardOnGrad: VCard,
    AlertWarning: VAlert,
    AlertInfo: VAlert,
    AlertNote: VAlert,
    ...buttonAliases, // BtnStyle1..7
  },
  defaults: vuetifyDefaults,
  theme: {
    defaultTheme: AppName.VpnHoodClient,
    themes: {
      VpnHoodClient: {
        dark: true,
        colors: vhClientThemeColors,
        variables: {
          'medium-emphasis-opacity': '0.8',
          'border-opacity': '0.03',
          'disabled-opacity': '0.6',
        },
      },
      VpnHoodConnect: {
        dark: true,
        colors: vhConnectThemeColors,
        variables: {
          'medium-emphasis-opacity': '0.8',
          'border-opacity': '0.03',
        },
      },
    },
  },
});
