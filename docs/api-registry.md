# 项目统一接口/函数文档

本文件记录项目中所有公开接口和函数。每次任务新增或修改接口时，必须同步更新本文件。

## 维护规则

1. 每个接口/函数拥有唯一序号，格式 API-XXXX，递增分配。
2. 新增接口在文件末尾追加，不得插入已有记录之间。
3. 修改已有接口时，更新"最后修订日期"和"最后修订者"字段，并在"修订历史"中追加说明。
4. 删除接口时标记状态为"已废弃"，不得物理删除记录。
5. 接口记录应与实际代码保持一致，每次任务的回归测试应包含检查。

## 记录格式

每条记录应包含以下字段：

| 字段 | 说明 |
|---|---|
| 序号 | API-XXXX |
| 名称 | 函数或接口名称 |
| 所属系统 | core / canvas / ui / io / modules |
| 所属模块 | 具体子模块名称 |
| 状态 | 活跃 / 已废弃 |
| 创建日期 | YYYY-MM-DD |
| 最后修订日期 | YYYY-MM-DD |
| 创建者 | 人或 Agent 标识 |
| 最后修订者 | 人或 Agent 标识 |
| 功能描述 | 一段话描述该接口的职责 |
| 输入参数 | 参数名、类型、描述、约束 |
| 输出参数 | 返回值类型、描述、约束 |
| 典型用例 | 调用示例代码或场景描述 |
| 修订历史 | 日期、修订者、修订内容摘要 |

## 接口记录

### API-0001 ～ API-0038 Core Types (src/core/types.ts)

| 字段 | 内容 |
|---|---|
| 序号 | API-0001 ～ API-0038 |
| 名称 | 核心 TypeScript 类型集合 |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 定义所有场景文档、元素、图层、连接线、数据源、图表、模板、导出预设等核心类型，与顶层设计文档第 10-13 章一致 |
| 输入参数 | 无（纯类型定义） |
| 输出参数 | 从 src/core/index.ts 桶导出以下类型：ElementType, ShapeKind, ChartType, RtlPortDirection, TopologyDeviceType, ConnectorRouteType, ArrowStyleKind, ConnectorSemanticKind, CollisionStrategy, ExportRegion, ExportFormat, Transform2D, ElementStyle, BBox, GeometryShape, BaseElement, ShapeElement, TextElement, ImageElement, ConnectorEndpoint, ConnectorRoute, ConnectorLabel, ArrowStyle, ConnectorElement, ChartElement, ColumnMappings, ContainerElement, RtlPortElement, RtlModuleElement, MindNodeElement, TopologyNodeElement, SceneElement, Layer, ElementGroup, ProjectMeta, CanvasConfig, ViewportState, SceneRules, DataSource, ChartDefinition, TemplateInstance, ExportPreset, SceneDocument, GeometryAdapter, AnchorPoint |
| 典型用例 | 其他模块引用这些类型定义场景数据结构、元素模型和配置对象 |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 38 个类型/接口 |
