<template>
  <div>
    <div class="page-header">
      <h2>职位管理</h2>
      <el-button type="primary" @click="$router.push('/company/jobs/create')">发布新职位</el-button>
    </div>
    <el-table :data="jobs" border stripe v-loading="loading" empty-text="暂无职位，请发布新职位">
      <el-table-column prop="title" label="职位名称" min-width="180" />
      <el-table-column prop="city" label="城市" width="100" />
      <el-table-column label="薪资范围" width="140">
        <template #default="{ row }">{{ formatSalary(row.salary_min) }} - {{ formatSalary(row.salary_max) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="row.status === 'open' ? 'success' : 'info'" size="small">
            {{ row.status === 'open' ? '🔓 招聘中' : '🔒 已关闭' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="发布时间" width="120">
        <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="280">
        <template #default="{ row }">
          <el-button type="primary" text size="small" @click="$router.push(`/company/jobs/${row.id}/edit`)">编辑</el-button>
          <el-button type="primary" text size="small" @click="$router.push(`/company/jobs/${row.id}/applications`)">查看申请</el-button>
          <el-button type="danger" text size="small" @click="handleClose(row)" :disabled="row.status === 'closed'">关闭</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { jobsApi } from '@/api/auth';
import { ElMessage, ElMessageBox } from 'element-plus';

const jobs = ref([]);
const loading = ref(false);

async function fetchJobs() {
  loading.value = true;
  try {
    const { data } = await jobsApi.getMine();
    jobs.value = data.jobs || [];
  } catch (e) { /* ignore */ }
  finally { loading.value = false; }
}

async function handleClose(job) {
  try {
    await ElMessageBox.confirm(`确认关闭职位「${job.title}」吗？`, '提示', { type: 'warning' });
    await jobsApi.close(job.id);
    ElMessage.success('职位已关闭');
    job.status = 'closed';
  } catch (e) { /* cancelled or error */ }
}

function formatSalary(val) { return val ? Math.round(val / 1000) + 'K' : '?'; }
function formatDate(d) { return d ? new Date(d).toLocaleDateString('zh-CN') : ''; }

onMounted(() => fetchJobs());
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h2 { font-size: 24px; }
</style>
