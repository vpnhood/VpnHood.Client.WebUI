import {ClientProfileInfo, ServerLocationInfo} from "@/services/VpnHood.Client.Api";

export class Util {
    // Client profile have single location
    public static isSingleLocation(locationCount: number): boolean {
        return locationCount < 2;
    }

    // Server card state is collapsed or expanded
    // 0 = expanded
    public static isCollapsed(expandState: number): boolean {
        return expandState !== 0;
    }

    // Location count of client profile
    public static calcLocationCount(clientProfileInfo: ClientProfileInfo): number {
        const excludeAutoSelect = clientProfileInfo.serverLocationInfos.filter(
            x => x.countryCode !== '*' && !x.isNestedCountry
        );
        return excludeAutoSelect.length;
    }

    // Client profile have a location or not
    public static isServerHaveLocation(serverLocationInfos: ServerLocationInfo[]): boolean {
        return serverLocationInfos.length > 0
    }
}
