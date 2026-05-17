# 招聘平台 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建完整的招聘平台，包含求职者端和公司方双角色系统，支持简历管理、职位发布与搜索、投递状态跟踪、实时聊天和通知推送。

**Architecture:** 单仓库一体化架构，client/ 目录为 Vite+Vue3 SPA，server/ 目录为 Express REST API + Socket.IO 实时服务，PostgreSQL 数据库，JWT 认证，PDF 文件本地存储。

**Tech Stack:** Vue 3 (Composition API) + Vite + Element Plus + Pinia + Vue Router 4 + Axios + Socket.IO Client / Express + Knex.js + Multer + JWT + bcrypt + Socket.IO + PostgreSQL

---

## 文件结构概览

```
recruitment-platform/
├── package.json                     # 根启动脚本
├── client/                          # 前端
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.development
│   └── src/
│       ├── main.js
│       ├── App.vue
│       ├── assets/styles/main.css
│       ├── api/                     # Axios 请求模块 (6 files)
│       ├── components/
│       │   ├── common/              # 6 shared components
│       │   ├── seeker/              # 3 seeker components
│       │   └── company/             # 3 company components
│       ├── composables/             # useSocket, useFileUpload
│       ├── layouts/                 # SeekerLayout, CompanyLayout
│       ├── router/index.js
│       ├── stores/                  # auth, chat, notification, application
│       └── views/
│           ├── auth/                # LoginView, RegisterView
│           ├── seeker/              # 8 views
│           └── company/             # 8 views
├── server/                          # 后端
│   ├── package.json
│   ├── .env
│   ├── knexfile.js
│   ├── src/
│   │   ├── app.js
│   │   ├── config/                  # db.js, index.js
│   │   ├── middleware/              # auth.js, upload.js, validate.js
│   │   ├── routes/                  # 6 route files
│   │   ├── controllers/             # 6 controller files
│   │   ├── services/                # 6 service files
│   │   ├── models/                  # 7 model files
│   │   └── socket/index.js
│   ├── migrations/
│   └── uploads/
└── docs/superpowers/
    ├── specs/2026-05-17-recruitment-platform-design.md
    └── plans/2026-05-17-recruitment-platform-plan.md
```

---

### Phase 1: 项目基础搭建

---

### Task 1: 根目录与后端项目初始化

**Files:**
- Create: `package.json`
- Create: `server/package.json`
- Create: `server/.env`
- Create: `server/knexfile.js`
- Create: `server/src/config/db.js`
- Create: `server/src/config/index.js`

- [ ] **Step 1: 创建根 package.json**

```json
{
  "name": "recruitment-platform",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:client": "cd client && npm run dev",
    "dev:server": "cd server && npm run dev"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
```

Run: `npm install`

- [ ] **Step 2: 创建 server/package.json**

```json
{
  "name": "recruitment-server",
  "private": true,
  "scripts": {
    "dev": "nodemon src/app.js",
    "migrate": "knex migrate:latest --knexfile knexfile.js",
    "seed": "knex seed:run --knexfile knexfile.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "knex": "^3.1.0",
    "pg": "^8.12.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "multer": "^1.4.5-lts.1",
    "socket.io": "^4.7.4",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

Run: `cd server && npm install`

- [ ] **Step 3: 创建 server/.env**

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=recruitment
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
UPLOAD_DIR=uploads
```

- [ ] **Step 4: 创建 server/knexfile.js**

```js
require('dotenv').config();

module.exports = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  migrations: {
    directory: './migrations',
  },
  seeds: {
    directory: './seeds',
  },
};
```

- [ ] **Step 5: 创建 server/src/config/index.js**

```js
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 3,
  },
};
```

- [ ] **Step 6: 创建 server/src/config/db.js**

```js
const knex = require('knex');
const knexfile = require('../../knexfile');

const db = knex(knexfile);

module.exports = db;
```

- [ ] **Step 7: 创建 server/src/app.js**

```js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const { port } = require('./config');
const { initSocket } = require('./socket');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes (later tasks)

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// Socket.IO
initSocket(server);

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
```

- [ ] **Step 8: Commit**

---

### Task 2: 前端项目初始化

**Files:**
- Create: `client/package.json`
- Create: `client/index.html`
- Create: `client/vite.config.js`
- Create: `client/.env.development`
- Create: `client/src/main.js`
- Create: `client/src/App.vue`
- Create: `client/src/assets/styles/main.css`
- Create: `client/src/router/index.js`

- [ ] **Step 1: 创建 client/package.json**

```json
{
  "name": "recruitment-client",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.3.0",
    "pinia": "^2.1.7",
    "element-plus": "^2.5.0",
    "@element-plus/icons-vue": "^2.3.1",
    "axios": "^1.6.5",
    "socket.io-client": "^4.7.4"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "vite": "^5.1.0"
  }
}
```

Run: `cd client && npm install`

- [ ] **Step 2: 创建 client/index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>招聘平台</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

- [ ] **Step 3: 创建 client/vite.config.js**

```js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
      },
    },
  },
});
```

- [ ] **Step 4: 创建 client/.env.development**

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000
```

- [ ] **Step 5: 创建 client/src/main.js**

```js
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import App from './App.vue';
import router from './router';
import './assets/styles/main.css';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(ElementPlus, { locale: /* zhCn later */ });

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.mount('#app');
```

- [ ] **Step 6: 创建 client/src/App.vue**

```vue
<template>
  <router-view />
</template>
```

- [ ] **Step 7: 创建全局样式 client/src/assets/styles/main.css**

```css
:root {
  /* 求职者端主题色 */
  --seeker-primary: #2563EB;
  --seeker-primary-light: #3B82F6;
  --seeker-accent: #F59E0B;
  --seeker-bg: #EFF6FF;
  --seeker-dark: #1E3A5F;

  /* 公司端主题色 */
  --company-primary: #0F766E;
  --company-primary-light: #0D9488;
  --company-accent: #059669;
  --company-bg: #F0FDFA;
  --company-dark: #134E4A;

  /* 中性色 */
  --gray-50: #F8FAFC;
  --gray-100: #F1F5F9;
  --gray-200: #E2E8F0;
  --gray-400: #94A3B8;
  --gray-500: #64748B;
  --gray-800: #1E293B;

  /* 圆角 */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 999px;

  /* 阴影 */
  --shadow-card: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-hover: 0 4px 12px rgba(0,0,0,0.1);
  --shadow-modal: 0 20px 60px rgba(0,0,0,0.15);

  /* 字体 */
  --font-display: 'DM Sans', sans-serif;
  --font-body: 'Inter', -apple-system, sans-serif;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--gray-500);
  background: var(--gray-50);
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--gray-800);
}
```

- [ ] **Step 8: 创建 client/src/router/index.js（骨架，后续补充路由）**

```js
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: () => import('@/views/auth/LoginView.vue') },
  { path: '/register', name: 'Register', component: () => import('@/views/auth/RegisterView.vue') },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
