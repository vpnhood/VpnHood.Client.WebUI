import {initializeApp, FirebaseOptions} from 'firebase/app'

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
        apiKey: "AIzaSyB2Br41jN32DmXyH-HqdcsOXVnaGON1ay0",
        authDomain: "client-d2460.firebaseapp.com",
        databaseURL: "https://client-d2460.firebaseio.com",
        projectId: "client-d2460",
        storageBucket: "client-d2460.appspot.com",
        messagingSenderId: "216585339900",
        appId: "1:216585339900:web:17299300c94bfddc172879",
        measurementId: "G-ZG1R4RF8V5"
    };

    public static initialize(isConnectApp: boolean): void{
        initializeApp(isConnectApp ? this.connectAppFirebaseConfig : this.clientAppFirebaseConfig);
    }
}