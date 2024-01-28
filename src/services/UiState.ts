export class UiState {

    // General custom alert dialog property
    public alertDialogText: string = "";

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

    public isGoogleSignInSupported: boolean = false;

    public showLoadingDialog: boolean = false;
}
