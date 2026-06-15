import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: () => import('@/views/auth/LoginView.vue') },
  { path: '/register', name: 'Register', component: () => import('@/views/auth/RegisterView.vue') },
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
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: 'dashboard', name: 'AdminDashboard', component: () => import('@/views/admin/DashboardView.vue') },
      { path: 'users', name: 'AdminUsers', component: () => import('@/views/admin/UsersView.vue') },
      { path: 'jobs', name: 'AdminJobs', component: () => import('@/views/admin/JobsView.vue') },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

function roleToPath(r) {
  if (r === 'job_seeker') return 'seeker';
  if (r === 'company') return 'company';
  if (r === 'admin') return 'admin';
  return 'company';
}

router.beforeEach((to, from) => {
  const token = localStorage.getItem('token');
  let role = '';
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      role = payload.role || '';
    } catch { localStorage.removeItem('token'); }
  }

  // 已登录用户访问登录/注册页 → 重定向到对应控制台
  if (to.path === '/login' || to.path === '/register') {
    if (role) return `/${roleToPath(role)}/dashboard`;
    return true;
  }

  // 未登录用户访问需要认证的页面 → 重定向到登录页
  if (!role) return '/login';

  // 角色不匹配 → 重定向到正确的控制台
  if (to.meta.role && to.meta.role !== role) return `/${roleToPath(role)}/dashboard`;

  return true;
});

export default router;
