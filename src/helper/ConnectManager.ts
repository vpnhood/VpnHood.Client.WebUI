import { VpnHoodApp } from '@/services/VpnHoodApp';
import { ClientProfileInfo, ConnectPlanId, ServerLocationOptions } from '@/services/VpnHood.Client.Api';
import { ComponentName } from '@/helper/UiConstants';
import { ComponentRouteController } from '@/services/ComponentRouteController';
import router from '@/services/router';

export class ConnectManager {
  private static async showPromoteDialog(clientProfileId: string, isPremium: boolean, serverLocation: string): Promise<boolean> {
    if (!serverLocation)
      return true;

    const clientProfileInfo: ClientProfileInfo = await VpnHoodApp.instance.clientProfileClient.get(clientProfileId);
    const options: ServerLocationOptions | undefined = clientProfileInfo.serverLocationInfos.find(
      x => x.serverLocation === serverLocation)?.options;

    // Create promote dialog
    if (!options?.prompt)
      return false;

    const promoteData = VpnHoodApp.instance.data.uiState.promoteDialogData;
    promoteData.clientProfileId = clientProfileId;
    promoteData.serverLocation = serverLocation;
    promoteData.showRewardedAd = options.premiumByRewardAd;
    promoteData.showTryPremium = options.premiumByTrial;
    promoteData.showGoPremium = options.premiumByPurchase;
    promoteData.isPremiumLocation = isPremium;
    promoteData.isVisible = true;

    // Show promote dialog
    await ComponentRouteController.showComponent(ComponentName.PromoteDialog);
    return true;
  }

  public static async connect1(isDiagnose: boolean = false) {
    // For developer
    console.log("Connect1");

    const clientProfileId = VpnHoodApp.instance.data.settings.userSettings.clientProfileId
      ?? VpnHoodApp.instance.data.state.clientProfile?.clientProfileId;

    if (!clientProfileId) {
      await router.push('/servers');
      return;
    }
    await this.connect2(clientProfileId, isDiagnose);
  }

  public static async connect2(clientProfileId: string, isDiagnose: boolean = false): Promise<void> {
    // For developer
    console.log("Connect2");

    const serverLocation: string = VpnHoodApp.instance.data.settings.userSettings.serverLocation ?? '*/*';
    const clientProfileInfo: ClientProfileInfo = await VpnHoodApp.instance.clientProfileClient.get(clientProfileId);
    const isPremiumLocation: boolean = clientProfileInfo.isPremiumLocationSelected;
    await this.connect3(clientProfileId, serverLocation, isPremiumLocation, isDiagnose);
  }

  public static async connect3(clientProfileId: string, serverLocation: string, isPremiumLocation: boolean, isDiagnose: boolean = false) {
    // For developer
    console.log("Connect3");

    if (await this.showPromoteDialog(clientProfileId, isPremiumLocation, serverLocation))
      return;
    await VpnHoodApp.instance.connect(clientProfileId, serverLocation, isPremiumLocation, ConnectPlanId.Normal, isDiagnose);
  }
}
