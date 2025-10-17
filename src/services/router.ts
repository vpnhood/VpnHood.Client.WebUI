import { createRouter, createWebHistory } from 'vue-router';
import { routes } from 'vue-router/auto-routes'
import i18n from '@/locales/i18n';
import { VpnHoodApp } from '@/services/VpnHoodApp';

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Change page title and add transition
router.beforeEach((to, from, next) => {
  // Add the app name to the page title
  const appName = VpnHoodApp.instance.isConnectApp() ? i18n.global.t('VPN_HOOD_CONNECT_APP_NAME') : i18n.global.t('VPN_HOOD_APP_NAME');
  document.title = `${to.meta.title} - ${appName}`;

  const toDepth = to.path.split('/').length;
  const fromDepth = from.path.split('/').length;
  to.meta.transition = toDepth >= fromDepth ? 'translate-with-fade' : 'short-translate';
    next();
});

export default router;
