import { ApiException, ExceptionType, SessionErrorCode } from '@/services/VpnHood.Client.Api';
import i18n from '@/locales/i18n';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import { AnalyticsCustomEvent } from '@/services/Firebase';
import { GooglePlayBillingPurchaseState } from '@/helpers/googlePlayBilling/GooglePlayBillingPurchaseState';
import { GooglePlayBillingResponseCode } from '@/helpers/googlePlayBilling/GooglePlayBillingResponseCode';
import type { ShowErrorActions } from '@/helpers/UiConstants';

interface ShowErrorOptions {
  ignoreMessage?: boolean,
  localeKey?: string,
  text?: string,
  action?: ShowErrorActions
}

export class ErrorHandler {

  public static async processError(err: unknown): Promise<void> {

    const errorOptions: ShowErrorOptions = await this.getErrorMessage(err);

    // Do not show any message
    if (errorOptions.ignoreMessage) return;

    const text = errorOptions.text ?? '';

    // English message for analytics
    const englishErrorMessage = errorOptions.localeKey ?
      (i18n.global.t(errorOptions.localeKey, 1, { locale: 'en' }) + text) :
      text;

    // Translated message for show to user
    const userErrorMessage = errorOptions.localeKey ?
      (i18n.global.t(errorOptions.localeKey) + text) :
      text;

    // Send the error message to analytics
    VpnHoodApp.instance.analyticsLogEvent(AnalyticsCustomEvent.AlertDialogEventName, {
      message: englishErrorMessage,
      ui_language: i18n.global.locale.value,
      org_message: err,
      app_version: VpnHoodApp.instance.getAppVersion(true)
    });

    // Show the message
    await VpnHoodApp.instance.showErrorMessage(userErrorMessage, errorOptions.action);
  }

  private static async getErrorMessage(err: unknown): Promise<ShowErrorOptions> {
    if (typeof err === 'string')
      return { text: err };

    //All exception from API
    if (err instanceof ApiException)
      return this.processApiException(err);

    if (err instanceof Error)
      return { text: err.message ?? err };

    return { localeKey: `UNKNOWN_ERROR: ${err}` };
  }

  private static async processApiException(err: ApiException): Promise<ShowErrorOptions> {
    // For developer
    console.log('Exception Type: ApiException');
    console.log('TypeName: ', err.exceptionTypeName);
    console.log('Error Infos: ' + err);

    switch (err.exceptionTypeName) {

      // Intentionally silenced errors
      case 'OperationCanceledException':
      case 'UserCanceledException':
      case 'ObjectDisposedException':
        return { ignoreMessage: true };

      // Could not connect to any server
      case ExceptionType.UnreachableServer:
        return { localeKey: 'UNREACHABLE_SERVER_MESSAGE', action: { showDiagnose: true } };

      // No internet or slow
      case ExceptionType.NoInternet:
        return { localeKey: 'NO_INTERNET_MSG', action: { showDiagnose: true } };

      // App minimized during showing ad
      case ExceptionType.ShowAdNoUi:
        return { localeKey: 'SHOW_AD_NO_UI_MSG' };

      // VPN service encountered an issue
      case ExceptionType.VpnServiceUnreachable:
        return { localeKey: 'VPN_SERVICE_UNREACHABLE_MSG' };

      // It is not clear under what circumstances this occurs.
      case ExceptionType.VpnServiceTimeout:
        return { localeKey: 'VPN_SERVICE_TIMEOUT_MSG' };

      // It is not clear under what circumstances this occurs.
      case ExceptionType.VpnServiceNotReady:
        return { localeKey: 'VPN_SERVICE_NOT_READY_MSG' };

      // On the diagnosis
      case ExceptionType.NoStableVpn:
        return { localeKey: 'NO_STABLE_VPN_MSG' };

      // User sees the rewarded ad but does not earn
      case ExceptionType.RewardNotEarned:
        return { localeKey: 'REWARD_NOT_EARNED_MSG' };

      // After diagnose
      case ExceptionType.NoErrorFound:
        return { localeKey: 'DIAGNOSE_FINISHED_NO_ERROR_MSG' };

      // Access server is in the maintenance mode
      case ExceptionType.Maintenance:
        return { localeKey: 'MAINTENANCE_MODE_MSG' };

      // Could not connect to any server in the selected location
      case ExceptionType.UnreachableServerLocation:
        return this.unreachableServerLocationExceptionHandler();

      // Currently happened only for Rewarded Ad
      case ExceptionType.LoadAd:
        return { localeKey: 'REWARDED_AD_LOAD_ERROR_MSG' };

      // Currently happened only for Rewarded Ad
      case ExceptionType.ShowAd:
        return { localeKey: 'REWARDED_AD_SHOW_ERROR_MSG' };

      // Quick launch isn't supported
      case ExceptionType.AutoStartNotSupported:
        return { localeKey: 'QUICK_LAUNCH_NOT_SUPPORTED_MSG' };

      // Could not connect after a specific time
      case 'ConnectionTimeoutException':
        return { localeKey: 'CONNECTION_TIMEOUT_MSG', action: { showDiagnose: true } };

      // Device does not have Google Play
      case 'GooglePlayUnavailableException':
        return { localeKey: 'GOOGLE_PLAY_IS_UNAVAILABLE' };

      // Access server exceptions
      case 'SessionException':
        return this.sessionExceptionHandler(err);

      case 'GoogleBillingException':
        return this.googleBillingExceptionHandler(err);

      case 'HttpRequestException':
        return { text: err.message };

      // Default message for unhandled ApiException types
      default:
        return { text: err.message ?? err };
    }
  }

