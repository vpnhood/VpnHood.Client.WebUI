import axios, {AxiosInstance} from "axios";
import {ApiClient} from './VpnHood.Client.Api';

export class ClientApiFactory {

    private readonly axiosInstance: AxiosInstance;
    private readonly baseUrl: string | undefined = process.env.VUE_APP_CLIENT_API_BASE_URL;

    constructor() {

        if (this.baseUrl == undefined)
            throw new Error("Server API base url or app id is not set in the .env file.");

        //Define the axios default config
        this.axiosInstance = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        this.axiosInstance.interceptors.request.use(

            async (config) => {
                config.timeout = 15000;
                return config;
            },
            async (error) => {
                throw error;
                //return Promise.reject(error);
            },
        );
    }

    private static _instance: ClientApiFactory | null = null;
    public static get instance(): ClientApiFactory {
        if (this._instance === null)
            this._instance = new ClientApiFactory();

        return this._instance;
    }

    //For each class of VpnHood.Client.Api.ts, we need to create a new method like below
    public CreateApiClient(): ApiClient {
        return new ApiClient(this.baseUrl, this.axiosInstance);
    }

}