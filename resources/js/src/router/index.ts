import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

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

export default router;
