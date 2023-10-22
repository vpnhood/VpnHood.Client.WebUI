/*
import router from "@/plugins/router";
import {ComponentName} from "@/UiConstants";

export class ComponentRouteController {

    private static showComponentPromise: Promise<void> = Promise.resolve();
    public componentName: string;
    private constructor(componentName: string) {
        this.componentName = componentName;
    }
    public get isShow(): boolean {
        return ComponentRouteController.isShowComponent(this.componentName);
    }

    // noinspection JSUnusedGlobalSymbols
    public set isShow(value: boolean) {
        ComponentRouteController.showComponent(value, this.componentName).then();
    }

    public static create(componentName: string): ComponentRouteController {
        return new ComponentRouteController(componentName);
    }

    public static isShowComponent(componentName: string): boolean {
        return router.currentRoute.value.query[componentName] === "true";
    }

    public static async showComponent(value: boolean, componentName: string): Promise<void> {
        await this.showComponentPromise;
        console.log(value, componentName);
        this.showComponentPromise = this.showComponentInternal(value, componentName);
        await this.showComponentPromise;
        console.log(value, componentName);
    }
    private static async showComponentInternal(value: boolean, componentName: string): Promise<void> {

        if (value === this.isShowComponent(componentName))
            return;
        console.log(value, this.isShowComponent(componentName));
        if (this.isShowComponent(ComponentName.NavigationDrawer)){
            const query = {...router.currentRoute.value.query};
            delete query[componentName];
            await router.replace({query});
        }

        if (value) {
            await router.push({query: {...router.currentRoute.value.query, [componentName]: "true"}});
        } else if (router.currentRoute.value.query[componentName]) {
            const query = {...router.currentRoute.value.query};
            delete query[componentName];
            router.back();

        }
    }

}*/
