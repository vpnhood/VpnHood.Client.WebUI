export class GeneralSnackbarData {
  public message: string = "";
  public color: string = "";
  public textColor: string | null = null;
  public isShow: boolean = false;
  public isTimerAvailable: boolean = true;
  public timeOut: number | null = 5000;
  public hasCloseBtn: boolean = true;
}
