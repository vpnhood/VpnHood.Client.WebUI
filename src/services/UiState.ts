export class UiState {

    // General custom alert dialog property
    public showAlertDialog: boolean = false;
    public alertDialogText: string = "";

    // Public server hint message state
    public showPublicServerHint: boolean = false;

    // Premium server ad state
    public showPremiumServerAd: boolean = false;

    // Suppress message state
    public showSuppressSnackbar: boolean = false;
    public userIgnoreSuppressToTime: Date | null = null;
    public userIgnoreSuppressByTime: Date | null = null;

    // Update message state
    public showUpdateSnackbar: boolean = false;

    // New server added message state
    public showNewServerAdded: boolean = false;

    // Time of user ignored update
    public userIgnoreUpdateTime: number | null = null;

    // Time of user ignored last error message
    public userIgnoreLastErrorTime?: Date | null = null;

}
