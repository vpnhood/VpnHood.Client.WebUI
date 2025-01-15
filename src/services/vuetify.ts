import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as directives from 'vuetify/directives';
import { en, fa } from 'vuetify/locale';
import * as components from 'vuetify/components';
import { VIcon } from 'vuetify/components/VIcon';
import { VpnHoodApp } from '@/services/VpnHoodApp';

const myColors = {
  gray:{
    100: "#f3f3f3",
    200: "#efefef",
    300: "#eaeaea",
    400: "#bebebe",
    500: "#929292",
    600: "#888888ff",
    700: "#3f3f3f"
  },
  blue:{
    100:"#16a3fe",
    200:"#1940b0",
    300:"#122272",
    400:"#06124b",
  },
  purple:{
    100:"#8d9fe4",
    200:"#7b7afe",
    300:"#2f296e",
    400:"#211951",
    500:"#150e3d",
    600:"#0b0b24"
  },
  green:{
    100:"#15f5ba",
    200:"#23c99d"
  },
  yellow:{
    100:"#ffe066",
    200:"#ffe648",
  }
}
function isPremiumFeaturesAvailable(): boolean{
  if (!VpnHoodApp.instance.data.features.isPremiumFlagSupported)
    return true;
  return VpnHoodApp.instance.data.state.clientProfile?.isPremiumAccount === true;
}

export default createVuetify({
  components,
  directives,
  locale: {
    locale: 'en',
    fallback: 'en',
    messages: { en, fa },
    rtl: {
      ar: true,
      fa: true,
      isRtl: true
    }
  },
  aliases: {
    PremiumIcon: VIcon,
  },
  defaults: {
    VSheet: {
      class: "pa-4",
      color: "background",
      height: "100%"
    },
    PremiumIcon:{
      color:isPremiumFeaturesAvailable() ? 'enable-premium' : 'disable-premium',
      icon:"mdi-crown",
      size:"18"
    }
  },
  theme: {
    defaultTheme: 'VpnHood',
    variations: {
      colors: ['background'],
      lighten: 2,
      darken: 4,
    },
    themes: {
      VpnHood: {
        dark: false,
        colors: {
          background: myColors.gray['100'],
          'on-background':'#000000',
          'card-bg': '#ffffff',
          active: myColors.green['200'],
          highlight: myColors.green['200'],
          'enable-premium':myColors.blue['400'],
          'disable-premium':myColors.yellow['100'],

          'ui-tertiary': '#16a3fe',
          surface: '#ffffff',
          'on-surface': '#212121',
          primary: '#1940b0',
          'primary-darken-1': '#122272',
          'primary-darken-2': '#06124b',
          secondary: '#23c99d',
          'on-secondary': '#ffffff',
          'secondary-lighten-1': '#3ff6a9',
          'on-secondary-lighten-1': '#ffffff',
          'tertiary': '#16a3fe',
          'on-tertiary': '#ffffff',
          'purple': '#7b7afe',
          'purple-lighten-1': '#8d9fe4',
          'on-purple-lighten-1': '#ffffff',
          'purple-lighten-2': '#f0f3ff',
          'gray': '#3f3f3f',
          'gray-lighten-1': '#888888ff',
          'gray-lighten-2': '#929292',
          'gray-lighten-3': '#bebebe',
          'gray-lighten-4': '#eaeaea',
          'gray-lighten-5': '#efefef',
          'gray-lighten-6': '#f3f3f3',
          error: '#ff5252',
          info: '#7b7afe',
          success: '#4caf50',
          warning: '#ffe066',
          'on-warning': '#704d00'
        },
        variables: {
          'medium-emphasis-opacity': '0.8',
          'border-color': '#000000'
        }
      },
      VpnHoodConnect: {
        dark: true,
        colors: {
          background: myColors.purple['500'],
          'on-background':'#ffffff',
          'card-bg': myColors.purple['400'],
          active: myColors.green['100'],
          highlight: myColors.purple['200'],
          'enable-premium':myColors.green['100'],
          'disable-premium':myColors.yellow['100'],

          'ui-tertiary': '#7b7afe',
          surface: '#ffffff',
          'on-surface': '#212121',
          'primary-lighten-1': '#2f296e',
          primary: '#211951',
          'primary-darken-1': '#211951',
          'primary-darken-2': '#150e3d',
          'primary-darken-4': '#0b0b24',
          secondary: '#7b7afe',
          'on-secondary': '#ffffff',
          'secondary-lighten-1': '#15f5ba',
          'secondary-lighten-2': '#23c99d',
          'on-secondary-lighten-1': '#ffffff',
          'tertiary-lighten-1': '#ffe648',
          'tertiary': '#e7b481',
          'on-tertiary': '#ffffff',
          'purple': '#7b7afe',
          'purple-lighten-1': '#8d9fe4',
          'on-purple-lighten-1': '#ffffff',
          'purple-lighten-2': '#f0f3ff',
          'gray': '#3f3f3f',
          'gray-lighten-1': '#888888ff',
          'gray-lighten-2': '#929292',
          'gray-lighten-3': '#bebebe',
          'gray-lighten-4': '#eaeaea',
          'gray-lighten-5': '#f3f3f3',
          error: '#ff5252',
          info: '#2196F3',
          success: '#4caf50',
          warning: '#ffe066',
          'on-warning': '#704d00'
        },
        variables: {
          'medium-emphasis-opacity': '0.8',
          'border-color': '#000000'
        }
      }
    }
  }
});
