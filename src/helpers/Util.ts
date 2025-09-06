import { ClientProfileInfo } from '@/services/VpnHood.Client.Api';
import vuetify from '@/theme/vuetify';

export class Util {
  // Client profile has a single location
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

  public static getSpecialPageCardClass(): string{
    const allDisplaySizeClass: string = "d-flex flex-column justify-space-between primary-bg-grad rounded-xl text-white fill-height border-opacity-50"
    const borderClassForMobileSize: string = "border border-promote-premium-border"

    if (vuetify.display.smAndDown.value)
      return allDisplaySizeClass + ' ' + borderClassForMobileSize;

    return allDisplaySizeClass
  }

  public static delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public static isNullOrUndefined(value: unknown): boolean {
    return value === null || value === undefined;
  }


/*  public static sendTestError(): void {
    const errorMessage = 'Something went wrong';
    const statusCode = 401;
    const responseBody = {
      typeName: 'AdBlockerException',
      message: 'Invalid email',
      data: {
        ErrorCode: 'AccessExpired',
        BillingResponseCode: 'Error',
        PurchaseState: 'purchase state',
        BillingMessage: 'billing message'
      },
    };
    const headers = { 'Content-Type': 'application/json' };

    const apiException = new ApiException(errorMessage, statusCode, responseBody, headers);
    throw apiException;
  }*/
}
