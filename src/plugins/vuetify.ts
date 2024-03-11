import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import {createVuetify} from 'vuetify'

export default createVuetify({
        defaults: {
            VSheet: {
                color: '#eaeaea',
                height: '100%',
                class: 'pa-4',
            },
        },
        theme: {
            defaultTheme: 'VpnHood',
            themes: {
                VpnHood: {
                    dark: true,
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
                VpnHoodConnect: {
                    dark: true,
                    colors: {
                        'ui-tertiary': '#7b7afe',
                        background: '#211951',
                        surface: '#ffffff',
                        'on-surface': '#212121',
                        primary: '#211951',
                        'primary-darken-1': '#211951',
                        'primary-darken-2': '#150e3d',
                        secondary: '#7b7afe',
                        'on-secondary': '#ffffff',
                        'secondary-lighten-1': '#15f5ba',
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
        }
    }
)
