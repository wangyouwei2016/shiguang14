# README Refresh Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 README 重构为中文优先、3 分钟上手的信息架构，同时保持技术信息准确完整。

**Architecture:** 先依据现有代码核对事实（环境变量、API、登录模式、数据路径、Docker 行为），再一次性重写 README 结构，最后执行一致性检查，确保命令与路径可用。

**Tech Stack:** Markdown, Next.js 15, Node.js/npm, Docker

---

### Task 1: 收集 README 事实依据

**Files:**
- Modify: `README.md`
- Read: `package.json`, `.env.example`, `middleware.ts`, `lib/auth.ts`, `app/api/tasks/route.ts`, `app/api/goals/route.ts`, `app/api/focus-cycle/route.ts`, `Dockerfile`

**Step 1: 核对脚本与运行方式**
Run: `cat package.json`
Expected: 存在 `dev/build/start/clean` 脚本。

**Step 2: 核对环境变量与登录约束**
Run: `cat .env.example`
Expected: 存在 `APP_LOGIN_PASSWORD` 与 `APP_LOGIN_USERS` 二选一说明。

**Step 3: 核对 API 与存储路径**
Run: `rg --files app/api`
Expected: 存在 `tasks`、`goals`、`focus-cycle`、`auth/login` 接口。

### Task 2: 重写 README 结构

**Files:**
- Modify: `README.md`

**Step 1: 重排章节到“先上手后深入”**
- 将“30 秒看懂”和“3 分钟启动”前置。
- 将功能、配置、存储、API、Docker、FAQ、docs 索引整理为单线阅读路径。

**Step 2: 中文优先并去重**
- 删除整段重复英文。
- 仅保留一句英文简介用于国际读者快速识别。

**Step 3: 补齐高频问题**
- 增加登录失败、环境变量冲突、数据文件重置的 FAQ。

### Task 3: 自检与结果确认

**Files:**
- Modify: `README.md`

**Step 1: 检查结构标题**
Run: `rg '^#|^##|^###' README.md`
Expected: 标题顺序与设计一致。

**Step 2: 检查关键字一致性**
Run: `rg 'APP_LOGIN_PASSWORD|APP_LOGIN_USERS|/api/tasks|/api/goals|/api/focus-cycle|docker run' README.md`
Expected: 关键配置和命令均存在。

**Step 3: 形成变更摘要**
Run: `git diff -- README.md docs/plans/2026-03-12-readme-refresh-design.md docs/plans/2026-03-12-readme-refresh.md`
Expected: 仅包含本次文档相关改动。
