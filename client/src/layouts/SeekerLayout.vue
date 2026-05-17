<template>
  <el-container class="layout-seeker">
    <el-aside width="220px" class="sidebar">
      <div class="logo">
        <span class="logo-icon">🔷</span>
        <span class="logo-text">求职中心</span>
      </div>
      <el-menu :default-active="activeMenu" router background-color="transparent" text-color="#475569" active-text-color="#2563EB">
        <el-menu-item index="/seeker/dashboard">
          <el-icon><HomeFilled /></el-icon><span>首页概览</span>
        </el-menu-item>
        <el-menu-item index="/seeker/jobs">
          <el-icon><Search /></el-icon><span>职位搜索</span>
        </el-menu-item>
        <el-menu-item index="/seeker/applications">
          <el-icon><Document /></el-icon><span>我的投递</span>
        </el-menu-item>
        <el-menu-item index="/seeker/resume">
          <el-icon><UserFilled /></el-icon><span>我的简历</span>
        </el-menu-item>
        <el-menu-item index="/seeker/messages">
          <el-icon><ChatDotRound /></el-icon><span>消息</span>
          <el-badge v-if="chatStore.unreadCount" :value="chatStore.unreadCount" class="badge" />
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="topbar">
        <div class="topbar-right">
          <NotificationBell />
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
import { useChatStore } from '@/stores/chat';
import NotificationBell from '@/components/common/NotificationBell.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const chatStore = useChatStore();
const activeMenu = computed(() => route.path);

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>

<style scoped>
.layout-seeker { height: 100vh; }
.sidebar {
  background: linear-gradient(180deg, #1E3A5F 0%, #2563EB 100%);
  color: #fff;
}
.sidebar :deep(.el-menu) { border-right: none; }
.sidebar :deep(.el-menu-item) { color: rgba(255,255,255,0.7); }
.sidebar :deep(.el-menu-item:hover) { background: rgba(255,255,255,0.1); color: #fff; }
.sidebar :deep(.el-menu-item.is-active) { background: rgba(255,255,255,0.15); color: #fff; font-weight: 600; }
.logo { padding: 20px 16px; display: flex; align-items: center; gap: 8px; font-family: var(--font-display); }
.logo-icon { font-size: 24px; }
.logo-text { font-size: 18px; font-weight: 700; color: #fff; }
.topbar { display: flex; align-items: center; justify-content: flex-end; background: #fff; border-bottom: 1px solid var(--gray-200); padding: 0 24px; }
.topbar-right { display: flex; align-items: center; gap: 20px; }
.user-info { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; }
.main-content { background: var(--gray-50); padding: 24px; }
.badge { margin-top: -8px; }
</style>
