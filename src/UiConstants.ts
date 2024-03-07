export class LocalStorage {
    public static readonly userAccount: string = "VhConnectUserAccount";
    public static readonly acceptedPrivacyPolicy: string = "VhAcceptedPrivacyPolicy";
}
export class UiConstants {
    static daysOfDate: number = 24 * 60 * 60 * 1000;
}

export enum ComponentName {
    // noinspection JSUnusedGlobalSymbols
    PurchaseSubscriptionDialog = "PurchaseSubscriptionDialog",
    TunnelClientCountryDialog = "TunnelClientCountryDialog",
    NavigationDrawer = "NavigationDrawer",
    ProtocolDialog = "ProtocolDialog",
    AlertDialog = "AlertDialog",
    AddServerDialog = "AddServerDialog",
    RenameServerDialog = "RenameServerDialog",
    ConfirmDeleteServerDialog = "ConfirmDeleteServerDialog",
    ServersDialogForVpnHoodConnect = "ServersDialogForVpnHoodConnect",
}

export enum SubscriptionPlansId {
    HiddenServer = "hidden-server",
    GlobalServer = "global-servers",
    BundleServers = "bundle-servers",
}

export enum AppName{
    VpnHood = "VpnHood",
    VpnHoodConnect = "VpnHoodConnect",
}