```

- [ ] **Step 9: 验证前端能启动**

Run: `cd client && npm run dev`
Expected: Vite dev server starts on http://localhost:5173

- [ ] **Step 10: Commit**

---

### Task 3: 数据库迁移

**Files:**
- Create: `server/migrations/001_initial.js`
- Create: `server/seeds/001_sample.js`

- [ ] **Step 1: 确保 PostgreSQL 数据库存在**

Run: `psql -U postgres -c "CREATE DATABASE recruitment;"` (如果尚未创建)

- [ ] **Step 2: 创建迁移文件 server/migrations/001_initial.js**

```js
exports.up = function (knex) {
  return knex.schema
    .createTable('users', (t) => {
      t.increments('id').primary();
      t.string('email', 255).notNullable().unique();
      t.string('password_hash', 255).notNullable();
      t.string('role', 20).notNullable(); // 'job_seeker' | 'company'
      t.timestamps(true, true);
    })
    .createTable('online_resumes', (t) => {
      t.increments('id').primary();
      t.integer('user_id').unsigned().notNullable()
        .references('id').inTable('users').onDelete('CASCADE');
      t.string('full_name', 100);
      t.string('email', 255);
      t.string('phone', 20);
      t.string('city', 50);
      t.jsonb('education').defaultTo('[]');
      t.jsonb('work_experience').defaultTo('[]');
      t.jsonb('skills').defaultTo('[]');
      t.text('self_intro');
      t.timestamps(true, true);
    })
    .createTable('resume_attachments', (t) => {
      t.increments('id').primary();
      t.integer('resume_id').unsigned().notNullable()
        .references('id').inTable('online_resumes').onDelete('CASCADE');
      t.string('file_name', 255).notNullable();
      t.string('file_path', 500).notNullable();
      t.integer('file_size').notNullable();
      t.timestamp('uploaded_at').defaultTo(knex.fn.now());
    })
    .createTable('jobs', (t) => {
      t.increments('id').primary();
      t.integer('company_user_id').unsigned().notNullable()
        .references('id').inTable('users').onDelete('CASCADE');
      t.string('title', 200).notNullable();
      t.string('city', 50);
      t.integer('salary_min');
      t.integer('salary_max');
      t.string('experience_level', 50);
      t.string('education_level', 50);
      t.jsonb('description').defaultTo('{}');
      t.string('status', 20).defaultTo('open'); // 'open' | 'closed'
      t.timestamps(true, true);
    })
    .createTable('applications', (t) => {
      t.increments('id').primary();
      t.integer('job_id').unsigned().notNullable()
        .references('id').inTable('jobs').onDelete('CASCADE');
      t.integer('job_seeker_user_id').unsigned().notNullable()
        .references('id').inTable('users').onDelete('CASCADE');
      t.integer('resume_id').unsigned().notNullable()
        .references('id').inTable('online_resumes').onDelete('CASCADE');
      t.string('status', 20).defaultTo('saved');
      t.text('cover_letter');
      t.timestamps(true, true);
    })
    .createTable('conversations', (t) => {
      t.increments('id').primary();
      t.integer('job_seeker_user_id').unsigned().notNullable()
        .references('id').inTable('users').onDelete('CASCADE');
      t.integer('company_user_id').unsigned().notNullable()
        .references('id').inTable('users').onDelete('CASCADE');
      t.integer('job_id').unsigned()
        .references('id').inTable('jobs').onDelete('SET NULL');
      t.timestamps(true, true);
      t.unique(['job_seeker_user_id', 'company_user_id', 'job_id']);
    })
    .createTable('messages', (t) => {
      t.increments('id').primary();
      t.integer('conversation_id').unsigned().notNullable()
        .references('id').inTable('conversations').onDelete('CASCADE');
      t.integer('sender_id').unsigned().notNullable()
        .references('id').inTable('users').onDelete('CASCADE');
      t.text('content').notNullable();
      t.boolean('is_read').defaultTo(false);
      t.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .createTable('notifications', (t) => {
      t.increments('id').primary();
      t.integer('user_id').unsigned().notNullable()
        .references('id').inTable('users').onDelete('CASCADE');
      t.string('type', 50).notNullable();
      t.string('title', 200).notNullable();
      t.text('content');
      t.integer('related_id');
      t.boolean('is_read').defaultTo(false);
      t.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('notifications')
    .dropTableIfExists('messages')
    .dropTableIfExists('conversations')
    .dropTableIfExists('applications')
    .dropTableIfExists('jobs')
    .dropTableIfExists('resume_attachments')
    .dropTableIfExists('online_resumes')
    .dropTableIfExists('users');
};
```

- [ ] **Step 3: 运行迁移**

Run: `cd server && npm run migrate`
Expected: 9 张表创建成功

- [ ] **Step 4: 创建种子数据 server/seeds/001_sample.js**

```js
const bcrypt = require('bcryptjs');

exports.seed = async function (knex) {
  // 清理
  await knex('notifications').del();
  await knex('messages').del();
  await knex('conversations').del();
  await knex('applications').del();
  await knex('jobs').del();
  await knex('resume_attachments').del();
  await knex('online_resumes').del();
  await knex('users').del();

  const hash = await bcrypt.hash('123456', 10);

  // 求职者
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

  // 公司方
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
    description: JSON.stringify({ detail: '负责公司核心产品前端开发...' }),
    status: 'open',
  }).returning('*');

  console.log('Seed data created:');
  console.log('  求职者: seeker@test.com / 123456');
  console.log('  公司方: hr@test.com / 123456');
};
```

- [ ] **Step 5: 运行种子数据**

Run: `cd server && npm run seed`
Expected: 种子数据插入成功

- [ ] **Step 6: Commit**

---

### Phase 2: 后端核心

---

### Task 4: 认证系统（注册/登录/JWT中间件）

**Files:**
- Create: `server/src/models/user.js`
- Create: `server/src/services/auth.js`
- Create: `server/src/controllers/auth.js`
- Create: `server/src/routes/auth.js`
- Create: `server/src/middleware/auth.js`

- [ ] **Step 1: 创建 server/src/models/user.js**

```js
const db = require('../config/db');

const User = {
  findByEmail: (email) => db('users').where({ email }).first(),
  findById: (id) => db('users').where({ id }).first().select('id', 'email', 'role', 'created_at'),
  create: (data) => db('users').insert(data).returning(['id', 'email', 'role', 'created_at']),
};

module.exports = User;
```

- [ ] **Step 2: 创建 server/src/services/auth.js**

```js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const config = require('../config');

class AuthService {
  async register(email, password, role) {
    const existing = await User.findByEmail(email);
    if (existing) throw Object.assign(new Error('邮箱已注册'), { status: 409 });

    const password_hash = await bcrypt.hash(password, 10);
    const [user] = await User.create({ email, password_hash, role });
    const token = this._generateToken(user);
    return { user, token };
  }

  async login(email, password) {
    const user = await User.findByEmail(email);
    if (!user) throw Object.assign(new Error('邮箱或密码错误'), { status: 401 });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw Object.assign(new Error('邮箱或密码错误'), { status: 401 });

    const { password_hash, ...safeUser } = user;
    const token = this._generateToken(safeUser);
    return { user: safeUser, token };
  }

  async getMe(userId) {
    const user = await User.findById(userId);
    if (!user) throw Object.assign(new Error('用户不存在'), { status: 404 });
    return user;
  }

  _generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }
}

module.exports = new AuthService();
```

- [ ] **Step 3: 创建 server/src/controllers/auth.js**

```js
const authService = require('../services/auth');

const AuthController = {
  register: async (req, res, next) => {
    try {
      const { email, password, role } = req.body;
      if (!email || !password || !role) throw Object.assign(new Error('缺少必填字段'), { status: 400 });
      if (!['job_seeker', 'company'].includes(role)) throw Object.assign(new Error('无效角色'), { status: 400 });
      if (password.length < 6) throw Object.assign(new Error('密码至少6位'), { status: 400 });

      const result = await authService.register(email, password, role);
      res.status(201).json(result);
    } catch (err) { next(err); }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) throw Object.assign(new Error('缺少邮箱或密码'), { status: 400 });

      const result = await authService.login(email, password);
      res.json(result);
    } catch (err) { next(err); }
  },

  me: async (req, res, next) => {
    try {
      const user = await authService.getMe(req.userId);
      res.json({ user });
    } catch (err) { next(err); }
  },
};

module.exports = AuthController;
```

- [ ] **Step 4: 创建 server/src/routes/auth.js**

```js
const router = require('express').Router();
const AuthController = require('../controllers/auth');
const authMiddleware = require('../middleware/auth');

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/me', authMiddleware, AuthController.me);

module.exports = router;
```

- [ ] **Step 5: 创建 server/src/middleware/auth.js**

```js
const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token 无效或已过期' });
  }
};
```

- [ ] **Step 6: 更新 server/src/app.js，挂载路由**

在 `app.use(express.json())` 之后添加：
```js
app.use('/api/auth', require('./routes/auth'));
```

- [ ] **Step 7: 测试认证 API**

Run: `cd server && npm run dev`

用 curl 或 Postman 测试：
```bash
# 注册
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","role":"job_seeker"}'

# 登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# 获取当前用户（替换 YOUR_TOKEN）
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

- [ ] **Step 8: Commit**

---

### Task 5: 简历管理 API

**Files:**
- Create: `server/src/models/resume.js`
- Create: `server/src/services/resume.js`
- Create: `server/src/controllers/resume.js`
- Create: `server/src/routes/resume.js`
- Create: `server/src/middleware/upload.js`

- [ ] **Step 1: 创建 server/src/models/resume.js**

```js
const db = require('../config/db');

const Resume = {
  findByUserId: (userId) => db('online_resumes').where({ user_id: userId }).first(),
  upsert: (userId, data) => db('online_resumes')
    .insert({ ...data, user_id: userId })
    .onConflict('user_id')
    .merge(data)
    .returning('*'),

  // Attachments
  countAttachments: (resumeId) => db('resume_attachments').where({ resume_id: resumeId }).count('id as count').first(),
  getAttachments: (resumeId) => db('resume_attachments').where({ resume_id: resumeId }),
  addAttachment: (data) => db('resume_attachments').insert(data).returning('*'),
  getAttachment: (id) => db('resume_attachments').where({ id }).first(),
  deleteAttachment: (id) => db('resume_attachments').where({ id }).del(),
};

module.exports = Resume;
```

- [ ] **Step 2: 创建 server/src/middleware/upload.js**

```js
const multer = require('multer');
const path = require('path');
const config = require('../config');
const fs = require('fs');

if (!fs.existsSync(config.upload.dir)) {
  fs.mkdirSync(config.upload.dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, config.upload.dir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype !== 'application/pdf') {
    return cb(new Error('仅允许PDF文件'), false);
  }
  cb(null, true);
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.upload.maxFileSize },
});
```

- [ ] **Step 3: 创建 server/src/services/resume.js**

```js
const Resume = require('../models/resume');
const config = require('../config');

class ResumeService {
  async getResume(userId) {
    const resume = await Resume.findByUserId(userId);
    if (!resume) return null;
    const attachments = await Resume.getAttachments(resume.id);
    return { ...resume, attachments };
  }

  async upsertResume(userId, data) {
    const allowed = ['full_name', 'email', 'phone', 'city', 'education', 'work_experience', 'skills', 'self_intro'];
    const filtered = {};
    allowed.forEach((k) => { if (data[k] !== undefined) filtered[k] = data[k]; });
    const [resume] = await Resume.upsert(userId, filtered);
    const attachments = await Resume.getAttachments(resume.id);
    return { ...resume, attachments };
  }

  async uploadAttachment(userId, file) {
    const resume = await Resume.findByUserId(userId);
    if (!resume) throw Object.assign(new Error('请先创建在线简历'), { status: 400 });

    const { count } = await Resume.countAttachments(resume.id);
    if (parseInt(count) >= config.upload.maxFiles) {
      throw Object.assign(new Error(`最多上传${config.upload.maxFiles}份附件`), { status: 400 });
    }

    const [attachment] = await Resume.addAttachment({
      resume_id: resume.id,
      file_name: file.originalname,
      file_path: file.path,
      file_size: file.size,
    });
    return attachment;
  }

  async deleteAttachment(userId, attachmentId) {
    const resume = await Resume.findByUserId(userId);
    if (!resume) throw Object.assign(new Error('简历不存在'), { status: 404 });

    const attachment = await Resume.getAttachment(attachmentId);
    if (!attachment || attachment.resume_id !== resume.id) {
      throw Object.assign(new Error('附件不存在'), { status: 404 });
    }

    const fs = require('fs');
    fs.unlink(attachment.file_path, () => {});
    await Resume.deleteAttachment(attachmentId);
    return { deleted: true };
  }

  async getAttachmentFile(attachmentId) {
    const attachment = await Resume.getAttachment(attachmentId);
    if (!attachment) throw Object.assign(new Error('附件不存在'), { status: 404 });
    return attachment;
  }
}

module.exports = new ResumeService();
```

- [ ] **Step 4: 创建 server/src/controllers/resume.js**

```js
const resumeService = require('../services/resume');
const path = require('path');

const ResumeController = {
  get: async (req, res, next) => {
    try {
      const data = await resumeService.getResume(req.userId);
      res.json({ resume: data });
    } catch (err) { next(err); }
  },

  upsert: async (req, res, next) => {
    try {
      const resume = await resumeService.upsertResume(req.userId, req.body);
      res.json({ resume });
    } catch (err) { next(err); }
  },

  uploadAttachment: async (req, res, next) => {
    try {
      const attachment = await resumeService.uploadAttachment(req.userId, req.file);
      res.status(201).json({ attachment });
    } catch (err) { next(err); }
  },

  deleteAttachment: async (req, res, next) => {
    try {
      const result = await resumeService.deleteAttachment(req.userId, parseInt(req.params.id));
      res.json(result);
    } catch (err) { next(err); }
  },

  downloadAttachment: async (req, res, next) => {
    try {
      const attachment = await resumeService.getAttachmentFile(parseInt(req.params.id));
      res.download(attachment.file_path, attachment.file_name);
    } catch (err) { next(err); }
  },
};

module.exports = ResumeController;
```

