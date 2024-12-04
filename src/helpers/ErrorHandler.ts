import { ApiException } from '@/services/VpnHood.Client.Api';
import i18n from '@/locales/i18n';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import { AnalyticsCustomEvent } from '@/services/Firebase';
import { GooglePlayBillingPurchaseState } from '@/helpers/googlePlayBilling/GooglePlayBillingPurchaseState';
import { GooglePlayBillingResponseCode } from '@/helpers/googlePlayBilling/GooglePlayBillingResponseCode';

export class ErrorHandler {

  public static async processError(err: unknown): Promise<void> {
    let errorMessage = await this.getErrorMessage(err);

    if (errorMessage){
      await VpnHoodApp.instance.showErrorMessage(errorMessage);
      // Clear current value
      errorMessage = null;
    }
  }

  private static async getErrorMessage(err: unknown): Promise<string | null> {
    if (typeof err === 'string')
      return err;

    if (err instanceof ApiException)
      return this.processApiException(err);

    if (err instanceof Error)
      return err.message ?? err;

    return i18n.global.t('UNKNOWN_ERROR');
  }

  private static async processApiException(err: ApiException): Promise<string | null> {
    // For developer
    console.log('Exception Type: ApiException');
    console.log('TypeName: ', err.exceptionTypeName);
    console.log("Error Infos: " + err);
// TODO handle UnreachableServer
    switch (err.exceptionTypeName) {
      case 'HttpRequestException':
        return this.httpRequestExceptionHandler(err);
      case 'UnreachableServerLocation':
        return this.unreachableServerExceptionHandler();
      case 'LoadAdException':
        return this.loadAdExceptionHandler(err);
      case 'SessionException':
        return this.sessionExceptionHandler(err);
      case 'GoogleBillingException':
        return this.googleBillingExceptionHandler(err);
    }

    // Just for VpnHoodConnect
    //TODO Test error
    if (VpnHoodApp.instance.isConnectApp() && err.message === 'Session has been closed.') {
      await VpnHoodApp.instance.signOut();
      return null;
    }

    return err.message ?? err;
  }

  private static async httpRequestExceptionHandler(err: ApiException): Promise<string> {

    switch (err.statusCode) {

      // Could not connect to the server
      case 400:
        return i18n.global.t('COULD_NOT_CONNECT_TO_SERVER');

      case 401:
        // Just for VpnHoodConnect
        // When the SPA is signed in but the app could not find the user account in the local storage.
        // Invalid credential.
        if (VpnHoodApp.instance.isConnectApp() && !VpnHoodApp.instance.data.userState.userAccount) {
          // Send error message to analytics
          VpnHoodApp.instance.analyticsLogEvent(AnalyticsCustomEvent.AlertDialogEventName,
            { message: i18n.global.t('AUTHENTICATION_ERROR', 'en'), });
          await VpnHoodApp.instance.signOut();
          return i18n.global.t('AUTHENTICATION_ERROR');
        }
        break;
    }
    return err.message;
  }

  private static async unreachableServerExceptionHandler(): Promise<string> {
    // Suggest to connect to the auto location
    if (!VpnHoodApp.instance.data.state.hasDiagnoseStarted
      && VpnHoodApp.instance.data.state.clientProfile?.selectedLocationInfo?.serverLocation !== "*/*" )
      return i18n.global.t('UNREACHABLE_SERVER_LOCATION_MESSAGE_WITH_CHANGE_TO_AUTO');

    // Show the message when the user can connect to the VPN but not to the selected server
    return i18n.global.t('UNREACHABLE_SERVER_LOCATION_MESSAGE');
  }

  private static async sessionExceptionHandler(err: ApiException): Promise<string> {
    // TODO implement error messages
    return err.message;
  }

  private static async loadAdExceptionHandler(err: ApiException): Promise<string> {
    // TODO implement error messages
    return err.message;
  }

  private static async googleBillingExceptionHandler(err: ApiException): Promise<string | null> {

    const googleMessageTitle = i18n.global.t('GOOGLE_EXCEPTION_MESSAGE');
    const billingMessage = err.data.BillingMessage;

    if (err.data.PurchaseState === GooglePlayBillingPurchaseState.Pending)
      return i18n.global.t('GOOGLE_BILLING_PENDING_PURCHASE');

    switch (err.data.BillingResponseCode) {

      case GooglePlayBillingResponseCode.BillingUnavailable:
        return i18n.global.t('GOOGLE_BILLING_BILLING_UNAVAILABLE');

      case GooglePlayBillingResponseCode.ServiceDisconnected:
        return i18n.global.t('GOOGLE_BILLING_SERVICE_DISCONNECTED');

      case GooglePlayBillingResponseCode.Error:
        return `${i18n.global.t('ORDER_PROCESSING_FAILED')} ${billingMessage ? `${googleMessageTitle} ${billingMessage}` : ''}`;

      case GooglePlayBillingResponseCode.DeveloperError:
        return `${i18n.global.t('GOOGLE_BILLING_DEVELOPER_ERROR')} ${billingMessage ? `${googleMessageTitle} ${billingMessage}` : ''}`;

      case GooglePlayBillingResponseCode.FeatureNotSupported:
        return i18n.global.t('GOOGLE_BILLING_FEATURE_NOT_SUPPORTED');

      case GooglePlayBillingResponseCode.ItemAlreadyOwned:
        return i18n.global.t('SELECTED_PLAN_ALREADY_SUBSCRIBED');

      case GooglePlayBillingResponseCode.ItemUnavailable:
        return i18n.global.t('GOOGLE_BILLING_ITEM_UNAVAILABLE');

      case GooglePlayBillingResponseCode.ItemNotOwned:
        return i18n.global.t('GOOGLE_BILLING_ITEM_NOT_OWNED');

      case GooglePlayBillingResponseCode.NetworkError:
        return i18n.global.t('GOOGLE_BILLING_NETWORK_ERROR');

      case GooglePlayBillingResponseCode.ServiceTimeout:
        return i18n.global.t('GOOGLE_BILLING_SERVICE_TIMEOUT');

      case GooglePlayBillingResponseCode.ServiceUnavailable:
        return i18n.global.t('GOOGLE_BILLING_SERVICE_UNAVAILABLE');

      case GooglePlayBillingResponseCode.UserCancelled:
        console.log(i18n.global.t('GOOGLE_BILLING_USER_CANCELED'));
        return null;
    }

    return err.message;
  }
}
