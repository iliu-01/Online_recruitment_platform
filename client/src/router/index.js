import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: () => import('@/views/auth/LoginView.vue') },
  { path: '/register', name: 'Register', component: () => import('@/views/auth/RegisterView.vue') },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
