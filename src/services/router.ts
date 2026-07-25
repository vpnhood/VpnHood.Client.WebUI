import { createRouter, createWebHistory } from 'vue-router';
import { routes } from 'vue-router/auto-routes'
import { VpnHoodApp } from '@/services/VpnHoodApp';

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: (_to, _from, savedPosition) => savedPosition ?? { top: 0 }
});

// Change page title and add transition. Returning nothing continues the navigation; the next()
// callback is deprecated in vue-router 5.
router.beforeEach((to, from) => {
  const toDepth = to.path.split('/').length;
  const fromDepth = from.path.split('/').length;
  to.meta.transition = toDepth >= fromDepth ? 'translate-with-fade' : 'short-translate';
});

// Update document title after navigation. Dont change the page title in beforeEach
router.afterEach((to) => {
  // Add the app name to the page title
  const appName = VpnHoodApp.instance.data.features.appName;
  document.title = `${to.meta.title} - ${appName}`;
});

export default router;
