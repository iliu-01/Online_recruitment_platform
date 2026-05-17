<template>
  <div class="resume-preview">
    <div class="resume-header">
      <h2>{{ resume.full_name }}</h2>
      <p>{{ resume.email }} | {{ resume.phone }} | {{ resume.city }}</p>
    </div>
    <div v-if="parsedSkills.length" class="section">
      <h3>技能标签</h3>
      <div class="skill-tags">
        <span v-for="s in parsedSkills" :key="s" class="skill-tag">{{ s }}</span>
      </div>
    </div>
    <div v-if="parsedEducation.length" class="section">
      <h3>教育经历</h3>
      <div v-for="(e, i) in parsedEducation" :key="i" class="exp-item">
        <div class="exp-title">{{ e.school }} · {{ e.major }} · {{ e.degree }}</div>
        <div class="exp-date">{{ e.start }} - {{ e.end }}</div>
      </div>
    </div>
    <div v-if="parsedWork.length" class="section">
      <h3>工作经历</h3>
      <div v-for="(w, i) in parsedWork" :key="i" class="exp-item">
        <div class="exp-title">{{ w.position }} @ {{ w.company }}</div>
        <div class="exp-date">{{ w.start }} - {{ w.end }}</div>
        <div class="exp-desc">{{ w.description }}</div>
      </div>
    </div>
    <div v-if="resume.self_intro" class="section">
      <h3>自我描述</h3>
      <p>{{ resume.self_intro }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({ resume: { type: Object, required: true } });

function parseJSON(val) { if (!val) return []; return typeof val === 'string' ? JSON.parse(val) : val; }
const parsedSkills = computed(() => parseJSON(props.resume.skills));
const parsedEducation = computed(() => parseJSON(props.resume.education));
const parsedWork = computed(() => parseJSON(props.resume.work_experience));
</script>

<style scoped>
.resume-preview { background: #fff; padding: 24px; border-radius: var(--radius-md); }
.resume-header { margin-bottom: 20px; }
.resume-header h2 { font-size: 22px; color: var(--gray-800); margin-bottom: 4px; }
.section { margin-bottom: 20px; }
.section h3 { font-size: 15px; color: var(--gray-800); border-bottom: 2px solid var(--seeker-primary); padding-bottom: 4px; margin-bottom: 10px; }
.skill-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.skill-tag { background: var(--seeker-bg); color: var(--seeker-primary); padding: 4px 12px; border-radius: var(--radius-full); font-size: 12px; }
.exp-item { margin-bottom: 10px; }
.exp-title { font-weight: 600; color: var(--gray-800); }
.exp-date { font-size: 12px; color: var(--gray-400); }
.exp-desc { font-size: 13px; color: var(--gray-500); margin-top: 4px; }
</style>
