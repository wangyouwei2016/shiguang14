# 拾光 14 · Shiguang 14

一个面向独立创造者与终身学习者的极简个人成长管理应用，用“灵感收集 → 两周聚焦 → 今日执行 → 成就回顾”的闭环，帮助用户降低任务焦虑，建立稳定的正反馈。

Shiguang 14 is a minimal personal growth management app for independent creators and lifelong learners. It turns scattered ideas into a calm workflow: capture inspiration, focus on the next 14 days, act on today’s desk, and review completed progress over time.

## 项目亮点 / Highlights

- **极简闭环 / Minimal loop**：从灵感池到 14 天行囊，再到今日案头与时光印记，形成轻量但完整的任务流转。
- **本地持久化 / Local persistence**：通过 Next.js Route Handlers 读写本地 JSON 文件，无需数据库即可完成原型验证。
- **低负担交互 / Low-friction interaction**：支持快速录入、标签提取、状态迁移、目标关联与高光复盘。
- **沉静视觉风格 / Calm visual language**：整体界面围绕侘寂、纸张纹理、柔和边框与轻动效设计。

## 核心功能 / Core Features

### 1. 闪念捕手 / Quick Capture
- 顶部全局输入框，按回车即可将想法加入灵感池。
- 自动提取 `#标签`，并将正文与标签拆分保存。
- 支持 `Ctrl/Cmd + K` 快速聚焦输入框。

The global input at the top captures ideas instantly. It extracts `#tags`, stores the cleaned title, and supports `Ctrl/Cmd + K` for quick focus.

### 2. 灵感池 / Idea Pool
- 用于承接尚未加工的想法、待整理任务与长期灵感。
- 支持编辑标题、标签、删除任务，并将灵感推进到 14 天行囊。

The Idea Pool stores unprocessed ideas and long-tail tasks. Items can be edited, tagged, deleted, or promoted into the 14-day focus list.

### 3. 14 天行囊 / Focus 14
- 用于管理未来两周准备执行的事项。
- 支持将任务放回灵感池，或推送到今日案头。
- 目标管理中的事项也可直接加入行囊，并建立关联关系。

Focus 14 is the two-week execution layer. Tasks can move back to the idea pool or forward to today’s desk, and goals can generate linked focus tasks.

### 4. 今日案头 / Today’s Desk
- 展示今日要处理的任务。
- 支持编辑、删除与完成任务。
- 完成后任务进入时光印记，形成可追溯的成长记录。

Today’s Desk is the daily action board. Tasks can be edited, deleted, or completed, and completed items are archived into the timeline view.

### 5. 时光印记 / Time Footprints
- 以时间线方式按完成时间展示历史任务。
- 支持将任务标记为“高光”，并补充复盘感悟。
- 支持后续修改标题、删除记录与编辑高光笔记。

Time Footprints is a timeline of completed work. Users can highlight meaningful entries and attach short reflection notes.

### 6. 目标管理 / Goal Management
- 独立维护长期 / 中期 / 短期目标。
- 支持编辑目标标题、注释与周期分类。
- 可将目标一键转化为 Focus 14 中的执行任务，并同步关联更新。

Goal Management maintains long-, mid-, and short-term goals. Goals can be edited, categorized, and turned into linked execution tasks inside Focus 14.

## 技术栈 / Tech Stack

| 层级 / Layer | 技术 / Technology | 说明 / Notes |
| --- | --- | --- |
| Framework | `Next.js 15` | 使用 App Router 与 Route Handlers |
| UI | `React 19` | 组件式前端开发 |
| Language | `TypeScript 5` | 全项目类型约束 |
| Styling | `Tailwind CSS 4` | 原子化样式与全局视觉系统 |
| Animation | `motion` | 页面切换与列表微动效 |
| Icons | `lucide-react` | 轻量图标库 |
| Server API | `Next.js Route Handlers` | 提供 `/api/tasks` 与 `/api/goals` |
| Persistence | `JSON files` | 数据落盘到 `data/tasks.json` 与 `data/goals.json` |
| Tooling | `PostCSS` | 样式处理与构建辅助 |
| Deployment | `Next standalone output` | `next.config.ts` 中启用 `output: 'standalone'` |

## 架构说明 / Architecture

当前项目是一个**单体式 Web 原型**：前端页面、服务端 API、数据持久化都在同一个 Next.js 项目中完成。

This project is a **monolithic web prototype** where the UI, API layer, and persistence all live inside the same Next.js app.

### 数据流 / Data Flow

1. 用户在页面中操作任务或目标。
2. 页面通过 `lib/useTasks.ts` 与 `lib/useGoals.ts` 管理客户端状态。
3. 状态变化后，前端向 `/api/tasks` 或 `/api/goals` 发起 `PUT` 请求。
4. 服务端校验数据结构后，将内容原子写入本地 JSON 文件。
5. 页面首次加载时通过 `GET` 请求读取现有数据。

When users change tasks or goals, the client hooks update local state and then persist the full collection through `PUT` requests. The server validates payloads and writes them to local JSON files using a temporary file + rename strategy.

## 项目结构 / Project Structure

