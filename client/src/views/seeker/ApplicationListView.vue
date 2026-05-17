<template>
  <div>
    <h2>我的投递</h2>
    <el-tabs v-model="activeTab" @tab-change="fetchApplications">
      <el-tab-pane label="全部" name="" />
      <el-tab-pane label="待投递" name="saved" />
      <el-tab-pane label="已投递" name="delivered" />
      <el-tab-pane label="面试中" name="interviewing" />
      <el-tab-pane label="已录用" name="offered" />
    </el-tabs>
    <el-table :data="applications" border stripe v-loading="loading" empty-text="暂无投递记录">
      <el-table-column prop="job_title" label="职位名称" min-width="180" />
      <el-table-column prop="job_city" label="城市" width="100" />
      <el-table-column label="状态" width="120">
        <template #default="{ row }"><StatusTag :status="row.status" /></template>
      </el-table-column>
      <el-table-column label="投递时间" width="180">
        <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button type="primary" text size="small" @click="$router.push(`/seeker/jobs/${row.job_id}`)">查看职位</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { applicationsApi } from '@/api/auth';
import StatusTag from '@/components/common/StatusTag.vue';

const activeTab = ref('');
const applications = ref([]);
const loading = ref(false);

async function fetchApplications() {
  loading.value = true;
  try {
    const params = activeTab.value ? { status: activeTab.value } : {};
    const { data } = await applicationsApi.getMine(activeTab.value || undefined);
    applications.value = data.applications || [];
  } catch (e) { /* ignore */ }
  finally { loading.value = false; }
}

function formatDate(d) { return d ? new Date(d).toLocaleDateString('zh-CN') : ''; }

onMounted(() => fetchApplications());
</script>

<style scoped>
h2 { font-size: 24px; margin-bottom: 20px; }
</style>
