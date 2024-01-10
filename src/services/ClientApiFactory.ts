import axios, {AxiosInstance} from "axios";
import {AppApiClient} from './VpnHood.Client.Api';

export class ClientApiFactory {

    private readonly axiosInstance: AxiosInstance;
    private readonly baseUrl: string | undefined = process.env["VUE_APP_CLIENT_API_BASE_URL"];

    constructor() {

        if (!this.baseUrl)
            this.baseUrl = window.location.origin;

        //Define the axios default config
        this.axiosInstance = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        /*this.axiosInstance.interceptors.request.use(

            async (config) => {
                config.timeout = 15000;
                return config;
            },
            async (error) => {
                throw error;
                //return Promise.reject(error);
            },
        );*/
    }

    // noinspection LocalVariableNamingConventionJS
    private static _instance: ClientApiFactory | null = null;
    public static get instance(): ClientApiFactory {
        if (this._instance === null)
            this._instance = new ClientApiFactory();

        return this._instance;
    }

    public createApiClient(): AppApiClient {
        return new AppApiClient(this.baseUrl, this.axiosInstance);
    }

}