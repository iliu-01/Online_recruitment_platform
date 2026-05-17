<template>
  <div class="file-uploader">
    <el-upload
      :before-upload="beforeUpload"
      :http-request="customUpload"
      :show-file-list="false"
      accept=".pdf"
      drag
    >
      <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
      <div class="el-upload__text">拖拽或<em>点击上传</em></div>
      <template #tip>
        <div class="el-upload__tip">仅限 PDF 文件，最多 {{ maxFiles }} 份</div>
      </template>
    </el-upload>
    <div v-if="files.length" class="file-list">
      <div v-for="f in files" :key="f.id" class="file-item">
        <span>{{ f.file_name }}</span>
        <el-button type="danger" text :icon="Delete" @click="$emit('remove', f)" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus';

const props = defineProps({ files: { type: Array, default: () => [] }, maxFiles: { type: Number, default: 3 } });
const emit = defineEmits(['upload', 'remove']);

function beforeUpload(file) {
  if (file.type !== 'application/pdf') { ElMessage.error('仅允许上传 PDF 文件'); return false; }
  if (props.files.length >= props.maxFiles) { ElMessage.error(`最多上传 ${props.maxFiles} 份附件`); return false; }
  return true;
}
function customUpload({ file }) { emit('upload', file); }
</script>

<style scoped>
.file-list { margin-top: 12px; }
.file-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--gray-100); border-radius: var(--radius-sm); margin-bottom: 6px; font-size: 13px; }
</style>
