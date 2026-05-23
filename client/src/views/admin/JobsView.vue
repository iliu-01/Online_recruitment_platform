<template>
  <div>
    <h2>职位审查</h2>
    <div class="toolbar">
      <el-select v-model="filterStatus" placeholder="状态筛选" clearable @change="fetchJobs" style="width:140px">
        <el-option label="招聘中" value="open" />
        <el-option label="已关闭" value="closed" />
      </el-select>
      <el-input v-model="searchText" placeholder="搜索职位..." clearable @change="fetchJobs" style="width:260px;margin-left:12px" />
    </div>
    <el-table :data="jobs" border stripe v-loading="loading" style="margin-top:16px">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="title" label="职位名称" min-width="200" />
      <el-table-column prop="company_email" label="发布公司" min-width="180" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'open' ? 'success' : 'info'" size="small">
            {{ row.status === 'open' ? '招聘中' : '已关闭' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="发布时间" width="180">
        <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button type="danger" text size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { adminApi } from '@/api/auth';
import { ElMessage, ElMessageBox } from 'element-plus';

const jobs = ref([]);
const loading = ref(false);
const filterStatus = ref('');
const searchText = ref('');

async function fetchJobs() {
  loading.value = true;
  try {
    const { data } = await adminApi.listJobs({ status: filterStatus.value || undefined, search: searchText.value || undefined });
    jobs.value = data.jobs || [];
  } catch (e) { /* ignore */ }
  finally { loading.value = false; }
}

async function handleDelete(job) {
  try {
    await ElMessageBox.confirm(`确认删除职位「${job.title}」吗？此操作不可撤销。`, '警告', { type: 'error', confirmButtonText: '确认删除' });
    await adminApi.deleteJob(job.id);
    ElMessage.success('职位已删除');
    await fetchJobs();
  } catch (e) { /* cancelled */ }
}

function formatDate(d) { return d ? new Date(d).toLocaleString('zh-CN') : ''; }

onMounted(() => fetchJobs());
</script>

<style scoped>
h2 { font-size: 24px; margin-bottom: 16px; }
</style>
