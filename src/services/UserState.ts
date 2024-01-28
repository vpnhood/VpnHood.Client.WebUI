import {AppAccount} from "@/services/VpnHood.Client.Api";

export class UserState {
    // Time of user ignored last error message
    public userIgnoreLastErrorTime?: Date | null = null;
    public userAccount: AppAccount | null = null;
}
