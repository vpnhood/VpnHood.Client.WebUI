export class ConfirmDialogData {
    isOpenDialog: boolean = false;
    title: string = "";
    message: string = "";
    resolve!: (value: (PromiseLike<boolean> | boolean)) => void;

    get isOpen(): boolean{return this.isOpenDialog;}
    set isOpen(value: boolean){this.isOpenDialog = value;}

    showDialog(title: string, message: string): Promise<boolean>{
        this.title = title;
        this.message = message;
        this.isOpen = true;
        return new Promise<boolean>((resolve) => {
            this.resolve = resolve;
        });
    }
    closeDialog(result: boolean){
        this.isOpen = false;
        this.resolve(result);
        console.log("Confirm Dialog Task = " + result);
    }
}
