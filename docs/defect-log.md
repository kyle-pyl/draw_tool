# 缺陷记录表

本文件记录项目开发过程中发现的所有缺陷。缺陷在测试、代码审查或用户反馈中发现时追加。

## 维护规则

1. 每个缺陷拥有唯一编号，格式 DEF-XXXX，递增分配。
2. 新增缺陷在文件末尾追加。
3. 缺陷修复后更新"当前状态"和"修复时间"字段，不得删除缺陷记录。
4. 缺陷等级划分：致命 > 严重 > 一般 > 轻微 > 建议。

## 记录格式

每条缺陷记录应包含以下字段：

| 字段 | 说明 |
|---|---|
| 缺陷编号 | DEF-XXXX |
| 缺陷等级 | 致命 / 严重 / 一般 / 轻微 / 建议 |
| 缺陷标题 | 简短描述 |
| 缺陷描述 | 详细说明缺陷表现 |
| 所属系统 | core / canvas / ui / io / modules |
| 所属模块 | 具体子模块名称 |
| 所属任务 | 发现缺陷时正在执行的任务编号 |
| 关联功能点 | 受影响的功能点描述 |
| 复现方式 | 复现步骤或触发条件 |
| 期望行为 | 正确的预期行为 |
| 实际行为 | 观察到的错误行为 |
| 当前状态 | 新建 / 已确认 / 修复中 / 已修复 / 已验证 / 已关闭 / 延期 / 不修复 |
| 发现者 | 人或 Agent 标识 |
| 修复者 | 人或 Agent 标识 |
| 记录时间 | YYYY-MM-DD HH:mm |
| 修复时间 | YYYY-MM-DD HH:mm |
| 修复方式 | 修复方案简述 |
| 关联 Commit | 修复对应的 git commit hash |
| 回归验证 | 验证通过的测试用例或手工验证说明 |

## 缺陷记录

### DEF-0001 App.tsx 重复 import 语句

| 字段 | 内容 |
|---|---|
| 缺陷编号 | DEF-0001 |
| 缺陷等级 | 一般 |
| 缺陷标题 | App.tsx 第 1-2 行重复 import react |
| 缺陷描述 | 文件开头两行完全相同的 `import { useMemo, useState, useCallback, useEffect, useRef } from 'react';` |
| 所属系统 | ui |
| 所属模块 | App |
| 所属任务 | T-05-07 |
| 关联功能点 | 应用入口，所有组件 |
| 复现方式 | 打开 src/App.tsx 即可看到 |
| 期望行为 | 只保留一行 import |
| 实际行为 | 存在两行重复的 import |
| 当前状态 | 已修复 |
| 发现者 | OpenCode/deepseek-v4-pro |
| 修复者 | OpenCode/deepseek-v4-pro |
| 记录时间 | 2026-05-21 21:25 |
| 修复时间 | 2026-05-21 21:30 |
| 修复方式 | 删除重复的 import 行 |
| 关联 Commit | 84bc7d6 |
| 回归验证 | 编译通过，运行正常 |

### DEF-0002 Windows PowerShell 下 Lite 包构建失败

| 字段 | 内容 |
|---|---|
| 缺陷编号 | DEF-0002 |
| 缺陷等级 | 严重 |
| 缺陷标题 | Windows PowerShell 下 `npm run build:lite` 失败 |
| 缺陷描述 | package.json 中 build:lite 脚本使用 Unix 语法 `VITE_BUNDLE=lite vite build`，Windows PowerShell 无法识别该环境变量设置语法 |
| 所属系统 | core |
| 所属模块 | build |
| 所属任务 | T-12-08 |
| 关联功能点 | Lite/Full 双包构建 |
| 复现方式 | 在 Windows PowerShell 下执行 `npm run build:lite` |
| 期望行为 | Lite 包成功构建到 dist/lite |
| 实际行为 | 报错 `'VITE_BUNDLE' is not recognized as an internal or external command` |
| 当前状态 | 已修复 |
| 发现者 | OpenCode/deepseek-v4-pro |
| 修复者 | OpenCode/deepseek-v4-pro |
| 记录时间 | 2026-05-21 21:25 |
| 修复时间 | 2026-05-21 21:30 |
| 修复方式 | 安装 cross-env 作为 devDependency，将 build:lite/build:full 脚本改为 `cross-env VITE_BUNDLE=lite vite build` |
| 关联 Commit | 84bc7d6 |
| 回归验证 | `npm run build:lite` 成功构建到 dist/lite，`npm run build:full` 成功构建到 dist/full |

### DEF-0003 polygon-clipping ESM 导出警告

| 字段 | 内容 |
|---|---|
| 缺陷编号 | DEF-0003 |
| 缺陷等级 | 轻微 |
| 缺陷标题 | polygon-clipping 库 ESM 命名导出警告 |
| 缺陷描述 | vite build 时 polygon-clipping 的 `union`、`intersection`、`xor`、`difference` 函数在 ESM 模块中被报告为 "is not exported"，但运行时（CJS fallback）正常工作 |
| 所属系统 | core |
| 所属模块 | geometry, boolean-ops |
| 所属任务 | T-11-01, T-11-03 |
| 关联功能点 | 布尔运算、真实几何碰撞检测 |
| 复现方式 | 执行 `npm run build` 查看构建日志 |
| 期望行为 | 无警告的干净构建 |
| 实际行为 | 构建输出中包含 6 条 ESM 导出警告 |
| 当前状态 | 已修复 |
| 发现者 | OpenCode/deepseek-v4-pro |
| 修复者 | OpenCode/deepseek-v4-pro |
| 记录时间 | 2026-05-21 21:25 |
| 修复时间 | 2026-05-21 22:15 |
| 修复方式 | 将 `import * as pc from 'polygon-clipping'` 改为 `import pc from 'polygon-clipping'`（default import）。polygon-clipping 的 ESM 文件仅提供 default export，default import 匹配其实际导出结构，消除 Rollup 警告 |
| 关联 Commit | 84bc7d6 |
| 回归验证 | `npm run build:full` 构建无警告，tests 全部通过 |