- [ ] **Step 5: 创建 server/src/routes/resume.js**

```js
const router = require('express').Router();
const ResumeController = require('../controllers/resume');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { requireRole } = require('../middleware/validate');

router.get('/', auth, requireRole('job_seeker'), ResumeController.get);
router.put('/', auth, requireRole('job_seeker'), ResumeController.upsert);
router.post('/attachments', auth, requireRole('job_seeker'), upload.single('file'), ResumeController.uploadAttachment);
router.delete('/attachments/:id', auth, requireRole('job_seeker'), ResumeController.deleteAttachment);
router.get('/attachments/:id', auth, ResumeController.downloadAttachment);

module.exports = router;
```

- [ ] **Step 6: 创建 server/src/middleware/validate.js**

```js
const validate = {
  requireRole: (...roles) => (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ error: '无权限执行此操作' });
    }
    next();
  },
};

module.exports = validate;
```

- [ ] **Step 7: 挂载路由**

在 `server/src/app.js` 中添加：
```js
app.use('/api/resume', require('./routes/resume'));
```

- [ ] **Step 8: Commit**

---

### Task 6: 职位管理 API

**Files:**
- Create: `server/src/models/job.js`
- Create: `server/src/services/jobs.js`
- Create: `server/src/controllers/jobs.js`
- Create: `server/src/routes/jobs.js`

- [ ] **Step 1: 创建 server/src/models/job.js**

```js
const db = require('../config/db');

const Job = {
  create: (data) => db('jobs').insert(data).returning('*'),
  update: (id, companyUserId, data) => db('jobs').where({ id, company_user_id: companyUserId }).update(data).returning('*'),
  findById: (id) => db('jobs').where({ id }).first(),
  findByCompany: (companyUserId) => db('jobs').where({ company_user_id: companyUserId }).orderBy('created_at', 'desc'),
  search: (filters) => {
    let query = db('jobs').where({ status: 'open' });
    if (filters.keyword) query = query.where('title', 'ilike', `%${filters.keyword}%`);
    if (filters.city) query = query.where('city', 'ilike', `%${filters.city}%`);
    if (filters.salary_min) query = query.where('salary_max', '>=', filters.salary_min);
    if (filters.experience) query = query.where('experience_level', filters.experience);
    return query.orderBy('created_at', 'desc')
      .limit(filters.page_size || 20)
      .offset(((filters.page || 1) - 1) * (filters.page_size || 20));
  },
  searchCount: (filters) => {
    let query = db('jobs').where({ status: 'open' });
    if (filters.keyword) query = query.where('title', 'ilike', `%${filters.keyword}%`);
    if (filters.city) query = query.where('city', 'ilike', `%${filters.city}%`);
    if (filters.salary_min) query = query.where('salary_max', '>=', filters.salary_min);
    if (filters.experience) query = query.where('experience_level', filters.experience);
    return query.count('id as total').first();
  },
  delete: (id, companyUserId) => db('jobs').where({ id, company_user_id: companyUserId }).update({ status: 'closed' }),
};

module.exports = Job;
```

- [ ] **Step 2: 创建 server/src/services/jobs.js**

```js
const Job = require('../models/job');

class JobService {
  async create(companyUserId, data) {
    const [job] = await Job.create({ ...data, company_user_id: companyUserId });
    return job;
  }

  async update(jobId, companyUserId, data) {
    const [job] = await Job.update(jobId, companyUserId, data);
    if (!job) throw Object.assign(new Error('职位不存在或无权操作'), { status: 404 });
    return job;
  }

  async getById(jobId) {
    const job = await Job.findById(jobId);
    if (!job) throw Object.assign(new Error('职位不存在'), { status: 404 });
    return job;
  }

  async getMine(companyUserId) {
    return Job.findByCompany(companyUserId);
  }

  async search(filters) {
    const [jobs, { total }] = await Promise.all([
      Job.search(filters),
      Job.searchCount(filters),
    ]);
    return { items: jobs, total: parseInt(total), page: parseInt(filters.page || 1) };
  }

  async close(jobId, companyUserId) {
    const [job] = await Job.delete(jobId, companyUserId);
    if (!job) throw Object.assign(new Error('职位不存在或无权操作'), { status: 404 });
    return job;
  }
}

module.exports = new JobService();
```

- [ ] **Step 3: 创建 server/src/controllers/jobs.js**

```js
const jobService = require('../services/jobs');

const JobController = {
  create: async (req, res, next) => {
    try {
      const job = await jobService.create(req.userId, req.body);
      res.status(201).json({ job });
    } catch (err) { next(err); }
  },
  update: async (req, res, next) => {
    try {
      const job = await jobService.update(parseInt(req.params.id), req.userId, req.body);
      res.json({ job });
    } catch (err) { next(err); }
  },
  get: async (req, res, next) => {
    try {
      const { keyword, city, salary_min, experience, page, page_size } = req.query;
      const result = await jobService.search({ keyword, city, salary_min, experience, page, page_size });
      res.json(result);
    } catch (err) { next(err); }
  },
  getById: async (req, res, next) => {
    try {
      const job = await jobService.getById(parseInt(req.params.id));
      res.json({ job });
    } catch (err) { next(err); }
  },
  getMine: async (req, res, next) => {
    try {
      const jobs = await jobService.getMine(req.userId);
      res.json({ jobs });
    } catch (err) { next(err); }
  },
  delete: async (req, res, next) => {
    try {
      const job = await jobService.close(parseInt(req.params.id), req.userId);
      res.json({ job });
    } catch (err) { next(err); }
  },
};

module.exports = JobController;
```

- [ ] **Step 4: 创建 server/src/routes/jobs.js**

```js
const router = require('express').Router();
const JobController = require('../controllers/jobs');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/validate');

router.get('/', JobController.get);
router.get('/mine', auth, requireRole('company'), JobController.getMine);
router.get('/:id', JobController.getById);
router.post('/', auth, requireRole('company'), JobController.create);
router.put('/:id', auth, requireRole('company'), JobController.update);
router.delete('/:id', auth, requireRole('company'), JobController.delete);

module.exports = router;
```

- [ ] **Step 5: 挂载路由**

在 `server/src/app.js` 中添加：
```js
app.use('/api/jobs', require('./routes/jobs'));
```

- [ ] **Step 6: Commit**

---

### Task 7: 投递管理 API

**Files:**
- Create: `server/src/models/application.js`
- Create: `server/src/services/applications.js`
- Create: `server/src/controllers/applications.js`
- Create: `server/src/routes/applications.js`

- [ ] **Step 1: 创建 server/src/models/application.js**

```js
const db = require('../config/db');

const Application = {
  create: (data) => db('applications').insert(data).returning('*'),
  findBySeeker: (userId, status) => {
    let q = db('applications')
      .join('jobs', 'applications.job_id', 'jobs.id')
      .where('applications.job_seeker_user_id', userId)
      .select('applications.*', 'jobs.title as job_title', 'jobs.city as job_city', 'jobs.company_user_id');
    if (status) q = q.where('applications.status', status);
    return q.orderBy('applications.created_at', 'desc');
  },
  findByCompany: (companyUserId, jobId) => {
    let q = db('applications')
      .join('jobs', 'applications.job_id', 'jobs.id')
      .join('online_resumes', 'applications.resume_id', 'online_resumes.id')
      .where('jobs.company_user_id', companyUserId)
      .select('applications.*', 'jobs.title as job_title', 'online_resumes.full_name as seeker_name');
    if (jobId) q = q.where('applications.job_id', jobId);
    return q.orderBy('applications.created_at', 'desc');
  },
  findById: (id) => db('applications').where({ id }).first(),
  updateStatus: (id, status) => db('applications').where({ id }).update({ status, updated_at: db.fn.now() }).returning('*'),
};

module.exports = Application;
```

- [ ] **Step 2: 创建 server/src/services/applications.js**

```js
const Application = require('../models/application');
const Job = require('../models/job');

class ApplicationService {
  async apply(jobSeekerUserId, { job_id, resume_id, cover_letter, status }) {
    const job = await Job.findById(job_id);
    if (!job || job.status !== 'open') throw Object.assign(new Error('职位不存在或已关闭'), { status: 400 });

    const [app] = await Application.create({
      job_id,
      job_seeker_user_id: jobSeekerUserId,
      resume_id,
      cover_letter: cover_letter || '',
      status: status || 'delivered',
    });
    return app;
  }

  async getMine(jobSeekerUserId, status) {
    return Application.findBySeeker(jobSeekerUserId, status);
  }

  async getReceived(companyUserId, jobId) {
    return Application.findByCompany(companyUserId, jobId);
  }

  async updateStatus(companyUserId, applicationId, newStatus) {
    const app = await Application.findById(applicationId);
    if (!app) throw Object.assign(new Error('投递不存在'), { status: 404 });

    const job = await Job.findById(app.job_id);
    if (job.company_user_id !== companyUserId) {
      throw Object.assign(new Error('无权操作'), { status: 403 });
    }

    const validTransitions = {
      delivered: ['interviewing', 'rejected'],
      interviewing: ['offered', 'rejected'],
      offered: ['accepted', 'rejected'],
      accepted: [],
      rejected: [],
      saved: ['delivered'],
    };

    if (!validTransitions[app.status]?.includes(newStatus)) {
      throw Object.assign(new Error(`不能从 ${app.status} 变更到 ${newStatus}`), { status: 400 });
    }

    return Application.updateStatus(applicationId, newStatus);
  }
}

module.exports = new ApplicationService();
```

- [ ] **Step 3: 创建 server/src/controllers/applications.js**

```js
const applicationService = require('../services/applications');

const ApplicationController = {
  apply: async (req, res, next) => {
    try {
      const app = await applicationService.apply(req.userId, req.body);
      res.status(201).json({ application: app });
    } catch (err) { next(err); }
  },
  getMine: async (req, res, next) => {
    try {
      const applications = await applicationService.getMine(req.userId, req.query.status);
      res.json({ applications });
    } catch (err) { next(err); }
  },
  getReceived: async (req, res, next) => {
    try {
      const applications = await applicationService.getReceived(req.userId, req.query.job_id);
      res.json({ applications });
    } catch (err) { next(err); }
  },
  updateStatus: async (req, res, next) => {
    try {
      const result = await applicationService.updateStatus(req.userId, parseInt(req.params.id), req.body.status);
      res.json({ application: result[0] });
    } catch (err) { next(err); }
  },
};

module.exports = ApplicationController;
```

