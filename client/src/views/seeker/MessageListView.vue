<template>
  <div>
    <h2>消息中心</h2>
    <el-card v-if="conversations.length === 0">
      <el-empty description="暂无消息" :image-size="80" />
    </el-card>
    <div class="conversation-list" v-else>
      <div v-for="conv in conversations" :key="conv.id" class="conv-item" @click="$router.push(`/seeker/messages/${conv.id}`)">
        <div class="conv-avatar">
          <el-avatar :size="44">{{ conv.partner_name?.charAt(0) || '?' }}</el-avatar>
        </div>
        <div class="conv-body">
          <div class="conv-header">
            <span class="conv-name">{{ conv.partner_name || '对话' }}</span>
            <span class="conv-time">{{ formatDate(conv.last_message_at) }}</span>
          </div>
          <div class="conv-preview">{{ conv.last_message || '暂无消息' }}</div>
        </div>
        <el-badge v-if="conv.unread_count" :value="conv.unread_count" class="conv-badge" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useChatStore } from '@/stores/chat';

const chatStore = useChatStore();
const conversations = computed(() => chatStore.conversations);

function formatDate(d) { return d ? new Date(d).toLocaleDateString('zh-CN') : ''; }

onMounted(async () => {
  try { await chatStore.fetchConversations(); } catch (e) {}
});
</script>

<style scoped>
h2 { font-size: 24px; margin-bottom: 20px; }
.conversation-list { background: #fff; border-radius: var(--radius-md); overflow: hidden; }
.conv-item { display: flex; align-items: center; padding: 14px 20px; cursor: pointer; border-bottom: 1px solid var(--gray-100); transition: background 0.15s; }
.conv-item:hover { background: var(--gray-50); }
.conv-avatar { margin-right: 12px; }
.conv-body { flex: 1; min-width: 0; }
.conv-header { display: flex; justify-content: space-between; margin-bottom: 4px; }
.conv-name { font-weight: 600; font-size: 15px; color: var(--gray-800); }
.conv-time { font-size: 12px; color: var(--gray-400); }
.conv-preview { font-size: 13px; color: var(--gray-500); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.conv-badge { margin-left: 8px; }
</style>
