# 招聘平台 — 设计文档

> 日期: 2026-05-17  
> 项目类型: 学习练手项目  
> 技术栈: Vue3 + Vite + Element Plus / Node.js + Express / PostgreSQL / Socket.IO

---

## 一、项目概述

面向求职者和公司方的在线招聘平台。用户注册时选择角色，求职者管理简历并投递职位、跟踪投递状态，公司方发布职位并接收简历，双方可通过实时聊天沟通。

### 功能清单

| 模块 | 求职者 | 公司方 |
|---|---|---|
| 认证 | 邮箱+密码注册登录 | 邮箱+密码注册登录 |
| 简历 | 一份在线简历 + 最多3份PDF附件 | — |
| 职位 | 搜索/浏览/查看详情 | 发布/编辑/关闭职位 |
| 投递 | 投递职位，管理状态（草稿→已投递→面试中→已发Offer→已接受/已拒绝） | 查看收到的投递，变更状态 |
| 聊天 | 与HR实时消息 | 与求职者实时消息 |
| 通知 | 状态变更、新消息提醒 | 新投递、新消息提醒 |

---

## 二、整体架构

```
浏览器 ──HTTP──▶ Vue3 SPA ──REST API──▶ Express ──SQL──▶ PostgreSQL
   │                                        │
   └──────── WebSocket ──────────────────▶ Socket.IO ──▶ 文件存储 (本地磁盘)
```

- 前端 Vite 开发服务器代理 API 请求到后端，无需 Nginx
- JWT 无状态认证
- HTTP 处理 CRUD，WebSocket 处理实时消息/通知
- PDF 文件存储在 server/uploads/ 目录

---

## 三、数据库模型（PostgreSQL，9 张表）

### users
| 字段 | 类型 | 说明 |
|---|---|---|
| id | SERIAL PK | |
| email | VARCHAR(255) UNIQUE | 登录邮箱 |
| password_hash | VARCHAR(255) | bcrypt 加密 |
| role | VARCHAR(20) | 'job_seeker' / 'company' |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### online_resumes
| 字段 | 类型 | 说明 |
|---|---|---|
| id | SERIAL PK | |
| user_id | INT FK→users | 一对一 |
| full_name | VARCHAR(100) | |
| email | VARCHAR(255) | |
| phone | VARCHAR(20) | |
| city | VARCHAR(50) | |
| education | JSONB | [{school, degree, major, start, end}] |
| work_experience | JSONB | [{company, position, start, end, description}] |
| skills | JSONB | ["技能标签数组"] |
| self_intro | TEXT | 自我描述 |

### resume_attachments
| 字段 | 类型 | 说明 |
|---|---|---|
| id | SERIAL PK | |
| resume_id | INT FK→online_resumes | |
| file_name | VARCHAR(255) | 原始文件名 |
| file_path | VARCHAR(500) | 服务器存储路径 |
| file_size | INT | 字节数 |
| uploaded_at | TIMESTAMP | |

约束：每个 user 最多 3 条，仅允许 PDF。

### jobs
| 字段 | 类型 | 说明 |
|---|---|---|
| id | SERIAL PK | |
| company_user_id | INT FK→users | |
| title | VARCHAR(200) | |
| city | VARCHAR(50) | |
| salary_min | INT | |
| salary_max | INT | |
| experience_level | VARCHAR(50) | 经验要求 |
| education_level | VARCHAR(50) | 学历要求 |
| description | JSONB | 职位描述（富文本） |
| status | VARCHAR(20) | 'open' / 'closed' |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### applications
| 字段 | 类型 | 说明 |
|---|---|---|
| id | SERIAL PK | |
| job_id | INT FK→jobs | |
| job_seeker_user_id | INT FK→users | |
| resume_id | INT FK→online_resumes | 投递时使用的简历 |
| status | VARCHAR(20) | saved / delivered / interviewing / offered / accepted / rejected |
| cover_letter | TEXT | 求职信 |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### conversations
| 字段 | 类型 | 说明 |
|---|---|---|
| id | SERIAL PK | |
| job_seeker_user_id | INT FK→users | |
| company_user_id | INT FK→users | |
| job_id | INT FK→jobs (nullable) | 关联职位 |
| created_at | TIMESTAMP | |

