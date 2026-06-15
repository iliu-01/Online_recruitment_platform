# 招聘平台

在线招聘平台，面向**求职者**、**公司方（HR）**和**管理员**三种角色。求职者可管理简历、搜索职位、投递并跟踪状态、与 HR 实时聊天。公司方可发布职位、查看投递简历、管理面试流程、与求职者沟通。管理员可审查用户与职位数据。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端框架 | Vue 3 (Composition API) + Vite |
| UI 组件库 | Element Plus |
| 状态管理 | Pinia |
| 路由 | Vue Router 4 |
| HTTP 客户端 | Axios |
| 实时通信 | Socket.IO (Client + Server) |
| 后端框架 | Express (Node.js) |
| 数据库 | PostgreSQL |
| 查询构建 | Knex.js |
| 认证 | JWT (jsonwebtoken) + bcryptjs |
| 文件上传 | Multer |

## 功能

### 求职者
- 注册/登录（选择求职者角色）
- 在线简历编辑（基本信息、技能标签、教育/工作经历）
- PDF 附件简历上传（最多 3 份，仅限 PDF）
- 职位搜索与筛选（关键词、城市、经验要求、薪资）
- 投递职位（含求职信，可选保存草稿）
- 投递状态管理（待投递 → 已投递 → 面试中 → 已发 Offer → 已接受/已拒绝）
- 与 HR 实时聊天，支持发送简历附件
- 系统通知（状态变更、新消息提醒）

### 公司方
- 注册/登录（选择公司角色）
- 发布/编辑/关闭/重开职位
- 查看收到的投递简历
- 管理面试流程（变更投递状态）
- 与求职者实时聊天
- 系统通知（新投递、新消息提醒）

### 管理员
- 专属登录入口（仅限种子数据创建）
- 数据概览仪表盘（用户/职位/投递统计）
- 用户管理（查看、删除、切换用户角色）
- 职位审查（查看、删除违规职位）

## 项目结构

```
recruitment-platform/
├── client/                         # 前端 Vue3 + Vite
│   └── src/
│       ├── api/                    # Axios 请求模块 (auth, resume, jobs, applications, chat, notifications)
│       ├── assets/styles/          # 全局样式与 CSS 变量
│       ├── components/
│       │   ├── common/             # 共用组件 (ChatWindow, StatusTag, JobCard, NotificationBell, FileUploader, ResumePreview)
│       │   ├── seeker/             # 求职者专用组件
│       │   └── company/            # 公司方专用组件
│       ├── composables/            # 组合式函数 (useSocket)
│       ├── layouts/                # 布局组件 (SeekerLayout, CompanyLayout, AdminLayout)
│       ├── router/                 # Vue Router 路由配置与守卫
│       ├── stores/                 # Pinia 状态管理 (auth, chat, notification, application)
│       └── views/
│           ├── admin/              # 管理员视图 (3 页面)
│           ├── auth/               # 登录/注册页
│           ├── seeker/             # 求职者视图 (8 页面)
│           └── company/            # 公司方视图 (8 页面)
├── server/                         # 后端 Express + Knex + Socket.IO
│   └── src/
│       ├── config/                 # 配置 (数据库连接、环境变量)
│       ├── controllers/            # 控制器层 (请求/响应处理)
│       ├── middleware/              # 中间件 (JWT 认证、文件上传、参数校验)
│       ├── models/                 # 数据模型层 (数据库操作封装)
│       ├── routes/                 # 路由定义 (auth, resume, jobs, applications, conversations, notifications)
│       ├── services/               # 业务逻辑层
│       └── socket/                 # Socket.IO 事件处理
│   ├── migrations/                 # 数据库迁移文件
│   └── seeds/                      # 种子数据
└── docs/superpowers/               # 设计文档与实施计划
```

## 数据库表结构

### ER 关系图

