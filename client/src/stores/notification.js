import { defineStore } from 'pinia';
import { notificationsApi } from '@/api/auth';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
  }),
  actions: {
    async fetchList(page = 1) {
      const { data } = await notificationsApi.list(page);
      this.notifications = data.notifications;
      this.unreadCount = data.unreadCount;
    },
    async markRead(id) {
      await notificationsApi.markRead(id);
      const n = this.notifications.find((x) => x.id === id);
      if (n) n.is_read = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
    },
    async markAllRead() {
      await notificationsApi.markAllRead();
      this.notifications.forEach((n) => (n.is_read = true));
      this.unreadCount = 0;
    },
    pushNotification(n) {
      this.notifications.unshift(n);
      this.unreadCount++;
    },
  },
});
