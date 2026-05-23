<template>
  <div class="job-detail" v-if="job">
    <el-page-header @back="router.back()" :content="job.title" />
    <el-card class="detail-card">
      <h2>{{ job.title }}</h2>
      <div class="meta">
        <span>📍 {{ job.city }}</span><span>💰 {{ (job.salary_min/1000).toFixed(0) }}K-{{ (job.salary_max/1000).toFixed(0) }}K</span>
        <span>🎓 {{ job.experience_level }}</span><span>📚 {{ job.education_level }}</span>
      </div>
      <div class="desc" v-html="(job.description?.detail || '暂无详细描述').replace(/\n/g,'<br>')" />
      <el-divider />
      <h3>投递此职位</h3>
      <el-form v-if="resume" :model="form" label-width="100px">
        <el-form-item label="使用简历"><span>{{ resume.full_name }}</span></el-form-item>
        <el-form-item label="求职信"><el-input v-model="form.cover_letter" type="textarea" :rows="4" placeholder="简短的求职信（选填）" /></el-form-item>
        <el-form-item><el-button type="primary" @click="handleApply" :loading="applying" :disabled="hasApplied">{{ hasApplied ? '已投递' : '立即投递' }}</el-button></el-form-item>
      </el-form>
      <el-empty v-else description="请先创建简历"><el-button type="primary" @click="router.push('/seeker/resume')">创建简历</el-button></el-empty>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { jobsApi, resumeApi, applicationsApi } from '@/api/auth';
import { ElMessage } from 'element-plus';

const route = useRoute(); const router = useRouter();
const job = ref(null); const resume = ref(null); const applying = ref(false);
const hasApplied = ref(false);
const form = reactive({ cover_letter: '' });

onMounted(async () => {
  try {
    const [{ data: j }, { data: r }] = await Promise.all([
      jobsApi.getById(route.params.id),
      resumeApi.get().catch(() => ({ data: { resume: null } })),
    ]);
    job.value = j.job; resume.value = r.resume;
  } catch (e) {}
});

async function handleApply() {
  applying.value = true;
  try {
    await applicationsApi.apply({ job_id: job.value.id, resume_id: resume.value.id, cover_letter: form.cover_letter, status: 'delivered' });
    ElMessage.success('投递成功');
    hasApplied.value = true;
    setTimeout(() => router.push('/seeker/jobs'), 800);
  } catch (err) {
    ElMessage.error(err.response?.data?.error || '投递失败');
  } finally { applying.value = false; }
}
</script>

<style scoped>
.job-detail { max-width: 800px; }
.detail-card { margin-top: 20px; }
.detail-card h2 { font-size: 24px; margin-bottom: 12px; }
.meta { display: flex; gap: 20px; font-size: 14px; color: var(--gray-500); margin-bottom: 20px; }
.desc { line-height: 1.8; color: var(--gray-500); }
</style>
