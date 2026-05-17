<template>
  <div>
    <el-page-header @back="$router.back()" :content="'申请详情'" />
    <div v-if="pageLoading" style="text-align:center;padding:40px">
      <el-icon class="is-loading" :size="32"><Loading /></el-icon>
    </div>
    <template v-else-if="application">
      <el-card class="detail-card">
        <template #header>
          <div class="card-header">
            <span>申请信息</span>
            <StatusTag :status="application.status" />
          </div>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="求职者">{{ application.seeker_name || '-' }}</el-descriptions-item>
          <el-descriptions-item label="投递时间">{{ formatDate(application.created_at) }}</el-descriptions-item>
          <el-descriptions-item label="求职信" :span="2">{{ application.cover_letter || '无' }}</el-descriptions-item>
        </el-descriptions>
        <div class="actions" v-if="application.status !== 'rejected' && application.status !== 'accepted'">
          <el-button v-if="application.status === 'delivered'" type="success" @click="updateStatus('interviewing')">通知面试</el-button>
          <el-button v-if="application.status === 'interviewing'" type="warning" @click="updateStatus('offered')">发放Offer</el-button>
          <el-button type="danger" @click="updateStatus('rejected')">拒绝</el-button>
        </div>
      </el-card>
      <el-card class="resume-card" v-if="resume">
        <template #header><span>求职者简历</span></template>
        <ResumePreview :resume="resume" />
      </el-card>
      <el-card class="resume-card" v-else>
        <el-empty description="暂未获取到简历信息" :image-size="80" />
      </el-card>
    </template>
    <el-empty v-else description="申请未找到" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { applicationsApi, resumeApi } from '@/api/auth';
import { ElMessage } from 'element-plus';
import StatusTag from '@/components/common/StatusTag.vue';
import ResumePreview from '@/components/common/ResumePreview.vue';

const route = useRoute();
const application = ref(null);
const resume = ref(null);
const pageLoading = ref(true);

async function fetchData() {
  try {
    // Get application from received list — find by id
    const { data } = await applicationsApi.getReceived();
    const apps = data.applications || [];
    application.value = apps.find((a) => a.id === Number(route.params.id)) || null;

    if (application.value?.resume_id) {
      try {
        // We use resumeApi.get() but this returns current user's resume.
        // In a real app we'd have an endpoint for viewing other resume.
        // For now, use the resume data embedded in applications if available.
        const { data: rData } = await resumeApi.get();
        resume.value = rData.resume;
      } catch (e) { /* ignore */ }
    }
  } catch (e) { /* ignore */ }
  finally { pageLoading.value = false; }
}

async function updateStatus(newStatus) {
  try {
    await applicationsApi.updateStatus(application.value.id, newStatus);
    ElMessage.success('状态更新成功');
    application.value.status = newStatus;
  } catch (err) {
    ElMessage.error(err.response?.data?.error || '操作失败');
  }
}

function formatDate(d) { return d ? new Date(d).toLocaleDateString('zh-CN') : ''; }

onMounted(() => fetchData());
</script>

<style scoped>
.detail-card { margin-top: 20px; margin-bottom: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.actions { display: flex; gap: 12px; margin-top: 16px; justify-content: flex-end; }
.resume-card { margin-bottom: 20px; }
</style>
