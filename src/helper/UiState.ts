import { PromoteDialogData } from '@/components/PromoteDialog/PromoteDialogData';
import { ErrorDialogData } from '@/components/ErrorDialog/ErrorDialogData';

export class UiState {

  public errorDialogData: ErrorDialogData = new ErrorDialogData();
  public promoteDialogData: PromoteDialogData = new PromoteDialogData();

  // Suppress message state
  public showSuppressSnackbar: boolean = false;
  public userIgnoreSuppressToTime: Date | null = null;
  public userIgnoreSuppressByTime: Date | null = null;

  // Update message state
  public showUpdateSnackbar: boolean = false;

  // New server added message state
  public showNewServerAdded: boolean = false;

  // Time of user ignored last error message
  public configTime: Date = new Date();

  public showLoadingDialog: boolean = false;

  public stateLastErrorMessage: string | null = null;
}
