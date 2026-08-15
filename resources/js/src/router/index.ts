import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

import { pinia } from '@/app/pinia';
import { useAuthStore } from '@/stores/auth.store';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/auth/LoginPage.vue'),
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: '/app/projects',
    name: 'projects',
    component: () => import('@/pages/admin/ProjectsPage.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/app/projects/:projectId',
    name: 'project-board',
    component: () => import('@/pages/admin/project-board/ProjectBoardPage.vue'),
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

router.beforeEach(async (to) => {
  const authStore = useAuthStore(pinia);

  if (!authStore.isInitialized) {
    await authStore.fetchCurrentUser();
  }

  const requiresAuth = to.matched.some((route) => route.meta.requiresAuth === true);

  if (requiresAuth && !authStore.isAuthenticated) {
    return {
      name: 'login',
      query: {
        redirect: to.fullPath,
      },
    };
  }

  if (to.name === 'login' && authStore.isAuthenticated) {
    return {
      name: 'projects',
    };
  }

  return true;
})

export default router;
