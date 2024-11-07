import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import {createVuetify} from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import {en, fa} from "vuetify/locale";

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
            isRtl: true,
        },
    },
        defaults: {
            VSheet: {
                class: 'pa-4 position-relative',
                height: '100%',
            },
        },
        theme: {
            defaultTheme: 'VpnHood',
            themes: {
                VpnHood: {
                    dark: false,
                    colors: {
                        'ui-tertiary': '#16a3fe',
                        background: '#122272',
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
                        'on-warning': '#704d00',
                    },
                    variables: {
                        'medium-emphasis-opacity': '0.8',
                        'border-color': '#000000',
                    },
                },
                VpnHoodConnect: {
                    dark: true,
                    colors: {
                        'ui-tertiary': '#7b7afe',
                        background: '#211951',
                        surface: '#ffffff',
                        'on-surface': '#212121',
                        'primary-lighten-1': '#2f296e',
                        primary: '#211951',
                        'primary-darken-1': '#211951',
                        'primary-darken-2': '#150e3d',
                        'primary-darken-4': '#070819',
                        secondary: '#7b7afe',
                        'on-secondary': '#ffffff',
                        'secondary-lighten-1': '#15f5ba',
                        'secondary-lighten-2': '#23c99d',
                        'on-secondary-lighten-1': '#ffffff',
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
                        'on-warning': '#704d00',
                    },
                    variables: {
                        'medium-emphasis-opacity': '0.8',
                        'border-color': '#000000',
                    },
                },
            },
        },
    }
)
