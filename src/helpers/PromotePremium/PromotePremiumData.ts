export class PromotePremiumData {
  public clientProfileId: string | null = null;
  public serverLocation: string | null = null;
  public isPremiumLocation: boolean = false;
  public showGoPremium: boolean = false;
  public normal: number | null | undefined = 0;
  public showRewardedAd?: number | null;
  public showTryPremium?: number | null;
}
