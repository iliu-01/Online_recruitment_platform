<template>
  <div>
    <el-page-header @back="$router.push('/company/jobs')" content="发布新职位" />
    <el-card class="form-card">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="职位名称" prop="title">
          <el-input v-model="form.title" placeholder="例如：前端开发工程师" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所在城市" prop="city">
              <el-input v-model="form.city" placeholder="例如：北京" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="经验要求" prop="experience_level">
              <el-select v-model="form.experience_level" placeholder="请选择" style="width:100%">
                <el-option label="应届生" value="应届生" />
                <el-option label="1-3年" value="1-3年" />
                <el-option label="3-5年" value="3-5年" />
                <el-option label="5年以上" value="5年以上" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="最低薪资" prop="salary_min">
              <el-input-number v-model="form.salary_min" :min="0" :step="1000" style="width:100%" placeholder="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最高薪资" prop="salary_max">
              <el-input-number v-model="form.salary_max" :min="0" :step="1000" style="width:100%" placeholder="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="学历要求" prop="education_level">
          <el-select v-model="form.education_level" placeholder="请选择" style="width:100%">
            <el-option label="大专" value="大专" />
            <el-option label="本科" value="本科" />
            <el-option label="硕士" value="硕士" />
            <el-option label="博士" value="博士" />
            <el-option label="不限" value="不限" />
          </el-select>
        </el-form-item>
        <el-form-item label="职位描述" prop="description">
          <el-input v-model="form.description.detail" type="textarea" :rows="8" placeholder="详细描述职位职责和要求..." />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" @click="handleCreate" :loading="loading">发布职位</el-button>
          <el-button @click="$router.push('/company/jobs')">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { jobsApi } from '@/api/auth';
import { ElMessage } from 'element-plus';

const router = useRouter();
const loading = ref(false);

const form = reactive({
  title: '',
  city: '',
  experience_level: '',
  education_level: '',
  salary_min: null,
  salary_max: null,
  description: { detail: '' },
});

const rules = {
  title: [{ required: true, message: '请输入职位名称', trigger: 'blur' }],
  city: [{ required: true, message: '请输入城市', trigger: 'blur' }],
  experience_level: [{ required: true, message: '请选择经验要求', trigger: 'change' }],
  education_level: [{ required: true, message: '请选择学历要求', trigger: 'change' }],
  salary_min: [{ required: true, message: '请输入最低薪资', trigger: 'blur' }],
  salary_max: [{ required: true, message: '请输入最高薪资', trigger: 'blur' }],
};

async function handleCreate() {
  loading.value = true;
  try {
    const payload = {
      ...form,
      salary_min: Number(form.salary_min),
      salary_max: Number(form.salary_max),
    };
    await jobsApi.create(payload);
    ElMessage.success('职位发布成功');
    router.push('/company/jobs');
  } catch (err) {
    ElMessage.error(err.response?.data?.error || '发布失败');
  } finally { loading.value = false; }
}
</script>

<style scoped>
.form-card { margin-top: 20px; max-width: 800px; }
</style>
