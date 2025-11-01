import { ChannelProtocol, ClientProfileInfo } from '@/services/VpnHood.Client.Api';
import vuetify from '@/theme/vuetify';
import i18n from '@/locales/i18n';

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

  public static delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public static getAssetPath(fileName: string): string {
    return new URL(`../assets/images/${fileName}`, import.meta.url).href;
  }

  public static protocolTitle(protocol: ChannelProtocol): string{
    switch (protocol) {
      case ChannelProtocol.Udp:
        return "PROTOCOL_UDP";
      case ChannelProtocol.Tcp:
        return "PROTOCOL_TCP";
      case ChannelProtocol.Quic:
        return "PROTOCOL_QUIC";
    }
  }

  public static getRelativeTime(date: Date | string | null | undefined): string {
    if (!date) return '-';
    
    const locale = i18n.global.t;
    const now = new Date();
    const targetDate = typeof date === 'string' ? new Date(date) : date;
    
    // Calculate difference in seconds
    const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);
    
    // Handle future dates or very recent (less than 5 seconds)
    if (diffInSeconds < 5) {
      return locale('TIME_JUST_NOW');
    }
    
    // Seconds (5-59 seconds)
    if (diffInSeconds < 60) {
      const unit = diffInSeconds === 1 ? locale('SECOND') : locale('SECONDS');
      return locale('TIME_SECONDS_AGO', { count: diffInSeconds, unit });
    }
    
    // Minutes (1-59 minutes)
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      const unit = diffInMinutes === 1 ? locale('MINUTE') : locale('MINUTES');
      return locale('TIME_MINUTES_AGO', { count: diffInMinutes, unit });
    }
    
    // Hours (1-23 hours)
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      const unit = diffInHours === 1 ? locale('HOUR') : locale('HOURS');
      return locale('TIME_HOURS_AGO', { count: diffInHours, unit });
    }
    
    // Days (1+ days)
    const diffInDays = Math.floor(diffInHours / 24);
    const unit = diffInDays === 1 ? locale('DAY') : locale('DAYS');
    return locale('TIME_DAYS_AGO', { count: diffInDays, unit });
  }



// For developers sends test error
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
