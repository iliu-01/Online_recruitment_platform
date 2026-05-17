<template>
  <div class="job-card" @click="$emit('click')">
    <div class="card-header">
      <h3 class="job-title">{{ job.title }}</h3>
      <span class="salary">{{ formatSalary(job.salary_min) }}-{{ formatSalary(job.salary_max) }}</span>
    </div>
    <div class="card-meta">
      <span><el-icon><Location /></el-icon>{{ job.city }}</span>
      <span><el-icon><Clock /></el-icon>{{ job.experience_level }}</span>
      <span><el-icon><School /></el-icon>{{ job.education_level }}</span>
    </div>
    <div class="card-footer">
      <StatusTag :status="job.status === 'open' ? 'delivered' : 'rejected'" />
      <span class="date">{{ formatDate(job.created_at) }}</span>
    </div>
  </div>
</template>

<script setup>
import StatusTag from './StatusTag.vue';

defineProps({ job: { type: Object, required: true } });
defineEmits(['click']);

function formatSalary(val) { return val ? Math.round(val / 1000) + 'K' : '?'; }
function formatDate(d) { return d ? new Date(d).toLocaleDateString('zh-CN') : ''; }
</script>

<style scoped>
.job-card { background: #fff; border-radius: var(--radius-md); padding: 16px 20px; box-shadow: var(--shadow-card); cursor: pointer; transition: all 0.2s; }
.job-card:hover { box-shadow: var(--shadow-hover); transform: translateY(-1px); }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.job-title { font-size: 16px; font-weight: 700; color: var(--gray-800); }
.salary { font-size: 16px; font-weight: 700; color: #F59E0B; }
.card-meta { display: flex; gap: 16px; font-size: 13px; color: var(--gray-500); margin-bottom: 8px; }
.card-meta span { display: flex; align-items: center; gap: 4px; }
.card-footer { display: flex; justify-content: space-between; align-items: center; }
.date { font-size: 12px; color: var(--gray-400); }
</style>
