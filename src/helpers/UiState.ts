import { PromoteDialogData } from '@/components/PromoteDialog/PromoteDialogData';
import { ErrorDialogData } from '@/components/ErrorDialog/ErrorDialogData';
import { GeneralSnackbarData } from '@/components/GeneralSnackbar/GeneralSnackbarData';

export class UiState {

  public errorDialogData: ErrorDialogData = new ErrorDialogData();
  public promoteDialogData: PromoteDialogData = new PromoteDialogData();
  public generalSnackbarData: GeneralSnackbarData = new GeneralSnackbarData();

  // Suppress message state
  public showSuppressSnackbar: boolean = false;
  public userIgnoreSuppressToTime: Date | null = null;
  public userIgnoreSuppressByTime: Date | null = null;

  // Update message state
  public showUpdateSnackbar: boolean = false;

  // Time of user ignored last error message
  public configTime: Date = new Date();

  public showLoadingDialog: boolean = false;

  public stateLastErrorMessage: string | null = null;

}
