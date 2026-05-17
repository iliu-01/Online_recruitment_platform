import { defineStore } from 'pinia';
import { conversationsApi } from '@/api/auth';

export const useChatStore = defineStore('chat', {
  state: () => ({
    conversations: [],
    messages: {},
    unreadCount: 0,
  }),
  actions: {
    async fetchConversations() {
      const { data } = await conversationsApi.list();
      this.conversations = data.conversations;
    },
    async fetchMessages(conversationId, before) {
      const { data } = await conversationsApi.getMessages(conversationId, before);
      if (before) {
        this.messages[conversationId] = [...data.messages, ...(this.messages[conversationId] || [])];
      } else {
        this.messages[conversationId] = data.messages;
      }
    },
    addMessage(msg) {
      const list = this.messages[msg.conversationId] || [];
      list.push(msg);
      this.messages[msg.conversationId] = list;
    },
    async fetchUnreadCount() {
      const { data } = await conversationsApi.unreadCount();
      this.unreadCount = data.count;
    },
  },
});
