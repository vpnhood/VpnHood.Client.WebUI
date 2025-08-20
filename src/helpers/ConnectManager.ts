import { VpnHoodApp } from '@/services/VpnHoodApp';
import { ClientProfileInfo, ConnectPlanId, ServerLocationOptions } from '@/services/VpnHood.Client.Api';
import router from '@/services/router';

export class ConnectManager {
  public static async showPromoteDialog(clientProfileId: string, serverLocation: string, isPremium: boolean): Promise<boolean> {

    const clientProfileInfo: ClientProfileInfo = await VpnHoodApp.instance.clientProfileClient.get(clientProfileId);
    const options: ServerLocationOptions | undefined = clientProfileInfo.locationInfos.find(
      x => x.serverLocation === serverLocation)?.options;

    // Fore developer
    console.log('Show Prompt: ' + options?.prompt);

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
    promoteData.normal = options.normal;
    promoteData.isPremiumLocation = isPremium;

    // Show promotes dialog
    await router.push({name: 'PROMOTE_PREMIUM'});
    return true;
  }

  public static async connect1(isDiagnose: boolean = false): Promise<void> {
    const clientProfileId = VpnHoodApp.instance.data.state.clientProfile?.clientProfileId;

    // For developer
    console.log('Connect1');
    console.log(`ClientProfileId: ${clientProfileId}`);

    if (!clientProfileId) {
      await router.push({name: 'SERVERS'});
      return;
    }
    await this.connect2(clientProfileId, isDiagnose);
  }

  public static async connect2(clientProfileId: string, isDiagnose: boolean = false): Promise<void> {
    const clientProfileInfo: ClientProfileInfo = await VpnHoodApp.instance.clientProfileClient.get(clientProfileId);
    let serverLocation: string | undefined = clientProfileInfo.selectedLocationInfo?.serverLocation;

    // For developer
    console.log('Connect2');
    console.log('Detected server location: ' + serverLocation);

    if (!serverLocation && clientProfileInfo.selectedLocationInfo) {
      await router.push({name: 'SERVERS'});
      return;
    }

    const hasPremium = clientProfileInfo.selectedLocationInfo?.options.hasPremium;
    const hasFree = clientProfileInfo.selectedLocationInfo?.options.hasFree;

    let isPremiumLocationSelected = clientProfileInfo.isPremiumLocationSelected;

    if (hasPremium && !hasFree)
      isPremiumLocationSelected = true;

    if (!hasPremium && hasFree)
      isPremiumLocationSelected = false;

    // If the user is not premium and the selected location is premium, then set the location to auto to show the
    // promoted dialog with the option to connect as free.
    /*if (isPremiumLocationSelected && VpnHoodApp.instance.data.features.isPremiumFlagSupported && !VpnHoodApp.instance.isPremiumAccount()){
      isPremiumLocationSelected = false;
      serverLocation = '*!/!*';
    }*/

    // Force the premium user to connect to the premium location.
    if (VpnHoodApp.instance.isPremiumAccount() && VpnHoodApp.instance.data.features.isPremiumFlagSupported && !isPremiumLocationSelected ){
      isPremiumLocationSelected = true;
      serverLocation = '*/*';
    }

    await this.connect3(clientProfileId, serverLocation, isPremiumLocationSelected, isDiagnose, undefined);
  }

  public static async connect3(
    clientProfileId: string,
    serverLocation: string | undefined,
    isPremiumLocation: boolean,
    isDiagnose: boolean = false,
    goToHome: boolean | undefined = true
  ): Promise<void> {
    // For developer
    console.log('Connect3');
    console.log('isPremiumLocation: ' + isPremiumLocation);
    console.log('goToHome: ' + goToHome);

    if (serverLocation && await this.showPromoteDialog(clientProfileId, serverLocation, isPremiumLocation))
      return;

    try {
      await VpnHoodApp.instance.connect(clientProfileId, serverLocation, isPremiumLocation, ConnectPlanId.Normal, isDiagnose, goToHome);
    }
    catch{
      // Ignore message
    }

  }
}
