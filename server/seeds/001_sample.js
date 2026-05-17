const bcrypt = require('bcryptjs');

exports.seed = async function (knex) {
  // Clean all tables in correct order
  await knex('notifications').del();
  await knex('messages').del();
  await knex('conversations').del();
  await knex('applications').del();
  await knex('jobs').del();
  await knex('resume_attachments').del();
  await knex('online_resumes').del();
  await knex('users').del();

  const hash = await bcrypt.hash('123456', 10);

  // Create job seeker
  const [seeker] = await knex('users').insert({
    email: 'seeker@test.com',
    password_hash: hash,
    role: 'job_seeker',
  }).returning('*');

  await knex('online_resumes').insert({
    user_id: seeker.id,
    full_name: '张三',
    email: 'seeker@test.com',
    phone: '13800138000',
    city: '上海',
    education: JSON.stringify([
      { school: '上海交通大学', degree: '本科', major: '计算机科学', start: '2018', end: '2022' }
    ]),
    work_experience: JSON.stringify([
      { company: '某科技公司', position: '前端开发', start: '2022', end: '2025', description: '负责Vue.js项目开发' }
    ]),
    skills: JSON.stringify(['Vue.js', 'React', 'TypeScript', 'Node.js']),
    self_intro: '3年前端开发经验，热爱技术',
  });

  // Create company user
  const [company] = await knex('users').insert({
    email: 'hr@test.com',
    password_hash: hash,
    role: 'company',
  }).returning('*');

  const [job] = await knex('jobs').insert({
    company_user_id: company.id,
    title: '高级前端工程师',
    city: '上海',
    salary_min: 25000,
    salary_max: 40000,
    experience_level: '3-5年',
    education_level: '本科',
    description: JSON.stringify({ detail: '负责公司核心产品前端开发，使用Vue3+TypeScript技术栈，参与架构设计...' }),
    status: 'open',
  }).returning('*');

  console.log('Seed data created:');
  console.log('  求职者: seeker@test.com / 123456');
  console.log('  公司方: hr@test.com / 123456');
};
