<template>
  <div class="dashboard">
    <h2>公司面板</h2>
    <el-row :gutter="16" class="stats">
      <el-col :span="8"><el-card><el-statistic title="发布职位数" :value="stats.jobCount" /></el-card></el-col>
      <el-col :span="8"><el-card><el-statistic title="收到简历数" :value="stats.receivedCount" /></el-card></el-col>
      <el-col :span="8"><el-card><el-statistic title="新消息数" :value="chatStore.unreadCount" /></el-card></el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { jobsApi, applicationsApi } from '@/api/auth';
import { useChatStore } from '@/stores/chat';

const chatStore = useChatStore();
const stats = ref({ jobCount: 0, receivedCount: 0 });

onMounted(async () => {
  try {
    const [{ data: jobs }, { data: apps }] = await Promise.all([
      jobsApi.getMine(),
      applicationsApi.getReceived(),
    ]);
    stats.value.jobCount = (jobs.jobs || []).length;
    stats.value.receivedCount = (apps.applications || []).length;
  } catch (e) { /* ignore */ }
});
</script>

<style scoped>
.dashboard h2 { font-size: 24px; margin-bottom: 20px; }
</style>