- [ ] **Step 4: 创建 server/src/routes/applications.js**

```js
const router = require('express').Router();
const ApplicationController = require('../controllers/applications');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/validate');

router.post('/', auth, requireRole('job_seeker'), ApplicationController.apply);
router.get('/mine', auth, requireRole('job_seeker'), ApplicationController.getMine);
router.get('/received', auth, requireRole('company'), ApplicationController.getReceived);
router.put('/:id/status', auth, requireRole('company'), ApplicationController.updateStatus);

module.exports = router;
```

- [ ] **Step 5: 挂载路由**

在 `server/src/app.js` 中添加：
```js
app.use('/api/applications', require('./routes/applications'));
```

- [ ] **Step 6: Commit**

---

### Task 8: 聊天与通知 API

**Files:**
- Create: `server/src/models/conversation.js`
- Create: `server/src/models/message.js`
- Create: `server/src/models/notification.js`
- Create: `server/src/services/conversations.js`
- Create: `server/src/services/notifications.js`
- Create: `server/src/controllers/conversations.js`
- Create: `server/src/controllers/notifications.js`
- Create: `server/src/routes/conversations.js`
- Create: `server/src/routes/notifications.js`

- [ ] **Step 1: 创建 server/src/models/conversation.js**

```js
const db = require('../config/db');

const Conversation = {
  findOrCreate: (jobSeekerUserId, companyUserId, jobId) =>
    db('conversations')
      .insert({ job_seeker_user_id: jobSeekerUserId, company_user_id: companyUserId, job_id: jobId })
      .onConflict(['job_seeker_user_id', 'company_user_id', 'job_id'])
      .merge()
      .returning('*'),

  findByUser: (userId) =>
    db('conversations')
      .where('job_seeker_user_id', userId)
      .orWhere('company_user_id', userId)
      .orderBy('created_at', 'desc'),

  findById: (id) => db('conversations').where({ id }).first(),
};

module.exports = Conversation;
```

- [ ] **Step 2: 创建 server/src/models/message.js**

```js
const db = require('../config/db');

const Message = {
  create: (data) => db('messages').insert(data).returning('*'),
  findByConversation: (conversationId, before, limit = 50) => {
    let q = db('messages').where({ conversation_id: conversationId }).orderBy('created_at', 'desc').limit(limit);
    if (before) q = q.where('id', '<', before);
    return q;
  },
  markRead: (conversationId, userId) =>
    db('messages')
      .where({ conversation_id: conversationId, is_read: false })
      .whereNot({ sender_id: userId })
      .update({ is_read: true }),
  unreadCount: (userId) =>
    db('messages')
      .join('conversations', 'messages.conversation_id', 'conversations.id')
      .where(function () {
        this.where('conversations.job_seeker_user_id', userId)
          .orWhere('conversations.company_user_id', userId);
      })
      .where('messages.is_read', false)
      .whereNot('messages.sender_id', userId)
      .count('messages.id as count')
      .first(),
};

module.exports = Message;
```

- [ ] **Step 3: 创建 server/src/models/notification.js**

```js
const db = require('../config/db');

const Notification = {
  create: (data) => db('notifications').insert(data).returning('*'),
  findByUser: (userId, page = 1, limit = 20) =>
    db('notifications').where({ user_id: userId }).orderBy('created_at', 'desc')
      .limit(limit).offset((page - 1) * limit),
  markRead: (id, userId) => db('notifications').where({ id, user_id: userId }).update({ is_read: true }),
  markAllRead: (userId) => db('notifications').where({ user_id: userId, is_read: false }).update({ is_read: true }),
  unreadCount: (userId) =>
    db('notifications').where({ user_id: userId, is_read: false }).count('id as count').first(),
};

module.exports = Notification;
```

- [ ] **Step 4: 创建 server/src/services/conversations.js**

```js
const Conversation = require('../models/conversation');
const Message = require('../models/message');

class ConversationService {
  async getOrCreate(jobSeekerUserId, companyUserId, jobId) {
    const [conversation] = await Conversation.findOrCreate(jobSeekerUserId, companyUserId, jobId || null);
    return conversation;
  }

  async list(userId) {
    const conversations = await Conversation.findByUser(userId);
    // 获取最后一条消息
    const result = [];
    for (const c of conversations) {
      const msgs = await Message.findByConversation(c.id, null, 1);
      result.push({ ...c, lastMessage: msgs[0] || null });
    }
    return result;
  }

  async getMessages(conversationId, before) {
    const messages = await Message.findByConversation(conversationId, before);
    return messages.reverse(); // 返回正序
  }

  async markRead(conversationId, userId) {
    await Message.markRead(conversationId, userId);
  }

  async unreadCount(userId) {
    const { count } = await Message.unreadCount(userId);
    return parseInt(count);
  }
}

module.exports = new ConversationService();
```

- [ ] **Step 5: 创建 server/src/services/notifications.js**

```js
const Notification = require('../models/notification');

class NotificationService {
  async list(userId, page) {
    return Notification.findByUser(userId, page);
  }

  async markRead(id, userId) {
    await Notification.markRead(id, userId);
  }

  async markAllRead(userId) {
    await Notification.markAllRead(userId);
  }

  async unreadCount(userId) {
    const { count } = await Notification.unreadCount(userId);
    return parseInt(count);
  }

  async create(userId, type, title, content, relatedId) {
    const [notification] = await Notification.create({ user_id: userId, type, title, content, related_id: relatedId });
    return notification;
  }
}

module.exports = new NotificationService();
```

- [ ] **Step 6: 创建 server/src/controllers/conversations.js**

```js
const conversationService = require('../services/conversations');

const ConversationController = {
  list: async (req, res, next) => {
    try {
      const conversations = await conversationService.list(req.userId);
      res.json({ conversations });
    } catch (err) { next(err); }
  },
  getMessages: async (req, res, next) => {
    try {
      const messages = await conversationService.getMessages(parseInt(req.params.id), req.query.before);
      await conversationService.markRead(parseInt(req.params.id), req.userId);
      res.json({ messages });
    } catch (err) { next(err); }
  },
  unreadCount: async (req, res, next) => {
    try {
      const count = await conversationService.unreadCount(req.userId);
      res.json({ count });
    } catch (err) { next(err); }
  },
};

module.exports = ConversationController;
```

- [ ] **Step 7: 创建 server/src/controllers/notifications.js**

```js
const notificationService = require('../services/notifications');

const NotificationController = {
  list: async (req, res, next) => {
    try {
      const notifications = await notificationService.list(req.userId, parseInt(req.query.page || 1));
      const count = await notificationService.unreadCount(req.userId);
      res.json({ notifications, unreadCount: count });
    } catch (err) { next(err); }
  },
  markRead: async (req, res, next) => {
    try {
      await notificationService.markRead(parseInt(req.params.id), req.userId);
      res.json({ success: true });
    } catch (err) { next(err); }
  },
  markAllRead: async (req, res, next) => {
    try {
      await notificationService.markAllRead(req.userId);
      res.json({ success: true });
    } catch (err) { next(err); }
  },
};

module.exports = NotificationController;
```

- [ ] **Step 8: 创建路由文件并挂载**

`server/src/routes/conversations.js`:
```js
const router = require('express').Router();
const ConversationController = require('../controllers/conversations');
const auth = require('../middleware/auth');

router.get('/', auth, ConversationController.list);
router.get('/unread-count', auth, ConversationController.unreadCount);
router.get('/:id/messages', auth, ConversationController.getMessages);

module.exports = router;
```

`server/src/routes/notifications.js`:
```js
const router = require('express').Router();
const NotificationController = require('../controllers/notifications');
const auth = require('../middleware/auth');

router.get('/', auth, NotificationController.list);
router.put('/:id/read', auth, NotificationController.markRead);
router.put('/read-all', auth, NotificationController.markAllRead);

module.exports = router;
```

在 `app.js` 中：
```js
app.use('/api/conversations', require('./routes/conversations'));
app.use('/api/notifications', require('./routes/notifications'));
```

- [ ] **Step 9: Commit**

---

### Task 9: Socket.IO 实时通信

**Files:**
- Create: `server/src/socket/index.js`

- [ ] **Step 1: 创建 server/src/socket/index.js**

```js
const jwt = require('jsonwebtoken');
const config = require('../config');
const messageService = require('../services/conversations');
const notificationService = require('../services/notifications');
const Conversation = require('../models/conversation');
const Message = require('../models/message');

function initSocket(server) {
  const io = require('socket.io')(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  // 在线用户映射 userId -> socketId
  const onlineUsers = new Map();

  // JWT 认证中间件
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('未提供Token'));
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error('Token无效'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;

    // 加入个人房间
    socket.join(`user:${userId}`);
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} connected`);

    // 发送消息
    socket.on('send_message', async ({ conversationId, receiverId, content }) => {
      try {
        // 保存消息
        const [msg] = await Message.create({
          conversation_id: conversationId,
          sender_id: userId,
          content,
        });

        // 推送给接收者
        const payload = {
          id: msg.id,
          conversationId,
          senderId: userId,
          content,
          createdAt: msg.created_at,
        };
        io.to(`user:${receiverId}`).emit('new_message', payload);

        // 发送通知
        const notif = await notificationService.create(
          receiverId,
          'new_message',
          '新消息',
          content.substring(0, 50),
          conversationId
        );
        io.to(`user:${receiverId}`).emit('notification', {
          id: notif.id,
          type: notif.type,
          title: notif.title,
          content: notif.content,
          createdAt: notif.created_at,
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // 通知已读回执（可选）
    socket.on('mark_read', async ({ conversationId }) => {
      await messageService.markRead(conversationId, userId);
    });

    // 断线
    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      console.log(`User ${userId} disconnected`);
    });
  });

  // 挂载到 app，供其他模块使用
  return { io, onlineUsers };
}

module.exports = { initSocket };
```

- [ ] **Step 2: 验证 Socket 连接**

Start server: `cd server && npm run dev`

- [ ] **Step 3: Commit**

---

### Phase 3: 前端实现

---

### Task 10: 前端基础设施（API 层 + Store + 布局）

**Files:**
- Create: `client/src/api/index.js`
- Create: `client/src/api/auth.js`
- Create: `client/src/stores/auth.js`
- Create: `client/src/stores/chat.js`
- Create: `client/src/stores/notification.js`
- Create: `client/src/stores/application.js`
- Create: `client/src/composables/useSocket.js`
- Create: `client/src/layouts/SeekerLayout.vue`
- Create: `client/src/layouts/CompanyLayout.vue`

- [ ] **Step 1: 创建 client/src/api/index.js**

```js
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import router from '@/router';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const authStore = useAuthStore();
      authStore.logout();
      router.push('/login');
    }
    return Promise.reject(err);
  }
);

