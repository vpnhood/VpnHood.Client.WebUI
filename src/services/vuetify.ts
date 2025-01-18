import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as directives from 'vuetify/directives';
import { en, fa } from 'vuetify/locale';
import * as components from 'vuetify/components';
import { VIcon } from 'vuetify/components/VIcon';
import { VAlert } from 'vuetify/components/VAlert';
import { VBtn } from 'vuetify/components/VBtn';
import { VChip } from 'vuetify/components/VChip';
import i18n from '@/locales/i18n';

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
    100:"#3ff6a9",
    200:"#15f5ba",
    300:"#23c99d"
  },
  yellow:{
    100:"#ffe066",
    200:"#ffe648",
    300: "#704d00"
  },
  cream:{
    100:"#e7b481"
  },
  red:{
    100: "#ff5252"
  },
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
    HomeConfigBtn: VBtn,
    HomeConfigChip: VChip,
    WarningAlert: VAlert,
    InfoAlert: VAlert,
    NoteAlert: VAlert,
  },
  defaults: {
    VSheet: {
      class: "pa-4",
      color: "background",
      height: "100%"
    },
    VCard:{
      color:'card-bg',
      class: 'py-2'
    },
    VCardTitle:{
      class: "pt-1 pb-0"
    },
    VCardSubtitle:{
      class: "text-disabled text-wrap text-caption"
    },
    HomeConfigBtn:{
      block: true,
      depressed: true,
      variant:'text',
      size:'small',
      class: 'config-item'
    },
    HomeConfigChip:{
      variant:'text',
      class: 'text-capitalize text-caption text-disabled text-truncate limited-width-to-truncate px-0'
    },
    PremiumIcon:{
      icon:"mdi-crown",
      size:"18"
    },
    WarningAlert:{
      icon: false,
      type: "warning",
      density: "compact",
      class: "text-caption",
      border: "start",
      title: i18n.global.t("ALERT")
    },
    NoteAlert:{
      icon: false,
      type: "note",
      density: "compact",
      class: "text-caption",
      border: "start",
      variant: 'tonal',
      title: i18n.global.t("NOTE")
    },
    InfoAlert:{
      icon: false,
      type: "info",
      density: "compact",
      class: "text-caption",
      border: "start",
      variant: 'tonal',
      title: i18n.global.t("INFO")
    }
  },
  theme: {
    defaultTheme: 'VpnHood',
    themes: {
      VpnHood: {
        dark: false,
        colors: {
          /*** Backgrounds ***/
          background: myColors.gray['100'],
          'on-background': '#000000',
          'colored-bg-light': myColors.blue['200'],
          'colored-bg-dark': myColors.blue['300'],
          'app-bg': myColors.blue['400'],

          /*** Home page gradient background ***/
          'home-bg-grad-1': myColors.blue['200'],
          'home-bg-grad-2': myColors.blue['300'],

          /*** Home page connect btn ***/
          'connect-btn-disconnected-grad-1': myColors.blue['100'],
          'connect-btn-disconnected-grad-2': myColors.green['100'],
          'connect-btn-connected': myColors.blue['100'],
          'on-connect-btn-disconnected': myColors.blue['400'],
          'on-connect-btn-connected': '#ffffff',

          /*** Home page extend session countdown ***/
          'count-down-normal': myColors.green['300'],
          'count-down-alert': myColors.yellow['200'],
          'count-down-warning': myColors.red['100'],
          'extent-session-btn': myColors.yellow['200'],
          'on-extent-session-btn': myColors.blue['400'],

          /*** Home page go premium btn ***/
          'go-premium-btn': myColors.blue['100'],
          'on-go-premium-btn': myColors.blue['200'],

          /*** Home page 'Down' and 'Up' color ***/
          'connection-speed': myColors.blue['100'],

          /*** Home page total bandwidth ***/
          'total-bandwidth': myColors.blue['100'],

          /*** Home page access key expired date ***/
          'expire-date-warning': myColors.purple['100'],
          'expire-date-alert': myColors.red['100'],

          /*** Home page config buttons ***/
          'config-btn-bg': myColors.blue['300'],
          'on-config-btn-bg': myColors.blue['100'],


          /*** Cards ***/
          'card-bg': '#ffffff',
          'on-card-border': myColors.gray['200'],

          /*** States ***/
          active: myColors.green['300'],
          'on-active': myColors.blue['400'],
          highlight: myColors.green['300'],
          'enable-premium': myColors.blue['400'],
          'disable-premium': myColors.yellow['200'],

          /*** Alerts ***/
          info: myColors.green['300'],
          note: myColors.purple['200'],
          error: myColors.red['100'],
          warning: myColors.yellow['100'],
          'on-warning': myColors.yellow['300'],

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
        },
        variables: {
          'medium-emphasis-opacity': '0.8',
          'border-color': '#000000'
        }
      },
      VpnHoodConnect: {
        dark: true,
        colors: {
          /*** Backgrounds ***/
          background: myColors.purple['500'],
          'on-background':'#ffffff',
          'colored-bg-light': myColors.purple['500'],
          'colored-bg-dark': myColors.purple['600'],
          'app-bg': myColors.purple['500'],

          /*** Home page gradient background ***/
          'home-bg-grad-1': myColors.purple['500'],
          'home-bg-grad-2': myColors.purple['500'],

          /*** Home page connect btn ***/
          'connect-btn-disconnected-grad-1': myColors.cream['100'],
          'connect-btn-disconnected-grad-2': myColors.cream['100'],
          'connect-btn-connected': myColors.purple['200'],
          'on-connect-btn-disconnected': myColors.purple['300'],
          'on-connect-btn-connected': '#ffffff',

          /*** Home page extend session countdown ***/
          'count-down-normal': myColors.green['200'],
          'count-down-alert': myColors.yellow['200'],
          'count-down-warning': myColors.red['100'],
          'extent-session-btn': myColors.yellow['200'],
          'on-extent-session-btn': myColors.purple['600'],

          /*** Home page go premium btn ***/
          'go-premium-btn': myColors.cream['100'],
          'on-go-premium-btn': myColors.purple['500'],

          /*** Home page 'Down' and 'Up' color ***/
          'connection-speed': myColors.purple['200'],

          /*** Home page total bandwidth ***/
          'total-bandwidth': myColors.purple['200'],

          /*** Home page access key expired date ***/
          'expire-date-warning': myColors.purple['100'],
          'expire-date-alert': myColors.red['100'],

          /*** Home page config buttons ***/
          'config-btn-bg': myColors.purple['500'],
          'on-config-btn-bg': myColors.cream['100'],

          /*** Cards ***/
          'card-bg': myColors.purple['400'],
          'on-card-border': myColors.purple['500'],

          /*** States ***/
          active: myColors.green['100'],
          'on-active': myColors.purple['500'],
          highlight: myColors.purple['200'],
          'enable-premium': myColors.green['100'],
          'disable-premium': myColors.yellow['200'],

          /*** Alerts ***/
          info: myColors.green['300'],
          note: myColors.purple['100'],
          error: myColors.red['100'],
          warning: myColors.yellow['100'],
          'on-warning': myColors.yellow['300'],

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
        },
        variables: {
          'medium-emphasis-opacity': '0.8',
          'border-color': '#000000'
        }
      }
    }
  }
});
