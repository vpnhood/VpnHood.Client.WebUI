import { ClientProfileInfo } from '@/services/VpnHood.Client.Api';
import vuetify from '@/services/vuetify';

export class Util {
  // Client profile have single location
  public static isSingleLocation(locationCount: number): boolean {
    return locationCount < 2;
  }

  // Location count of client profile
  public static calcLocationCount(clientProfileInfo: ClientProfileInfo): number {
    const excludeAutoSelect = clientProfileInfo.locationInfos.filter(
      x => x.countryCode !== '*' && !x.isNestedCountry
    );
    return excludeAutoSelect.length;
  }

  public static isLocationAutoSelected(value: string): boolean {
    return value === '*' || value === '*/*';
  }

  public static getLocalizedRightChevron(): string {
    return vuetify.locale.isRtl.value ? 'mdi-chevron-left' : 'mdi-chevron-right';
  }

  // noinspection JSUnusedGlobalSymbols
  public static getLocalizedLeftChevron(): string {
    return vuetify.locale.isRtl.value ? 'mdi-chevron-right' : 'mdi-chevron-left';
  }

  public static getShortDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);
    return formattedDate;
  }
}
