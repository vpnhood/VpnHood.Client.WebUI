import { VpnHoodApp } from '@/services/VpnHoodApp';
import { ClientProfileInfo, ConnectPlanId, ServerLocationOptions } from '@/services/VpnHood.Client.Api';
import { ComponentName } from '@/helpers/UiConstants';
import { ComponentRouteController } from '@/services/ComponentRouteController';
import router from '@/services/router';

export class ConnectManager {
  public static async showPromoteDialog(clientProfileId: string, serverLocation: string, isPremium: boolean): Promise<boolean> {

    const clientProfileInfo: ClientProfileInfo = await VpnHoodApp.instance.clientProfileClient.get(clientProfileId);
    const options: ServerLocationOptions | undefined = clientProfileInfo.locationInfos.find(
      x => x.serverLocation === serverLocation)?.options;

    // Fore developer
    console.log("Show Prompt: " + options?.prompt);

    if (!options?.prompt)
      return false;

    // Config promote dialog
    const promoteData = VpnHoodApp.instance.data.uiState.promoteDialogData;
    promoteData.clientProfileId = clientProfileId;
    promoteData.serverLocation = serverLocation;
    promoteData.showRewardedAd = options.premiumByRewardedAd;
    promoteData.showTryPremium = options.premiumByTrial;
    promoteData.showGoPremium = options.premiumByPurchase;
    promoteData.isPremiumLocation = isPremium;

    // Show promote dialog
    await ComponentRouteController.showComponent(ComponentName.PromoteDialog);
    return true;
  }

  public static async connect1(isDiagnose: boolean = false) {
    // For developer
    console.log("Connect1");

    const clientProfileId = VpnHoodApp.instance.data.state.clientProfile?.clientProfileId;
    if (!clientProfileId) {
      await router.push('/servers');
      return;
    }
    await this.connect2(clientProfileId, isDiagnose);
  }

  public static async connect2(clientProfileId: string, isDiagnose: boolean = false): Promise<void> {
    // For developer
    console.log("Connect2");

    const clientProfileInfo: ClientProfileInfo = await VpnHoodApp.instance.clientProfileClient.get(clientProfileId);
    const serverLocation: string | undefined = clientProfileInfo.selectedLocationInfo?.serverLocation;
    if (!serverLocation){
      await router.push('/servers');
      return;
    }

    let isPremiumLocation: boolean;

    // If the location has a premium option and the normal option is unavailable (i.e., 0), it is classified as premium.
    // This scenario is expected to be rare and typically occurs only on first-time use.
    if(clientProfileInfo.selectedLocationInfo?.options.hasPremium === true
      && clientProfileInfo.selectedLocationInfo?.options.normal == null)
      isPremiumLocation = true;

    // If the location does not have a premium option or has both premium and free options, we rely on
    // clientProfileInfo.isPremiumLocationSelected. If the user has previously selected premium or free options,
    // their selection will be used. Otherwise, the default value for clientProfileInfo.isPremiumLocationSelected is
    // false, which means the free option is selected by default.
    else
      isPremiumLocation = clientProfileInfo.isPremiumLocationSelected;

    await this.connect3(clientProfileId, serverLocation, isPremiumLocation, isDiagnose);
  }

  public static async connect3(clientProfileId: string, serverLocation: string, isPremiumLocation: boolean, isDiagnose: boolean = false) {
    // For developer
    console.log("Connect3");
    console.log('Detected server location: ' + serverLocation);
    console.log('isPremiumLocation: ' + isPremiumLocation);

    if (serverLocation && await this.showPromoteDialog(clientProfileId, serverLocation, isPremiumLocation))
      return;

    await VpnHoodApp.instance.connect(clientProfileId, serverLocation, isPremiumLocation, ConnectPlanId.Normal, isDiagnose);
  }
}
