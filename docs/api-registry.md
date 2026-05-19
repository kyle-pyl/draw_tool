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

### API-0001 ElementType

| 字段 | 内容 |
|---|---|
| 序号 | API-0001 |
| 名称 | ElementType |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 所有元素类型的字符串字面量联合类型，作为元素类型判别式使用 |
| 输入参数 | 无（类型别名） |
| 输出参数 | 'shape' \| 'text' \| 'image' \| 'connector' \| 'chart' \| 'container' \| 'rtlModule' \| 'rtlPort' \| 'mindNode' \| 'topologyNode' |
| 典型用例 | `const el: BaseElement = { type: 'shape' as ElementType, ... }` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0002 ShapeKind

| 字段 | 内容 |
|---|---|
| 序号 | API-0002 |
| 名称 | ShapeKind |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 几何图形种类字面量联合类型 |
| 输入参数 | 无（类型别名） |
| 输出参数 | 'rect' \| 'circle' \| 'ellipse' \| 'polygon' \| 'path' |
| 典型用例 | `shape.shapeKind = 'rect'` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0003 ChartType

| 字段 | 内容 |
|---|---|
| 序号 | API-0003 |
| 名称 | ChartType |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 支持的图表类型字面量联合类型 |
| 输入参数 | 无（类型别名） |
| 输出参数 | 'bar' \| 'line' \| 'scatter' \| 'boxplot' \| 'histogram' \| 'heatmap' |
| 典型用例 | `const chart: ChartElement = { chartType: 'bar', ... }` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0004 RtlPortDirection

| 字段 | 内容 |
|---|---|
| 序号 | API-0004 |
| 名称 | RtlPortDirection |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | RTL 端口信号方向 |
| 输入参数 | 无（类型别名） |
| 输出参数 | 'input' \| 'output' \| 'inout' |
| 典型用例 | `port.direction = 'input'` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0005 TopologyDeviceType

| 字段 | 内容 |
|---|---|
| 序号 | API-0005 |
| 名称 | TopologyDeviceType |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 网络拓扑节点设备类型 |
| 输入参数 | 无（类型别名） |
| 输出参数 | 'router' \| 'switch' \| 'server' \| 'cloud' \| 'firewall' \| 'loadBalancer' \| 'gateway' \| 'custom' |
| 典型用例 | `node.deviceType = 'router'` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0006 ConnectorRouteType

| 字段 | 内容 |
|---|---|
| 序号 | API-0006 |
| 名称 | ConnectorRouteType |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 连接线路由策略类型 |
| 输入参数 | 无（类型别名） |
| 输出参数 | 'straight' \| 'polyline' \| 'orthogonal' \| 'curve' |
| 典型用例 | `route.type = 'orthogonal'` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0007 ArrowStyleKind

| 字段 | 内容 |
|---|---|
| 序号 | API-0007 |
| 名称 | ArrowStyleKind |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 箭头样式类型 |
| 输入参数 | 无（类型别名） |
| 输出参数 | 'none' \| 'triangle' \| 'openTriangle' \| 'diamond' \| 'circle' |
| 典型用例 | `arrow.type = 'triangle'` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0008 ConnectorSemanticKind

| 字段 | 内容 |
|---|---|
| 序号 | API-0008 |
| 名称 | ConnectorSemanticKind |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 连接线语义分类，用于路由和布局提示 |
| 输入参数 | 无（类型别名） |
| 输出参数 | 'flow' \| 'dependency' \| 'rtl-net' \| 'rtl-bus' \| 'network-link' \| 'mind-edge' |
| 典型用例 | `conn.semanticKind = 'rtl-bus'` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0009 CollisionStrategy

| 字段 | 内容 |
|---|---|
| 序号 | API-0009 |
| 名称 | CollisionStrategy |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 碰撞检测策略类型 |
| 输入参数 | 无（类型别名） |
| 输出参数 | 'bbox' \| 'geometry' |
| 典型用例 | `rules.collisionStrategy = 'bbox'` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0010 ExportRegion

| 字段 | 内容 |
|---|---|
| 序号 | API-0010 |
| 名称 | ExportRegion |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 导出区域模式 |
| 输入参数 | 无（类型别名） |
| 输出参数 | 'viewport' \| 'selection' \| 'artboard' \| 'full' |
| 典型用例 | `preset.region = 'viewport'` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0011 ExportFormat

| 字段 | 内容 |
|---|---|
| 序号 | API-0011 |
| 名称 | ExportFormat |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 导出图片格式类型 |
| 输入参数 | 无（类型别名） |
| 输出参数 | 'svg' \| 'png' \| 'jpg' |
| 典型用例 | `preset.format = 'png'` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0012 Transform2D

