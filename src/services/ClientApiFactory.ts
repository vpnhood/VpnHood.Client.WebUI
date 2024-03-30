import axios, {AxiosInstance} from "axios";
import {AppClient, AccountClient, BillingClient} from './VpnHood.Client.Api';

export class ClientApiFactory {

    private readonly axiosInstance: AxiosInstance;
    private readonly baseUrl: string = process.env["VUE_APP_HOOD_ANDROID_API_BASE_URL"] ?? window.location.origin;

    constructor() {
        //Define the axios default config
        this.axiosInstance = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });
    }

    // noinspection LocalVariableNamingConventionJS
    private static _instance: ClientApiFactory | null = null;
    public static get instance(): ClientApiFactory {
        if (this._instance === null)
            this._instance = new ClientApiFactory();

        return this._instance;
    }

    public createAppClient(): AppClient {
        return new AppClient(this.baseUrl, this.axiosInstance);
    }

    public createAccountClient(): AccountClient {
        return new AccountClient(this.baseUrl, this.axiosInstance);
    }
    public createBillingClient(): BillingClient {
        return new BillingClient(this.baseUrl, this.axiosInstance);
    }

}