import {createRouter, createWebHistory} from 'vue-router'
import HomePage from '../pages/Home.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: HomePage
    },
    {
        path: '/settings',
        name: 'Settings',
        component: () => import(/* webpackChunkName: "Settings" */ '@/pages/Settings.vue'),
    },
    {
        path: '/apps-filter',
        name: 'Apps Filter',
        component: () => import(/* webpackChunkName: "AppsFilter" */ '@/pages/AppsFilter.vue'),
    },
    {
        path: '/servers',
        name: 'Servers',
        component: () => import(/* webpackChunkName: "Servers" */ '@/pages/Servers.vue'),
    },
    {
        path: '/languages',
        name: 'Languages',
        component: () => import(/* webpackChunkName: "Languages" */ '@/pages/Languages.vue'),
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router