### messages
| 字段 | 类型 | 说明 |
|---|---|---|
| id | SERIAL PK | |
| conversation_id | INT FK→conversations | |
| sender_id | INT FK→users | |
| content | TEXT | |
| is_read | BOOLEAN DEFAULT false | |
| created_at | TIMESTAMP | |

### notifications
| 字段 | 类型 | 说明 |
|---|---|---|
| id | SERIAL PK | |
| user_id | INT FK→users | |
| type | VARCHAR(50) | 通知类型 |
| title | VARCHAR(200) | |
| content | TEXT | |
| related_id | INT | 关联业务ID |
| is_read | BOOLEAN DEFAULT false | |
| created_at | TIMESTAMP | |

---

## 四、REST API

### 认证 `/api/auth`
- `POST /register` — 注册（email, password, role）
- `POST /login` — 登录，返回 JWT
- `GET /me` — 当前用户信息

### 简历 `/api/resume`（求职者）
- `GET /` — 获取我的简历
- `PUT /` — 创建/更新简历
- `POST /attachments` — 上传PDF附件（≤3份）
- `DELETE /attachments/:id` — 删除附件
- `GET /attachments/:id` — 下载附件

### 职位 `/api/jobs`
- `GET /` — 搜索列表（?keyword, ?city, ?salary_min, ?salary_max, ?experience, ?page, ?page_size）
- `GET /:id` — 职位详情
- `POST /` — 发布职位（公司）
- `PUT /:id` — 编辑职位（公司）
- `DELETE /:id` — 关闭职位（公司）
- `GET /mine` — 我发布的职位（公司）

### 投递 `/api/applications`
- `POST /` — 投递（需 job_id, resume_id, cover_letter）
- `GET /mine` — 我的投递（求职者，支持 ?status 筛选）
- `GET /received` — 收到的投递（公司，按职位分组）
- `PUT /:id/status` — 更新状态（公司操作）

### 聊天 `/api/conversations`
- `GET /` — 会话列表
- `GET /:id/messages` — 历史消息（?before 游标分页）

### 通知 `/api/notifications`
- `GET /` — 通知列表（?page，20条/页）
- `PUT /:id/read` — 标记已读
- `PUT /read-all` — 全部已读

---

## 五、实时通信（Socket.IO）

### 连接流程
1. 前端登录获得 JWT
2. 建立 WebSocket，携带 token
3. 服务端验证 JWT，将 socket 绑定到 userId
4. socket.join(`user:${userId}`) 加入个人房间
5. 就绪，可收发消息和接收通知

### 事件定义

| 事件 | 方向 | 载荷 | 说明 |
|---|---|---|---|
| `send_message` | 客户端→服务端 | { conversationId, content, receiverId } | 发送消息 |
| `new_message` | 服务端→客户端 | { id, conversationId, senderId, content, createdAt } | 接收消息 |
| `notification` | 服务端→客户端 | { id, type, title, content, createdAt } | 接收通知 |

### 服务端处理 send_message 逻辑
1. 验证发送者身份
2. 将消息写入 messages 表
3. 更新 conversations 时间戳
4. 向接收者房间推送 new_message
5. 向接收者推送 notification

---

## 六、前端设计

### 路由

