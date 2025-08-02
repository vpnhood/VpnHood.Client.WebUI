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
import { AppName } from '@/helpers/UiConstants';

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
    20: "#eaeff6",
    100:"#16a3fe",
    200:"#1940b0",
    300:"#122272",
    400:"#06124b",
    500:"#030b30"
  },
  purple:{
    20:"#e1e1ff",
    100:"#8d9fe4",
    200:"#7b7afe",
    300:"#2f296e",
    400:"#211951",
    500:"#150e3d",
    600:"#0b0b24"
  },
  green:{
    20:"#d3eee7",
    100:"#3ff6a9",
    200:"#15f5ba",
    300:"#23c99d",
    400:"#078362",
  },
  yellow:{
    50:"#fce68f",
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

interface IThemeColorNames {
  [key: string]: string;

  background: string,
  'on-background': string,
  'colored-bg-light': string,
  'colored-bg-dark': string,
  'app-bg': string,

  'app-bar': string,
  'on-app-bar': string,

  'navigation-drawer': string,
  'navigation-drawer-header': string,
  'navigation-drawer-version': string,

  'home-app-bar': string,

  /*** Home page gradient background ***/
  'home-bg-grad-1': string,
  'home-bg-grad-2': string,

  /*** Home page connect btn ***/
  'connect-btn-disconnected-grad-1': string,
  'connect-btn-disconnected-grad-2': string,
  'connect-btn-connected': string,
  'on-connect-btn-disconnected': string,
  'on-connect-btn-connected': string,

  /*** Home page extend session countdown ***/
  'count-down-normal': string,
  'count-down-alert': string,
  'count-down-warning': string,

  /*** Home page go premium btn ***/
  'go-premium-btn': string,
  'on-go-premium-btn': string,

  /*** Promote premium pages ***/
  'promote-premium-border': string,
  'promote-premium-color-premium': string,
  'on-promote-premium-color-premium': string,
  'promote-premium-color-free': string,
  'on-promote-premium-color-free': string,
  'premium-features-icon': string,
  'premium-code-btn': string,
  'purchase-subscription-btn': string,
  'on-purchase-subscription-btn': string,
  'activate-code-btn': string,
  'on-activate-code-btn': string,

  'suppress-snackbar': string,
  'on-suppress-snackbar': string,

  'update-snackbar-alert': string,
  'update-snackbar-warning': string,
  'btn-on-update-snackbar': string,

  /*** Home page 'Down' and 'Up' color ***/
  'connection-speed': string,

  /*** Home page total bandwidth ***/
  'total-bandwidth': string,

  /*** Home page access key expired date ***/
  'expire-date-alert': string,
  'expire-date-warning': string,

  /*** Home page config buttons ***/
  'config-btn-bg': string,
  'on-config-btn-bg': string,

  /*** Servers list ***/
  'active-server': string,
  'fastest-server': string,
  'active-server-chip': string,
  'on-active-server-chip': string,

  /*** Expansion panels on servers list ***/
  'expansion-panels': string,
  'on-expansion-panels': string,
  'expansion-panels-servers-list': string,
  'active-profile-radio': string,
  'inactive-profile-radio': string,
  'profile-menu-btn': string,

  /*** Config card ***/
  'config-card-bg': string,
  'zebra-on-config-card-bg': string,
  'config-card-on-expansion-panel': string,

  /*** Light dialog ***/
  'dialog-light': string,
  'on-dialog-light': string,
  'dialog-light-text': string,

  /*** Dark dialog ***/
  'dialog-dark': string,
  'on-dialog-dark': string,
  'dialog-dark-text': string,

  'grad-bg-container-bg': string,

  'tonal-icon-btn': string,

  'card-on-grad-bg': string,

  'general-dialog': string,
  'on-general-dialog': string,
  'general-dialog-text': string,

  /*** Alert dialog ***/
  'dialog-alert': string,
  'on-dialog-alert': string,
  'dialog-alert-text': string,
  'dialog-alert-btn': string,

  'sample-ip-filter-bg': string,
  'sample-ip-filter-text': string,

  'btn-style-1': string,
  'on-btn-style-1': string,

  'btn-style-2': string,
  'on-btn-style-2': string,

  'btn-style-3': string,
  'on-btn-style-3': string,

  'btn-style-4': string,

  'btn-style-5': string,
  'on-btn-style-5': string,

  'btn-style-6': string,
  'on-btn-style-6': string,

  'switch-btn': string,

  'connection-circle-border': string,

  /*** States ***/
  active: string,
  'on-active': string,
  highlight: string,
  'enable-premium': string,
  'disable-premium': string,

  'disconnect-warning': string,
  'on-disconnect-warning': string,

  'version-on-home-debug': string,
  'on-version-on-home-debug': string,

  /*** Alerts ***/
  info: string,
  'on-info': string,
  note: string,
  'on-note': string,
  error: string,
  warning: string,
  'on-warning': string,

  /*** Scrollbar for windows ***/
  'scroll-track': string,
  'scroll-thumb': string,
  'scroll-thumb-hover': string,


  'skeleton-loader': string,
}

const vhConnectThemeColors: IThemeColorNames = {
  /*** Backgrounds ***/
  background: myColors.purple['500'],
  'on-background':'#ffffff',
  'colored-bg-light': myColors.purple['500'],
  'colored-bg-dark': myColors.purple['600'],
  'app-bg': myColors.purple['500'],

  'app-bar': myColors.purple['500'],
  'on-app-bar': '#ffffff',
  'skeleton-loader': myColors.purple['300'],

  /*** Navigation drawer ***/
  'navigation-drawer': myColors.purple['400'],
  'navigation-drawer-header': myColors.purple['500'],
  'navigation-drawer-version': myColors.green['200'],

  'home-app-bar': '#ffffff',

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
  'count-down-alert': myColors.cream['100'],
  'count-down-warning': myColors.red['100'],

  /*** Home page go premium btn ***/
  'go-premium-btn': myColors.cream['100'],
  'on-go-premium-btn': myColors.purple['500'],

  /*** Promote premium pages ***/
  'promote-premium-border': myColors.purple['200'],
  'promote-premium-color-premium': myColors.green['200'],
  'on-promote-premium-color-premium': myColors.purple['600'],
  'promote-premium-color-free': myColors.purple['200'],
  'on-promote-premium-color-free': '#ffffff',
  'premium-features-icon': myColors.purple['200'],
  'premium-code-btn': myColors.purple['200'],
  'purchase-subscription-btn': myColors.green['200'],
  'on-purchase-subscription-btn': myColors.purple['600'],
  'activate-code-btn': myColors.purple['200'],
  'on-activate-code-btn': '#ffffff',

  'suppress-snackbar': myColors.cream['100'],
  'on-suppress-snackbar': myColors.gray['800'],

  'update-snackbar-alert': myColors.purple['200'],
  'update-snackbar-warning': myColors.cream['100'],
  'btn-on-update-snackbar': myColors.purple['500'],

  /*** Home page 'Down' and 'Up' color ***/
  'connection-speed': myColors.purple['200'],

  /*** Home page total bandwidth ***/
  'total-bandwidth': myColors.purple['200'],

  /*** Home page access key expired date ***/
  'expire-date-alert': myColors.purple['100'],
  'expire-date-warning': myColors.red['100'],

  /*** Home page config buttons ***/
  'config-btn-bg': myColors.purple['500'],
  'on-config-btn-bg': myColors.cream['100'],

  /*** Servers list ***/
  'active-server': myColors.green['200'],
  'fastest-server': myColors.purple['200'],
  'active-server-chip': myColors.green['200'],
  'on-active-server-chip': myColors.purple['500'],

  /*** Expansion panels on servers list ***/
  'expansion-panels': myColors.purple['400'],
  'on-expansion-panels': '#ffffff',
  'expansion-panels-servers-list': myColors.purple['400'],
  'active-profile-radio': myColors.green['300'],
  'inactive-profile-radio': myColors.gray['300'],
  'profile-menu-btn': myColors.gray['400'],

  /*** Config card ***/
  'config-card-bg': myColors.purple['400'],
  'zebra-on-config-card-bg': myColors.purple['500'],
  'config-card-on-expansion-panel': myColors.purple['400'],

  /*** Light dialog ***/
  'dialog-light': myColors.green['200'],
  'on-dialog-light': '#ffffff',
  'dialog-light-text': '#ffffff',

  /*** Dark dialog ***/
  'dialog-dark': myColors.purple['400'],
  'on-dialog-dark': myColors.cream['100'],
  'dialog-dark-text': '#ffffff',

  'grad-bg-container-bg': myColors.purple['600'],

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

  'btn-style-3': myColors.cream['100'],
  'on-btn-style-3': myColors.purple['500'],

  'btn-style-4': myColors.purple['200'],

  'btn-style-5': myColors.gray['300'],
  'on-btn-style-5': '#ffffff',

  'btn-style-6': '#ffffff',
  'on-btn-style-6': myColors.purple['500'],

  'switch-btn': myColors.purple['200'],

  'connection-circle-border': myColors.cream['100'],

  /*** States ***/
  active: myColors.green['200'],
  'on-active': myColors.purple['500'],
  highlight: myColors.purple['200'],
  'enable-premium': myColors.green['200'],
  'disable-premium': myColors.cream['100'],

  'disconnect-warning': myColors.purple['100'],
  'on-disconnect-warning': myColors.purple['600'],

  'version-on-home-debug': myColors.cream['100'],
  'on-version-on-home-debug': myColors.purple['600'],

  /*** Alerts ***/
  info: myColors.purple['400'],
  'on-info': myColors.gray['400'],
  note: myColors.purple['400'],
  'on-note': myColors.purple['100'],
  error: myColors.red['100'],
  warning: myColors.purple['400'],
  'on-warning': myColors.cream['100'],

  /*** Scrollbar for windows ***/
  'scroll-track': myColors.purple['500'],
  'scroll-thumb': myColors.purple['300'],
  'scroll-thumb-hover': myColors.purple['200'],
}

const vhClientThemeColors: IThemeColorNames = {

  /*** Backgrounds ***/
  background: myColors.blue['20'],
  'on-background': '#000000',
  'colored-bg-light': myColors.blue['300'],
  'colored-bg-dark': myColors.blue['400'],
  'app-bg': myColors.blue['400'],
  'app-bar': myColors.blue['200'],
  'on-app-bar': '#ffffff',
  'skeleton-loader': myColors.blue['300'],

  /*** Navigation drawer ***/
  'navigation-drawer': "#ffffff",
  'navigation-drawer-header': myColors.blue['300'],
  'navigation-drawer-version': myColors.green['200'],

  'home-app-bar': '#ffffff',

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

  /*** Home page go premium btn ***/
  'go-premium-btn': myColors.green['300'],
  'on-go-premium-btn': myColors.blue['200'],

  /*** Promote premium pages ***/
  'promote-premium-border': myColors.blue['100'],
  'promote-premium-color-premium': myColors.green['200'],
  'on-promote-premium-color-premium': myColors.blue['500'],
  'promote-premium-color-free': myColors.blue['100'],
  'on-promote-premium-color-free': '#ffffff',
  'premium-features-icon': myColors.blue['100'],
  'premium-code-btn': myColors.blue['100'],
  'purchase-subscription-btn': myColors.green['200'],
  'on-purchase-subscription-btn': myColors.blue['500'],
  'activate-code-btn': myColors.blue['200'],
  'on-activate-code-btn': '#ffffff',

  'suppress-snackbar': myColors.purple['200'],
  'on-suppress-snackbar': myColors.purple['20'],

  'update-snackbar-alert': myColors.blue['20'],
  'update-snackbar-warning': myColors.green['200'],
  'btn-on-update-snackbar': myColors.blue['400'],

  /*** Home page 'Down' and 'Up' color ***/
  'connection-speed': myColors.blue['100'],

  /*** Home page total bandwidth ***/
  'total-bandwidth': myColors.blue['100'],

  /*** Home page access key expired date ***/
  'expire-date-alert': myColors.purple['100'],
  'expire-date-warning': myColors.red['100'],

  /*** Home page config buttons ***/
  'config-btn-bg': myColors.blue['300'],
  'on-config-btn-bg': myColors.blue['100'],

  /*** Servers list ***/
  'active-server': myColors.green['300'],
  'fastest-server': myColors.blue['200'],
  'active-server-chip': myColors.green['300'],
  'on-active-server-chip': '#ffffff',

  /*** Expansion panels on servers list ***/
  'expansion-panels': '#ffffff',
  'on-expansion-panels': myColors.blue['400'],
  'expansion-panels-servers-list': myColors.blue['20'],
  'active-profile-radio': myColors.green['300'],
  'inactive-profile-radio': myColors.gray['300'],
  'profile-menu-btn': myColors.gray['400'],

  /*** Config card ***/
  'config-card-bg': '#ffffff',
  'zebra-on-config-card-bg': myColors.blue['400'],
  'config-card-on-expansion-panel': myColors.blue['20'],

  /*** Light dialog ***/
  'dialog-light': myColors.green['200'],
  'on-dialog-light': '#ffffff',
  'dialog-light-text': '#ffffff',

  /*** Dark dialog ***/
  'dialog-dark': myColors.purple['400'],
  'on-dialog-dark': myColors.cream['100'],
  'dialog-dark-text': '#ffffff',

  'grad-bg-container-bg': myColors.blue['500'],

  'tonal-icon-btn': myColors.blue['100'],

  'card-on-grad-bg': myColors.blue['200'],

  'general-dialog': "#ffffff",
  'on-general-dialog': myColors.blue['300'],
  'general-dialog-text': '#000000',

  /*** Alert dialog ***/
  'dialog-alert': '#ffffff',
  'on-dialog-alert': myColors.blue['400'],
  'dialog-alert-text': myColors.gray['800'],
  'dialog-alert-btn': myColors.blue['400'],

  'sample-ip-filter-bg': myColors.green['400'],
  'sample-ip-filter-text': myColors.gray['100'],

  'btn-style-1': myColors.blue['300'],
  'on-btn-style-1': '#ffffff',

  'btn-style-2': myColors.blue['100'],
  'on-btn-style-2': '#ffffff',

  'btn-style-3': myColors.cream['100'],
  'on-btn-style-3': myColors.purple['500'],

  'btn-style-4': myColors.blue['200'],

  'btn-style-5': myColors.gray['800'],
  'on-btn-style-5': '#ffffff',

  'btn-style-6': '#ffffff',
  'on-btn-style-6': myColors.blue['400'],

  'switch-btn': myColors.blue['200'],

  'connection-circle-border': myColors.cream['100'],

  /*** States ***/
  active: myColors.green['300'],
  'on-active': myColors.blue['400'],
  highlight: myColors.blue['200'],
  'enable-premium': myColors.blue['200'],
  'disable-premium': myColors.yellow['200'],

  'disconnect-warning': myColors.yellow['50'],
  'on-disconnect-warning': myColors.yellow['300'],

  'version-on-home-debug': myColors.yellow['200'],
  'on-version-on-home-debug': myColors.blue['400'],

  /*** Alerts ***/
  info: myColors.green['20'],
  'on-info': myColors.green['400'],
  note: myColors.purple['20'],
  'on-note': myColors.purple['300'],
  error: myColors.red['100'],
  warning: myColors.yellow['50'],
  'on-warning': myColors.yellow['300'],

  /*** Scrollbar for windows ***/
  'scroll-track': myColors.blue['20'],
  'scroll-thumb': myColors.gray['500'],
  'scroll-thumb-hover': myColors.green['300'],
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
    BtnStyle5: VBtn,
    BtnStyle6: VBtn,
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
      class: "px-4 pb-4 fill-height",
      color: "background",
    },
    VExpansionPanel:{
      ConfigCard:{
        color:'config-card-on-expansion-panel',
      }
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
      variant: "flat",
      rounded: "pill",
      color: 'btn-style-3',
      class: "text-transform-none"
    },
    BtnStyle4:{
      variant: 'tonal',
      color: 'btn-style-4',
      class: "text-transform-none justify-space-between",
      block: true
    },
    BtnStyle5:{
      variant:'tonal',
      rounded: 'pill',
      density:'comfortable',
      color: 'btn-style-5',
      class: "text-transform-none"
    },
    BtnStyle6:{
      variant:'flat',
      rounded: 'pill',
      color: 'btn-style-6',
      class: "text-transform-none"
    },
    TonalIconBtn: {
      variant: "tonal",
      size: "30",
      color: "tonal-icon-btn"
    },

    ConfigCard:{
      color:'config-card-bg',
      class: 'config-card',
      rounded: 'lg',
      VCardTitle:{
        class: "d-flex justify-space-between align-center pt-3 pb-0"
      },
      VCardSubtitle:{
        class: "text-disabled text-wrap text-caption"
      },
      VSwitch:{
        class: 'px-2',
        color: 'switch-btn',
        density: 'compact',
        hideDetails: true
      }
    },
    HomeConfigBtn:{
      block: true,
      variant:'text',
      size:'small',
      class: 'config-item',

    },
    PremiumIcon:{
      icon:"mdi-crown",
      size:"18"
    },

    AlertWarning:{
      icon: false,
      type: "warning",
      density: "compact",
      rounded: "lg",
      class: "text-caption pt-1 text-start",
      VAlertTitle:{
        style: "font-weight: 600; font-size: 0.9rem;"
      }
    },
    AlertNote:{
      icon: false,
      type: "note",
      density: "compact",
      rounded: "lg",
      class: "text-caption pt-1 text-start",
      VAlertTitle:{
        style: "font-weight: 600; font-size: 0.9rem;"
      }
    },
    AlertInfo:{
      icon: false,
      type: "info",
      density: "compact",
      rounded: "lg",
      class: "text-caption pt-1 text-start",
      VAlertTitle:{
        style: "font-weight: 600; font-size: 0.9rem;"
      }
    },
  },
  theme: {
    defaultTheme: AppName.VpnHoodClient,
    themes: {
      VpnHoodClient: {
        dark: false,
        colors: vhClientThemeColors,
        variables: {
          'medium-emphasis-opacity': '0.8',
          'border-opacity': '0.07',
          'disabled-opacity': '0.7'
        }
      },
      VpnHoodConnect: {
        dark: true,
        colors: vhConnectThemeColors,
        variables: {
          'medium-emphasis-opacity': '0.8',
          'border-opacity': '0.03',
        }
      }
    }
  }
});
