import axios from "axios";
import type {AxiosInstance} from 'axios';
import {AppClient, AccountClient, BillingClient, ClientProfileClient} from './VpnHood.Client.Api';

export class ClientApiFactory {
    private readonly axiosInstance: AxiosInstance;
    private readonly baseUrl: string = import.meta.env.VITE_CLIENT_API_BASE_URL ?? window.location.origin;

    constructor() {
        //Define the axios default config
        const axiosConfig = {
            baseURL: this.baseUrl,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        };
        this.axiosInstance = axios.create(axiosConfig);
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

    public createClientProfileClient(): ClientProfileClient {
        return new ClientProfileClient(this.baseUrl, this.axiosInstance);
    }

    public createAccountClient(): AccountClient {
        return new AccountClient(this.baseUrl, this.axiosInstance);
    }

    public createBillingClient(): BillingClient {
        return new BillingClient(this.baseUrl, this.axiosInstance);
    }
}