  private static async unreachableServerLocationExceptionHandler(): Promise<ShowErrorOptions> {
    // Suggest connecting to the auto location
    if (!VpnHoodApp.instance.data.state.hasDiagnoseRequested)
      return {
        localeKey: 'UNREACHABLE_SERVER_LOCATION_MESSAGE_WITH_CHANGE_TO_AUTO',
        action: { showChangeServerToAuto: true }
      };

    return { localeKey: 'UNREACHABLE_SERVER_MESSAGE', action: { showDiagnose: true } };
  }

  private static async sessionExceptionHandler(err: ApiException): Promise<ShowErrorOptions> {
    switch (err.data?.ErrorCode) {

      case SessionErrorCode.SessionSuppressedBy:
        return { localeKey: 'SESSION_SUPPRESSED_BY_OTHER' };

      // User is premium (by Code or Google) and attempt to connect while the premium is expired.
      case SessionErrorCode.AccessExpired:
        if (VpnHoodApp.instance.data.features.isPremiumFlagSupported){
          return { localeKey: 'PREMIUM_ACCESS_EXPIRED_MSG', action: {showRemovePremium: true} };
        }
        return { localeKey: 'SERVER_KEY_EXPIRED' };

      // User is connected with a premium session (by Code, Google, Try or RewardedAd), and it's expired.
      case SessionErrorCode.SessionExpired:
        return { localeKey: 'PREMIUM_CONNECTION_EXPIRED_MSG' };

      // Daily limit for connecting to premium exceeded
      case SessionErrorCode.DailyLimitExceeded:
        return { localeKey: 'DAILY_LIMIT_EXCEEDED_MSG' };

      // Premium code is invalid
      case SessionErrorCode.AccessCodeRejected:
        return { localeKey: 'INVALID_ACCESS_CODE' };

      // Connection plan rejected by access server
      case SessionErrorCode.PlanRejected:
        return { localeKey: 'PLAN_REJECTED_MSG' };

      // Access server is in the maintenance mode
      case SessionErrorCode.Maintenance:
        return { localeKey: 'MAINTENANCE_MODE_MSG' };

      // Selected server isn't available anymore
      case SessionErrorCode.NoServerAvailable:
        return { localeKey: 'NO_SERVER_AVAILABLE_MSG' };

      // Selected server moved to the premium list
      case SessionErrorCode.PremiumLocation:
        return { localeKey: 'PREMIUM_LOCATION_MSG' };

      // Selected server moved to the premium list
      case SessionErrorCode.RewardedAdRejected:
        return { localeKey: 'REWARD_NOT_EARNED_MSG' };

      // Fallback for unhandled session error codes
      default:
        return { text: err.message ?? err };
    }
  }

  private static async googleBillingExceptionHandler(err: ApiException): Promise<ShowErrorOptions> {

    const googleMessageTitle = 'GOOGLE_EXCEPTION_MESSAGE';
    const billingMessage = err.data?.BillingMessage;
    const purchaseState = err.data?.PurchaseState;
    const billingResponseCode = err.data?.BillingResponseCode;

    if (purchaseState === GooglePlayBillingPurchaseState.Pending)
      return { localeKey: 'GOOGLE_BILLING_PENDING_PURCHASE' };

    switch (billingResponseCode) {

      case GooglePlayBillingResponseCode.BillingUnavailable:
        return { localeKey: 'GOOGLE_BILLING_BILLING_UNAVAILABLE' };

      case GooglePlayBillingResponseCode.ServiceDisconnected:
        return { localeKey: 'GOOGLE_BILLING_SERVICE_DISCONNECTED' };

      case GooglePlayBillingResponseCode.Error:
        if (purchaseState === '')
          return { text: `${billingMessage}` };
        return {
          localeKey: 'ORDER_PROCESSING_FAILED',
          text: `${billingMessage ? `${googleMessageTitle} ${billingMessage}` : ''}`
        };

      case GooglePlayBillingResponseCode.DeveloperError:
        return {
          localeKey: 'GOOGLE_BILLING_DEVELOPER_ERROR',
          text: `${billingMessage ? `${googleMessageTitle} ${billingMessage}` : ''}`
        };

      case GooglePlayBillingResponseCode.FeatureNotSupported:
        return { localeKey: 'GOOGLE_BILLING_FEATURE_NOT_SUPPORTED' };

      case GooglePlayBillingResponseCode.ItemAlreadyOwned:
        return { localeKey: 'SELECTED_PLAN_ALREADY_SUBSCRIBED' };

      case GooglePlayBillingResponseCode.ItemUnavailable:
        return { localeKey: 'GOOGLE_BILLING_ITEM_UNAVAILABLE' };

      case GooglePlayBillingResponseCode.ItemNotOwned:
        return { localeKey: 'GOOGLE_BILLING_ITEM_NOT_OWNED' };

      case GooglePlayBillingResponseCode.NetworkError:
        return { localeKey: 'GOOGLE_BILLING_NETWORK_ERROR' };

      case GooglePlayBillingResponseCode.ServiceTimeout:
        return { localeKey: 'GOOGLE_BILLING_SERVICE_TIMEOUT' };

      case GooglePlayBillingResponseCode.ServiceUnavailable:
        return { localeKey: 'GOOGLE_BILLING_SERVICE_UNAVAILABLE' };

      case GooglePlayBillingResponseCode.UserCancelled:
        console.log(i18n.global.t('GOOGLE_BILLING_USER_CANCELED'));
        return { ignoreMessage: true };

      default:
        return { text: err.message ?? err };
    }
  }
}
