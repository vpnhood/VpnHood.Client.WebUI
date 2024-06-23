export class Config {
    isOpenField: boolean = false;
    openPromise: string = "";
    resolve!: (value: (PromiseLike<string> | string)) => void;

    get isOpen(): boolean{
        return this.isOpenField;
    }
    set isOpen(value: boolean){
        this.isOpenField = value;
    }
    showDialog(): Promise<string>{
        this.isOpen = true;
        return new Promise<string>((resolve) => {
            this.resolve = resolve;
        });
    }
    close(result: string){
        this.isOpen = false;
        this.resolve(result)

    }
}