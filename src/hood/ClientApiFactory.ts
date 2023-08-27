import axios, {AxiosInstance} from "axios";

export class ClientApiFactory {

    private readonly axiosInstance: AxiosInstance;
    private readonly baseUrl: string | undefined = process.env.VUE_APP_STORE_SERVER_API_BASE_URL;
    private readonly appId: string | undefined = process.env.VUE_APP_STORE_SERVER_APP_ID;

    constructor() {

        if (this.baseUrl == undefined || this.appId == undefined)
            throw new Error("Server API base url or app id is not set in the .env file.");

        //Define the axios default config
        this.axiosInstance = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.axiosInstance.interceptors.request.use(

            async (config) => {
                config.timeout = 15000;
                const token = localStorage.getItem('storeJwtToken');
                config.headers.Authorization = `Bearer ${token}`
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

    /*public CreateTeamClient(): TeamClient {
        return new TeamClient(this.baseUrl, this.axiosInstance);
    }*/

}