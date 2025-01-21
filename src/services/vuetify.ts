import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as directives from 'vuetify/directives';
import { en, fa } from 'vuetify/locale';
import * as components from 'vuetify/components';
import { VIcon } from 'vuetify/components/VIcon';
import { VAlert } from 'vuetify/components/VAlert';
import { VBtn } from 'vuetify/components/VBtn';
import { VCard } from 'vuetify/components/VCard';
import i18n from '@/locales/i18n';

const myColors = {
  gray:{
    100: "#f3f3f3",
    200: "#efefef",
    300: "#eaeaea",
    400: "#bebebe",
    500: "#929292",
    600: "#888888ff",
    700: "#3f3f3f",
    800: "#1e1e1e",
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

    BtnStyle1: VBtn,
    BtnStyle2: VBtn,
    BtnStyle3: VBtn,
    BtnStyle4: VBtn,
    TonalIconBtn: VBtn,

    HomeConfigBtn: VBtn,
    ConfigCard: VCard,

    AlertWarning: VAlert,
    AlertInfo: VAlert,
    AlertNote: VAlert,
  },
  defaults: {
    VList:{
      class:"py-0",
    },
    VDialog: {
      maxWidth: "500",
      VCard:{
        rounded:"xl",
        VCardActions:{
          VBtn:{
            variant:"text",
            rounded:"pill",
            class:"font-weight-bold text-transform-none",
            ripple:false
          }
        }
      }
    },
    VBtn: {
      class: "text-transform-none"
    },
    VSheet: {
      class: "pa-4 fill-height",
      color: "background",
    },

    BtnStyle1:{
      variant:'flat',
      rounded: 'pill',
      color: 'btn-style-1',
      class: "text-transform-none font-weight-bold"
    },
    BtnStyle2:{
      variant: "flat",
      rounded: "pill",
      color: 'btn-style-2',
      class: "text-transform-none"
    },
    BtnStyle3:{
      variant: 'tonal',
      color: 'btn-style-3',
      class: "text-transform-none justify-space-between",
      block: true
    },
    BtnStyle4:{
      variant:'tonal',
      rounded: 'pill',
      density:'comfortable',
      color: 'btn-style-4',
      class: "text-transform-none"
    },

    TonalIconBtn: {
      variant: "tonal",
      size: "30",
      color: "tonal-icon-btn"
    },

    ConfigCard:{
      color:'config-card-bg',
      class: 'py-2',
      VCardTitle:{
        class: "d-flex justify-space-between align-center pt-1 pb-0"
      },
      VCardSubtitle:{
        class: "text-disabled text-wrap text-caption"
      },
      VSwitch:{
        class: 'px-2',
        color: 'highlight',
        density: 'compact',
        hideDetails: true
      }
    },
    HomeConfigBtn:{
      block: true,
      depressed: true,
      variant:'text',
      size:'small',
      class: 'config-item',
      VChip:{
        variant:'text',
        size:"small",
        density:"compact",
        color:"disabled",
        class: 'text-capitalize text-caption text-truncate limited-width-to-truncate',
      },
    },
    PremiumIcon:{
      icon:"mdi-crown",
      size:"18"
    },
    AlertWarning:{
      icon: false,
      type: "warning",
      density: "compact",
      class: "text-caption pt-1 text-start",
      border: "start",
      title: i18n.global.t("ALERT"),
      VAlertTitle:{
        style: "font-weight: 600; font-size: 0.9rem;"
      }
    },
    AlertNote:{
      icon: false,
      type: "note",
      density: "compact",
      class: "text-caption pt-1 text-start",
      border: "start",
      variant: 'tonal',
      title: i18n.global.t("NOTE"),
      VAlertTitle:{
        style: "font-weight: 600; font-size: 0.9rem;"
      }
    },
    AlertInfo:{
      icon: false,
      type: "info",
      density: "compact",
      class: "text-caption pt-1 text-start",
      border: "start",
      variant: 'tonal',
      title: i18n.global.t("INFO"),
      VAlertTitle:{
        style: "font-weight: 600; font-size: 0.9rem;"
      }
    },
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

          /*** Config card ***/
          'config-card-bg': '#ffffff',
          'on-config-card-border': myColors.gray['200'],

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
          'border-opacity': '0.3'
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

          'navigation-drawer': myColors.purple['400'],
          'navigation-drawer-version': myColors.green['200'],

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

          /*** Config card ***/
          'config-card-bg': myColors.purple['400'],

          /*** Light dialog ***/
          'dialog-light': myColors.green['200'],
          'on-dialog-light': '#ffffff',
          'dialog-light-text': '#ffffff',

          /*** Dark dialog ***/
          'dialog-dark': myColors.purple['400'],
          'on-dialog-dark': myColors.cream['100'],
          'dialog-dark-text': '#ffffff',

          'grad-bg-container-bg': myColors.purple['600'],

          'promote-connect-btn-icon': myColors.cream['100'],

          'tonal-icon-btn': myColors.purple['200'],

          'card-on-grad-bg': myColors.purple['300'],

          'general-dialog': myColors.purple['500'],
          'on-general-dialog': myColors.purple['200'],
          'general-dialog-text': myColors.gray['300'],

          /*** Alert dialog ***/
          'dialog-alert': myColors.cream['100'],
          'on-dialog-alert': myColors.purple['500'],
          'dialog-alert-text': myColors.gray['800'],
          'dialog-alert-btn': myColors.purple['500'],

          'sample-ip-filter-bg': myColors.gray['800'],
          'sample-ip-filter-text': myColors.gray['400'],

          'btn-style-1': myColors.green['200'],
          'on-btn-style-1': myColors.purple['500'],

          'btn-style-2': myColors.purple['200'],
          'on-btn-style-2': '#ffffff',

          'btn-style-3': myColors.purple['200'],

          'btn-style-4': myColors.gray['300'],
          'on-btn-style-4': '#ffffff',

          'btn-style-5': myColors.gray['300'],
          'on-btn-style-5': '#ffffff',

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
          'border-opacity': '0.03'
        }
      }
    }
  }
});
