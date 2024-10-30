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

// General custom alert dialog property
export class ErrorDialogData {
    public isVisible: boolean = false;
    public message: string = "";
    public canDiagnose: boolean = false;
    public logExists: boolean = false;
    public showChangeServerToAutoButton: boolean = false;
}

// General custom alert dialog property
export class PromoteDialogData {
    public isVisible: boolean = false;
    public message: string = "";
}
