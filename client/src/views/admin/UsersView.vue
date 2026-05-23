<template>
  <div>
    <h2>用户管理</h2>
    <div class="toolbar">
      <el-select v-model="filterRole" placeholder="角色筛选" clearable @change="fetchUsers" style="width:160px">
        <el-option label="求职者" value="job_seeker" />
        <el-option label="公司方" value="company" />
        <el-option label="管理员" value="admin" />
      </el-select>
      <el-input v-model="searchText" placeholder="搜索邮箱..." clearable @change="fetchUsers" style="width:260px;margin-left:12px" />
    </div>
    <el-table :data="users" border stripe v-loading="loading" style="margin-top:16px">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="email" label="邮箱" min-width="200" />
      <el-table-column label="角色" width="120">
        <template #default="{ row }">
          <el-tag :type="roleType(row.role)" size="small">{{ roleLabel(row.role) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="注册时间" width="180">
        <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button v-if="row.role !== 'admin'" type="danger" text size="small" @click="handleDelete(row)">删除</el-button>
          <el-button v-if="row.role === 'job_seeker'" type="primary" text size="small" @click="toggleRole(row, 'company')">改为公司</el-button>
          <el-button v-if="row.role === 'company'" type="primary" text size="small" @click="toggleRole(row, 'job_seeker')">改为求职者</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { adminApi } from '@/api/auth';
import { ElMessage, ElMessageBox } from 'element-plus';

const users = ref([]);
const loading = ref(false);
const filterRole = ref('');
const searchText = ref('');

async function fetchUsers() {
  loading.value = true;
  try {
    const { data } = await adminApi.listUsers({ role: filterRole.value || undefined, search: searchText.value || undefined });
    users.value = data.users || [];
  } catch (e) { /* ignore */ }
  finally { loading.value = false; }
}

async function handleDelete(user) {
  try {
    await ElMessageBox.confirm(`确认删除用户「${user.email}」吗？此操作不可撤销。`, '警告', { type: 'error', confirmButtonText: '确认删除' });
    await adminApi.deleteUser(user.id);
    ElMessage.success('用户已删除');
    await fetchUsers();
  } catch (e) { /* cancelled */ }
}

async function toggleRole(user, newRole) {
  try {
    await adminApi.updateUser(user.id, { role: newRole });
    ElMessage.success('角色已更新');
    await fetchUsers();
  } catch (err) {
    ElMessage.error(err.response?.data?.error || '操作失败');
  }
}

function roleType(r) {
  if (r === 'admin') return 'danger';
  if (r === 'company') return 'success';
  return '';
}
function roleLabel(r) {
  if (r === 'admin') return '管理员';
  if (r === 'company') return '公司方';
  return '求职者';
}
function formatDate(d) { return d ? new Date(d).toLocaleString('zh-CN') : ''; }

onMounted(() => fetchUsers());
</script>

<style scoped>
h2 { font-size: 24px; margin-bottom: 16px; }
</style>
