import api from './index';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

export const resumeApi = {
  get: () => api.get('/resume'),
  upsert: (data) => api.put('/resume', data),
  uploadAttachment: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/resume/attachments', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  deleteAttachment: (id) => api.delete(`/resume/attachments/${id}`),
  getAttachmentUrl: (id) => `/api/resume/attachments/${id}`,
};

export const jobsApi = {
  search: (params) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  close: (id) => api.delete(`/jobs/${id}`),
  getMine: () => api.get('/jobs/mine'),
};

export const applicationsApi = {
  apply: (data) => api.post('/applications', data),
  getMine: (status) => api.get('/applications/mine', { params: { status } }),
  getReceived: (jobId) => api.get('/applications/received', { params: { job_id: jobId } }),
  updateStatus: (id, status) => api.put(`/applications/${id}/status`, { status }),
};

export const conversationsApi = {
  list: () => api.get('/conversations'),
  getMessages: (id, before) => api.get(`/conversations/${id}/messages`, { params: { before } }),
  create: (data) => api.post('/conversations', data),
  unreadCount: () => api.get('/conversations/unread-count'),
};

export const notificationsApi = {
  list: (page) => api.get('/notifications', { params: { page } }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export const adminApi = {
  stats: () => api.get('/admin/stats'),
  listUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  listJobs: (params) => api.get('/admin/jobs', { params }),
  deleteJob: (id) => api.delete(`/admin/jobs/${id}`),
};
