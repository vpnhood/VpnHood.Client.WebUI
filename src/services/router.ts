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
    component: () => import(/* webpackChunkName: "Languages" */ '@/pages/AppLanguages.vue'),
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
  },
  {
    path: '/account',
    name: 'Account',
    component: () => import(/* webpackChunkName: "Account" */ '@/pages/UserAccount.vue'),
    meta: {
      title: 'Account',
    }
  },
  {
    path: '/extend-session',
    name: 'Extend Session',
    component: () => import(/* webpackChunkName: "ExtendSession" */ '@/pages/ExtendSession.vue'),
    meta: {
      title: 'Extend Session',
    }
  },
  {
    path: '/promote-premium',
    name: 'Promote Premium',
    component: () => import(/* webpackChunkName: "PromotePremium" */ '@/pages/PromotePremium.vue'),
    meta: {
      title: 'Promote Premium',
    }
  },
  {
    path: '/filter-ips-by-device',
    name: 'Filter IPs By Device',
    component: () => import(/* webpackChunkName: "FilterIPsByDevice" */ '@/pages/FilterIPsByDevice.vue'),
    meta: {
      title: 'Filter IPs By Device',
    }
  },
  {
    path: '/filter-ips-by-app',
    name: 'Filter IPs By App',
    component: () => import(/* webpackChunkName: "FilterIPsByApp" */ '@/pages/FilterIPsByApp.vue'),
    meta: {
      title: 'Filter IPs By App',
    }
  },
  {
    path: '/premium-statistics',
    name: 'Premium Statistics',
    component: () => import(/* webpackChunkName: "Premium Statistics" */ '@/pages/PremiumStatistics.vue'),
    meta: {
      title: 'Premium Statistics',
    }
  },
  {
    path: '/premium-user',
    name: 'Premium User',
    component: () => import(/* webpackChunkName: "Premium User" */ '@/pages/PremiumUser.vue'),
    meta: {
      title: 'Premium User',
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
