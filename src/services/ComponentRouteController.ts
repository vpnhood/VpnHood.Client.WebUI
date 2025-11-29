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
          await this.showComponentInternal(componentName, value);

          //show component by delay to make sure previous back is finished
          await this.delay(value ? 200 : 100);
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
          // make sure remove the route (because back may not work)
          const query = { ...route.query };
          delete query[componentName];
          await router.replace({ path: route.path, query: query });

          // remove the route from history
          router.back();
        }
    }
}