```
users ──1:1── online_resumes ──1:N── resume_attachments
  │
  ├──1:N── jobs ──1:N── applications
  │           │
  ├──1:N── conversations (as job_seeker) ──1:N── messages
  │
  ├──1:N── conversations (as company)
  │
  └──1:N── notifications
```

### 表定义

#### users — 用户表

| 列名 | 类型 | 约束 | 说明 |
|---|---|---|---|
| id | SERIAL | PK | 自增主键 |
| email | VARCHAR(255) | NOT NULL, UNIQUE | 登录邮箱 |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt 加密后的密码 |
| role | VARCHAR(20) | NOT NULL | 角色: `admin` / `job_seeker` / `company` |
| created_at | TIMESTAMPTZ | NOT NULL | 创建时间 |
| updated_at | TIMESTAMPTZ | NOT NULL | 更新时间 |

#### online_resumes — 在线简历表

| 列名 | 类型 | 约束 | 说明 |
|---|---|---|---|
| id | SERIAL | PK | 自增主键 |
| user_id | INTEGER | NOT NULL, UNIQUE, FK → users.id | 所属用户 (一对一) |
| full_name | VARCHAR(100) | | 姓名 |
| email | VARCHAR(255) | | 联系邮箱 |
| phone | VARCHAR(20) | | 联系电话 |
| city | VARCHAR(50) | | 所在城市 |
| education | JSONB | DEFAULT '[]' | 教育经历数组 |
| work_experience | JSONB | DEFAULT '[]' | 工作经历数组 |
| skills | JSONB | DEFAULT '[]' | 技能标签数组 |
| self_intro | TEXT | | 自我评价 |
| created_at | TIMESTAMPTZ | NOT NULL | 创建时间 |
| updated_at | TIMESTAMPTZ | NOT NULL | 更新时间 |

> education 结构: `[{ school, degree, major, start, end }]`  
> work_experience 结构: `[{ company, position, start, end, description }]`  
> skills 结构: `["Vue.js", "React", ...]`

#### resume_attachments — 简历附件表

| 列名 | 类型 | 约束 | 说明 |
|---|---|---|---|
| id | SERIAL | PK | 自增主键 |
| resume_id | INTEGER | NOT NULL, FK → online_resumes.id (CASCADE) | 所属简历 |
| file_name | VARCHAR(255) | NOT NULL | 原始文件名 |
| file_path | VARCHAR(500) | NOT NULL | 服务器存储路径 |
| file_size | INTEGER | NOT NULL | 文件大小 (字节) |
| uploaded_at | TIMESTAMPTZ | NOT NULL | 上传时间 |

> 每个用户最多 3 份附件，仅限 PDF, ≤10MB

#### jobs — 职位表

| 列名 | 类型 | 约束 | 说明 |
|---|---|---|---|
| id | SERIAL | PK | 自增主键 |
| company_user_id | INTEGER | NOT NULL, FK → users.id (CASCADE) | 发布公司 |
| title | VARCHAR(200) | NOT NULL | 职位名称 |
| city | VARCHAR(50) | | 工作城市 |
| salary_min | INTEGER | | 薪资下限 |
| salary_max | INTEGER | | 薪资上限 |
| experience_level | VARCHAR(50) | | 经验要求 |
| education_level | VARCHAR(50) | | 学历要求 |
| description | JSONB | DEFAULT '{}' | 职位详情 (含 detail 等字段) |
| status | VARCHAR(20) | DEFAULT 'open' | 状态: `open` / `closed` |
| created_at | TIMESTAMPTZ | NOT NULL | 创建时间 |
| updated_at | TIMESTAMPTZ | NOT NULL | 更新时间 |

#### applications — 投递表

| 列名 | 类型 | 约束 | 说明 |
|---|---|---|---|
| id | SERIAL | PK | 自增主键 |
| job_id | INTEGER | NOT NULL, FK → jobs.id (CASCADE) | 投递的职位 |
| job_seeker_user_id | INTEGER | NOT NULL, FK → users.id (CASCADE) | 投递的求职者 |
| resume_id | INTEGER | NOT NULL, FK → online_resumes.id (CASCADE) | 使用的简历 |
| status | VARCHAR(20) | DEFAULT 'saved' | 投递状态 (见状态流转) |
| cover_letter | TEXT | | 求职信 |
| created_at | TIMESTAMPTZ | NOT NULL | 投递时间 |
| updated_at | TIMESTAMPTZ | NOT NULL | 最后更新时间 |

