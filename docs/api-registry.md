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
