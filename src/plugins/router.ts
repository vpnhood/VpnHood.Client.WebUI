import {createRouter, createWebHistory} from 'vue-router'
import HomePage from '../pages/HomePage.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
    meta: {
      title: 'Home',
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import(/* webpackChunkName: "Settings" */ '@/pages/AppSettings.vue'),
    meta: {
      title: 'Settings',
    }
  },
  {
    path: '/apps-filter',
    name: 'Apps Filter',
    component: () => import(/* webpackChunkName: "AppsFilter" */ '@/pages/AppsFilter.vue'),
    meta: {
      title: 'Apps Filter',
    }
  },
  {
    path: '/servers',
    name: 'Servers',
    component: () => import(/* webpackChunkName: "Servers" */ '@/pages/ServersList.vue'),
    meta: {
      title: 'Servers',
    }
  },
  {
    path: '/languages',
    name: 'Languages',
    component: () => import(/* webpackChunkName: "Languages" */ '@/pages/Languages.vue'),
    meta: {
      title: 'Languages',
    }
  },
  {
    path: '/purchase-subscription',
    name: 'Purchase Subscription',
    component: () => import(/* webpackChunkName: "PurchaseSubscription" */ '@/pages/PurchaseSubscription.vue'),
    meta: {
      title: 'Purchase Subscription',
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Change page title
router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title}`;
  next();
});

export default router
