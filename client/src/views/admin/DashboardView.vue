<template>
  <div>
    <h2>管理后台 - 数据概览</h2>
    <el-row :gutter="20" class="stats-row">
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic title="注册用户总数" :value="stats.totalUsers" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic title="发布职位总数" :value="stats.totalJobs" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic title="投递申请总数" :value="stats.totalApplications" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { adminApi } from '@/api/auth';

const stats = ref({ totalUsers: 0, totalJobs: 0, totalApplications: 0 });

onMounted(async () => {
  try {
    const { data } = await adminApi.stats();
    stats.value = data.stats;
  } catch (e) { /* ignore */ }
});
</script>

<style scoped>
h2 { font-size: 24px; margin-bottom: 24px; }
</style>