| 字段 | 内容 |
|---|---|
| 序号 | API-0012 |
| 名称 | Transform2D |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 元素二维仿射变换（位置、尺寸、旋转、缩放） |
| 输入参数 | x: number, y: number, width: number, height: number, rotation: number, scaleX: number, scaleY: number |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const t: Transform2D = { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 }` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0013 ElementStyle

| 字段 | 内容 |
|---|---|
| 序号 | API-0013 |
| 名称 | ElementStyle |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 元素视觉样式属性，包括填充、描边、透明度、字体等 |
| 输入参数 | fill, stroke, strokeWidth, strokeDasharray?, opacity, fillOpacity?, strokeOpacity?, fontSize?, fontFamily?, fontWeight?, fontStyle?, textAlign?, textDecoration? |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const style: ElementStyle = { fill: '#fff', stroke: '#000', strokeWidth: 2, opacity: 1 }` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0014 BBox

| 字段 | 内容 |
|---|---|
| 序号 | API-0014 |
| 名称 | BBox |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 轴对齐包围盒，表示元素在画布坐标中的矩形边界 |
| 输入参数 | x: number, y: number, width: number, height: number |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const bbox: BBox = { x: 10, y: 20, width: 100, height: 50 }` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0015 GeometryShape

| 字段 | 内容 |
|---|---|
| 序号 | API-0015 |
| 名称 | GeometryShape |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 真实几何形状，由多条闭合路径的顶点数组构成，用于高级碰撞检测和布尔运算 |
| 输入参数 | paths: { x: number, y: number }[][] |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const shape: GeometryShape = { paths: [[{x:0,y:0},{x:100,y:0},{x:100,y:100}]]}` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0016 BaseElement

| 字段 | 内容 |
|---|---|
| 序号 | API-0016 |
| 名称 | BaseElement |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 所有场景元素共享的基础接口，包含 id、type、layerId、transform、style、visible、locked 等公共字段 |
| 输入参数 | id: string, type: ElementType, layerId: string, name?: string, transform: Transform2D, style: ElementStyle, visible: boolean, locked: boolean, tags?: string[], metadata?: Record<string, unknown> |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const base: BaseElement = { id: 'e1', type: 'shape', layerId: 'l1', ... }` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0017 ShapeElement

| 字段 | 内容 |
|---|---|
| 序号 | API-0017 |
| 名称 | ShapeElement |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 几何图形元素（矩形、圆、椭圆、多边形、路径），继承 BaseElement |
| 输入参数 | 继承 BaseElement; type: 'shape', shapeKind: ShapeKind, cornerRadius?, points?, pathCommands? |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const s: ShapeElement = { ...base, type: 'shape', shapeKind: 'rect' }` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0018 TextElement

| 字段 | 内容 |
|---|---|
| 序号 | API-0018 |
| 名称 | TextElement |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 文本元素，用于标签、注释、面板标题等，继承 BaseElement |
| 输入参数 | 继承 BaseElement; type: 'text', text: string |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const t: TextElement = { ...base, type: 'text', text: 'Hello' }` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0019 ImageElement

| 字段 | 内容 |
|---|---|
| 序号 | API-0019 |
| 名称 | ImageElement |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 导入的图片元素（PNG、JPG、SVG），src 为 blob/data URL，继承 BaseElement |
| 输入参数 | 继承 BaseElement; type: 'image', src: string, originalWidth: number, originalHeight: number, objectFit? |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const img: ImageElement = { ...base, type: 'image', src: 'blob:...', originalWidth: 800, originalHeight: 600 }` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0020 ConnectorEndpoint

| 字段 | 内容 |
|---|---|
| 序号 | API-0020 |
| 名称 | ConnectorEndpoint |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 连接线端点，可绑定元素锚点或为自由浮动点 |
| 输入参数 | elementId?: string, anchorId?: string, x: number, y: number |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const ep: ConnectorEndpoint = { elementId: 'e1', anchorId: 'right', x: 100, y: 50 }` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0021 ConnectorRoute

| 字段 | 内容 |
|---|---|
| 序号 | API-0021 |
| 名称 | ConnectorRoute |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 连接线路由定义，包含路由策略和途径点 |
| 输入参数 | type: ConnectorRouteType, points: { x: number, y: number }[] |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const route: ConnectorRoute = { type: 'straight', points: [{x:0,y:0}] }` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0022 ConnectorLabel

| 字段 | 内容 |
|---|---|
| 序号 | API-0022 |
| 名称 | ConnectorLabel |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 连接线上的标签，包含文本、位置和偏移量 |
| 输入参数 | text: string, position: number (0-1), offset: { dx: number, dy: number } |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const label: ConnectorLabel = { text: 'data', position: 0.5, offset: { dx: 0, dy: -10 } }` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0023 ArrowStyle

| 字段 | 内容 |
|---|---|
| 序号 | API-0023 |
| 名称 | ArrowStyle |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 连接线箭头样式配置 |
| 输入参数 | type: ArrowStyleKind, size?: number, color?: string |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const arrow: ArrowStyle = { type: 'triangle', size: 1.2 }` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0024 ConnectorElement

