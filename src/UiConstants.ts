export class LocalStorage {
    public static readonly acceptedPrivacyPolicy: string = "VhAcceptedPrivacyPolicy";
}
export class UiConstants {
    static daysOfDate: number = 24 * 60 * 60 * 1000;
}

export enum ComponentName {
    // noinspection JSUnusedGlobalSymbols
    TunnelClientCountryDialog = "TunnelClientCountryDialog",
    NavigationDrawer = "NavigationDrawer",
    ProtocolDialog = "ProtocolDialog",
    AlertDialog = "AlertDialog",
    AddServerDialog = "AddServerDialog",
    RenameServerDialog = "RenameServerDialog",
    ConfirmDeleteServerDialog = "ConfirmDeleteServerDialog",
    PrivacyPolicyDialog = "PrivacyPolicyDialog"
}

export enum LanguagesCode {
    SystemDefault = "sys",
    English = "en",
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