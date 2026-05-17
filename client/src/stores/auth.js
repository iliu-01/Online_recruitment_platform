import { defineStore } from 'pinia';
import { authApi } from '@/api/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    role: (state) => state.user?.role || '',
    userId: (state) => state.user?.id || null,
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
