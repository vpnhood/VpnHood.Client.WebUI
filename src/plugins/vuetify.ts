import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import {VBottomSheet} from "vuetify/labs/VBottomSheet";
import {createVuetify} from 'vuetify'
/* temporary color 153 30 52*/
export default createVuetify({
    defaults:{
        VSheet: {
            color: '#eaeaea',
            height: '100%',
            class: 'pa-4',
        },
    },
        components: {
            VBottomSheet,
        },
        theme: {
            defaultTheme: 'VpnHood',
            themes: {
                VpnHood: {
                    dark: true,
                    colors: {
                        background: '#122272',
                        surface: '#FFFFFF',
                        'on-surface': '#212121',
                        primary: '#1940b0',
                        'primary-darken-1': '#122272',
                        'primary-darken-2': '#06124b',
                        secondary: '#23c99d',
                        'on-secondary': '#ffffff',
                        'master-green': '#23c99d',
                        'on-master-green': '#ffffff',
                        'sharp-master-green': '#3ff6a9',
                        'on-sharp-master-green': '#ffffff',
                        'sky-blue': '#16a3fe',
                        'on-sky-blue': '#ffffff',
                        'light-purple': '#8d9fe4',
                        'on-light-purple': '#ffffff',
                        'on-warning': '#704d00',
                        'gray': '#3f3f3f',
                        error: '#ff5252',
                        info: '#2196F3',
                        success: '#4CAF50',
                        warning: '#ffe066',
                    },
                    variables: {
                        'medium-emphasis-opacity': '0.8',
                        'border-color':'#e8e8e8',
                        'border-opacity': 1,
                    },
                },
                VpnHoodConnect: {
                    dark: true,
                    colors: {
                        background: '#211951',
                        surface: '#FFFFFF',
                        'on-surface': '#212121',
                        primary: '#211951',
                        'primary-darken-1': '#211951',
                        'primary-darken-2': '#150e3d',
                        secondary: '#e7b481',
                        'on-secondary': '#ffffff',
                        'master-green': '#e7b481',
                        'on-master-green': '#ffffff',
                        'sharp-master-green': '#e7b481',
                        'on-sharp-master-green': '#ffffff',
                        'sky-blue': '#e7b481',
                        'on-sky-blue': '#ffffff',
                        'light-purple': '#f0f3ff',
                        'on-light-purple': '#ffffff',
                        'on-warning': '#704d00',
                        'gray': '#3f3f3f',
                        error: '#ff5252',
                        info: '#2196F3',
                        success: '#4CAF50',
                        warning: '#ffe066',
                    },
                    variables: {
                        'medium-emphasis-opacity': '0.8',
                        'border-color':'#e8e8e8',
                        'border-opacity': 1,
                    },
                },
            },
        }
    }
)
