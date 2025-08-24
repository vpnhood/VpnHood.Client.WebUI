import { PromotePremiumData } from '@/helpers/PromotePremium/PromotePremiumData';
import { ErrorDialogData } from '@/components/ErrorDialog/ErrorDialogData';
import { GeneralSnackbarData } from '@/components/GeneralSnackbar/GeneralSnackbarData';

export class UiState {

  public errorDialogData: ErrorDialogData = new ErrorDialogData();
  public promotePremiumData: PromotePremiumData = new PromotePremiumData();
  public generalSnackbarData: GeneralSnackbarData = new GeneralSnackbarData();

  // Suppress message state
  public userIgnoreSuppressToTime: Date | null = null;

  // Update message state
  public showUpdateSnackbar: boolean = false;

  // Time of user ignored the last error message
  public configTime: Date = new Date();

  public showLoadingDialog: boolean = false;

  public stateLastErrorMessage: string | null = null;

  public uiConnectInProgress: boolean = false;
  public uiDisconnectInProgress: boolean = false;

  public edgeToEdgeTop: number | null = null;
  public edgeToEdgeBottom: number | null = null;
}