#### conversations — 对话表

| 列名 | 类型 | 约束 | 说明 |
|---|---|---|---|
| id | SERIAL | PK | 自增主键 |
| job_seeker_user_id | INTEGER | NOT NULL, FK → users.id (CASCADE) | 求职者 |
| company_user_id | INTEGER | NOT NULL, FK → users.id (CASCADE) | 公司方 |
| job_id | INTEGER | FK → jobs.id (SET NULL) | 关联职位 (可为空) |
| created_at | TIMESTAMPTZ | NOT NULL | 创建时间 |
| updated_at | TIMESTAMPTZ | NOT NULL | 更新时间 |

> UNIQUE(job_seeker_user_id, company_user_id, job_id)

#### messages — 消息表

| 列名 | 类型 | 约束 | 说明 |
|---|---|---|---|
| id | SERIAL | PK | 自增主键 |
| conversation_id | INTEGER | NOT NULL, FK → conversations.id (CASCADE) | 所属对话 |
| sender_id | INTEGER | NOT NULL, FK → users.id (CASCADE) | 发送者 |
| content | TEXT | NOT NULL | 消息内容 |
| is_read | BOOLEAN | DEFAULT false | 是否已读 |
| created_at | TIMESTAMPTZ | NOT NULL | 发送时间 |

#### notifications — 通知表

| 列名 | 类型 | 约束 | 说明 |
|---|---|---|---|
| id | SERIAL | PK | 自增主键 |
| user_id | INTEGER | NOT NULL, FK → users.id (CASCADE) | 接收用户 |
| type | VARCHAR(50) | NOT NULL | 通知类型 |
| title | VARCHAR(200) | NOT NULL | 通知标题 |
| content | TEXT | | 通知内容 |
| related_id | INTEGER | | 关联实体 ID |
| is_read | BOOLEAN | DEFAULT false | 是否已读 |
| created_at | TIMESTAMPTZ | NOT NULL | 通知时间 |

## 环境要求

- **Node.js** >= 18
- **PostgreSQL** 16 或 17
- **npm** >= 9

## 快速开始

### 1. 创建 PostgreSQL 数据库

安装 PostgreSQL 后，创建 `recruitment` 数据库：

```bash
psql -U postgres -c "CREATE DATABASE recruitment;"
```

### 2. 配置环境变量

编辑 `server/.env`，修改数据库连接信息（与你安装时设定的密码一致）：

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=recruitment
DB_USER=postgres
DB_PASSWORD=你的密码
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
UPLOAD_DIR=uploads
```

### 3. 安装依赖

```bash
# 根目录（安装 concurrently）
npm install

# 后端
cd server
npm install

# 前端
cd ../client
npm install
```

### 4. 初始化数据库

```bash
cd server
npm run migrate    # 创建所有表
npm run seed       # 插入测试数据
```

### 5. 启动项目

```bash
# 在根目录，同时启动前后端
npm run dev
```

或者分别启动：

```bash
# 终端 1 - 后端 (http://localhost:3000)
cd server && npm run dev

# 终端 2 - 前端 (http://localhost:5173)
cd client && npm run dev
```

浏览器打开 `http://localhost:5173`

### 6. 测试账号

| 角色 | 邮箱 | 密码 |
|---|---|---|
| 管理员 | admin@test.com | 123456 |
| 求职者 | seeker@test.com | 123456 |
| 公司方 | hr@test.com | 123456 |

## API 概览

### 认证 `/api/auth`
| 方法 | 路径 | 说明 | 认证 |
|---|---|---|---|
| POST | /register | 注册（email, password, role） | 否 |
| POST | /login | 登录，返回 JWT token | 否 |
| GET | /me | 获取当前用户信息 | 是 |