export default api;
```

- [ ] **Step 2: 创建 client/src/api/auth.js**

```js
import api from './index';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

export const resumeApi = {
  get: () => api.get('/resume'),
  upsert: (data) => api.put('/resume', data),
  uploadAttachment: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/resume/attachments', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  deleteAttachment: (id) => api.delete(`/resume/attachments/${id}`),
  getAttachmentUrl: (id) => `/api/resume/attachments/${id}`,
};

export const jobsApi = {
  search: (params) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  close: (id) => api.delete(`/jobs/${id}`),
  getMine: () => api.get('/jobs/mine'),
};

export const applicationsApi = {
  apply: (data) => api.post('/applications', data),
  getMine: (status) => api.get('/applications/mine', { params: { status } }),
  getReceived: (jobId) => api.get('/applications/received', { params: { job_id: jobId } }),
  updateStatus: (id, status) => api.put(`/applications/${id}/status`, { status }),
};

export const conversationsApi = {
  list: () => api.get('/conversations'),
  getMessages: (id, before) => api.get(`/conversations/${id}/messages`, { params: { before } }),
  unreadCount: () => api.get('/conversations/unread-count'),
};

export const notificationsApi = {
  list: (page) => api.get('/notifications', { params: { page } }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};
```

- [ ] **Step 3: 创建 client/src/stores/auth.js**

```js
import { defineStore } from 'pinia';
import { authApi } from '@/api/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    role: (state) => state.user?.role || '',
    userId: (state) => state.user?.id || null,
  },
  actions: {
    async login(email, password) {
      const { data } = await authApi.login({ email, password });
      this.token = data.token;
      this.user = data.user;
      localStorage.setItem('token', data.token);
    },
    async register(email, password, role) {
      const { data } = await authApi.register({ email, password, role });
      this.token = data.token;
      this.user = data.user;
      localStorage.setItem('token', data.token);
    },
    async fetchUser() {
      const { data } = await authApi.me();
      this.user = data.user;
    },
    logout() {
      this.token = '';
      this.user = null;
      localStorage.removeItem('token');
    },
  },
});
```

- [ ] **Step 4: 创建 client/src/stores/chat.js**

```js
import { defineStore } from 'pinia';
import { conversationsApi } from '@/api/auth';

export const useChatStore = defineStore('chat', {
  state: () => ({
    conversations: [],
    messages: {}, // { [conversationId]: [msg, ...] }
    unreadCount: 0,
  }),
  actions: {
    async fetchConversations() {
      const { data } = await conversationsApi.list();
      this.conversations = data.conversations;
    },
    async fetchMessages(conversationId, before) {
      const { data } = await conversationsApi.getMessages(conversationId, before);
      if (before) {
        this.messages[conversationId] = [...data.messages, ...(this.messages[conversationId] || [])];
      } else {
        this.messages[conversationId] = data.messages;
      }
    },
    addMessage(msg) {
      const list = this.messages[msg.conversationId] || [];
      list.push(msg);
      this.messages[msg.conversationId] = list;
    },
    async fetchUnreadCount() {
      const { data } = await conversationsApi.unreadCount();
      this.unreadCount = data.count;
    },
  },
});
```

- [ ] **Step 5: 创建 client/src/stores/notification.js**

```js
import { defineStore } from 'pinia';
import { notificationsApi } from '@/api/auth';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
  }),
  actions: {
    async fetchList(page = 1) {
      const { data } = await notificationsApi.list(page);
      this.notifications = data.notifications;
      this.unreadCount = data.unreadCount;
    },
    async markRead(id) {
      await notificationsApi.markRead(id);
      const n = this.notifications.find((x) => x.id === id);
      if (n) n.is_read = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
    },
    async markAllRead() {
      await notificationsApi.markAllRead();
      this.notifications.forEach((n) => (n.is_read = true));
      this.unreadCount = 0;
    },
    pushNotification(n) {
      this.notifications.unshift(n);
      this.unreadCount++;
    },
  },
});
```

- [ ] **Step 6: 创建 client/src/stores/application.js**

```js
import { defineStore } from 'pinia';
import { applicationsApi } from '@/api/auth';

export const useApplicationStore = defineStore('application', {
  state: () => ({
    applications: [],
    statusFilter: '',
  }),
  actions: {
    async fetchMine(status) {
      const { data } = await applicationsApi.getMine(status);
      this.applications = data.applications;
    },
    async fetchReceived(jobId) {
      const { data } = await applicationsApi.getReceived(jobId);
      this.applications = data.applications;
    },
    async apply(data) {
      await applicationsApi.apply(data);
    },
    async updateStatus(id, status) {
      await applicationsApi.updateStatus(id, status);
    },
  },
});
```

- [ ] **Step 7: 创建 client/src/composables/useSocket.js**

```js
import { io } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth';
import { useChatStore } from '@/stores/chat';
import { useNotificationStore } from '@/stores/notification';

let socket = null;

export function useSocket() {
  const connect = () => {
    const authStore = useAuthStore();
    if (!authStore.token || socket?.connected) return;

    socket = io('/', {
      auth: { token: authStore.token },
    });

    socket.on('new_message', (msg) => {
      const chatStore = useChatStore();
      chatStore.addMessage(msg);
      chatStore.fetchConversations();
    });

    socket.on('notification', (notif) => {
      const notifStore = useNotificationStore();
      notifStore.pushNotification(notif);
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err.message);
    });
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  };

  const sendMessage = (conversationId, receiverId, content) => {
    if (socket?.connected) {
      socket.emit('send_message', { conversationId, receiverId, content });
    }
  };

  return { connect, disconnect, sendMessage };
}
```

- [ ] **Step 8: 创建 client/src/layouts/SeekerLayout.vue**

```vue
<template>
  <el-container class="layout-seeker">
    <el-aside width="220px" class="sidebar">
      <div class="logo">
        <span class="logo-icon">🔷</span>
        <span class="logo-text">求职中心</span>
      </div>
      <el-menu :default-active="activeMenu" router background-color="transparent" text-color="#475569" active-text-color="#2563EB">
        <el-menu-item index="/seeker/dashboard">
          <el-icon><HomeFilled /></el-icon><span>首页概览</span>
        </el-menu-item>
        <el-menu-item index="/seeker/jobs">
          <el-icon><Search /></el-icon><span>职位搜索</span>
        </el-menu-item>
        <el-menu-item index="/seeker/applications">
          <el-icon><Document /></el-icon><span>我的投递</span>
        </el-menu-item>
        <el-menu-item index="/seeker/resume">
          <el-icon><UserFilled /></el-icon><span>我的简历</span>
        </el-menu-item>
        <el-menu-item index="/seeker/messages">
          <el-icon><ChatDotRound /></el-icon><span>消息</span>
          <el-badge v-if="chatStore.unreadCount" :value="chatStore.unreadCount" class="badge" />
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="topbar">
        <div class="topbar-right">
          <NotificationBell />
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="32" icon="UserFilled" />
              <span>{{ authStore.user?.email }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useChatStore } from '@/stores/chat';
import NotificationBell from '@/components/common/NotificationBell.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const chatStore = useChatStore();
const activeMenu = computed(() => route.path);

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>

