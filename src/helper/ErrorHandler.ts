import { ApiException } from '@/services/VpnHood.Client.Api';
import i18n from '@/locales/i18n';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import { AnalyticsCustomEvent } from '@/services/Firebase';

export class ErrorHandler {

  public static async processError(err: unknown): Promise<void> {
    //TODO Check the errors again
    if (typeof err === 'string')
      return await VpnHoodApp.instance.showErrorMessage(err);

    if (!(err instanceof Error))
      return await VpnHoodApp.instance.showErrorMessage(i18n.global.t('UNKNOWN_ERROR'));

    if (!(err instanceof ApiException))
      return await VpnHoodApp.instance.showErrorMessage(err.message ?? err);

    await this.processApiException(err);
  }
  public static async processApiException(err: ApiException): Promise<void>{

    const vhApp = VpnHoodApp.instance

    // For developer
    console.log("exceptionTypeName: ", err.exceptionTypeName);

    // Could not connect to the server
    if (err.exceptionTypeName === "HttpRequestException" && err.statusCode === 400)
      return await vhApp.showErrorMessage(i18n.global.t('COULD_NOT_CONNECT_TO_SERVER'));

    // Show a message that the user can connect to the VPN but not to the selected server
    if (err.exceptionTypeName === 'UnreachableServerLocation' && !vhApp.data.state.hasDiagnoseStarted &&
      vhApp.data.settings.userSettings.serverLocation)
      return await vhApp.showErrorMessage(i18n.global.t('UNREACHABLE_SERVER_LOCATION_MESSAGE'), true);

    // Just for VpnHoodConnect
    //TODO Test error
    if (vhApp.isConnectApp() && err.message === 'Session has been closed.')
      return await vhApp.signOut();

    // Just for VpnHoodConnect
    // When the SPA is signed in but the app could not find the user account in the local storage.
    // Invalid credential.
    if (vhApp.isConnectApp() && err.statusCode === 401 && !vhApp.data.userState.userAccount) {
      // Send error message to analytics
      vhApp.analyticsLogEvent(AnalyticsCustomEvent.AlertDialogEventName, {
        message: i18n.global.t('AUTHENTICATION_ERROR', 'en')
      });

      await vhApp.showErrorMessage(i18n.global.t('AUTHENTICATION_ERROR'));
      await vhApp.signOut();
      return;
    }

    await vhApp.showErrorMessage(err.message ?? err);
  }
}
