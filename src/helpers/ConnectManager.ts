import { VpnHoodApp } from '@/services/VpnHoodApp';
import { ClientProfileInfo, ConnectPlanId, ServerLocationOptions } from '@/services/VpnHood.Client.Api';
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
    const promoteData = VpnHoodApp.instance.data.uiState.promotePremiumData;
    promoteData.clientProfileId = clientProfileId;
    promoteData.serverLocation = serverLocation;
    promoteData.showRewardedAd = options.premiumByRewardedAd;
    promoteData.showTryPremium = options.premiumByTrial;
    promoteData.premiumByPurchase = options.premiumByPurchase;
    promoteData.premiumByCode = options.premiumByCode;
    promoteData.canGoPremium = options.canGoPremium;
    promoteData.normal = options.normal
    promoteData.isPremiumLocation = isPremium;

    // Show promote dialog
    await router.push('/promote-premium')
    return true;
  }

  public static async connect1(isDiagnose: boolean = false) {
    const clientProfileId = VpnHoodApp.instance.data.state.clientProfile?.clientProfileId;

    // For developer
    console.log("Connect1");
    console.log(`ClientProfileId: ${clientProfileId}`);

    if (!clientProfileId) {
      await router.push('/servers');
      return;
    }
    await this.connect2(clientProfileId, isDiagnose);
  }

  public static async connect2(clientProfileId: string, isDiagnose: boolean = false): Promise<void> {
    const clientProfileInfo: ClientProfileInfo = await VpnHoodApp.instance.clientProfileClient.get(clientProfileId);
    const serverLocation: string | undefined = clientProfileInfo.selectedLocationInfo?.serverLocation;

    // For developer
    console.log("Connect2");
    console.log('Detected server location: ' + serverLocation);

    if (!serverLocation && clientProfileInfo.selectedLocationInfo){
      await router.push('/servers');
      return;
    }

    let isPremiumLocation = clientProfileInfo.isPremiumLocationSelected;

    if(clientProfileInfo.selectedLocationInfo?.options.hasPremium && !clientProfileInfo.selectedLocationInfo?.options.hasFree)
      isPremiumLocation = true;

    if(!clientProfileInfo.selectedLocationInfo?.options.hasPremium && clientProfileInfo.selectedLocationInfo?.options.hasFree)
      isPremiumLocation = false;

    await this.connect3(clientProfileId, serverLocation, isPremiumLocation, isDiagnose);
  }

  public static async connect3(clientProfileId: string, serverLocation: string | undefined, isPremiumLocation: boolean, isDiagnose: boolean = false) {
    // For developer
    console.log("Connect3");
    console.log('isPremiumLocation: ' + isPremiumLocation);

    if (serverLocation && await this.showPromoteDialog(clientProfileId, serverLocation, isPremiumLocation))
      return;

    await VpnHoodApp.instance.connect(clientProfileId, serverLocation, isPremiumLocation, ConnectPlanId.Normal, isDiagnose);
  }
}