```text
.
├── app/
│   ├── api/
│   │   ├── goals/route.ts      # Goal read/write API
│   │   └── tasks/route.ts      # Task read/write API
│   ├── globals.css             # Global styles and texture utilities
│   ├── layout.tsx              # App layout and metadata
│   └── page.tsx                # Main entry and view orchestration
├── components/
│   ├── Focus14.tsx             # 14-day focus view
│   ├── GoalManager.tsx         # Goal CRUD and grouping
│   ├── IdeaPool.tsx            # Idea pool view
│   ├── QuickCapture.tsx        # Global quick capture input
│   ├── Sidebar.tsx             # Main navigation
│   ├── TimeFootprints.tsx      # Completed timeline view
│   └── TodaysDesk.tsx          # Daily execution view
├── data/
│   ├── goals.json              # Goal storage
│   └── tasks.json              # Task storage
├── docs/
│   ├── prd.md                  # Product requirement notes
│   ├── style.md                # Visual style reference
│   └── ui.md                   # UI draft / interaction notes
├── lib/
│   ├── useGoals.ts             # Goal state + persistence hook
│   ├── useTasks.ts             # Task state + persistence hook
│   └── utils.ts                # Shared utilities
├── next.config.ts
├── package.json
└── README.md
```

## 本地运行 / Getting Started

### 环境要求 / Prerequisites

- `Node.js 20+`（推荐使用 LTS 版本 / LTS recommended）
- `npm`（项目当前使用 npm 脚本 / npm scripts are used in this repo）

### 安装与启动 / Install and Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

然后访问 / Then open:

```text
http://localhost:3000
```

### 可用脚本 / Available Scripts

```bash
npm run dev     # 启动开发环境 / start dev server
npm run build   # 构建生产版本 / build for production
npm run start   # 启动生产服务 / start production server
```

## 环境变量 / Environment Variables

项目中提供了以下环境变量模板：

The project ships with the following environment variable template:

- `GEMINI_API_KEY`
- `APP_URL`

需要注意的是：**当前业务功能并没有实际调用 Gemini API**。这些变量更像是继承自 AI Studio 模板的预留配置，而不是当前版本的核心依赖。

Important note: **the current product logic does not actively call the Gemini API**. These variables appear to be inherited from the AI Studio starter template and are not essential to the current feature set.

## 数据存储 / Data Persistence

当前版本采用**文件型持久化**，适合个人使用、原型验证与本地演示。

The current version uses **file-based persistence**, which is great for local demos, prototypes, and single-user workflows.

- 任务数据：`data/tasks.json`
- 目标数据：`data/goals.json`
- 读接口：`GET /api/tasks`、`GET /api/goals`
- 写接口：`PUT /api/tasks`、`PUT /api/goals`
- 写入方式：先写临时文件，再重命名覆盖，降低写坏文件的风险

### 适用边界 / Limitations

- 适合单用户、低并发场景
- 不适合作为多人协作或高并发生产数据库方案
- 若后续要上线为正式产品，建议迁移到 SQLite、PostgreSQL 或 Firebase/Supabase 等托管存储

This persistence model is intentionally simple. It works well for single-user usage but should be replaced by a database for multi-user or production-grade deployments.

## API 概览 / API Overview

### `GET /api/tasks`
返回全部任务数据。

Returns the full task collection.

### `PUT /api/tasks`
接收完整任务数组并落盘，服务端会做基础结构校验。

Accepts the full task array, validates the payload, and persists it to disk.

### `GET /api/goals`
返回全部目标数据。

Returns the full goal collection.

### `PUT /api/goals`
接收完整目标数组并落盘，服务端会做基础结构校验。

Accepts the full goal array, validates the payload, and writes it to disk.

## 设计风格 / Design Notes

项目视觉与交互明显受到以下方向影响：

The visual system and interaction style are shaped by the following ideas:

- 侘寂感 / wabi-sabi inspired calmness
- 柔和中性色 / muted neutral palette
- 纸张颗粒与网格纹理 / paper grain and subtle grid textures
- 低压交互反馈 / gentle, non-punitive task interaction
- 聚焦“慢慢的成就感” / emphasizing gradual progress instead of urgency

相关参考文档位于：

Supporting design notes live in:

- `docs/prd.md`
- `docs/style.md`
- `docs/ui.md`

## 当前状态 / Current Status

这是一个已经具备核心闭环的可运行原型，适合继续沿着以下方向演进：

This is a working prototype with a complete core workflow. Good next steps include:

- 增加拖拽式任务流转 / drag-and-drop task transitions
- 增加筛选、搜索与标签视图 / filters, search, and tag views
- 引入真实数据库与用户体系 / database and authentication
- 支持周期管理与复盘统计 / cycle management and review analytics
- 增强移动端导航体验 / better mobile navigation patterns

## 致谢 / Notes

项目中保留了一些 AI Studio 模板痕迹（例如默认 README、环境变量说明与相关依赖），但当前业务主体已经演化为一个专注于个人成长管理的独立 Web 应用。

Some starter-template traces from AI Studio remain in the repository, but the product itself has already evolved into a focused personal growth management web app.