### 简历 `/api/resume`
| 方法 | 路径 | 说明 | 角色 |
|---|---|---|---|
| GET | / | 获取我的在线简历 | 求职者 |
| PUT | / | 创建/更新在线简历 | 求职者 |
| POST | /attachments | 上传 PDF 附件（≤3份） | 求职者 |
| DELETE | /attachments/:id | 删除附件 | 求职者 |
| GET | /attachments/:id | 下载/预览附件 | 登录用户 |

### 职位 `/api/jobs`
| 方法 | 路径 | 说明 | 角色 |
|---|---|---|---|
| GET | / | 搜索职位（keyword, city, salary, experience, page） | 无 |
| GET | /:id | 职位详情 | 无 |
| POST | / | 发布职位 | 公司方 |
| PUT | /:id | 编辑职位 | 公司方 |
| DELETE | /:id | 关闭职位 | 公司方 |
| GET | /mine | 我发布的职位 | 公司方 |

### 投递 `/api/applications`
| 方法 | 路径 | 说明 | 角色 |
|---|---|---|---|
| POST | / | 投递职位 | 求职者 |
| GET | /mine | 我的投递（支持 ?status 筛选） | 求职者 |
| GET | /received | 收到的投递（支持 ?job_id 筛选） | 公司方 |
| PUT | /:id/status | 更新投递状态 | 公司方 |

### 聊天 `/api/conversations`
| 方法 | 路径 | 说明 | 认证 |
|---|---|---|---|
| POST | / | 创建/查找对话 | 是 |
| GET | / | 对话列表 | 是 |
| GET | /:id/messages | 历史消息（游标分页 ?before） | 是 |

### 通知 `/api/notifications`
| 方法 | 路径 | 说明 | 认证 |
|---|---|---|---|
| GET | / | 通知列表（分页 ?page） | 是 |
| PUT | /:id/read | 标记已读 | 是 |
| PUT | /read-all | 全部已读 | 是 |

### 管理 `/api/admin`
| 方法 | 路径 | 说明 | 角色 |
|---|---|---|---|
| GET | /stats | 平台统计（用户/职位/投递总数） | 管理员 |
| GET | /users | 用户列表（支持 ?role, ?search） | 管理员 |
| PUT | /users/:id | 修改用户角色 | 管理员 |
| DELETE | /users/:id | 删除用户 | 管理员 |
| GET | /jobs | 职位列表（支持 ?status, ?search） | 管理员 |
| DELETE | /jobs/:id | 删除职位 | 管理员 |

### WebSocket 事件

| 事件 | 方向 | 载荷 |
|---|---|---|
| `send_message` | 客户端 → 服务端 | `{ conversationId, receiverId, content }` |
| `new_message` | 服务端 → 客户端 | `{ id, conversationId, sender_id, content, created_at }` |
| `notification` | 服务端 → 客户端 | `{ id, type, title, content, createdAt }` |

## 状态流转

求职者投递后，状态按以下规则流转：

```
saved(待投递) → delivered(已投递)
delivered(已投递) → interviewing(面试中) | rejected(已拒绝)
interviewing(面试中) → offered(已发Offer) | rejected(已拒绝)
offered(已发Offer) → accepted(已接受) | rejected(已拒绝)
```

## 注意事项

- PostgreSQL 服务必须先启动（Windows: `net start postgresql-x64-17` 管理员运行）
- PDF 上传限制：每个用户最多 3 份，单文件不超过 10MB，仅允许 PDF 格式
- 前端开发端口 5173，后端 API 端口 3000，Vite 已配置代理转发 `/api` 和 `/socket.io`
- 数据库迁移前需确保 `server/.env` 配置正确
- 首次启动前务必运行 `npm run migrate && npm run seed`
- `.env` 文件不会被 Git 追踪，请勿将真实密钥提交到仓库
