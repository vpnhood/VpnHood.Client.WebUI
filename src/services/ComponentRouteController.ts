import router from "@/services/router";
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

    private static delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    public static async showComponent(componentName: string, value: boolean = true): Promise<void> {
        const showLock: AsyncLock = new AsyncLock();
        await showLock.acquire("showLock", async () => {
            // wait to make sure we are not in the middle of navigation
            // v-model may call showComponentin middle of navigation
            await this.delay(100); 
            await this.showComponentInternal(componentName, value);
        });
    }
    private static async showComponentInternal(componentName: string, value: boolean): Promise<void> {
        if (value === this.isShowComponent(componentName))
            return;

        const route = router.currentRoute.value;
        if (value) {
            await router.push({ path: route.path, query: { ...route.query, [componentName]: "true" } });
            window.document.title = componentName;
        } else {
            // make sure remove the component query param before call router.back()
            // because router.back() is not async, and this method will return without removing the query param
            // so loop may occur
            const query = { ...route.query };
            delete query[componentName];
             await router.replace({ path: route.path, query: query });

            // remove the route from browser history
            /// router.replace can not remove the history entry
            router.back();
        }
    }
}
