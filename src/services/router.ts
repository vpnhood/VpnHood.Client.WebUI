import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../pages/HomePage.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
    meta: {
      title: 'Home'
    }
  },
  {
    path: '/settings',
    name: 'SETTINGS',
    component: () => import(/* webpackChunkName: "Settings" */ '@/pages/AppSettings.vue'),
    meta: {
      title: 'Settings'
    }
  },
  {
    path: '/apps-filter',
    name: 'APP_FILTER',
    component: () => import(/* webpackChunkName: "AppsFilter" */ '@/pages/AppsFilter.vue'),
    meta: {
      title: 'Apps Filter'
    }
  },
  {
    path: '/servers',
    name: 'SERVERS',
    component: () => import(/* webpackChunkName: "Servers" */ '@/pages/ServersList.vue'),
    meta: {
      title: 'Servers'
    }
  },
  {
    path: '/languages',
    name: 'LANGUAGE',
    component: () => import(/* webpackChunkName: "Languages" */ '@/pages/AppLanguages.vue'),
    meta: {
      title: 'Languages'
    }
  },
  {
    path: '/purchase-subscription',
    component: () => import(/* webpackChunkName: "PurchaseSubscription" */ '@/pages/SpecialPages/PurchaseSubscription.vue'),
    meta: {
      title: 'Purchase Subscription',
      gradBg: true
    }
  },
  {
    path: '/account',
    name: 'ACCOUNT',
    component: () => import(/* webpackChunkName: "Account" */ '@/pages/UserAccount.vue'),
    meta: {
      title: 'Account'
    }
  },
  {
    path: '/extend-session',
    component: () => import(/* webpackChunkName: "ExtendSession" */ '@/pages/SpecialPages/ExtendSession.vue'),
    meta: {
      title: 'Extend Session'
    }
  },
  {
    path: '/promote-premium',
    component: () => import(/* webpackChunkName: "PromotePremium" */ '@/pages/SpecialPages/PromotePremium.vue'),
    meta: {
      title: 'Promote Premium'
    }
  },
  {
    path: '/filter-ips-by-device',
    name: 'FILTER_IPS_BY_DEVICE',
    component: () => import(/* webpackChunkName: "FilterIPsByDevice" */ '@/pages/FilterIPsByDevice.vue'),
    meta: {
      title: 'Filter IPs By Device'
    }
  },
  {
    path: '/filter-ips-by-app',
    name: 'FILTER_IPS_BY_APP',
    component: () => import(/* webpackChunkName: "FilterIPsByApp" */ '@/pages/FilterIPsByApp.vue'),
    meta: {
      title: 'Filter IPs By App'
    }
  },
  {
    path: '/statistics',
    name: 'STATISTICS',
    component: () => import(/* webpackChunkName: "Statistics" */ '@/pages/UsageStatistics.vue'),
    meta: {
      title: 'Statistics'
    }
  },
  {
    path: '/premium-user',
    name: 'PREMIUM_USER',
    component: () => import(/* webpackChunkName: "Premium User" */ '@/pages/PremiumUser.vue'),
    meta: {
      title: 'Premium User'
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

export default router;