### DEF-0004 API-0209 编号缺失

| 字段 | 内容 |
|---|---|
| 缺陷编号 | DEF-0004 |
| 缺陷等级 | 轻微 |
| 缺陷标题 | api-registry.md 中 API-0208 后直接跳到 API-0210 |
| 缺陷描述 | 接口文档编号序列 API-0201~API-0208 (T-10-05 拓扑布局) 后缺少 API-0209，直接到 API-0210 (T-11-01 布尔运算) |
| 所属系统 | docs |
| 所属模块 | api-registry |
| 所属任务 | T-11-01 |
| 关联功能点 | 接口文档完整性 |
| 复现方式 | 查看 docs/api-registry.md 编号序列 |
| 期望行为 | 编号连续无跳号 |
| 实际行为 | 跳过了 API-0209 |
| 当前状态 | 已修复 |
| 发现者 | OpenCode/deepseek-v4-pro |
| 修复者 | OpenCode/deepseek-v4-pro |
| 记录时间 | 2026-05-21 21:25 |
| 修复时间 | 2026-05-21 21:30 |
| 修复方式 | 在 API-0208 和 API-0210 之间添加注释标记该编号有意空缺 |
| 关联 Commit | 84bc7d6 |
| 回归验证 | 文档编号序列已标注 |

### DEF-0005 commands.ts 文件过大

| 字段 | 内容 |
|---|---|
| 缺陷编号 | DEF-0005 |
| 缺陷等级 | 建议 |
| 缺陷标题 | commands.ts 文件 3513 行，包含所有命令类 |
| 缺陷描述 | src/core/commands.ts 单一文件包含 17 个命令类及辅助函数，总长 3513 行。影响代码可读性和可维护性 |
| 所属系统 | core |
| 所属模块 | commands |
| 所属任务 | T-05-01 ~ T-11-02 |
| 关联功能点 | 所有命令的实现 |
| 复现方式 | 查看 src/core/commands.ts 文件大小 |
| 期望行为 | 按命令类型拆分到独立文件 |
| 实际行为 | 所有命令集中在一个文件 |
| 当前状态 | 已修复 |
| 发现者 | OpenCode/deepseek-v4-pro |
| 修复者 | OpenCode/deepseek-v4-pro |
| 记录时间 | 2026-05-21 21:25 |
| 修复时间 | 2026-05-21 22:15 |
| 修复方式 | 拆分 commands.ts 为 6 个模块：`commands/base.ts`（268 行，共享接口/CommandExecutor/辅助函数）、`commands/element.ts`（782 行，元素级命令）、`commands/group.ts`（229 行，分组命令）、`commands/layout.ts`（1178 行，对齐/分布/批量/布局命令）、`commands/geometry.ts`（626 行，布尔运算/裁剪/图表转矢量命令）、`commands/index.ts`（barrel 重导出）。原始 commands.ts 改为单行重导出 |
| 关联 Commit | 84bc7d6 |
| 回归验证 | `npx tsc --noEmit` 无错误，1632 tests 全部通过，build 成功 |

### DEF-0006 Ruler 组件 jsdom 测试中 Canvas getContext 不可用

| 字段 | 内容 |
|---|---|
| 缺陷编号 | DEF-0006 |
| 缺陷等级 | 轻微 |
| 缺陷标题 | Ruler 组件测试中 HTMLCanvasElement.getContext 未在 jsdom 中实现 |
| 缺陷描述 | Ruler 组件使用 Canvas 2D 渲染，但 jsdom 不支持 Canvas API，导致 Ruler 相关测试输出 "Not implemented" 错误（测试本身仍标记为通过） |
| 所属系统 | ui |
| 所属模块 | Ruler |
| 所属任务 | T-12-07 |
| 关联功能点 | 标尺渲染、单元测试 |
| 复现方式 | 运行 Ruler 相关测试观察控制台错误输出 |
| 期望行为 | 无控制台错误 |
| 实际行为 | 7 条 `Error: Not implemented: HTMLCanvasElement.prototype.getContext` 错误 |
| 当前状态 | 已修复 |
| 发现者 | OpenCode/deepseek-v4-pro |
| 修复者 | OpenCode/deepseek-v4-pro |
| 记录时间 | 2026-05-21 21:25 |
| 修复时间 | 2026-05-21 22:15 |
| 修复方式 | 在 `src/tests/unit/setup.ts` 中为 `HTMLCanvasElement.prototype.getContext` 添加 mock，返回包含 scale/fillRect/strokeRect/beginPath/moveTo/lineTo/stroke/fillText/save/restore/translate/rotate 等 no-op 方法的 Canvas 2D 上下文对象 |
| 关联 Commit | 84bc7d6 |
| 回归验证 | Ruler 测试 9/9 通过，无 "Not implemented" 控制台错误
