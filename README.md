# Draw Tool

Agent 友好的论文与技术图表绘制工具。纯 Web 应用，本地优先，支持离线使用。

## 当前状态

| 项目 | 状态 |
|---|---|---|
| 阶段 | 阶段 9：数据图表 |
| 版本 | 0.9.0 |
| 可用功能 | 核心类型已定义（scene.json 结构、元素模型、图层、连接线、图表等），错误码和校验结果类型已定义，scene.json Schema 结构校验器已实现（含引用完整性校验和几何规则校验），示例项目 examples/basic/ 已创建并通过校验，ID 生成工具已实现（generateId），视口变换管理器（Viewport）已实现，SVG 画布渲染组件已实现（CanvasView），Document Store 已实现（useDocumentStore），JSON/ZIP 项目文件加载已实现，File System Access API 项目目录打开已实现，项目保存功能已实现，BBox 计算器已实现，同层碰撞检测已实现，图层冲突校验器已实现，冲突高亮已实现（ConflictHighlighter + ConflictPanel），命令系统框架已实现（CommandExecutor），CreateElement/MoveElements/UpdateElement/ChangeLayer/TransformElements/DeleteElement 命令已实现，图形绘制工具已实现（ShapeToolbar），文本工具已实现（TextEditor），图片导入工具已实现（SVG 安全清洗），属性面板已实现（PropertyPanel），分组命令已实现（Group/Ungroup/AddToGroup/RemoveFromGroup），对齐命令已实现（AlignElementsCommand：7 种对齐方式），分布命令已实现（DistributeElementsCommand：水平/垂直/环形），按层批量编辑命令已实现（BatchLayerEditCommand），多图层移动命令已实现（MoveLayersCommand），锚点系统已实现（getAnchors/resolveAnchor），连接线创建/渲染/箭头/标签已支持，正交路由已实现（computeOrthogonalRoute），连接线端点校验已实现，模板系统框架已实现（TemplateDefinition/TemplateElementDef/TemplateConnectorDef + 注册/查找/分类/实例化 API），基础几何模板已实现（registerGeometricTemplates：9 种），流程图模板已实现（registerFlowchartTemplates：7 种，含 是/否 锚点判断节点），架构图模板已实现（registerArchitectureTemplates：8 种，含 服务/数据库/缓存/消息队列/API网关/负载均衡/云区域/浏览器客户端），RTL 模块模板已实现（registerRtlTemplates：9 种，含 通用模块/寄存器/MUX/ALU/FSM/存储器/流水线级/控制器/数据通路，端口自动按方向分布），模板面板 UI 已实现（TemplatePanel：分类浏览、搜索过滤、SVG 缩略图预览、点击插入），CSV 解析器已实现（parseCSV：集成 PapaParse，自动类型推断 number/string/date/boolean，缺失值识别 N/A NA null 空串） |
| 构建状态 | 可安装、可启动、可构建、可运行测试（1026 个测试通过） |

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
| 任务清单 | 完整有序的开发任务列表 | docs/task-list.md | 2026-05-20 | T-08-06 |
| 任务日志 | 每个任务的完成记录 | docs/task-log.md | 2026-05-20 | T-08-06 |
| 接口/函数文档 | 项目所有公开接口的注册表 | docs/api-registry.md | 2026-05-20 | T-08-06 |
| 缺陷记录表 | 开发过程中的缺陷跟踪 | docs/defect-log.md | 2026-05-18 | T-00-01 |
| 文档维护指南 | 文档体系说明和维护规则 | docs/documentation-guide.md | 2026-05-18 | T-00-01 |
