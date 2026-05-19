# Draw Tool

Agent 友好的论文与技术图表绘制工具。纯 Web 应用，本地优先，支持离线使用。

## 当前状态

| 项目 | 状态 |
|---|---|
| 阶段 | 阶段 2：SVG 无限画布 |
| 版本 | 0.2.0 |
| 可用功能 | 核心类型已定义（scene.json 结构、元素模型、图层、连接线、图表等），错误码和校验结果类型已定义，scene.json Schema 结构校验器已实现（含引用完整性校验），示例项目 examples/basic/ 已创建并通过校验，ID 生成工具已实现（generateId），视口变换管理器（Viewport）已实现，SVG 画布渲染组件已实现（CanvasView：支持 shape、text、image、connector 渲染） |
| 构建状态 | 可安装、可启动、可构建、可运行测试 |

## 功能目标

支持以下图表类型的快速生成、编辑、校验和导出：

- 论文统计图（柱状图、折线图、散点图、箱线图、直方图、热图）
- 流程图
- 架构图
- 示意图
- RTL（Register Transfer Level）模块连接图
- 思维导图
- 网络拓扑图

## 技术栈

| 类别 | 选择 |
|---|---|
| 语言 | TypeScript |
| 构建 | Vite |
| UI | React + Zustand |
| 画布 | 自研 SVG 编辑器 |
| 测试 | Vitest + Playwright |

## 快速开始

```bash
npm install
npm run dev      # 开发服务器
npm run build    # 构建生产版本
npm test         # 运行单元测试
```

## 项目结构

```text
src/
  core/       # 核心模型：scene schema、元素、图层、命令、校验器
  canvas/     # SVG 无限画布：渲染、视口、选择、控制柄
  ui/         # UI 组件：面板、工具栏、菜单、快捷键
  io/         # 导入导出：JSON、CSV、Excel、ZIP、SVG、PNG
  modules/    # 专用图模块：流程图、架构图、RTL、思维导图、拓扑图、图表
  tests/      # 测试：unit、integration、e2e
docs/         # 项目文档
examples/     # 示例项目
```

## 文档索引

| 文档名称 | 功能 | 路径 | 最近修订日期 | 修订来源任务 |
|---|---|---|---|---|
| 顶层设计文档 | 产品目标、架构、数据模型、实现路线 | docs/top-level-design.md | 2026-05-18 | 初始创建 |
| 任务清单 | 完整有序的开发任务列表 | docs/task-list.md | 2026-05-19 | T-02-02 |
| 任务日志 | 每个任务的完成记录 | docs/task-log.md | 2026-05-19 | T-02-02 |
| 接口/函数文档 | 项目所有公开接口的注册表 | docs/api-registry.md | 2026-05-19 | T-02-02 |
| 缺陷记录表 | 开发过程中的缺陷跟踪 | docs/defect-log.md | 2026-05-18 | T-00-01 |
| 文档维护指南 | 文档体系说明和维护规则 | docs/documentation-guide.md | 2026-05-18 | T-00-01 |
