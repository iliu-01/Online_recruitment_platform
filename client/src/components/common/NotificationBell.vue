<template>
  <el-badge :value="notifStore.unreadCount" :hidden="!notifStore.unreadCount">
    <el-icon :size="20" style="cursor:pointer" @click="handleClick"><Bell /></el-icon>
  </el-badge>
  <el-drawer v-model="visible" title="消息通知" size="380px">
    <div v-if="notifStore.notifications.length === 0" style="text-align:center;padding:40px;color:#999;">暂无通知</div>
    <div v-for="n in notifStore.notifications" :key="n.id" class="notif-item" :class="{ unread: !n.is_read }" @click="handleRead(n)">
      <div class="notif-title">{{ n.title }}</div>
      <div class="notif-content">{{ n.content }}</div>
      <div class="notif-time">{{ formatDate(n.created_at) }}</div>
    </div>
    <template #footer>
      <el-button text @click="notifStore.markAllRead()">全部已读</el-button>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref } from 'vue';
import { useNotificationStore } from '@/stores/notification';

const notifStore = useNotificationStore();
const visible = ref(false);

async function handleClick() {
  visible.value = true;
  await notifStore.fetchList();
}

async function handleRead(n) {
  await notifStore.markRead(n.id);
}

function formatDate(d) { return d ? new Date(d).toLocaleString('zh-CN') : ''; }
</script>

<style scoped>
.notif-item { padding: 12px 0; border-bottom: 1px solid var(--gray-200); cursor: pointer; }
.notif-item.unread { background: #F0F9FF; margin: 0 -16px; padding: 12px 16px; }
.notif-title { font-weight: 600; font-size: 13px; color: var(--gray-800); margin-bottom: 4px; }
.notif-content { font-size: 12px; color: var(--gray-500); }
.notif-time { font-size: 11px; color: var(--gray-400); margin-top: 4px; }
</style>
