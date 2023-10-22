import router from "@/plugins/router";
import AsyncLock from 'async-lock';

export class ComponentRouteController {

    public componentName: string;
    private constructor(componentName: string) {
        this.componentName = componentName;
    }
    public get isShow(): boolean {
        return ComponentRouteController.isShowComponent(this.componentName);
    }

    // noinspection JSUnusedGlobalSymbols
    public set isShow(value: boolean) {
        ComponentRouteController.showComponent(this.componentName, value).then();
    }

    public static create(componentName: string): ComponentRouteController {
        return new ComponentRouteController(componentName);
    }

    public static isShowComponent(componentName: string): boolean {
        return router.currentRoute.value.query[componentName] === "true";
    }

    public static async showComponent(componentName: string, value: boolean = true): Promise<void> {
        //show component by timeout tp make sure previus back is finished
        setTimeout(() => {
            const showLock: AsyncLock = new AsyncLock();
            showLock.acquire("showLock", async () => {
                await this.showComponentInternal(componentName, value);
            });
        }, value ? 100 : 0);

        return Promise.resolve();
    }
    private static async showComponentInternal(componentName: string, value: boolean): Promise<void> {
        if (value === this.isShowComponent(componentName))
            return;

        const route = router.currentRoute.value;
        if (value) {
            await router.push({ path: route.path, query: { ...route.query, [componentName]: "true" } });
            window.document.title = componentName;
        } else {
            // make sure remove the route (because back may not work)
            const query = { ...route.query };
            delete query[componentName];
            router.push({ path: route.path, query: query, replace: true });

            // remove the route from history
            router.back();
        }
    }

}
