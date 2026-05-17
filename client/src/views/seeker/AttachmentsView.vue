<template>
  <div>
    <h2>附件管理</h2>
    <el-card class="attachments-card">
      <FileUploader :files="attachments" :maxFiles="3" @upload="handleUpload" @remove="handleRemove" />
      <el-empty v-if="attachments.length === 0 && !uploading" description="暂无附件，上传 PDF 简历或作品集" :image-size="80" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { resumeApi } from '@/api/auth';
import { ElMessage } from 'element-plus';
import FileUploader from '@/components/common/FileUploader.vue';

const attachments = ref([]);
const uploading = ref(false);

async function fetchAttachments() {
  try {
    const { data } = await resumeApi.get();
    attachments.value = data.resume?.attachments || [];
  } catch (e) { /* ignore */ }
}

async function handleUpload(file) {
  uploading.value = true;
  try {
    await resumeApi.uploadAttachment(file);
    ElMessage.success('上传成功');
    await fetchAttachments();
  } catch (err) {
    ElMessage.error(err.response?.data?.error || '上传失败');
  } finally { uploading.value = false; }
}

async function handleRemove(attachment) {
  try {
    await resumeApi.deleteAttachment(attachment.id);
    ElMessage.success('删除成功');
    attachments.value = attachments.value.filter((a) => a.id !== attachment.id);
  } catch (err) {
    ElMessage.error(err.response?.data?.error || '删除失败');
  }
}

onMounted(() => fetchAttachments());
</script>

<style scoped>
h2 { font-size: 24px; margin-bottom: 20px; }
.attachments-card { max-width: 600px; }
</style>
