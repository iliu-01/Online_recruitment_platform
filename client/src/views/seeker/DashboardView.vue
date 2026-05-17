<template>
  <div class="dashboard">
    <h2>求职面板</h2>
    <el-row :gutter="16" class="stats">
      <el-col :span="6"><el-card><el-statistic title="投递中" :value="stats.delivered" /></el-card></el-col>
      <el-col :span="6"><el-card><el-statistic title="面试中" :value="stats.interviewing" /></el-card></el-col>
      <el-col :span="6"><el-card><el-statistic title="已录用" :value="stats.offered" /></el-card></el-col>
      <el-col :span="6"><el-card><el-statistic title="新消息" :value="chatStore.unreadCount" /></el-card></el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { applicationsApi } from '@/api/auth';
import { useChatStore } from '@/stores/chat';

const chatStore = useChatStore();
const stats = ref({ delivered: 0, interviewing: 0, offered: 0 });

onMounted(async () => {
  try {
    const { data } = await applicationsApi.getMine();
    const apps = data.applications || [];
    stats.value.delivered = apps.filter((a) => a.status === 'delivered').length;
    stats.value.interviewing = apps.filter((a) => a.status === 'interviewing').length;
    stats.value.offered = apps.filter((a) => a.status === 'offered' || a.status === 'accepted').length;
  } catch (e) { /* ignore for now */ }
});
</script>

<style scoped>
.dashboard h2 { font-size: 24px; margin-bottom: 20px; }
</style>
