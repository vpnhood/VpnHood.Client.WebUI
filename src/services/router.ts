import { createRouter, createWebHistory } from 'vue-router';
import { routes } from 'vue-router/auto-routes'

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Change page title and add transition
router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title}`;
  const toDepth = to.path.split('/').length;
  const fromDepth = from.path.split('/').length;
  to.meta.transition = toDepth >= fromDepth ? 'translate-with-fade' : 'short-translate';
    next();
});

export default router;