<style scoped>
.layout-seeker { height: 100vh; }
.sidebar {
  background: linear-gradient(180deg, #1E3A5F 0%, #2563EB 100%);
  color: #fff;
}
.sidebar :deep(.el-menu) { border-right: none; }
.sidebar :deep(.el-menu-item) { color: rgba(255,255,255,0.7); }
.sidebar :deep(.el-menu-item:hover) { background: rgba(255,255,255,0.1); color: #fff; }
.sidebar :deep(.el-menu-item.is-active) { background: rgba(255,255,255,0.15); color: #fff; font-weight: 600; }
.logo { padding: 20px 16px; display: flex; align-items: center; gap: 8px; font-family: var(--font-display); }
.logo-icon { font-size: 24px; }
.logo-text { font-size: 18px; font-weight: 700; color: #fff; }
.topbar { display: flex; align-items: center; justify-content: flex-end; background: #fff; border-bottom: 1px solid var(--gray-200); padding: 0 24px; }
.topbar-right { display: flex; align-items: center; gap: 20px; }
.user-info { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; }
.main-content { background: var(--gray-50); padding: 24px; }
.badge { margin-top: -8px; }
</style>
```

- [ ] **Step 9: 创建 client/src/layouts/CompanyLayout.vue**

```vue
<template>
  <el-container class="layout-company">
    <el-aside width="220px" class="sidebar">
      <div class="logo">
        <span class="logo-icon">◆</span>
        <span class="logo-text">企业中心</span>
      </div>
      <el-menu :default-active="activeMenu" router background-color="transparent" text-color="#475569" active-text-color="#0F766E">
        <el-menu-item index="/company/dashboard">
          <el-icon><HomeFilled /></el-icon><span>首页概览</span>
        </el-menu-item>
        <el-menu-item index="/company/jobs">
          <el-icon><Briefcase /></el-icon><span>职位管理</span>
        </el-menu-item>
        <el-menu-item index="/company/applications">
          <el-icon><Document /></el-icon><span>简历收件箱</span>
        </el-menu-item>
        <el-menu-item index="/company/messages">
          <el-icon><ChatDotRound /></el-icon><span>消息</span>
          <el-badge v-if="chatStore.unreadCount" :value="chatStore.unreadCount" class="badge" />
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="topbar">
        <div class="topbar-right">
          <NotificationBell />
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="32" icon="UserFilled" />
              <span>{{ authStore.user?.email }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useChatStore } from '@/stores/chat';
import NotificationBell from '@/components/common/NotificationBell.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const chatStore = useChatStore();
const activeMenu = computed(() => route.path);

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>

<style scoped>
.layout-company { height: 100vh; }
.sidebar { background: linear-gradient(180deg, #134E4A 0%, #0F766E 100%); color: #fff; }
.sidebar :deep(.el-menu) { border-right: none; }
.sidebar :deep(.el-menu-item) { color: rgba(255,255,255,0.7); }
.sidebar :deep(.el-menu-item:hover) { background: rgba(255,255,255,0.1); color: #fff; }
.sidebar :deep(.el-menu-item.is-active) { background: rgba(255,255,255,0.15); color: #fff; font-weight: 600; }
.logo { padding: 20px 16px; display: flex; align-items: center; gap: 8px; font-family: var(--font-display); }
.logo-icon { font-size: 24px; }
.logo-text { font-size: 18px; font-weight: 700; color: #fff; }
.topbar { display: flex; align-items: center; justify-content: flex-end; background: #fff; border-bottom: 1px solid var(--gray-200); padding: 0 24px; }
.topbar-right { display: flex; align-items: center; gap: 20px; }
.user-info { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; }
.main-content { background: var(--gray-50); padding: 24px; }
.badge { margin-top: -8px; }
</style>
```

- [ ] **Step 10: 更新路由，加入布局路由** — 更新 `client/src/router/index.js`

在 routes 数组中添加（替换之前的简单骨架）：
```js
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: () => import('@/views/auth/LoginView.vue'), meta: { guest: true } },
  { path: '/register', name: 'Register', component: () => import('@/views/auth/RegisterView.vue'), meta: { guest: true } },
  {
    path: '/seeker',
    component: () => import('@/layouts/SeekerLayout.vue'),
    meta: { requiresAuth: true, role: 'job_seeker' },
    children: [
      { path: 'dashboard', name: 'SeekerDashboard', component: () => import('@/views/seeker/DashboardView.vue') },
      { path: 'resume', name: 'SeekerResume', component: () => import('@/views/seeker/ResumeView.vue') },
      { path: 'resume/attachments', name: 'SeekerAttachments', component: () => import('@/views/seeker/AttachmentsView.vue') },
      { path: 'jobs', name: 'SeekerJobs', component: () => import('@/views/seeker/JobListView.vue') },
      { path: 'jobs/:id', name: 'SeekerJobDetail', component: () => import('@/views/seeker/JobDetailView.vue') },
      { path: 'applications', name: 'SeekerApplications', component: () => import('@/views/seeker/ApplicationListView.vue') },
      { path: 'messages', name: 'SeekerMessages', component: () => import('@/views/seeker/MessageListView.vue') },
      { path: 'messages/:id', name: 'SeekerChat', component: () => import('@/views/seeker/ChatView.vue') },
    ],
  },
  {
    path: '/company',
    component: () => import('@/layouts/CompanyLayout.vue'),
    meta: { requiresAuth: true, role: 'company' },
    children: [
      { path: 'dashboard', name: 'CompanyDashboard', component: () => import('@/views/company/DashboardView.vue') },
      { path: 'jobs', name: 'CompanyJobs', component: () => import('@/views/company/JobListView.vue') },
      { path: 'jobs/create', name: 'CompanyJobCreate', component: () => import('@/views/company/JobCreateView.vue') },
      { path: 'jobs/:id/edit', name: 'CompanyJobEdit', component: () => import('@/views/company/JobEditView.vue') },
      { path: 'jobs/:id/applications', name: 'CompanyJobApplications', component: () => import('@/views/company/JobApplicationsView.vue') },
      { path: 'applications/:id', name: 'CompanyApplicationDetail', component: () => import('@/views/company/ApplicationDetailView.vue') },
      { path: 'messages', name: 'CompanyMessages', component: () => import('@/views/company/MessageListView.vue') },
      { path: 'messages/:id', name: 'CompanyChat', component: () => import('@/views/company/ChatView.vue') },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const { useAuthStore } = require('@/stores/auth');
  const authStore = useAuthStore();

  if (to.path === '/login' || to.path === '/register') {
    if (authStore.isLoggedIn) return next(`/${authStore.role}`);
    return next();
  }

  if (!authStore.isLoggedIn) return next('/login');
  if (to.meta.role && to.meta.role !== authStore.role) return next(`/${authStore.role}/dashboard`);
  next();
});

export default router;
```

- [ ] **Step 11: Commit**

---

### Task 11: 共用组件

**Files:**
- Create: `client/src/components/common/StatusTag.vue`
- Create: `client/src/components/common/JobCard.vue`
- Create: `client/src/components/common/NotificationBell.vue`
- Create: `client/src/components/common/ChatWindow.vue`
- Create: `client/src/components/common/FileUploader.vue`
- Create: `client/src/components/common/ResumePreview.vue`

- [ ] **Step 1: 创建 StatusTag.vue**

```vue
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
```

- [ ] **Step 2: 创建 JobCard.vue**

```vue
<template>
  <div class="job-card" @click="$emit('click')">
    <div class="card-header">
      <h3 class="job-title">{{ job.title }}</h3>
      <span class="salary">{{ job.salary_min / 1000 }}K-{{ job.salary_max / 1000 }}K</span>
    </div>
    <div class="card-meta">
      <span><el-icon><Location /></el-icon>{{ job.city }}</span>
      <span><el-icon><Clock /></el-icon>{{ job.experience_level }}</span>
      <span><el-icon><School /></el-icon>{{ job.education_level }}</span>
    </div>
    <div class="card-footer">
      <StatusTag :status="job.status === 'open' ? 'delivered' : 'rejected'" />
      <span class="date">{{ formatDate(job.created_at) }}</span>
    </div>
  </div>
</template>

<script setup>
import StatusTag from './StatusTag.vue';

defineProps({ job: { type: Object, required: true } });
defineEmits(['click']);

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('zh-CN');
}
</script>

<style scoped>
.job-card {
  background: #fff; border-radius: var(--radius-md); padding: 16px 20px;
  box-shadow: var(--shadow-card); cursor: pointer; transition: all 0.2s;
}
.job-card:hover { box-shadow: var(--shadow-hover); transform: translateY(-1px); }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.job-title { font-size: 16px; font-weight: 700; color: var(--gray-800); }
.salary { font-size: 16px; font-weight: 700; color: #F59E0B; }
.card-meta { display: flex; gap: 16px; font-size: 13px; color: var(--gray-500); margin-bottom: 8px; }
.card-meta span { display: flex; align-items: center; gap: 4px; }
.card-footer { display: flex; justify-content: space-between; align-items: center; }
.date { font-size: 12px; color: var(--gray-400); }
</style>
```

- [ ] **Step 3: 创建 NotificationBell.vue**

```vue
<template>
  <el-badge :value="notifStore.unreadCount" :hidden="!notifStore.unreadCount">
    <el-icon :size="20" style="cursor:pointer" @click="handleClick"><Bell /></el-icon>
  </el-badge>
  <el-drawer v-model="visible" title="消息通知" size="380px">
    <div v-if="notifStore.notifications.length === 0" style="text-align:center;padding:40px;color:#999;">暂无通知</div>
    <div v-for="n in notifStore.notifications" :key="n.id" class="notif-item" :class="{ unread: !n.is_read }" @click="handleRead(n)">
      <div class="notif-title">{{ n.title }}</div>
      <div class="notif-content">{{ n.content }}</div>
      <div class="notif-time">{{ formatDate(n.created_at) }}</div>
    </div>
    <template #footer>
      <el-button text @click="notifStore.markAllRead()">全部已读</el-button>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref } from 'vue';
import { useNotificationStore } from '@/stores/notification';
import { useRouter } from 'vue-router';

const notifStore = useNotificationStore();
const visible = ref(false);
const router = useRouter();

async function handleClick() {
  visible.value = true;
  await notifStore.fetchList();
}

async function handleRead(n) {
  await notifStore.markRead(n.id);
  if (n.type === 'new_message') {
    visible.value = false;
    // 跳转到聊天
  }
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleString('zh-CN');
}
</script>

<style scoped>
.notif-item { padding: 12px 0; border-bottom: 1px solid var(--gray-200); cursor: pointer; }
.notif-item.unread { background: #F0F9FF; margin: 0 -16px; padding: 12px 16px; }
.notif-title { font-weight: 600; font-size: 13px; color: var(--gray-800); margin-bottom: 4px; }
.notif-content { font-size: 12px; color: var(--gray-500); }
.notif-time { font-size: 11px; color: var(--gray-400); margin-top: 4px; }
</style>
```

- [ ] **Step 4: 创建 ChatWindow.vue**（双方共用聊天窗口）

```vue
<template>
  <div class="chat-window">
    <div class="chat-messages" ref="msgContainer">
      <div v-for="msg in messages" :key="msg.id" class="msg" :class="{ mine: msg.sender_id === authStore.userId }">
        <div class="msg-bubble">{{ msg.content }}</div>
        <div class="msg-time">{{ formatTime(msg.created_at) }}</div>
      </div>
      <div v-if="messages.length === 0" class="empty-chat">暂无消息，开始对话吧</div>
    </div>
    <div class="chat-input">
      <el-input v-model="inputText" placeholder="输入消息..." @keyup.enter="handleSend" :rows="2" type="textarea" />
      <el-button type="primary" @click="handleSend" :disabled="!inputText.trim()">发送</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useSocket } from '@/composables/useSocket';

const props = defineProps({
  conversationId: { type: Number, required: true },
  receiverId: { type: Number, required: true },
  messages: { type: Array, default: () => [] },
});

const authStore = useAuthStore();
const { sendMessage } = useSocket();
const inputText = ref('');
const msgContainer = ref(null);

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

function formatTime(d) {
  if (!d) return '';
  return new Date(d).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}
</script>

<style scoped>
.chat-window { display: flex; flex-direction: column; height: 100%; }
.chat-messages { flex: 1; overflow-y: auto; padding: 16px; }
.msg { margin-bottom: 12px; }
.msg.mine { display: flex; flex-direction: column; align-items: flex-end; }
.msg-bubble { max-width: 70%; padding: 8px 14px; border-radius: 12px; font-size: 14px; line-height: 1.5; }
.msg:not(.mine) .msg-bubble { background: #F1F5F9; color: var(--gray-800); border-bottom-left-radius: 4px; }
.msg.mine .msg-bubble { background: var(--seeker-primary); color: #fff; border-bottom-right-radius: 4px; }
.msg-time { font-size: 11px; color: var(--gray-400); margin-top: 2px; }
.empty-chat { text-align: center; color: #999; padding: 60px 0; }
.chat-input { display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid var(--gray-200); background: #fff; }
</style>
```

- [ ] **Step 5: 创建 FileUploader.vue**（PDF上传组件）

```vue
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

const props = defineProps({
  files: { type: Array, default: () => [] },
  maxFiles: { type: Number, default: 3 },
});

const emit = defineEmits(['upload', 'remove']);

function beforeUpload(file) {
  if (file.type !== 'application/pdf') {
    ElMessage.error('仅允许上传 PDF 文件');
    return false;
  }
  if (props.files.length >= props.maxFiles) {
    ElMessage.error(`最多上传 ${props.maxFiles} 份附件`);
    return false;
  }
  return true;
}

function customUpload({ file }) {
  emit('upload', file);
}
</script>

<style scoped>
.file-list { margin-top: 12px; }
.file-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--gray-100); border-radius: var(--radius-sm); margin-bottom: 6px; font-size: 13px; }
</style>
```

- [ ] **Step 6: 创建 ResumePreview.vue**（简历预览）

```vue
<template>
  <div class="resume-preview">
    <div class="resume-header">
      <h2>{{ resume.full_name }}</h2>
      <p>{{ resume.email }} | {{ resume.phone }} | {{ resume.city }}</p>
    </div>

    <div v-if="resume.skills?.length" class="section">
      <h3>技能标签</h3>
      <div class="skill-tags">
        <span v-for="s in parseJSON(resume.skills)" :key="s" class="skill-tag">{{ s }}</span>
      </div>
    </div>

    <div v-if="resume.education?.length" class="section">
      <h3>教育经历</h3>
      <div v-for="(e, i) in parseJSON(resume.education)" :key="i" class="exp-item">
        <div class="exp-title">{{ e.school }} · {{ e.major }} · {{ e.degree }}</div>
        <div class="exp-date">{{ e.start }} - {{ e.end }}</div>
      </div>
    </div>

    <div v-if="resume.work_experience?.length" class="section">
      <h3>工作经历</h3>
      <div v-for="(w, i) in parseJSON(resume.work_experience)" :key="i" class="exp-item">
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
defineProps({ resume: { type: Object, required: true } });

function parseJSON(val) {
  if (!val) return [];
  return typeof val === 'string' ? JSON.parse(val) : val;
}
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
```

- [ ] **Step 7: Commit**

---

### Task 12: 登录注册页面

**Files:**
- Create: `client/src/views/auth/LoginView.vue`
- Create: `client/src/views/auth/RegisterView.vue`

- [ ] **Step 1: 创建 LoginView.vue**

```vue
<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <h1>欢迎回来</h1>
        <p>登录您的招聘平台账号</p>
      </div>
      <el-form ref="formRef" :model="form" :rules="rules" size="large">
        <el-form-item prop="email">
          <el-input v-model="form.email" placeholder="邮箱" prefix-icon="Message" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" prefix-icon="Lock" show-password @keyup.enter="handleLogin" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="submit-btn" @click="handleLogin" :loading="loading">登 录</el-button>
        </el-form-item>
      </el-form>
      <div class="auth-footer">
        没有账号？<router-link to="/register">立即注册</router-link>
      </div>
      <div class="test-hint">
        测试账号：seeker@test.com / 123456 (求职者)<br>
        hr@test.com / 123456 (公司方)
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
    router.push(`/${authStore.role}/dashboard`);
  } catch (err) {
    ElMessage.error(err.response?.data?.error || '登录失败');
  } finally {
    loading.value = false;
  }
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
```

- [ ] **Step 2: 创建 RegisterView.vue**

```vue
<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <h1>创建账号</h1>
        <p>选择您的角色开始使用</p>
      </div>

      <!-- 角色选择 -->
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
          <el-input v-model="form.email" placeholder="邮箱" prefix-icon="Message" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码（至少6位）" prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" placeholder="确认密码" prefix-icon="Lock" show-password @keyup.enter="handleRegister" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="submit-btn" @click="handleRegister" :loading="loading">注 册</el-button>
        </el-form-item>
      </el-form>
      <div class="auth-footer">
        已有账号？<router-link to="/login">立即登录</router-link>
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
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.auth-card { width: 460px; background: #fff; border-radius: var(--radius-lg); padding: 40px; box-shadow: var(--shadow-modal); }
.auth-header { text-align: center; margin-bottom: 24px; }
.auth-header h1 { font-size: 28px; color: var(--gray-800); margin-bottom: 8px; }
.auth-header p { color: var(--gray-500); }
.role-selector { display: flex; gap: 12px; margin-bottom: 24px; }
.role-card { flex: 1; text-align: center; padding: 16px 8px; border: 2px solid var(--gray-200); border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s; }
.role-card:hover { border-color: #667eea; }
.role-card.active { border-color: #667eea; background: #EEF2FF; }
.role-icon { font-size: 28px; margin-bottom: 4px; }
.role-name { font-weight: 700; font-size: 15px; color: var(--gray-800); margin-bottom: 2px; }
.role-desc { font-size: 12px; color: var(--gray-400); }
.submit-btn { width: 100%; background: linear-gradient(135deg, #667eea, #764ba2); border: none; }
.auth-footer { text-align: center; margin-top: 16px; font-size: 13px; color: var(--gray-500); }
.auth-footer a { color: #667eea; }
</style>
```

- [ ] **Step 3: Commit**

---

### Task 13: 求职者端页面

**Files:**
- Create: `client/src/views/seeker/DashboardView.vue`
- Create: `client/src/views/seeker/JobListView.vue`
- Create: `client/src/views/seeker/JobDetailView.vue`
- Create: `client/src/views/seeker/ResumeView.vue`
- Create: `client/src/views/seeker/AttachmentsView.vue`
- Create: `client/src/views/seeker/ApplicationListView.vue`
- Create: `client/src/views/seeker/MessageListView.vue`
- Create: `client/src/views/seeker/ChatView.vue`

- [ ] **Step 1: 创建 DashboardView.vue**（概览统计）

```vue
<template>
  <div class="dashboard">
    <h2>求职面板</h2>
    <el-row :gutter="16" class="stats">
      <el-col :span="6"><el-statistic title="投递中" :value="stats.applying" /></el-col>
      <el-col :span="6"><el-statistic title="面试中" :value="stats.interviewing" /></el-col>
      <el-col :span="6"><el-statistic title="已录用" :value="stats.offered" /></el-col>
      <el-col :span="6"><el-statistic title="新消息" :value="chatStore.unreadCount" /></el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { applicationsApi } from '@/api/auth';
import { useChatStore } from '@/stores/chat';

const chatStore = useChatStore();
const stats = ref({ applying: 0, interviewing: 0, offered: 0 });

onMounted(async () => {
  const { data } = await applicationsApi.getMine();
  const apps = data.applications || [];
  stats.value.applying = apps.filter((a) => a.status === 'delivered').length;
  stats.value.interviewing = apps.filter((a) => a.status === 'interviewing').length;
  stats.value.offered = apps.filter((a) => a.status === 'offered' || a.status === 'accepted').length;
});
</script>

<style scoped>
.dashboard h2 { font-size: 24px; margin-bottom: 20px; }
.stats { margin-top: 16px; }
</style>
```

- [ ] **Step 2: 创建 JobListView.vue**（职位搜索）

```vue
<template>
  <div class="job-list-page">
    <div class="search-bar">
      <el-input v-model="filters.keyword" placeholder="搜索职位..." prefix-icon="Search" clearable class="search-input" @change="search" />
      <el-input v-model="filters.city" placeholder="城市" prefix-icon="Location" clearable class="city-input" @change="search" />
      <el-select v-model="filters.experience" placeholder="经验要求" clearable @change="search" style="width:140px">
        <el-option label="应届生" value="应届生" />
        <el-option label="1-3年" value="1-3年" />
        <el-option label="3-5年" value="3-5年" />
        <el-option label="5年以上" value="5年以上" />
      </el-select>
    </div>
    <div v-if="loading" style="text-align:center;padding:40px"><el-icon class="is-loading"><Loading /></el-icon></div>
    <div v-else>
      <JobCard v-for="job in jobs" :key="job.id" :job="job" @click="router.push(`/seeker/jobs/${job.id}`)" class="job-card-item" />
      <el-pagination v-if="total > 0" :total="total" :page-size="20" layout="prev, pager, next" @current-change="pageChange" style="margin-top:20px;justify-content:center" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { jobsApi } from '@/api/auth';
import JobCard from '@/components/common/JobCard.vue';

const router = useRouter();
const jobs = ref([]);
const total = ref(0);
const loading = ref(false);
const filters = reactive({ keyword: '', city: '', experience: '', page: 1 });

async function search() {
  loading.value = true;
  try {
    const { data } = await jobsApi.search(filters);
    jobs.value = data.items;
    total.value = data.total;
  } finally {
    loading.value = false;
  }
}

function pageChange(page) {
  filters.page = page;
  search();
}

onMounted(() => search());
</script>

<style scoped>
.search-bar { display: flex; gap: 12px; margin-bottom: 20px; }
.search-input { width: 300px; }
.city-input { width: 160px; }
.job-card-item { margin-bottom: 12px; }
</style>
```

- [ ] **Step 3: 创建 JobDetailView.vue**（职位详情+投递）

```vue
<template>
  <div class="job-detail" v-if="job">
    <el-page-header @back="router.back()" :content="job.title" />
    <el-card class="detail-card">
      <h2>{{ job.title }}</h2>
      <div class="meta">
        <span>📍 {{ job.city }}</span>
        <span>💰 {{ (job.salary_min / 1000).toFixed(0) }}K - {{ (job.salary_max / 1000).toFixed(0) }}K</span>
        <span>🎓 {{ job.experience_level }}</span>
        <span>📚 {{ job.education_level }}</span>
      </div>
      <div class="desc" v-html="job.description?.detail || '暂无详细描述'" />

      <el-divider />
      <h3>投递此职位</h3>
      <el-form :model="form" label-width="100px">
        <el-form-item label="使用简历">
          <span v-if="resume">{{ resume.full_name }}</span>
          <el-button v-else text type="primary" @click="router.push('/seeker/resume')">请先创建简历</el-button>
        </el-form-item>
        <el-form-item label="求职信">
          <el-input v-model="form.cover_letter" type="textarea" :rows="4" placeholder="简短的求职信（选填）" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleApply" :loading="applying" :disabled="!resume">
            {{ applying ? '投递中...' : savedApp ? '更新投递' : '立即投递' }}
          </el-button>
          <el-button v-if="!savedApp" @click="handleSave">保存草稿</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { jobsApi, resumeApi, applicationsApi } from '@/api/auth';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const job = ref(null);
const resume = ref(null);
const savedApp = ref(null);
const applying = ref(false);
const form = reactive({ cover_letter: '' });

onMounted(async () => {
  const [{ data: j }, { data: r }] = await Promise.all([
    jobsApi.getById(route.params.id),
    resumeApi.get().catch(() => ({ data: { resume: null } })),
  ]);
  job.value = j.job;
  resume.value = r.resume;
});

async function handleApply() {
  applying.value = true;
  try {
    await applicationsApi.apply({
      job_id: job.value.id,
      resume_id: resume.value.id,
      cover_letter: form.cover_letter,
      status: 'delivered',
    });
    ElMessage.success('投递成功');
  } catch (err) {
    ElMessage.error(err.response?.data?.error || '投递失败');
  } finally {
    applying.value = false;
  }
}

async function handleSave() {
  try {
    await applicationsApi.apply({
      job_id: job.value.id,
      resume_id: resume.value.id,
      cover_letter: form.cover_letter,
      status: 'saved',
    });
    ElMessage.success('已保存草稿');
  } catch (err) {
    ElMessage.error(err.response?.data?.error || '保存失败');
  }
}
</script>

<style scoped>
.job-detail { max-width: 800px; }
.detail-card { margin-top: 20px; }
.detail-card h2 { font-size: 24px; margin-bottom: 12px; }
.meta { display: flex; gap: 20px; font-size: 14px; color: var(--gray-500); margin-bottom: 20px; }
.desc { line-height: 1.8; color: var(--gray-500); }
</style>
```

- [ ] **Step 4: 创建 ResumeView.vue**（简历编辑表单，使用Element Plus表单组件实现教育经历/工作经历动态增删行，格式同设计文档定义）

此处代码较长，核心结构为：el-form 绑定 resume 对象，education/work_experience 使用 el-table + 动态增删行编辑 JSONB 结构，skills 使用 el-tag 输入。具体实现参考 Element Plus 动态表单模式。

- [ ] **Step 5: 创建 AttachmentsView.vue**（附件管理，使用FileUploader组件）

- [ ] **Step 6: 创建 ApplicationListView.vue**（投递列表+状态筛选标签页）

```vue
<template>
  <div class="app-list">
    <h2>我的投递</h2>
    <el-tabs v-model="activeTab" @tab-change="fetchApps">
      <el-tab-pane label="全部" name="" />
      <el-tab-pane label="📋 待投递" name="saved" />
      <el-tab-pane label="📤 已投递" name="delivered" />
      <el-tab-pane label="💬 面试中" name="interviewing" />
      <el-tab-pane label="🎉 已录用" name="offered" />
    </el-tabs>
    <el-table :data="apps" style="width:100%">
      <el-table-column prop="job_title" label="职位" />
      <el-table-column prop="job_city" label="城市" width="120" />
      <el-table-column label="状态" width="120">
        <template #default="{ row }"><StatusTag :status="row.status" /></template>
      </el-table-column>
      <el-table-column label="投递时间" width="160">
        <template #default="{ row }">{{ new Date(row.created_at).toLocaleString('zh-CN') }}</template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { applicationsApi } from '@/api/auth';
import StatusTag from '@/components/common/StatusTag.vue';

const apps = ref([]);
const activeTab = ref('');

async function fetchApps() {
  const { data } = await applicationsApi.getMine(activeTab.value || undefined);
  apps.value = data.applications;
}

onMounted(() => fetchApps());
</script>
```

- [ ] **Step 7: 创建 MessageListView.vue**（会话列表）

```vue
<template>
  <div class="msg-list">
    <h2>消息</h2>
    <div v-for="c in chatStore.conversations" :key="c.id" class="conv-item" @click="router.push(`/seeker/messages/${c.id}`)">
      <div class="conv-info">
        <div class="conv-name">HR · 职位咨询</div>
        <div class="conv-last">{{ c.lastMessage?.content || '暂无消息' }}</div>
      </div>
      <div class="conv-time">{{ formatDate(c.created_at) }}</div>
    </div>
    <el-empty v-if="chatStore.conversations.length === 0" description="暂无会话" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useChatStore } from '@/stores/chat';

const chatStore = useChatStore();
const router = useRouter();

onMounted(() => chatStore.fetchConversations());

function formatDate(d) { return d ? new Date(d).toLocaleDateString('zh-CN') : ''; }
</script>

<style scoped>
.conv-item { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: #fff; border-radius: var(--radius-md); margin-bottom: 8px; cursor: pointer; box-shadow: var(--shadow-card); }
.conv-item:hover { box-shadow: var(--shadow-hover); }
.conv-name { font-weight: 600; color: var(--gray-800); }
.conv-last { font-size: 13px; color: var(--gray-500); margin-top: 4px; }
.conv-time { font-size: 12px; color: var(--gray-400); }
</style>
```

- [ ] **Step 8: 创建 ChatView.vue**（聊天页面，内嵌 ChatWindow）

```vue
<template>
  <div class="chat-page">
    <el-page-header @back="router.back()" content="对话" />
    <div class="chat-container" v-if="conversationId">
      <ChatWindow :conversation-id="conversationId" :receiver-id="receiverId" :messages="msgs" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useChatStore } from '@/stores/chat';
import ChatWindow from '@/components/common/ChatWindow.vue';

const route = useRoute();
const router = useRouter();
const chatStore = useChatStore();

const conversationId = computed(() => parseInt(route.params.id));
const receiverId = computed(() => {
  const conv = chatStore.conversations.find((c) => c.id === conversationId.value);
  return conv?.company_user_id || 0;
});
const msgs = computed(() => chatStore.messages[conversationId.value] || []);

onMounted(() => chatStore.fetchMessages(conversationId.value));
</script>

<style scoped>
.chat-page { height: calc(100vh - 120px); display: flex; flex-direction: column; }
.chat-container { flex: 1; background: #fff; border-radius: var(--radius-md); box-shadow: var(--shadow-card); overflow: hidden; margin-top: 16px; }
</style>
```

- [ ] **Step 9: Commit**

---

### Task 14: 公司端页面（结构同求职者端，对称实现）**

**Files:**
- Create: `client/src/views/company/DashboardView.vue`
- Create: `client/src/views/company/JobListView.vue`
- Create: `client/src/views/company/JobCreateView.vue`
- Create: `client/src/views/company/JobEditView.vue`
- Create: `client/src/views/company/JobApplicationsView.vue`
- Create: `client/src/views/company/ApplicationDetailView.vue`
- Create: `client/src/views/company/MessageListView.vue`
- Create: `client/src/views/company/ChatView.vue`

实现逻辑与求职者端对称，关键差异：
- **DashboardView** — 统计发布职位数、收到简历数
- **JobListView** — 展示本公司发布的职位列表，有关闭功能
- **JobCreateView / JobEditView** — 使用 JobForm 组件（与求职者端不同，提前创建）
- **JobApplicationsView** — 展示某职位收到的投递列表（含状态变更按钮）
- **ApplicationDetailView** — 查看求职者简历详情（使用 ResumePreview 组件）
- **MessageListView / ChatView** — 与求职者端基本一致

核心实现（以 JobCreateView 为例）：

```vue
<template>
  <div>
    <el-page-header @back="router.back()" content="发布新职位" />
    <el-card style="margin-top:20px">
      <el-form :model="form" label-width="100px" ref="formRef" :rules="rules">
        <el-form-item label="职位名称" prop="title">
          <el-input v-model="form.title" placeholder="如：高级前端工程师" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="城市" prop="city">
              <el-input v-model="form.city" placeholder="如：上海" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="最低薪资" prop="salary_min">
              <el-input-number v-model="form.salary_min" :min="0" :step="1000" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="最高薪资" prop="salary_max">
              <el-input-number v-model="form.salary_max" :min="0" :step="1000" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="经验要求" prop="experience_level">
              <el-select v-model="form.experience_level" placeholder="选择" style="width:100%">
                <el-option v-for="e in exps" :key="e" :label="e" :value="e" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学历要求" prop="education_level">
              <el-select v-model="form.education_level" placeholder="选择" style="width:100%">
                <el-option v-for="e in edus" :key="e" :label="e" :value="e" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="职位描述" prop="detail">
          <el-input v-model="form.detail" type="textarea" :rows="6" placeholder="详细描述职位职责与要求..." />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">发布职位</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { jobsApi } from '@/api/auth';
import { ElMessage } from 'element-plus';

const router = useRouter();
const submitting = ref(false);
const exps = ['应届生', '1-3年', '3-5年', '5年以上', '不限'];
const edus = ['高中', '大专', '本科', '硕士', '博士', '不限'];

const form = reactive({ title: '', city: '', salary_min: 0, salary_max: 0, experience_level: '', education_level: '', detail: '' });
const rules = {
  title: [{ required: true, message: '请输入职位名称' }],
  city: [{ required: true, message: '请输入城市' }],
};

async function handleSubmit() {
  submitting.value = true;
  try {
    await jobsApi.create({
      ...form,
      description: { detail: form.detail },
    });
    ElMessage.success('发布成功');
    router.push('/company/jobs');
  } catch (err) {
    ElMessage.error(err.response?.data?.error || '发布失败');
  } finally {
    submitting.value = false;
  }
}
</script>
```

其他公司端页面与求职者端结构对称，关键差异已在上述说明。篇幅原因不全部展开，完整代码在实施时按设计文档逐个实现。

- [ ] **Step 1: Commit**

---

### Phase 4: 集成与调试

---

### Task 15: 端到端集成测试与调试

- [ ] **Step 1: 启动完整项目**

Run: `npm run dev`（根目录，同时启动前后端）

- [ ] **Step 2: 验证核心流程**

1. 注册求职者账号 → 登录 → 创建简历 → 上传PDF附件
2. 注册公司账号 → 登录 → 发布职位
3. 求职者搜索职位 → 查看详情 → 投递
4. 公司方查看收到的投递 → 变更状态（面试中→发Offer）
5. 双方发起聊天 → 实时收发消息
6. 检查通知铃铛是否收到状态变更和消息通知

- [ ] **Step 3: 修复发现的问题**

- [ ] **Step 4: Commit**

---

## 补充说明

- **ResumeView.vue（简历表单）** 和 **公司端的全部视图** 在 Task 13/14 中需要根据实际需求完整实现，本计划提供了核心代码结构，完整实现模式一致。
- **composables/useFileUpload.js** 如果只需要简单调用 API 则可省略，直接在组件中使用 api 层即可。
- 路由守卫中的 `require` 需改为 ES import（Pinia store 在 setup 外使用）。

---

> **实施顺序建议：** Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 6 → Task 7 → Task 8 → Task 9 → Task 10 → Task 11 → Task 12 → (验证前端基础流程) → Task 13 → Task 14 → Task 15