| 字段 | 内容 |
|---|---|
| 序号 | API-0024 |
| 名称 | ConnectorElement |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 连接线元素，连接两个端点，支持跨层，豁免同层碰撞检测 |
| 输入参数 | 继承 BaseElement; type: 'connector', source: ConnectorEndpoint, target: ConnectorEndpoint, route: ConnectorRoute, labels?: ConnectorLabel[], arrowStart?: ArrowStyle, arrowEnd?: ArrowStyle, semanticKind?: ConnectorSemanticKind |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const conn: ConnectorElement = { ...base, type: 'connector', source, target, route }` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0025 ChartElement

| 字段 | 内容 |
|---|---|
| 序号 | API-0025 |
| 名称 | ChartElement |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 数据绑定图表元素，从 DataSource 渲染，缓存 SVG 内容 |
| 输入参数 | 继承 BaseElement; type: 'chart', dataSourceId: string, chartType: ChartType, columnMappings: ColumnMappings, options?: Record<string, unknown>, svgContent?: string |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const ch: ChartElement = { ...base, type: 'chart', dataSourceId: 'ds1', chartType: 'bar' }` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0026 ColumnMappings

| 字段 | 内容 |
|---|---|
| 序号 | API-0026 |
| 名称 | ColumnMappings |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 数据列到图表轴/分组/颜色的映射配置 |
| 输入参数 | x?: string, y?: string, group?: string, color?: string |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const mapping: ColumnMappings = { x: 'category', y: 'value' }` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0027 ContainerElement

| 字段 | 内容 |
|---|---|
| 序号 | API-0027 |
| 名称 | ContainerElement |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 容器元素，用于泳道、云区域、子网区域等视觉分组 |
| 输入参数 | 继承 BaseElement; type: 'container', containerLabel?: string |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const c: ContainerElement = { ...base, type: 'container', containerLabel: 'Cloud' }` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0028 RtlPortElement

| 字段 | 内容 |
|---|---|
| 序号 | API-0028 |
| 名称 | RtlPortElement |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | RTL 端口元素，包含信号方向、位宽和端口名 |
| 输入参数 | 继承 BaseElement; type: 'rtlPort', direction: RtlPortDirection, bitWidth: number, portName: string |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const port: RtlPortElement = { ...base, type: 'rtlPort', direction: 'input', bitWidth: 32, portName: 'data_in' }` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0029 RtlModuleElement

| 字段 | 内容 |
|---|---|
| 序号 | API-0029 |
| 名称 | RtlModuleElement |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | RTL 硬件模块元素，包含模块名、实例名、参数、端口列表和折叠状态 |
| 输入参数 | 继承 BaseElement; type: 'rtlModule', moduleName: string, instanceName: string, parameters?: Record, ports?: RtlPortElement[], collapsed?: boolean |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const mod: RtlModuleElement = { ...base, type: 'rtlModule', moduleName: 'register', instanceName: 'r1' }` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0030 MindNodeElement

| 字段 | 内容 |
|---|---|
| 序号 | API-0030 |
| 名称 | MindNodeElement |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 思维导图节点元素，通过 parentId/childrenIds 形成树结构 |
| 输入参数 | 继承 BaseElement; type: 'mindNode', text: string, parentId?: string, childrenIds?: string[], collapsed?: boolean |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const node: MindNodeElement = { ...base, type: 'mindNode', text: 'Topic', childrenIds: ['n2'] }` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0031 TopologyNodeElement

| 字段 | 内容 |
|---|---|
| 序号 | API-0031 |
| 名称 | TopologyNodeElement |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 网络拓扑节点元素，表示一个网络设备 |
| 输入参数 | 继承 BaseElement; type: 'topologyNode', deviceType: TopologyDeviceType, label?: string, properties?: Record |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const node: TopologyNodeElement = { ...base, type: 'topologyNode', deviceType: 'router' }` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0032 SceneElement

| 字段 | 内容 |
|---|---|
| 序号 | API-0032 |
| 名称 | SceneElement |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 所有具体元素类型的联合类型，通过 type 字段判别 |
| 输入参数 | ShapeElement \| TextElement \| ImageElement \| ConnectorElement \| ChartElement \| ContainerElement \| RtlModuleElement \| RtlPortElement \| MindNodeElement \| TopologyNodeElement |
| 输出参数 | 无（联合类型） |
| 典型用例 | `function render(el: SceneElement) { switch(el.type) { ... } }` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0033 Layer

| 字段 | 内容 |
|---|---|
| 序号 | API-0033 |
| 名称 | Layer |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 图层定义，包含 id、名称、顺序、可见性、锁定和默认样式 |
| 输入参数 | id: string, name: string, order: number, visible: boolean, locked: boolean, defaultStyle?: Partial<ElementStyle>, metadata? |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const layer: Layer = { id: 'l1', name: 'Layer 1', order: 1, visible: true, locked: false }` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0034 ElementGroup

| 字段 | 内容 |
|---|---|
| 序号 | API-0034 |
| 名称 | ElementGroup |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 跨层元素分组，支持批量选中、移动和样式编辑 |
| 输入参数 | id: string, name: string, elementIds: string[], metadata? |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const group: ElementGroup = { id: 'g1', name: 'Group A', elementIds: ['e1', 'e2'] }` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0035 ProjectMeta

