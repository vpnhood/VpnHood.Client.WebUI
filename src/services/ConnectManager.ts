import { ClientProfileInfo, ConnectPlanId, ServerLocationOptions } from '@/services/VpnHood.Client.Api';
import { ComponentName, LocationType } from '@/UiConstants';
import { ComponentRouteController } from '@/services/ComponentRouteController';
import router from '@/plugins/router';
import { VpnHoodApp } from '@/services/VpnHoodApp';

const vhApp = VpnHoodApp.instance;

export class ConnectManager {
  private static async showPromoteDialog(clientProfileId: string, isPremium: boolean, serverLocation: string): Promise<boolean> {
    if (!serverLocation)
      return true;

    const clientProfileInfo: ClientProfileInfo = await vhApp.clientProfileClient.get(clientProfileId);
    const options: ServerLocationOptions | undefined = clientProfileInfo.serverLocationInfos.find(
      x => x.serverLocation === serverLocation)?.options;
    const isPremiumLocation: boolean = isPremium ?? clientProfileInfo.customData === LocationType.Premium.toString();

    // Create promote dialog
    if (!options?.prompt)
      return false;

    const promoteData = vhApp.data.uiState.promoteDialogData;
    promoteData.clientProfileId = clientProfileId;
    promoteData.serverLocation = serverLocation;
    promoteData.showRewardedAd = options.premiumByRewardAd;
    promoteData.showTryPremium = options.premiumByTrial;
    promoteData.showGoPremium = options.premiumByPurchase;
    promoteData.isPremiumLocation = isPremiumLocation;
    promoteData.isVisible = true;

    // Show promote dialog
    await ComponentRouteController.showComponent(ComponentName.PromoteDialog);
    return true;
  }

  public static async connect1(isDiagnose: boolean = false) {
    const clientProfileId = vhApp.data.settings.userSettings.clientProfileId;
    if (!clientProfileId) {
      await router.push('/servers');
      return;
    }
    await this.connect2(clientProfileId, isDiagnose);
  }

  public static async connect2(clientProfileId: string, isDiagnose: boolean = false): Promise<void> {
    const serverLocation = vhApp.data.settings.userSettings.serverLocation ?? '*';
    const clientProfileInfo: ClientProfileInfo = await vhApp.clientProfileClient.get(clientProfileId);
    const isPremiumLocation: boolean = clientProfileInfo.customData === LocationType.Premium.toString() ?? LocationType.Free;
    await this.connect3(clientProfileId, serverLocation, isPremiumLocation, isDiagnose);
  }

  public static async connect3(clientProfileId: string, serverLocation: string, isPremiumLocation: boolean, isDiagnose: boolean = false) {
    if (await this.showPromoteDialog(clientProfileId, isPremiumLocation, serverLocation))
      return;
    await vhApp.connect(clientProfileId, serverLocation, isPremiumLocation, ConnectPlanId.Normal, isDiagnose);
  }
}
