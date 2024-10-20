import {initializeApp} from 'firebase/app'
import type {FirebaseOptions} from 'firebase/app'
import { getAnalytics } from "firebase/analytics";
import type {Analytics} from 'firebase/analytics'

export class FirebaseApp {
    // VpnHood Connect
    private static connectAppFirebaseConfig: FirebaseOptions = {
        apiKey: "AIzaSyC5gnuq8b2GymbLRjW_XTlFIFxrHvKZ6sU",
        authDomain: "vpnhood-connect.firebaseapp.com",
        projectId: "vpnhood-connect",
        storageBucket: "vpnhood-connect.appspot.com",
        messagingSenderId: "866504584967",
        appId: "1:866504584967:web:49f5398cbb594970ad5fa2",
        measurementId: "G-V9P8Q96PK9"
    };

    // VpnHood Client
    private static clientAppFirebaseConfig: FirebaseOptions = {
        apiKey: "AIzaSyCcgEuqO3eNZXetNtrap0Wm3mcvrqLcC3c",
        authDomain: "vpnhood-client.firebaseapp.com",
        projectId: "vpnhood-client",
        storageBucket: "vpnhood-client.appspot.com",
        messagingSenderId: "394312577363",
        appId: "1:394312577363:web:bb45a00044ce6bf02471a6",
        measurementId: "G-ZF424EEVF4"
    };

    public static initialize(isConnectApp: boolean): Analytics{
        const app = initializeApp(isConnectApp ? this.connectAppFirebaseConfig : this.clientAppFirebaseConfig);
        return getAnalytics(app);
    }
}

export enum AnalyticsCustomEvent {
    AlertDialogEventName = "vh_alert_dialog_message",
}
