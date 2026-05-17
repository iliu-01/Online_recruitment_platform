<template>
  <div class="chat-window">
    <div class="chat-messages" ref="msgContainer">
      <div v-for="msg in messages" :key="msg.id" class="msg" :class="{ mine: msg.sender_id === authStore.userId }">
        <div class="msg-bubble">{{ msg.content }}</div>
        <div class="msg-time">{{ formatTime(msg.created_at) }}</div>
      </div>
      <div v-if="messages.length === 0" class="empty-chat">暂无消息，开始对话吧</div>
    </div>
    <div class="chat-input">
      <el-input v-model="inputText" placeholder="输入消息..." @keyup.enter="handleSend" :rows="2" type="textarea" />
      <el-button type="primary" @click="handleSend" :disabled="!inputText.trim()">发送</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useSocket } from '@/composables/useSocket';

const props = defineProps({
  conversationId: { type: Number, required: true },
  receiverId: { type: Number, required: true },
  messages: { type: Array, default: () => [] },
});

const authStore = useAuthStore();
const { sendMessage } = useSocket();
const inputText = ref('');
const msgContainer = ref(null);

watch(() => props.messages.length, async () => {
  await nextTick();
  if (msgContainer.value) {
    msgContainer.value.scrollTop = msgContainer.value.scrollHeight;
  }
}, { immediate: true });

function handleSend() {
  if (!inputText.value.trim()) return;
  sendMessage(props.conversationId, props.receiverId, inputText.value.trim());
  inputText.value = '';
}

function formatTime(d) { return d ? new Date(d).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : ''; }
</script>

<style scoped>
.chat-window { display: flex; flex-direction: column; height: 100%; }
.chat-messages { flex: 1; overflow-y: auto; padding: 16px; }
.msg { margin-bottom: 12px; }
.msg.mine { display: flex; flex-direction: column; align-items: flex-end; }
.msg-bubble { max-width: 70%; padding: 8px 14px; border-radius: 12px; font-size: 14px; line-height: 1.5; }
.msg:not(.mine) .msg-bubble { background: #F1F5F9; color: var(--gray-800); border-bottom-left-radius: 4px; }
.msg.mine .msg-bubble { background: var(--seeker-primary); color: #fff; border-bottom-right-radius: 4px; }
.msg-time { font-size: 11px; color: var(--gray-400); margin-top: 2px; }
.empty-chat { text-align: center; color: #999; padding: 60px 0; }
.chat-input { display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid var(--gray-200); background: #fff; }
</style>