**求职者端 (/seeker/*)**
| 路径 | 页面 |
|---|---|
| /seeker/dashboard | 首页概览 |
| /seeker/resume | 编辑在线简历 |
| /seeker/resume/attachments | 管理附件简历 |
| /seeker/jobs | 职位搜索列表 |
| /seeker/jobs/:id | 职位详情 |
| /seeker/applications | 我的投递（含状态筛选） |
| /seeker/messages | 会话列表 |
| /seeker/messages/:id | 聊天窗口 |
| /seeker/notifications | 通知列表 |

**公司端 (/company/*)**
| 路径 | 页面 |
|---|---|
| /company/dashboard | 首页概览 |
| /company/jobs | 我发布的职位 |
| /company/jobs/create | 发布新职位 |
| /company/jobs/:id/edit | 编辑职位 |
| /company/jobs/:id/applications | 该职位收到的投递 |
| /company/applications/:id | 投递详情（查看简历） |
| /company/messages | 会话列表 |
| /company/messages/:id | 聊天窗口 |

**公共**
| 路径 | 页面 |
|---|---|
| /login | 登录 |
| /register | 注册（含角色选择） |

### 组件划分

| 层级 | 组件 | 说明 |
|---|---|---|
| 共用 | ChatWindow | 实时聊天窗口，双方一致 |
| 共用 | NotificationBell | 通知铃铛 + 红点 |
| 共用 | StatusTag | 投递状态标签（6种状态，颜色区分） |
| 共用 | JobCard | 职位卡片，列表/搜索复用 |
| 共用 | ResumePreview | 简历预览 |
| 共用 | FileUploader | PDF上传组件 |
| 求职者 | ResumeForm | 在线简历表单 |
| 求职者 | ApplicationStatusList | 投递状态管理列表 |
| 求职者 | JobSearchFilters | 职位搜索筛选栏 |
| 公司方 | JobForm | 职位发布/编辑表单 |
| 公司方 | ApplicationList | 收到的投递列表 |
| 公司方 | ResumeViewer | 求职者简历查看 |

### Pinia Store

| Store | 职责 | 关键状态 |
|---|---|---|
| useAuthStore | 认证用户信息 | token, user, role, isLoggedIn |
| useChatStore | 实时聊天 | conversations[], activeChat, messages{}, unreadCount |
| useNotificationStore | 通知管理 | notifications[], unreadCount, wsConnected |
| useApplicationStore | 投递管理 | applications[], statusFilter |

---

## 七、项目目录结构

```
recruitment-platform/
├── client/                          # Vite + Vue3 前端
│   ├── src/
│   │   ├── api/                     # Axios 请求模块
│   │   ├── components/
│   │   │   ├── common/              # 共用组件
│   │   │   ├── seeker/              # 求职者组件
│   │   │   └── company/             # 公司方组件
│   │   ├── composables/             # 组合式函数
│   │   ├── layouts/                 # SeekerLayout / CompanyLayout
│   │   ├── router/
│   │   ├── stores/                  # Pinia
│   │   └── views/                   # 页面
│   └── vite.config.js
│
├── server/                          # Node.js + Express
│   ├── src/
│   │   ├── config/                  # 数据库连接、环境变量
│   │   ├── middleware/              # auth, upload, validate
│   │   ├── routes/                  # 路由定义
│   │   ├── controllers/             # 请求处理
│   │   ├── services/                # 业务逻辑
│   │   ├── models/                  # 数据库操作
│   │   ├── socket/                  # Socket.IO 事件
│   │   └── app.js
│   ├── migrations/                  # Knex 迁移
│   ├── seeds/
│   ├── uploads/                     # PDF 存储
│   └── .env
│
├── docs/
└── package.json
```

### 后端分层职责

| 层 | 职责 | 不做什么 |
|---|---|---|
| Route | 定义 URL、HTTP 方法、参数提取 | 不包含业务逻辑、不操作数据库 |
| Controller | 请求/响应处理，参数校验，调用 Service | 不直接写 SQL |
| Service | 核心业务逻辑，事务管理 | 不处理 HTTP 请求/响应 |
| Model | 封装数据库查询 | 不包含业务判断 |

---

## 八、技术选型汇总

| 层 | 技术 | 用途 |
|---|---|---|
| 前端框架 | Vue 3 (Composition API) | SPA |
| 构建工具 | Vite | 开发/打包 |
| UI 组件库 | Element Plus | 表单/表格/对话框等 |
| 状态管理 | Pinia | 全局状态 |
| 路由 | Vue Router 4 | 页面路由 |
| HTTP 客户端 | Axios | API 请求 |
| 实时通信 | Socket.IO Client | 聊天+通知 |
| 后端框架 | Express | REST API |
| 认证 | JWT (jsonwebtoken) | 无状态认证 |
| 数据库 | PostgreSQL | 主数据存储 |
| 查询构建 | Knex.js | 数据库迁移与查询 |
| 文件上传 | Multer | PDF 附件 |
| WebSocket | Socket.IO (服务端) | 实时推送 |
| 密码加密 | bcrypt | 密码哈希 |

---

## 九、不包含（YAGNI）

- 手机号注册/短信验证（第三方服务不可控）
- OAuth 第三方登录（练手项目聚焦核心流程）
- Redis 缓存（数据量小不需要）
- 消息队列（同步处理足够）
- Docker 容器化（直接本地运行）
- Nginx 反向代理（Vite proxy 替代）
- 简历解析（PDF→结构化数据，复杂度高）
- 分角色更细的权限（如管理员后台）
