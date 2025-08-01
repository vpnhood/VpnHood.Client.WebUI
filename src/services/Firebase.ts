// noinspection SpellCheckingInspection
import {initializeApp} from 'firebase/app'
import type {FirebaseOptions} from 'firebase/app'
import { getAnalytics } from "firebase/analytics";
import type {Analytics} from 'firebase/analytics'


export class FirebaseApp {
    public static initialize(config: FirebaseOptions): Analytics{

      const firebaseOptions: FirebaseOptions = {
        apiKey: config.apiKey,
        authDomain: config.authDomain,
        projectId: config.projectId,
        storageBucket: config.storageBucket,
        messagingSenderId: config.messagingSenderId,
        appId: config.appId,
        measurementId: config.measurementId,
      };
        const app = initializeApp(firebaseOptions);
        return getAnalytics(app);
    }
}

export enum AnalyticsCustomEvent {
    AlertDialogEventName = "vh_alert_dialog_message",
}
