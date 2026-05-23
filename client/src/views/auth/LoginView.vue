<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <h1>欢迎回来</h1>
        <p>登录您的招聘平台账号</p>
      </div>
      <el-form ref="formRef" :model="form" :rules="rules" size="large">
        <el-form-item prop="email">
          <el-input v-model="form.email" placeholder="邮箱" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" show-password @keyup.enter="handleLogin" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="submit-btn" @click="handleLogin" :loading="loading">登 录</el-button>
        </el-form-item>
      </el-form>
      <div class="auth-footer">
        没有账号？<router-link to="/register">立即注册</router-link>
      </div>
      <div class="test-hint">
        管理员：admin@test.com / 123456<br>
        求职者：seeker@test.com / 123456<br>
        公司方：hr@test.com / 123456
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useSocket } from '@/composables/useSocket';
import { ElMessage } from 'element-plus';

const authStore = useAuthStore();
const router = useRouter();
const { connect } = useSocket();
const loading = ref(false);

const form = reactive({ email: '', password: '' });
const rules = {
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }, { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '密码至少6位', trigger: 'blur' }],
};

async function handleLogin() {
  loading.value = true;
  try {
    await authStore.login(form.email, form.password);
    connect();
    ElMessage.success('登录成功');
    router.push(`/${authStore.pathPrefix}/dashboard`);
  } catch (err) {
    ElMessage.error(err.response?.data?.error || '登录失败');
  } finally { loading.value = false; }
}
</script>

<style scoped>
.auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.auth-card { width: 420px; background: #fff; border-radius: var(--radius-lg); padding: 40px; box-shadow: var(--shadow-modal); }
.auth-header { text-align: center; margin-bottom: 32px; }
.auth-header h1 { font-size: 28px; color: var(--gray-800); margin-bottom: 8px; }
.auth-header p { color: var(--gray-500); }
.submit-btn { width: 100%; background: linear-gradient(135deg, #667eea, #764ba2); border: none; }
.auth-footer { text-align: center; margin-top: 16px; font-size: 13px; color: var(--gray-500); }
.auth-footer a { color: #667eea; }
.test-hint { margin-top: 12px; padding: 8px; background: var(--gray-100); border-radius: var(--radius-sm); font-size: 11px; color: var(--gray-400); text-align: center; line-height: 1.6; }
</style>
