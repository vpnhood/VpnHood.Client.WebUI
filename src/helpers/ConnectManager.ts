import { VpnHoodApp } from '@/services/VpnHoodApp';
import { ClientProfileInfo, ConnectPlanId, ServerLocationOptions } from '@/services/VpnHood.Client.Api';
import { ComponentName } from '@/helpers/UiConstants';
import { ComponentRouteController } from '@/services/ComponentRouteController';
import router from '@/services/router';

export class ConnectManager {
  public static async showPromoteDialog(clientProfileId: string, isPremium: boolean, serverLocation: string): Promise<boolean> {

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
    const serverLocation: string | null = clientProfileInfo.selectedLocationInfo?.serverLocation ?? null;
    const isPremiumLocation: boolean = clientProfileInfo.isPremiumLocationSelected ?? false;
    await this.connect3(clientProfileId, serverLocation, isPremiumLocation, isDiagnose);
  }

  public static async connect3(clientProfileId: string, serverLocation: string | null, isPremiumLocation: boolean, isDiagnose: boolean = false) {
    // For developer
    console.log("Connect3");

    if (serverLocation && await this.showPromoteDialog(clientProfileId, isPremiumLocation, serverLocation))
      return;

    await VpnHoodApp.instance.connect(clientProfileId, serverLocation, isPremiumLocation, ConnectPlanId.Normal, isDiagnose);
  }
}
