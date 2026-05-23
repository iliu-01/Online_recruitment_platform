<template>
  <el-container class="layout-admin">
    <el-aside width="220px" class="sidebar">
      <div class="logo">
        <span class="logo-icon">🔧</span>
        <span class="logo-text">管理后台</span>
      </div>
      <el-menu :default-active="activeMenu" router background-color="transparent" text-color="rgba(255,255,255,0.7)" active-text-color="#fff">
        <el-menu-item index="/admin/dashboard">
          <el-icon><DataAnalysis /></el-icon><span>数据概览</span>
        </el-menu-item>
        <el-menu-item index="/admin/users">
          <el-icon><User /></el-icon><span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/jobs">
          <el-icon><Document /></el-icon><span>职位审查</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="topbar">
        <div class="topbar-right">
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="32" icon="UserFilled" />
              <span>{{ authStore.user?.email }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const activeMenu = computed(() => route.path);

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>

<style scoped>
.layout-admin { height: 100vh; }
.sidebar { background: linear-gradient(180deg, #18181B 0%, #27272A 100%); color: #fff; }
.sidebar :deep(.el-menu) { border-right: none; }
.sidebar :deep(.el-menu-item) { color: rgba(255,255,255,0.7); }
.sidebar :deep(.el-menu-item:hover) { background: rgba(255,255,255,0.08); color: #fff; }
.sidebar :deep(.el-menu-item.is-active) { background: rgba(255,255,255,0.12); color: #fff; font-weight: 600; }
.logo { padding: 20px 16px; display: flex; align-items: center; gap: 8px; font-family: var(--font-display); }
.logo-icon { font-size: 22px; }
.logo-text { font-size: 18px; font-weight: 700; color: #fff; }
.topbar { display: flex; align-items: center; justify-content: flex-end; background: #fff; border-bottom: 1px solid var(--gray-200); padding: 0 24px; }
.topbar-right { display: flex; align-items: center; gap: 20px; }
.user-info { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; }
.main-content { background: var(--gray-50); padding: 24px; }
</style>
