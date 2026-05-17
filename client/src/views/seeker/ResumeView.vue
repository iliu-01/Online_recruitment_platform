<template>
  <div>
    <h2>我的简历</h2>
    <el-card class="resume-card">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名" prop="full_name">
              <el-input v-model="form.full_name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="所在城市" prop="city">
          <el-input v-model="form.city" placeholder="请输入所在城市" />
        </el-form-item>
        <el-form-item label="自我描述" prop="self_intro">
          <el-input v-model="form.self_intro" type="textarea" :rows="4" placeholder="简短的自我介绍" />
        </el-form-item>

        <el-divider>技能标签</el-divider>
        <el-form-item label="添加技能">
          <el-input v-model="newSkill" placeholder="输入技能名称" style="width:200px;margin-right:8px" @keyup.enter="addSkill" />
          <el-button type="primary" size="small" @click="addSkill" :disabled="!newSkill.trim()">添加</el-button>
        </el-form-item>
        <el-form-item>
          <el-tag v-for="(s, i) in form.skills" :key="i" closable @close="form.skills.splice(i, 1)" style="margin-right:6px;margin-bottom:6px">{{ s }}</el-tag>
          <span v-if="form.skills.length === 0" style="color:var(--gray-400);font-size:13px">暂无技能，请添加</span>
        </el-form-item>

        <el-divider>教育经历</el-divider>
        <el-table :data="form.education" border stripe style="margin-bottom:12px">
          <el-table-column prop="school" label="学校" />
          <el-table-column prop="major" label="专业" />
          <el-table-column prop="degree" label="学历" />
          <el-table-column prop="start" label="开始时间" width="120" />
          <el-table-column prop="end" label="结束时间" width="120" />
          <el-table-column label="操作" width="80">
            <template #default="{ $index }">
              <el-button type="danger" text size="small" @click="form.education.splice($index, 1)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-button type="primary" text size="small" @click="addEducation">+ 添加教育经历</el-button>

        <el-divider>工作经历</el-divider>
        <el-table :data="form.work_experience" border stripe style="margin-bottom:12px">
          <el-table-column prop="company" label="公司" />
          <el-table-column prop="position" label="职位" />
          <el-table-column prop="start" label="开始时间" width="120" />
          <el-table-column prop="end" label="结束时间" width="120" />
          <el-table-column prop="description" label="描述" min-width="150">
            <template #default="{ row }">
              <span style="font-size:12px;color:var(--gray-500)">{{ row.description?.slice(0, 30) || '-' }}{{ row.description?.length > 30 ? '...' : '' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80">
            <template #default="{ $index }">
              <el-button type="danger" text size="small" @click="form.work_experience.splice($index, 1)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-button type="primary" text size="small" @click="addWork">+ 添加工作经历</el-button>

        <el-divider />
        <el-form-item>
          <el-button type="primary" size="large" @click="handleSave" :loading="saving">保存简历</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Education Edit Dialog -->
    <el-dialog v-model="eduDialogVisible" title="教育经历" width="500px">
      <el-form :model="eduForm" label-width="80px">
        <el-form-item label="学校"><el-input v-model="eduForm.school" /></el-form-item>
        <el-form-item label="专业"><el-input v-model="eduForm.major" /></el-form-item>
        <el-form-item label="学历"><el-input v-model="eduForm.degree" placeholder="如: 本科、硕士" /></el-form-item>
        <el-form-item label="开始时间"><el-input v-model="eduForm.start" placeholder="如: 2018-09" /></el-form-item>
        <el-form-item label="结束时间"><el-input v-model="eduForm.end" placeholder="如: 2022-06" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="eduDialogVisible = false">取消</el-button><el-button type="primary" @click="confirmEdu">确定</el-button></template>
    </el-dialog>

    <!-- Work Edit Dialog -->
    <el-dialog v-model="workDialogVisible" title="工作经历" width="500px">
      <el-form :model="workForm" label-width="80px">
        <el-form-item label="公司"><el-input v-model="workForm.company" /></el-form-item>
        <el-form-item label="职位"><el-input v-model="workForm.position" /></el-form-item>
        <el-form-item label="开始时间"><el-input v-model="workForm.start" placeholder="如: 2022-07" /></el-form-item>
        <el-form-item label="结束时间"><el-input v-model="workForm.end" placeholder="如: 至今" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="workForm.description" type="textarea" :rows="3" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="workDialogVisible = false">取消</el-button><el-button type="primary" @click="confirmWork">确定</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { resumeApi } from '@/api/auth';
import { ElMessage } from 'element-plus';

const saving = ref(false);
const form = reactive({
  full_name: '',
  phone: '',
  email: '',
  city: '',
  self_intro: '',
  skills: [],
  education: [],
  work_experience: [],
});

const rules = {
  full_name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }, { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }],
};

// Skills
const newSkill = ref('');
function addSkill() {
  const s = newSkill.value.trim();
  if (s && !form.skills.includes(s)) { form.skills.push(s); newSkill.value = ''; }
}

// Education
const eduDialogVisible = ref(false);
const eduForm = reactive({ school: '', major: '', degree: '', start: '', end: '' });
function addEducation() {
  Object.assign(eduForm, { school: '', major: '', degree: '', start: '', end: '' });
  eduDialogVisible.value = true;
}
function confirmEdu() {
  if (!eduForm.school) { ElMessage.warning('请填写学校名称'); return; }
  form.education.push({ ...eduForm });
  eduDialogVisible.value = false;
}

// Work experience
const workDialogVisible = ref(false);
const workForm = reactive({ company: '', position: '', start: '', end: '', description: '' });
function addWork() {
  Object.assign(workForm, { company: '', position: '', start: '', end: '', description: '' });
  workDialogVisible.value = true;
}
function confirmWork() {
  if (!workForm.company) { ElMessage.warning('请填写公司名称'); return; }
  form.work_experience.push({ ...workForm });
  workDialogVisible.value = false;
}

// Load existing resume
onMounted(async () => {
  try {
    const { data } = await resumeApi.get();
    if (data.resume) {
      const r = data.resume;
      form.full_name = r.full_name || '';
      form.phone = r.phone || '';
      form.email = r.email || '';
      form.city = r.city || '';
      form.self_intro = r.self_intro || '';
      form.skills = typeof r.skills === 'string' ? JSON.parse(r.skills || '[]') : (r.skills || []);
      form.education = typeof r.education === 'string' ? JSON.parse(r.education || '[]') : (r.education || []);
      form.work_experience = typeof r.work_experience === 'string' ? JSON.parse(r.work_experience || '[]') : (r.work_experience || []);
    }
  } catch (e) { /* no resume yet */ }
});

async function handleSave() {
  saving.value = true;
  try {
    await resumeApi.upsert({
      full_name: form.full_name,
      phone: form.phone,
      email: form.email,
      city: form.city,
      self_intro: form.self_intro,
      skills: form.skills,
      education: form.education,
      work_experience: form.work_experience,
    });
    ElMessage.success('简历保存成功');
  } catch (err) {
    ElMessage.error(err.response?.data?.error || '保存失败');
  } finally { saving.value = false; }
}
</script>

<style scoped>
h2 { font-size: 24px; margin-bottom: 20px; }
.resume-card { max-width: 900px; }
</style>
