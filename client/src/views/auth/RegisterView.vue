<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <h1>创建账号</h1>
        <p>选择您的角色开始使用</p>
      </div>
      <div class="role-selector">
        <div class="role-card" :class="{ active: form.role === 'job_seeker' }" @click="form.role = 'job_seeker'">
          <div class="role-icon">🧑</div>
          <div class="role-name">求职者</div>
          <div class="role-desc">找工作，管理简历和投递</div>
        </div>
        <div class="role-card" :class="{ active: form.role === 'company' }" @click="form.role = 'company'">
          <div class="role-icon">🏢</div>
          <div class="role-name">公司方</div>
          <div class="role-desc">发布职位，招聘人才</div>
        </div>
      </div>
      <el-form ref="formRef" :model="form" :rules="rules" size="large">
        <el-form-item prop="email">
          <el-input v-model="form.email" placeholder="邮箱" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码（至少6位）" show-password />
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" placeholder="确认密码" show-password @keyup.enter="handleRegister" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="submit-btn" @click="handleRegister" :loading="loading">注 册</el-button>
        </el-form-item>
      </el-form>
      <div class="auth-footer">已有账号？<router-link to="/login">立即登录</router-link></div>
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

const form = reactive({ email: '', password: '', confirmPassword: '', role: '' });
const validateConfirm = (rule, value, callback) => {
  if (value !== form.password) callback(new Error('两次密码不一致'));
  else callback();
};
const rules = {
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }, { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '密码至少6位', trigger: 'blur' }],
  confirmPassword: [{ required: true, message: '请确认密码', trigger: 'blur' }, { validator: validateConfirm, trigger: 'blur' }],
};

async function handleRegister() {
  if (!form.role) { ElMessage.warning('请选择角色'); return; }
  loading.value = true;
  try {
    await authStore.register(form.email, form.password, form.role);
    connect();
    ElMessage.success('注册成功');
    router.push(`/${authStore.role}/dashboard`);
  } catch (err) {
    ElMessage.error(err.response?.data?.error || '注册失败');
  } finally { loading.value = false; }
}
</script>

<style scoped>
.auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.auth-card { width: 460px; background: #fff; border-radius: var(--radius-lg); padding: 40px; box-shadow: var(--shadow-modal); }
.auth-header { text-align: center; margin-bottom: 24px; }
.auth-header h1 { font-size: 28px; }
.auth-header p { color: var(--gray-500); }
.role-selector { display: flex; gap: 12px; margin-bottom: 24px; }
.role-card { flex: 1; text-align: center; padding: 16px 8px; border: 2px solid var(--gray-200); border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s; }
.role-card:hover { border-color: #667eea; }
.role-card.active { border-color: #667eea; background: #EEF2FF; }
.role-icon { font-size: 28px; margin-bottom: 4px; }
.role-name { font-weight: 700; font-size: 15px; color: var(--gray-800); }
.role-desc { font-size: 12px; color: var(--gray-400); }
.submit-btn { width: 100%; background: linear-gradient(135deg, #667eea, #764ba2); border: none; }
.auth-footer { text-align: center; margin-top: 16px; font-size: 13px; color: var(--gray-500); }
.auth-footer a { color: #667eea; }
</style>