| 字段 | 内容 |
|---|---|
| 序号 | API-0035 |
| 名称 | ProjectMeta |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 项目元数据，包含名称、作者、时间戳和描述 |
| 输入参数 | name: string, author?: string, createdAt?: string, updatedAt?: string, description?: string |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const meta: ProjectMeta = { name: 'Figure 1', author: 'Alice' }` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0036 CanvasConfig

| 字段 | 内容 |
|---|---|
| 序号 | API-0036 |
| 名称 | CanvasConfig |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 画布和渲染配置，包括单位、背景、字体、网格、吸附和画板尺寸 |
| 输入参数 | units: string, background: string, defaultFont: string, gridSize: number, snapToGrid: boolean, artboard?: { width, height } |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const cfg: CanvasConfig = { units: 'px', background: '#fff', defaultFont: 'Arial' }` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0037 ViewportState

| 字段 | 内容 |
|---|---|
| 序号 | API-0037 |
| 名称 | ViewportState |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 当前视口状态（缩放、平移偏移、最后选中元素） |
| 输入参数 | zoom: number, offsetX: number, offsetY: number, selectedElementId?: string |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const vp: ViewportState = { zoom: 1.5, offsetX: 100, offsetY: 200 }` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0038 SceneRules

| 字段 | 内容 |
|---|---|
| 序号 | API-0038 |
| 名称 | SceneRules |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 场景级规则和约束，包括最大层数、碰撞策略、隐藏/锁定元素行为、连接线豁免 |
| 输入参数 | maxLayerCount: number, collisionStrategy: CollisionStrategy, hiddenElementsCollide: boolean, lockedElementsCollide: boolean, connectorsExempt: boolean |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const rules: SceneRules = { maxLayerCount: 10, collisionStrategy: 'bbox' }` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0039 DataSource

| 字段 | 内容 |
|---|---|
| 序号 | API-0039 |
| 名称 | DataSource |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 外部数据文件引用和解析配置 |
| 输入参数 | id: string, path: string, type: 'csv' \| 'json' \| 'xlsx' \| 'xls', parseConfig?: Record |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const ds: DataSource = { id: 'ds1', path: 'data/table.csv', type: 'csv' }` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0040 ChartDefinition

| 字段 | 内容 |
|---|---|
| 序号 | API-0040 |
| 名称 | ChartDefinition |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 独立图表定义，存储在 scene.charts 中，与 ChartElement 分离以支持同一数据的多个视图 |
| 输入参数 | id: string, dataSourceId: string, chartType: ChartType, columnMappings: ColumnMappings, options? |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const cd: ChartDefinition = { id: 'c1', dataSourceId: 'ds1', chartType: 'bar' }` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0041 TemplateInstance

| 字段 | 内容 |
|---|---|
| 序号 | API-0041 |
| 名称 | TemplateInstance |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 模板实例记录，记录从模板创建的元素的来源和参数 |
| 输入参数 | templateId: string, position: { x, y }, layerId: string, params?: Record, elementIds: string[] |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const ti: TemplateInstance = { templateId: 't1', position: {x:0,y:0}, layerId: 'l1', elementIds: ['e1'] }` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0042 ExportPreset

| 字段 | 内容 |
|---|---|
| 序号 | API-0042 |
| 名称 | ExportPreset |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 预配置的导出设置，存储在场景中 |
| 输入参数 | id: string, name: string, region: ExportRegion, format: ExportFormat, options?: Record |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const ep: ExportPreset = { id: 'e1', name: 'Full SVG', region: 'full', format: 'svg' }` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0043 SceneDocument

| 字段 | 内容 |
|---|---|
| 序号 | API-0043 |
| 名称 | SceneDocument |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 顶层场景文档，对应于 scene.json 的序列化/反序列化对象 |
| 输入参数 | schemaVersion, project, canvas, viewport?, rules, layers, elements, groups, dataSources, charts, templates, exportPresets |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const scene: SceneDocument = { schemaVersion: '1.0.0', ... }` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0044 GeometryAdapter

| 字段 | 内容 |
|---|---|
| 序号 | API-0044 |
| 名称 | GeometryAdapter |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 几何运算适配器接口，提供包围盒计算、真实几何获取和相交测试 |
| 输入参数 | getBBox(element): BBox, getGeometry?(element): GeometryShape, intersects?(a, b): boolean |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const adapter: GeometryAdapter = { getBBox: (el) => ({ x, y, w, h }) }` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0045 AnchorPoint

