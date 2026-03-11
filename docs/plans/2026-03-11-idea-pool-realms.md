# 觉行三境（独语/灵思/问程）Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将「灵感池」重构为「觉行三境」，按「独语/灵思/问程」三境展示与管理，并支持灵思与独语之间的条目切换；三境标题样式统一且补充说明文案。

**Architecture:** 通过在 `Task` 上增加可选字段 `ideaRealm` 对 `status === 'idea'` 的任务分区；UI 层按 `ideaRealm` 拆分列表并提供一键切换；抽出可复用的 section/header/card 组件以去除重复并满足文件/函数长度约束。

**Tech Stack:** Next.js (App Router), React, TypeScript, Tailwind, lucide-react, motion.

---

### Task 1: 任务模型增加 `ideaRealm` + API 校验

**Files:**
- Modify: `lib/useTasks.ts`
- Modify: `app/api/tasks/route.ts`

**Step 1: 引入领域枚举并扩展 Task/patch/options**

- 在 `lib/useTasks.ts` 增加：
  - `export type IdeaRealm = 'lingsi' | 'duyu';`
  - `Task.ideaRealm?: IdeaRealm`
  - `TaskPatch` 支持 `ideaRealm`
  - `AddTaskOptions.ideaRealm?`
  - `buildTask()`：当 `status === 'idea'` 时默认 `ideaRealm = 'lingsi'`，非 idea 状态为 `undefined`

**Step 2: API 层增加 schema 校验**

- 在 `app/api/tasks/route.ts` 增加：
  - `type IdeaRealm = 'lingsi' | 'duyu'`
  - `isIdeaRealm(value)` helper
  - `isTask()` 的 optional fields 增加 `ideaRealm` 校验（允许缺省）

**Step 3: 验证**

Run: `npm run build`  
Expected: 退出码 0（无 TS/编译错误）

**Step 4: Commit**

```bash
git add lib/useTasks.ts app/api/tasks/route.ts
git commit -m "feat: add idea realm for idea tasks"
```

---

### Task 2: 页面命名/顺序调整 + 独语/灵思切换

**Files:**
- Modify: `components/Sidebar.tsx`
- Modify: `components/IdeaPool.tsx`
- Modify: `components/GoalManager.tsx`

**Step 1: 文案统一**

- `components/Sidebar.tsx`：导航项「灵感池」改为「觉行三境」
- `components/IdeaPool.tsx`：页面标题改为「觉行三境」，副标题显示「独语 · 灵思 · 问程」
- `components/GoalManager.tsx`：标题「目标管理」改为「问程」

**Step 2: 三境分区与顺序**

- `components/IdeaPool.tsx`：对 `status === 'idea'` 的任务按 `ideaRealm` 拆分：
  - 缺省视为 `lingsi`
  - 分区顺序：独语 → 灵思 → 问程

**Step 3: realm 切换动作**

- 灵思条目：按钮将 `ideaRealm` 设为 `duyu`
- 独语条目：按钮将 `ideaRealm` 设为 `lingsi`

**Step 4: 验证**

Run: `npm run build`  
Expected: 退出码 0

**Step 5: Commit**

```bash
git add components/Sidebar.tsx components/IdeaPool.tsx components/GoalManager.tsx
git commit -m "feat: rename idea pool to three realms and support duyu/lingsi"
```

---

### Task 3: 三境标题样式统一 + 说明文案

**Files:**
- Modify: `components/IdeaPool.tsx`
- Modify: `components/GoalManager.tsx`

**Step 1: 分区标题样式对齐**

让「独语」「灵思」标题的字体与左侧图标样式与「问程」一致（`font-serif text-xl ...`，图标同尺寸/同颜色 `#7A8B76`）。

**Step 2: 增加标题说明文案**

- 独语：`内观·明心见性`
- 灵思：`入微·步步为营`
- 问程：`立志·知行合一`

**Step 3: 验证**

Run: `npm run build`  
Expected: 退出码 0

**Step 4: Commit**

```bash
git add components/IdeaPool.tsx components/GoalManager.tsx
git commit -m "style: align realm headings and add descriptions"
```

---

### Task 4: Refactor IdeaPool 去重以满足代码指标

**Files:**
- Modify: `components/IdeaPool.tsx`
- Create: `components/IdeaRealmSection.tsx` (or similar)
- Create: `components/IdeaTaskCard.tsx` (or similar)

**Step 1: 抽出复用渲染**

- 把「独语」「灵思」两段重复的卡片渲染抽到可复用组件（section/header/card）
- 保持行为一致：编辑、保存、取消、删除、移入行囊、realm 切换
- 目标：`components/IdeaPool.tsx` 行数 ≤ 300，且主要函数尽量 ≤ 50 行

**Step 2: 验证**

Run: `npm run build`  
Expected: 退出码 0

**Step 3: Commit**

```bash
git add components/IdeaPool.tsx components/IdeaRealmSection.tsx components/IdeaTaskCard.tsx
git commit -m "refactor: dedupe idea realm rendering"
```

---

### Task 5: 清理无关 diff（锁文件/示例数据）

**Files:**
- Modify (if needed): `package-lock.json`
- Modify (if needed): `data/tasks.json`

**Step 1: 确认 diff 必要性**

- 若 `package-lock.json` 仅为噪声变更（npm 元数据变化），回退到 `HEAD`
- 若 `data/tasks.json` 仅为演示数据变更（例如单条加 `ideaRealm`），回退到 `HEAD`

**Step 2: 验证**

Run: `npm run build`  
Expected: 退出码 0

**Step 3: Commit**

若回退产生变更并需提交，再提交；否则跳过。

