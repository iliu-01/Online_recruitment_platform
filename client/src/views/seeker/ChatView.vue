<template>
  <div class="chat-page">
    <div class="chat-header">
      <el-button text @click="$router.push('/seeker/messages')">
        <el-icon><ArrowLeft /></el-icon> 返回消息列表
      </el-button>
      <span class="chat-title">对话</span>
    </div>
    <div class="chat-body">
      <ChatWindow :conversationId="conversationId" :receiverId="receiverId" :messages="chatMessages" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useChatStore } from '@/stores/chat';
import ChatWindow from '@/components/common/ChatWindow.vue';

const route = useRoute();
const chatStore = useChatStore();

const conversationId = computed(() => Number(route.params.id));
const conversation = computed(() => chatStore.conversations.find((c) => c.id === conversationId.value));
const receiverId = computed(() => conversation.value?.company_user_id || 0);
const chatMessages = computed(() => chatStore.messages[conversationId.value] || []);

onMounted(async () => {
  await chatStore.fetchConversations();
  await chatStore.fetchMessages(conversationId.value);
});
</script>

<style scoped>
.chat-page { display: flex; flex-direction: column; height: calc(100vh - 60px); }
.chat-header { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid var(--gray-200); background: #fff; }
.chat-title { font-weight: 600; font-size: 16px; }
.chat-body { flex: 1; overflow: hidden; }
</style>
