<template>
  <div>
    <h2>职位搜索</h2>
    <div class="search-bar">
      <el-input v-model="filters.keyword" placeholder="搜索职位..." clearable class="search-input" @change="search" />
      <el-input v-model="filters.city" placeholder="城市" clearable class="city-input" @change="search" />
      <el-select v-model="filters.experience" placeholder="经验要求" clearable @change="search" style="width:140px">
        <el-option label="应届生" value="应届生" /><el-option label="1-3年" value="1-3年" />
        <el-option label="3-5年" value="3-5年" /><el-option label="5年以上" value="5年以上" />
      </el-select>
    </div>
    <div v-if="loading" style="text-align:center;padding:40px"><el-icon class="is-loading" :size="32"><Loading /></el-icon></div>
    <div v-else>
      <JobCard v-for="job in jobs" :key="job.id" :job="job" @click="router.push(`/seeker/jobs/${job.id}`)" class="job-card-item" />
      <el-pagination v-if="total > 0" :total="total" :page-size="20" layout="prev, pager, next" @current-change="pageChange" style="justify-content:center;margin-top:20px" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { jobsApi } from '@/api/auth';
import JobCard from '@/components/common/JobCard.vue';

const router = useRouter();
const jobs = ref([]);
const total = ref(0);
const loading = ref(false);
const filters = reactive({ keyword: '', city: '', experience: '', page: 1 });

async function search() { loading.value = true; try { const { data } = await jobsApi.search(filters); jobs.value = data.items; total.value = data.total; } finally { loading.value = false; } }
function pageChange(page) { filters.page = page; search(); }
onMounted(() => search());
</script>

<style scoped>
h2 { font-size: 24px; margin-bottom: 20px; }
.search-bar { display: flex; gap: 12px; margin-bottom: 20px; }
.search-input { width: 300px; }
.city-input { width: 160px; }
.job-card-item { margin-bottom: 12px; }
</style>
