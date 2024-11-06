export class PromoteDialogData {
  public clientProfileId: string | null = null;
  public serverLocation: string | null = null;
  public isPremiumLocation: boolean = false;
  public showGoPremium: boolean = false;
  public showRewardedAd?: number | null;
  public showTryPremium?: number | null;
  public isVisible: boolean = false;
}
