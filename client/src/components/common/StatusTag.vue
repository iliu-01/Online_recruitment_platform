<template>
  <span class="status-tag" :class="statusClass">{{ statusLabel }}</span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({ status: { type: String, required: true } });

const STATUS_MAP = {
  saved:    { label: '📋 待投递', class: 'status-saved' },
  delivered:{ label: '📤 已投递', class: 'status-delivered' },
  interviewing: { label: '💬 面试中', class: 'status-interviewing' },
  offered:  { label: '🎉 已发Offer', class: 'status-offered' },
  accepted: { label: '✅ 已接受', class: 'status-accepted' },
  rejected: { label: '❌ 已拒绝', class: 'status-rejected' },
};

const config = computed(() => STATUS_MAP[props.status] || { label: props.status, class: '' });
const statusLabel = computed(() => config.value.label);
const statusClass = computed(() => config.value.class);
</script>

<style scoped>
.status-tag { display: inline-block; padding: 2px 10px; border-radius: var(--radius-full); font-size: 12px; font-weight: 500; }
.status-saved { background: #FEF3C7; color: #D97706; }
.status-delivered { background: #DBEAFE; color: #2563EB; }
.status-interviewing { background: #E0E7FF; color: #4F46E5; }
.status-offered { background: #D1FAE5; color: #059669; }
.status-accepted { background: #D1FAE5; color: #059669; }
.status-rejected { background: #FEE2E2; color: #DC2626; }
</style>