| 字段 | 内容 |
|---|---|
| 序号 | API-0045 |
| 名称 | AnchorPoint |
| 所属系统 | core |
| 所属模块 | types |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 元素连接锚点，用于连接线端点绑定 |
| 输入参数 | id: string, position: { x: number, y: number }, direction: number (radians) |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const anchor: AnchorPoint = { id: 'top', position: {x:0.5,y:0}, direction: -PI/2 }` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0046 ErrorCode

| 字段 | 内容 |
|---|---|
| 序号 | API-0046 |
| 名称 | ErrorCode |
| 所属系统 | core |
| 所属模块 | errors |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 稳定错误码枚举，覆盖 schema 校验、引用完整性、几何规则和业务规则四类校验场景 |
| 输入参数 | 无（枚举类型） |
| 输出参数 | SCHEMA_MISSING_ID, SCHEMA_INVALID_TYPE, SCHEMA_FIELD_TYPE_ERROR, REF_LAYER_NOT_FOUND, REF_GROUP_NOT_FOUND, REF_CONNECTOR_ENDPOINT_NOT_FOUND, GEO_SAME_LAYER_OVERLAP, GEO_MOVE_TARGET_CONFLICT, RULE_MAX_LAYER_EXCEEDED, RULE_LOCKED_ELEMENT_EDITED, RULE_HIDDEN_OVERLAP |
| 典型用例 | `const code = ErrorCode.GEO_SAME_LAYER_OVERLAP` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0047 ValidationSeverity

| 字段 | 内容 |
|---|---|
| 序号 | API-0047 |
| 名称 | ValidationSeverity |
| 所属系统 | core |
| 所属模块 | errors |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 校验错误严重性级别类型 |
| 输入参数 | 无（类型别名） |
| 输出参数 | 'error' | 'warning' |
| 典型用例 | `const sev: ValidationSeverity = 'error'` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0048 ValidationError

| 字段 | 内容 |
|---|---|
| 序号 | API-0048 |
| 名称 | ValidationError |
| 所属系统 | core |
| 所属模块 | errors |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 单个校验错误结构，包含错误码、消息、严重性、受影响图层/元素 ID、冲突包围盒和修复建议 |
| 输入参数 | code: string, message: string, severity: ValidationSeverity, layerIds?: string[], elementIds?: string[], bboxes?: BBox[], suggestion?: string |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const err: ValidationError = { code: 'SCHEMA_MISSING_ID', message: 'Missing id', severity: 'error' }` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0049 ValidationResult

| 字段 | 内容 |
|---|---|
| 序号 | API-0049 |
| 名称 | ValidationResult |
| 所属系统 | core |
| 所属模块 | errors |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 校验结果接口，包含 valid 布尔值和 errors 数组，作为所有校验函数的统一返回类型 |
| 输入参数 | valid: boolean, errors: ValidationError[] |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const result = validateScene(data); if (!result.valid) { showErrors(result.errors); }` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0050 successResult / failureResult

| 字段 | 内容 |
|---|---|
| 序号 | API-0050 |
| 名称 | successResult / failureResult |
| 所属系统 | core |
| 所属模块 | errors |
| 状态 | 活跃 |
| 创建日期 | 2026-05-18 |
| 最后修订日期 | 2026-05-18 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 创建 ValidationResult 的辅助函数：successResult() 返回 valid: true、failureResult(...errors) 返回 valid: false 并携带错误列表 |
| 输入参数 | successResult(): 无；failureResult(...errors: ValidationError[]): 一个或多个 ValidationError |
| 输出参数 | ValidationResult |
| 典型用例 | `return successResult()` / `return failureResult({ code: 'SCHEMA_INVALID_TYPE', message: '...', severity: 'error' })` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0051 validateScene

| 字段 | 内容 |
|---|---|
| 序号 | API-0051 |
| 名称 | validateScene |
| 所属系统 | core |
| 所属模块 | validator |
| 状态 | 活跃 |
| 创建日期 | 2026-05-19 |
| 最后修订日期 | 2026-05-19 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 对 unknown 对象执行完整校验：结构校验（schemaVersion、project、canvas、rules、layers、elements、groups）和引用完整性校验（element.layerId 引用存在性、group.elementIds 引用存在性、connector source/target 端点引用存在性） |
| 输入参数 | data: unknown - 待校验的对象 |
| 输出参数 | ValidationResult - valid 为 true 且 errors 为空表示通过；valid 为 false 且 errors 为非空表示校验失败 |
| 典型用例 | `const result = validateScene(json); if (result.valid) { loadScene(json as SceneDocument); } else { showErrors(result.errors); }` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建；2026-05-19, OpenCode/deepseek-v4-pro, T-01-04 增加引用完整性校验 |

### API-0052 validateAndCast

| 字段 | 内容 |
|---|---|
| 序号 | API-0052 |
| 名称 | validateAndCast |
| 所属系统 | core |
| 所属模块 | validator |
| 状态 | 活跃 |
| 创建日期 | 2026-05-19 |
| 最后修订日期 | 2026-05-19 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 便捷封装：先执行 validateScene，若通过则直接将 data 转为 SceneDocument 返回；若失败则返回 ValidationResult |
| 输入参数 | data: unknown - 待校验的对象 |
| 输出参数 | SceneDocument | ValidationResult - 校验通过返回类型缩窄后的文档，失败返回校验结果 |
| 典型用例 | `const doc = validateAndCast(json); if ('valid' in doc) { handleErrors(doc); } else { render(doc); }` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0053 validateReferences

| 字段 | 内容 |
|---|---|
| 序号 | API-0053 |
| 名称 | validateReferences |
| 所属系统 | core |
| 所属模块 | validator |
| 状态 | 活跃 |
| 创建日期 | 2026-05-19 |
| 最后修订日期 | 2026-05-19 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 内部校验函数，对已通过结构校验的数据执行引用完整性检查：每个 element 的 layerId 是否存在、每个 group 的 elementIds 是否存在、每个 connector 的 source/target elementId（若存在）是否有效。返回 REF_LAYER_NOT_FOUND、REF_GROUP_NOT_FOUND、REF_CONNECTOR_ENDPOINT_NOT_FOUND 等错误 |
| 输入参数 | data: Record<string, unknown> - 已通过结构校验的 scene 对象 |
| 输出参数 | ValidationError[] - 引用完整性错误列表，无错误时为空数组 |
| 典型用例 | `validateScene` 内部调用 `allErrors.push(...validateReferences(obj))` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建（T-01-04）|

### API-0054 generateId

| 字段 | 内容 |
|---|---|
| 序号 | API-0054 |
| 名称 | generateId |
| 所属系统 | core |
| 所属模块 | utils |
| 状态 | 活跃 |
| 创建日期 | 2026-05-19 |
| 最后修订日期 | 2026-05-19 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 使用 crypto.getRandomValues 生成唯一标识符字符串（含 Math.random 回退保证跨环境兼容）。支持可选前缀用于按类型命名 ID。 |
| 输入参数 | prefix?: string - 可选前缀，以 `_` 与随机部分分隔。无前缀或空字符串时返回纯 12 字符 nanoid |
| 输出参数 | string - 格式为 `{prefix}_{12随机字符}` 或纯 12 随机字符（URL 安全字符集 A-Za-z0-9_-） |
| 典型用例 | `const id = generateId('shape') // → "shape_aB3dEfGhIjKl"` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建（T-01-06）|

