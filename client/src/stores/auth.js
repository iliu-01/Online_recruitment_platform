import { defineStore } from 'pinia';
import { authApi } from '@/api/auth';

function decodeToken(token) {
  if (!token) return null;
  try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    role: (state) => state.user?.role || decodeToken(state.token)?.role || '',
    pathPrefix: (state) => {
    const role = state.user?.role || decodeToken(state.token)?.role;
    if (role === 'job_seeker') return 'seeker';
    if (role === 'company') return 'company';
    if (role === 'admin') return 'admin';
    return 'company';
  },
    userId: (state) => state.user?.id || decodeToken(state.token)?.id || null,
  },
  actions: {
    async login(email, password) {
      const { data } = await authApi.login({ email, password });
      this.token = data.token;
      this.user = data.user;
      localStorage.setItem('token', data.token);
    },
    async register(email, password, role) {
      const { data } = await authApi.register({ email, password, role });
      this.token = data.token;
      this.user = data.user;
      localStorage.setItem('token', data.token);
    },
    async fetchUser() {
      const { data } = await authApi.me();
      this.user = data.user;
    },
    logout() {
      this.token = '';
      this.user = null;
      localStorage.removeItem('token');
    },
  },
});
