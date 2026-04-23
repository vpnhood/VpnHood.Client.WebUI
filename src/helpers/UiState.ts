import { ErrorDialogState } from '@/helpers/ui-state/ErrorDialogState';
import { GeneralSnackbarState } from '@/helpers/ui-state/GeneralSnackbarState';
import { ConfirmDialogState } from '@/helpers/ui-state/ConfirmDialogState';

export class UiState {

  public errorDialogState: ErrorDialogState = new ErrorDialogState();
  public generalSnackbarState: GeneralSnackbarState = new GeneralSnackbarState();
  public confirmDialogState: ConfirmDialogState = new ConfirmDialogState();

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

  public isShowDeveloperDialog: boolean = false;

  public maxWidthOnLargeScreen = "959px";
  public autoLocationValue = null;
  public allCountriesCount = 238;
}
