import { io } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth';
import { useChatStore } from '@/stores/chat';
import { useNotificationStore } from '@/stores/notification';

let socket = null;

export function useSocket() {
  const connect = () => {
    const authStore = useAuthStore();
    if (!authStore.token || socket?.connected) return;

    socket = io('/', {
      auth: { token: authStore.token },
    });

    socket.on('new_message', (msg) => {
      const chatStore = useChatStore();
      chatStore.addMessage(msg);
      chatStore.fetchConversations();
    });

    socket.on('notification', (notif) => {
      const notifStore = useNotificationStore();
      notifStore.pushNotification(notif);
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err.message);
    });
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  };

  const sendMessage = (conversationId, receiverId, content) => {
    if (socket?.connected) {
      socket.emit('send_message', { conversationId, receiverId, content });
    }
  };

  return { connect, disconnect, sendMessage };
}
