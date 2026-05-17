import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: () => import('@/views/auth/LoginView.vue'), meta: { guest: true } },
  { path: '/register', name: 'Register', component: () => import('@/views/auth/RegisterView.vue'), meta: { guest: true } },
  {
    path: '/seeker',
    component: () => import('@/layouts/SeekerLayout.vue'),
    meta: { requiresAuth: true, role: 'job_seeker' },
    children: [
      { path: 'dashboard', name: 'SeekerDashboard', component: () => import('@/views/seeker/DashboardView.vue') },
      { path: 'resume', name: 'SeekerResume', component: () => import('@/views/seeker/ResumeView.vue') },
      { path: 'resume/attachments', name: 'SeekerAttachments', component: () => import('@/views/seeker/AttachmentsView.vue') },
      { path: 'jobs', name: 'SeekerJobs', component: () => import('@/views/seeker/JobListView.vue') },
      { path: 'jobs/:id', name: 'SeekerJobDetail', component: () => import('@/views/seeker/JobDetailView.vue') },
      { path: 'applications', name: 'SeekerApplications', component: () => import('@/views/seeker/ApplicationListView.vue') },
      { path: 'messages', name: 'SeekerMessages', component: () => import('@/views/seeker/MessageListView.vue') },
      { path: 'messages/:id', name: 'SeekerChat', component: () => import('@/views/seeker/ChatView.vue') },
    ],
  },
  {
    path: '/company',
    component: () => import('@/layouts/CompanyLayout.vue'),
    meta: { requiresAuth: true, role: 'company' },
    children: [
      { path: 'dashboard', name: 'CompanyDashboard', component: () => import('@/views/company/DashboardView.vue') },
      { path: 'jobs', name: 'CompanyJobs', component: () => import('@/views/company/JobListView.vue') },
      { path: 'jobs/create', name: 'CompanyJobCreate', component: () => import('@/views/company/JobCreateView.vue') },
      { path: 'jobs/:id/edit', name: 'CompanyJobEdit', component: () => import('@/views/company/JobEditView.vue') },
      { path: 'jobs/:id/applications', name: 'CompanyJobApplications', component: () => import('@/views/company/JobApplicationsView.vue') },
      { path: 'applications/:id', name: 'CompanyApplicationDetail', component: () => import('@/views/company/ApplicationDetailView.vue') },
      { path: 'messages', name: 'CompanyMessages', component: () => import('@/views/company/MessageListView.vue') },
      { path: 'messages/:id', name: 'CompanyChat', component: () => import('@/views/company/ChatView.vue') },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.path === '/login' || to.path === '/register') {
    if (authStore.isLoggedIn) return next(`/${authStore.role}`);
    return next();
  }

  if (!authStore.isLoggedIn) return next('/login');
  if (to.meta.role && to.meta.role !== authStore.role) return next(`/${authStore.role}/dashboard`);
  next();
});

export default router;
