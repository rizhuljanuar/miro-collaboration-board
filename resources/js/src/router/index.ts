import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/app/RouterPlaceholderPage.vue'),
    meta: {
        requiresAuth: false,
    },
  },
  {
    path: '/app/projects',
    name: 'projects',
    component: () => import('@/app/RouterPlaceholderPage.vue'),
    meta: {
        requiresAuth: true,
    },
  },
  {
    path: '/app/projects/:projectId',
    name: 'project-board',
    component: () => import('@/app/RouterPlaceholderPage.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
