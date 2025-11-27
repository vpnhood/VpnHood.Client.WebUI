import { computed, ref } from 'vue';
import { AppPurchaseOptions, BillingPurchaseState, SubscriptionPlan } from '@/services/VpnHood.Client.Api';
import { VpnHoodApp } from '@/services/VpnHoodApp';
import { GooglePlayBillingSubscriptionPeriods } from '@/helpers/googlePlayBilling/GooglePlayBillingSubscriptionPeriods';
import { Util } from '@/helpers/Util';
import router from '@/services/router';

export class PurchaseSubscriptionUtil {
  public static purchaseOptions = ref<AppPurchaseOptions | null>(null);
  public static showPurchaseViaWeb = ref<boolean>(false);
  public static showPurchaseViaGoogle = ref<boolean>(false);
  public static isGoogleBillingAvailable = ref<boolean>(true);
  public static subscriptionPlans = ref<SubscriptionPlan[]>([]);
  public static showProcessDialog = ref<boolean>(false);
  public static purchaseCompleteDialogMessage = ref<string | null>(null);
  public static selectedPlan = ref<SubscriptionPlan | null>(null);
  public static basePrice = ref<number>(0);

  public static isShowProcessDialog = computed<boolean>(() => {
    return VpnHoodApp.instance.data.state.purchaseState === BillingPurchaseState.Processing || this.showProcessDialog.value;
  });

  public static isNewCode = computed<boolean | undefined>(() => {
    return VpnHoodApp.instance.data.state.sessionInfo?.accessInfo?.isNew;
  });
  public static premiumCodeDeviceCount = computed<number | undefined>(() => {
    return VpnHoodApp.instance.data.state.sessionInfo?.accessInfo?.devicesSummary?.deviceCount;
  });
  public static premiumCodeActivationDate = computed<Date | undefined>(() => {
    return VpnHoodApp.instance.data.state.sessionInfo?.accessInfo?.createdTime;
  });
  public static premiumCodeExpirationDate = computed<Date | null | undefined>(() => {
    return VpnHoodApp.instance.data.state.sessionInfo?.accessInfo?.expirationTime;
  });

  public static getPlanTitle(planPeriod: string){
    switch (planPeriod) {
      case GooglePlayBillingSubscriptionPeriods.P1M:
        return "1_MONTH";
      case GooglePlayBillingSubscriptionPeriods.P6M:
        return "6_MONTHS";
      case GooglePlayBillingSubscriptionPeriods.P1Y:
        return "1_YEAR";
      default:
        return "UNKNOWN_ERROR";
    }
  }
  public static getPlanPricePeriod(planPeriod: string): string{
    switch (planPeriod) {
      case GooglePlayBillingSubscriptionPeriods.P1M:
        return "PER_MONTH";
      case GooglePlayBillingSubscriptionPeriods.P6M:
        return "PER_6_MONTHS";
      case GooglePlayBillingSubscriptionPeriods.P1Y:
        return "PER_YEAR";
      default:
        return "UNKNOWN_ERROR";
    }
  }
  public static calcBasePrice(planPeriod: string): number{
    switch (planPeriod) {
      case GooglePlayBillingSubscriptionPeriods.P1M:
        return this.basePrice.value;
      case GooglePlayBillingSubscriptionPeriods.P6M:
        return this.basePrice.value * 6;
      case GooglePlayBillingSubscriptionPeriods.P1Y:
        return this.basePrice.value * 12;
      default:
        return this.basePrice.value;
    }
  }

  public static calcDiscountPercentage(currentPrice: number, planPeriod: string): number{
    switch (planPeriod) {
      case GooglePlayBillingSubscriptionPeriods.P1M:
        return Util.calcPercentage(this.basePrice.value, currentPrice);
      case GooglePlayBillingSubscriptionPeriods.P6M:
        return Util.calcPercentage(this.basePrice.value * 6, currentPrice);
      case GooglePlayBillingSubscriptionPeriods.P1Y:
        return Util.calcPercentage(this.basePrice.value * 12, currentPrice);
      default:
        return Util.calcPercentage(this.basePrice.value, currentPrice);
    }
  }
  public static isShowDiscount(currentPrice: number, planPeriod: string): boolean{
    return !(planPeriod === GooglePlayBillingSubscriptionPeriods.P1M && currentPrice === this.basePrice.value);
  }

  public static async closeCompleteDialog(showStatistics: boolean) {
    this.purchaseCompleteDialogMessage.value = null;
    await router.replace({ name: showStatistics ? 'STATISTICS' : 'HOME' });
  }
}