### API-0055 ViewportConfig

| 字段 | 内容 |
|---|---|
| 序号 | API-0055 |
| 名称 | ViewportConfig |
| 所属系统 | canvas |
| 所属模块 | viewport |
| 状态 | 活跃 |
| 创建日期 | 2026-05-19 |
| 最后修订日期 | 2026-05-19 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | Viewport 类的配置接口，定义缩放范围、步长和初始状态参数 |
| 输入参数 | minZoom: number, maxZoom: number, zoomStep: number, initialZoom: number, initialOffsetX: number, initialOffsetY: number |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const vp = new Viewport({ minZoom: 0.1, maxZoom: 10, zoomStep: 1.2 })` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建（T-02-01）|

### API-0057 CanvasView

| 字段 | 内容 |
|---|--|
| 序号 | API-0057 |
| 名称 | CanvasView |
| 所属系统 | canvas |
| 所属模块 | CanvasView |
| 状态 | 活跃 |
| 创建日期 | 2026-05-19 |
| 最后修订日期 | 2026-05-19 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | React SVG 画布渲染组件。接收 SceneDocument 和 Viewport 作为 props，按图层 order 升序渲染所有元素到 SVG。支持渲染 shape（rect、circle、ellipse、polygon、path）、text（含对齐和样式）、image（img 引用）、connector（polyline 占位）。支持滚轮缩放（以鼠标位置为中心）、空格+拖拽平移、中键拖拽平移交互，光标样式自动切换（default/grab/grabbing），通过 onViewportChange 回调通知父组件重渲染。支持元素单选（点击）、多选（Shift+点击）、空白区域取消选中、锁定元素不可选中，通过 selectionManager prop 管理选择状态。选中元素在屏幕空间渲染蓝色包围盒和 8 个控制柄。支持框选（marquee selection）：在空白区域拖拽绘制半透明蓝色矩形框，释放时选中完全包含在选区内的所有可见未锁定元素，Shift+框选追加到现有选中，小拖拽（<4px）视为点击清空选中。 |
| 输入参数 | props: { scene: SceneDocument, viewport: Viewport, width?: number | string, height?: number | string, className?: string, onViewportChange?: () => void, selectionManager?: SelectionManager, onSelectionChange?: () => void } |
| 输出参数 | ReactElement - SVG 元素，包含按图层组织的 `<g>` 元素树、框选矩形和选择覆盖层 |
| 典型用例 | `<CanvasView scene={scene} viewport={viewport} selectionManager={selectionMgr} onViewportChange={update} onSelectionChange={update} />` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建（T-02-02）；2026-05-19, OpenCode/deepseek-v4-pro, T-02-03 新增 onViewportChange prop、滚轮缩放、空格/中键拖拽平移和光标样式切换；2026-05-19, OpenCode/deepseek-v4-pro, T-02-04 新增 selectionManager/onSelectionChange props、元素点击选择和多选交互、选择覆盖层渲染；2026-05-19, OpenCode/deepseek-v4-pro, T-02-05 新增框选（marquee selection）功能：空白区域拖拽选区、Shift+框选追加、视口变换适配、锁定/隐藏元素过滤 |

### API-0058 SelectionManager

| 字段 | 内容 |
|---|---|
| 序号 | API-0058 |
| 名称 | SelectionManager |
| 所属系统 | canvas |
| 所属模块 | selection |
| 状态 | 活跃 |
| 创建日期 | 2026-05-19 |
| 最后修订日期 | 2026-05-19 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 选择管理器类，维护当前选中元素的 ID 集合。提供单选（select，清空其他选择）、切换选择（toggleSelect，用于 Shift+点击多选）、清空选择（clearSelection）、全选可见未锁定元素（selectAll）、批量选择（selectByIds/addToSelection/removeFromSelection）、选中状态查询（isSelected）、选中元素获取（getSelectedElements）和选中计数（count）等功能 |
| 输入参数 | constructor() - 无参数，初始状态为空 |
| 输出参数 | select(id): void; toggleSelect(id): void; clearSelection(): void; selectAll(scene): void; selectByIds(ids): void; addToSelection(ids): void; removeFromSelection(ids): void; isSelected(id): boolean; getSelectedElements(scene): SceneElement[]; count: number; selectedIds: ReadonlySet<string> |
| 典型用例 | `const sm = new SelectionManager(); sm.select('e1'); sm.toggleSelect('e2'); const els = sm.getSelectedElements(scene);` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建（T-02-04）|

### API-0059 DocumentStore

| 字段 | 内容 |
|---|---|
| 序号 | API-0059 |
| 名称 | DocumentStore |
| 所属系统 | core |
| 所属模块 | store |
| 状态 | 活跃 |
| 创建日期 | 2026-05-19 |
| 最后修订日期 | 2026-05-19 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | Zustand Document Store 的状态类型接口。管理当前 scene、视口（zoom/offsetX/offsetY）、选择集（selectedIds）、脏标志（isDirty）、目录句柄（directoryHandle），并提供 loadScene、updateScene、getScene、markClean、setViewport、setSelectedIds、setDirectoryHandle 等方法 |
| 输入参数 | 无（接口类型，由 Zustand store 实现） |
| 输出参数 | scene: SceneDocument \| null; zoom: number; offsetX: number; offsetY: number; selectedIds: string[]; isDirty: boolean; directoryHandle: FileSystemDirectoryHandle \| null; loadScene(scene): void; updateScene(updater): void; getScene(): SceneDocument \| null; markClean(): void; setViewport(zoom, offsetX, offsetY): void; setSelectedIds(ids): void; setDirectoryHandle(handle): void |
| 典型用例 | `const store = useDocumentStore.getState(); store.loadScene(scene);` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建（T-03-01）；2026-05-19, OpenCode/deepseek-v4-pro, T-03-03 新增 directoryHandle 和 setDirectoryHandle |

### API-0060 useDocumentStore

| 字段 | 内容 |
|---|---|
| 序号 | API-0060 |
| 名称 | useDocumentStore |
| 所属系统 | core |
| 所属模块 | store |
| 状态 | 活跃 |
| 创建日期 | 2026-05-19 |
| 最后修订日期 | 2026-05-19 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | Zustand React Hook，提供对 DocumentStore 的响应式访问。组件通过此 hook 订阅 store 状态变化，自动重渲染。可解构 scene、isDirty、selectedIds 等字段或调用 loadScene、updateScene 等操作方法 |
| 输入参数 | 无（直接作为 hook 调用） |
| 输出参数 | DocumentStore 的全部字段和方法 |
| 典型用例 | `const { scene, isDirty, loadScene } = useDocumentStore();` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建（T-03-01）|

### API-0061 loadSceneFromFile

| 字段 | 内容 |
|---|---|
| 序号 | API-0061 |
| 名称 | loadSceneFromFile |
| 所属系统 | io |
| 所属模块 | importers |
| 状态 | 活跃 |
| 创建日期 | 2026-05-19 |
| 最后修订日期 | 2026-05-19 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 打开浏览器原生文件选择器，让用户选取 .json 文件，自动解析、校验并加载为 SceneDocument。优先使用 File System Access API（showOpenFilePicker），不可用时回退到隐藏 `<input type="file">` 元素。校验通过后自动调用 store.loadScene 加载，返回 ValidationResult 供 UI 展示结果 |
| 输入参数 | 无 |
| 输出参数 | Promise\<ValidationResult\> - valid 为 true 且场景已加载到 store；valid 为 false 时 errors 包含 PARSE_ERROR（JSON 语法错误）、SCHEMA_*（校验失败）、USER_CANCELLED（用户取消）等错误信息 |
| 典型用例 | `const result = await loadSceneFromFile(); if (result.valid) { /* scene loaded */ } else { showErrors(result.errors); }` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建（T-03-02）|

### API-0062 loadSceneFromFileObject

| 字段 | 内容 |
|---|---|
| 序号 | API-0062 |
| 名称 | loadSceneFromFileObject |
| 所属系统 | io |
| 所属模块 | importers |
| 状态 | 活跃 |
| 创建日期 | 2026-05-19 |
| 最后修订日期 | 2026-05-19 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 接收 File 对象，读取文本内容，解析 JSON，校验后加载到 Document Store。可作为 loadSceneFromFile 的内部实现复用，也可直接用于拖放导入等场景 |
| 输入参数 | file: File - 用户选取的 JSON 文件对象 |
| 输出参数 | Promise\<ValidationResult\> - valid 为 true 时场景已加载到 store，isDirty 重置为 false |
| 典型用例 | `const result = await loadSceneFromFileObject(file); if (result.valid) { startEditing(); }` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建（T-03-02）|

### API-0063 loadProjectFromDirectory

| 字段 | 内容 |
|---|---|
| 序号 | API-0063 |
| 名称 | loadProjectFromDirectory |
| 所属系统 | io |
| 所属模块 | importers |
| 状态 | 活跃 |
| 创建日期 | 2026-05-19 |
| 最后修订日期 | 2026-05-19 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 使用 File System Access API (showDirectoryPicker) 打开项目目录，读取 scene.json 校验加载。扫描 data/ 子目录，将 CSV/JSON/XLSX/XLS 文件自动添加为 DataSource 条目。扫描 assets/ 子目录，为图片文件创建 blob URL 并解析 ImageElement 的 src 引用。保存目录句柄到 store。若浏览器不支持 showDirectoryPicker 则返回 FEATURE_NOT_SUPPORTED 错误并提示使用 ZIP 导入 |
| 输入参数 | 无 |
| 输出参数 | Promise\<ValidationResult\> - 含 FEATURE_NOT_SUPPORTED、USER_CANCELLED、IO_ERROR、PARSE_ERROR、SCHEMA_* 等错误码 |
| 典型用例 | `const result = await loadProjectFromDirectory(); if (result.valid) { startEditing(); }` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建（T-03-03）|

### API-0064 importProjectFromZip

| 字段 | 内容 |
|---|---|
| 序号 | API-0064 |
| 名称 | importProjectFromZip |
| 所属系统 | io |
| 所属模块 | importers |
| 状态 | 活跃 |
| 创建日期 | 2026-05-19 |
| 最后修订日期 | 2026-05-19 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 从 ZIP 文件导入项目：使用 fflate 解压，提取 scene.json 并校验加载，扫描 data/ 中的文件添加为 DataSource 条目，扫描 assets/ 中的图片文件创建 blob URL 并解析 ImageElement 的 src 引用。作为浏览器不支持 File System Access API 时的后备导入方案 |
| 输入参数 | file: File - ZIP 文件对象 |
| 输出参数 | Promise\<ValidationResult\> - valid 为 true 时场景已加载到 store 且 directoryHandle 置空；valid 为 false 时 errors 包含 IO_ERROR（缺少 scene.json 或解压失败）、PARSE_ERROR（JSON 语法错误）、SCHEMA_*（校验失败）等 |
| 典型用例 | `const result = await importProjectFromZip(zipFile); if (result.valid) { startEditing(); }` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建（T-03-04）|

### API-0066 saveProject

| 字段 | 内容 |
|---|---|
| 序号 | API-0066 |
| 名称 | saveProject |
| 所属系统 | io |
| 所属模块 | exporters |
| 状态 | 活跃 |
| 创建日期 | 2026-05-19 |
| 最后修订日期 | 2026-05-19 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 保存当前项目。若存在 File System Access API 目录句柄（通过 loadProjectFromDirectory 打开的项目），则直接写入 scene.json 到目录根；否则调用 exportProjectToZip 导出 ZIP 并触发浏览器下载。保存前自动执行 validateScene 校验，校验失败则阻止保存并返回 ValidationResult。保存成功后调用 store.markClean() 重置 isDirty 标志 |
| 输入参数 | 无 |
| 输出参数 | Promise\<ValidationResult\> - valid 为 true 表示保存成功且 isDirty 已重置；valid 为 false 时 errors 包含 IO_ERROR（无场景/写入失败）或 SCHEMA_*（校验失败）等错误码 |
| 典型用例 | `const result = await saveProject(); if (result.valid) { /* saved */ } else { showErrors(result.errors); }` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建（T-03-05）|

### API-0065 exportProjectToZip

| 字段 | 内容 |
|---|---|
| 序号 | API-0065 |
| 名称 | exportProjectToZip |
| 所属系统 | io |
| 所属模块 | exporters |
| 状态 | 活跃 |
| 创建日期 | 2026-05-19 |
| 最后修订日期 | 2026-05-19 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 将当前加载的项目导出为 ZIP 归档：序列化当前 scene 为 scene.json，将 ImageElement 的 blob URL 还原为原始资源路径并嵌入对应的图片数据，若有目录句柄则一并导出 data/ 文件。导出结果可被 importProjectFromZip 重新导入 |
| 输入参数 | 无 |
| 输出参数 | Promise\<Blob\> - MIME 类型为 application/zip 的 ZIP 压缩包，可直接触发浏览器下载 |
| 典型用例 | `const blob = await exportProjectToZip(); const url = URL.createObjectURL(blob);` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建（T-03-04）|
