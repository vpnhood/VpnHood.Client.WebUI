import {ClientProfileInfo} from "@/services/VpnHood.Client.Api";

export class Util {
    // Client profile have single location
    public static isSingleLocation(locationCount: number): boolean {
        return locationCount < 2;
    }


    // Location count of client profile
    public static calcLocationCount(clientProfileInfo: ClientProfileInfo): number {
        const excludeAutoSelect = clientProfileInfo.serverLocationInfos.filter(
            x => x.countryCode !== '*' && !x.isNestedCountry
        );
        return excludeAutoSelect.length;
    }

  public static isLocationAutoSelected(value: string): boolean {
    return value === '*';
  }

}
