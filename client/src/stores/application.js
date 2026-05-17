import { defineStore } from 'pinia';
import { applicationsApi } from '@/api/auth';

export const useApplicationStore = defineStore('application', {
  state: () => ({
    applications: [],
    statusFilter: '',
  }),
  actions: {
    async fetchMine(status) {
      const { data } = await applicationsApi.getMine(status);
      this.applications = data.applications;
    },
    async fetchReceived(jobId) {
      const { data } = await applicationsApi.getReceived(jobId);
      this.applications = data.applications;
    },
    async apply(data) {
      await applicationsApi.apply(data);
    },
    async updateStatus(id, status) {
      await applicationsApi.updateStatus(id, status);
    },
  },
});
