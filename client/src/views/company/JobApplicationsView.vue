<template>
  <div>
    <el-page-header @back="$router.push('/company/jobs')" :content="'职位申请列表'" />
    <el-card class="table-card" v-loading="loading">
      <template #header>
        <span class="card-title">{{ jobTitle || '加载中...' }}</span>
      </template>
      <el-table :data="applications" border stripe empty-text="暂无申请">
        <el-table-column prop="seeker_name" label="求职者" min-width="120" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }"><StatusTag :status="row.status" /></template>
        </el-table-column>
        <el-table-column prop="cover_letter" label="求职信" min-width="160">
          <template #default="{ row }">
            <span style="font-size:12px;color:var(--gray-500)">{{ (row.cover_letter || '无').slice(0, 40) }}{{ (row.cover_letter || '').length > 40 ? '...' : '' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="投递时间" width="120">
          <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="340">
          <template #default="{ row }">
            <el-button type="primary" text size="small" @click="startChat(row)">发消息</el-button>
            <el-button type="primary" text size="small" @click="$router.push(`/company/applications/${row.id}`)">查看详情</el-button>
            <el-button v-if="row.status === 'delivered'" type="success" text size="small" @click="updateStatus(row, 'interviewing')">面试</el-button>
            <el-button v-if="row.status === 'interviewing'" type="warning" text size="small" @click="updateStatus(row, 'offered')">发Offer</el-button>
            <el-button v-if="row.status !== 'rejected' && row.status !== 'accepted'" type="danger" text size="small" @click="updateStatus(row, 'rejected')">拒绝</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { jobsApi, applicationsApi, conversationsApi } from '@/api/auth';
import { useAuthStore } from '@/stores/auth';
import { ElMessage } from 'element-plus';
import StatusTag from '@/components/common/StatusTag.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const jobId = ref(Number(route.params.id));
const jobTitle = ref('');
const applications = ref([]);
const loading = ref(false);

async function fetchData() {
  loading.value = true;
  try {
    const [{ data: job }, { data: apps }] = await Promise.all([
      jobsApi.getById(jobId.value),
      applicationsApi.getReceived(jobId.value),
    ]);
    jobTitle.value = job.job?.title || '';
    applications.value = apps.applications || [];
  } catch (e) { /* ignore */ }
  finally { loading.value = false; }
}

async function startChat(app) {
  try {
    console.log('app row data:', JSON.stringify(app, null, 2));
    const { data } = await conversationsApi.create({
      job_seeker_user_id: app.job_seeker_user_id,
      company_user_id: authStore.userId,
      job_id: jobId.value,
    });
    router.push(`/company/messages/${data.conversation.id}`);
  } catch (err) {
    ElMessage.error('发起对话失败');
  }
}

async function updateStatus(app, newStatus) {
  try {
    await applicationsApi.updateStatus(app.id, newStatus);
    ElMessage.success('状态更新成功');
    app.status = newStatus;
  } catch (err) {
    ElMessage.error(err.response?.data?.error || '操作失败');
  }
}

function formatDate(d) { return d ? new Date(d).toLocaleDateString('zh-CN') : ''; }

onMounted(() => fetchData());
</script>

<style scoped>
.table-card { margin-top: 20px; }
.card-title { font-size: 17px; font-weight: 600; }
</style>
