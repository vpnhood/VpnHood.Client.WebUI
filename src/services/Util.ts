import {ClientProfileInfo} from "@/services/VpnHood.Client.Api";

export class Util {
    public static isSingleLocation(locationCount: number): boolean {
        return locationCount < 2;
    }
    public static isCollapsed(expandState: number): boolean {
        return expandState !== 0;
    }
    public static calcLocationCount(clientProfileInfo: ClientProfileInfo): number {
        const excludeAutoSelect = clientProfileInfo.serverLocationInfos.filter(
            x => x.countryCode !== '*' && !x.isNestedCountry
        );
        return excludeAutoSelect.length;
    }
}