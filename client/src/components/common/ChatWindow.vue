<template>
  <div class="chat-window">
    <div class="chat-messages" ref="msgContainer">
      <div v-for="msg in messages" :key="msg.id" class="msg" :class="{ mine: msg.sender_id === authStore.userId }">
        <div v-if="msg.content?.startsWith('[attachment]')" class="msg-bubble msg-attachment">
          <div class="attachment-label">📎 简历附件</div>
          <a class="attachment-link" @click.prevent="openAttachment(msg.content)">{{ extractFileName(msg.content) }}</a>
        </div>
        <div v-else class="msg-bubble">{{ msg.content }}</div>
        <div class="msg-time">{{ formatTime(msg.created_at) }}</div>
      </div>
      <div v-if="messages.length === 0" class="empty-chat">暂无消息，开始对话吧</div>
    </div>
    <div class="chat-input">
      <el-popover v-model:visible="attPopVisible" trigger="click" placement="top" :width="300">
        <template #reference>
          <el-button v-if="authStore.role === 'job_seeker'" circle class="attach-btn" @click="fetchAttachments" :loading="attLoading">
            <el-icon><UploadFilled /></el-icon>
          </el-button>
        </template>
        <div v-if="attachments.length === 0" style="text-align:center;padding:12px;color:var(--gray-400)">暂无附件简历</div>
        <div v-for="a in attachments" :key="a.id" class="att-item" @click="sendAttachment(a)">
          <span>📄 {{ a.file_name }}</span>
        </div>
        <div style="font-size:11px;color:var(--gray-400);margin-top:8px">
          前往<router-link to="/seeker/resume/attachments">附件管理</router-link>上传简历
        </div>
      </el-popover>
      <el-input v-model="inputText" placeholder="输入消息..." @keyup.enter="handleSend" :rows="2" type="textarea" class="text-input" />
      <el-button type="primary" @click="handleSend" :disabled="!inputText.trim()">发送</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useSocket } from '@/composables/useSocket';
import { resumeApi } from '@/api/auth';
import api from '@/api/index';
import { ElMessage } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';

const props = defineProps({
  conversationId: { type: Number, required: true },
  receiverId: { type: Number, required: true },
  messages: { type: Array, default: () => [] },
});

const authStore = useAuthStore();
const { sendMessage } = useSocket();
const inputText = ref('');
const msgContainer = ref(null);

// 附件发送
const attPopVisible = ref(false);
const attLoading = ref(false);
const attachments = ref([]);

async function fetchAttachments() {
  attLoading.value = true;
  try {
    const { data } = await resumeApi.get();
    attachments.value = data.resume?.attachments || [];
  } catch (e) { /* ignore */ }
  finally { attLoading.value = false; }
}

function sendAttachment(att) {
  const content = `[attachment]${att.id}||${att.file_name}`;
  sendMessage(props.conversationId, props.receiverId, content);
  attPopVisible.value = false;
}

function extractFileName(content) {
  return content?.split('||')[1] || '附件';
}

async function openAttachment(content) {
  try {
    const attId = content.split('||')[0].replace('[attachment]', '');
    const res = await api.get(`/resume/attachments/${attId}`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    window.open(url, '_blank');
  } catch (e) { ElMessage.error('无法打开文件'); }
}

watch(() => props.messages.length, async () => {
  await nextTick();
  if (msgContainer.value) {
    msgContainer.value.scrollTop = msgContainer.value.scrollHeight;
  }
}, { immediate: true });

function handleSend() {
  if (!inputText.value.trim()) return;
  sendMessage(props.conversationId, props.receiverId, inputText.value.trim());
  inputText.value = '';
}

function formatTime(d) { return d ? new Date(d).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : ''; }
</script>

<style scoped>
.chat-window { display: flex; flex-direction: column; height: 100%; }
.chat-messages { flex: 1; overflow-y: auto; padding: 16px; }
.msg { margin-bottom: 12px; display: flex; flex-direction: column; align-items: flex-start; }
.msg.mine { align-items: flex-end; }
.msg-bubble { width: fit-content; max-width: 70%; padding: 8px 14px; border-radius: 12px; font-size: 14px; line-height: 1.5; word-break: break-word; }
.msg:not(.mine) .msg-bubble { background: #F1F5F9; color: var(--gray-800); border-bottom-left-radius: 4px; }
.msg.mine .msg-bubble { background: var(--seeker-primary); color: #fff; border-bottom-right-radius: 4px; }
.msg-attachment { background: #ECFDF5 !important; border: 1px solid #A7F3D0; color: var(--gray-800) !important; }
.msg.mine .msg-attachment { background: #065F46 !important; border-color: #059669; color: #fff !important; }
.attachment-label { font-size: 12px; opacity: 0.7; margin-bottom: 4px; }
.attachment-link { color: #059669; text-decoration: underline; cursor: pointer; font-weight: 600; font-size: 13px; }
.msg.mine .attachment-link { color: #A7F3D0; }
.msg-time { font-size: 11px; color: var(--gray-400); margin-top: 2px; }
.empty-chat { text-align: center; color: #999; padding: 60px 0; }
.chat-input { display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid var(--gray-200); background: #fff; align-items: flex-end; }
.text-input { flex: 1; }
.attach-btn { flex-shrink: 0; }
.att-item { padding: 8px 12px; cursor: pointer; border-radius: var(--radius-sm); font-size: 13px; }
.att-item:hover { background: var(--gray-100); }
</style>
