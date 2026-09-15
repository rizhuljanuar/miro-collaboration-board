import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../pages/auth/LoginPage.vue'),
  },
  {
    path: '/projects',
    name: 'projects',
    component: () => import('../pages/admin/ProjectPage.vue'),
  },
  {
    path: '/projects/:projectId',
    name: 'project-board',
    component: () => import('../pages/admin/ProjectBoardPage.vue'),
    props: true,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../pages/NotFoundPage.vue'),
  }
];

const router = createRouter({
  history: createWebHistory('/app/'),
  routes,
});

export default router;
