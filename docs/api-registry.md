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
| 输入参数 | 继承 BaseElement; type: 'text', text: string, backgroundColor?: string, borderColor?: string, borderWidth?: number |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const t: TextElement = { ...base, type: 'text', text: 'Hello', backgroundColor: '#ffff00', borderColor: '#000', borderWidth: 1 }` |
| 修订历史 | 2026-05-18, OpenCode/deepseek-v4-pro, 初始创建；2026-05-20, OpenCode/deepseek-v4-pro, T-05-08 新增 backgroundColor/borderColor/borderWidth 字段以支持文本框底色和边框 |

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
| 功能描述 | 对 unknown 对象执行完整校验：结构校验（schemaVersion、project、canvas、rules、layers、elements、groups）、引用完整性校验（element.layerId 引用存在性、group.elementIds 引用存在性、connector source/target 端点引用存在性）和几何规则校验（图层内元素 BBox 碰撞检测、最大图层数限制） |
| 输入参数 | data: unknown - 待校验的对象 |
| 输出参数 | ValidationResult - valid 为 true 且 errors 为空表示通过；valid 为 false 且 errors 为非空表示校验失败 |
| 典型用例 | `const result = validateScene(json); if (result.valid) { loadScene(json as SceneDocument); } else { showErrors(result.errors); }` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建；2026-05-19, OpenCode/deepseek-v4-pro, T-01-04 增加引用完整性校验；2026-05-19, OpenCode/deepseek-v4-pro, T-04-03 增加几何规则校验（图层冲突检测） |

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

### API-0056 Viewport

| 字段 | 内容 |
|---|---|
| 序号 | API-0056 |
| 名称 | Viewport |
| 所属系统 | canvas |
| 所属模块 | viewport |
| 状态 | 活跃 |
| 创建日期 | 2026-05-19 |
| 最后修订日期 | 2026-05-19 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 视口变换管理类。维护当前缩放比例和平移偏移量，提供屏幕坐标与画布坐标双向转换（screenToCanvas/canvasToScreen），支持缩放（zoomTo/zoomIn/zoomOut）、平移（pan）、适配区域（fitToRect）、重置（reset），返回 SVG transform 矩阵字符串（getTransformMatrix）。缩放范围可配置（默认 0.1 到 10）
| 输入参数 | constructor(config?: Partial<ViewportConfig>) - 可选配置 { minZoom, maxZoom, zoomStep, initialZoom, initialOffsetX, initialOffsetY }
| 输出参数 | screenToCanvas(sx, sy): { x, y }; canvasToScreen(cx, cy): { x, y }; pan(dx, dy): void; zoomTo(zoom, cx, cy): void; zoomIn(): void; zoomOut(): void; fitToRect(bbox): void; reset(): void; getTransformMatrix(): string; zoom: number; offsetX: number; offsetY: number
| 典型用例 | const vp = new Viewport(); const canvasPt = vp.screenToCanvas(mouseX, mouseY); vp.zoomIn();
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
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | React SVG 画布渲染组件。接收 SceneDocument 和 Viewport 作为 props，按图层 order 升序渲染所有元素到 SVG。支持渲染 shape（rect、circle、ellipse、polygon、path）、text（含文本样式、背景色、边框渲染）、image（img 引用）、connector（直线/折线/orthogonal 路由渲染）。支持滚轮缩放（以鼠标位置为中心）、空格+拖拽平移、中键拖拽平移交互，光标样式自动切换。支持元素单选（点击）、多选（Shift+点击）、空白区域取消选中、锁定元素不可选中、框选（marquee selection）。支持绘制工具（rect/circle/ellipse/line/polygon/text/connector），connector 工具默认使用 orthogonal 路由并计算路径点，支持弯折点渲染和拖拽调整（onConnectorRouteChange 回调）。text 工具点击即创建文本无需拖拽。支持文本元素双击编辑（onTextEditRequest 回调） |
| 输入参数 | props: { scene: SceneDocument, viewport: Viewport, width?: number | string, height?: number | string, className?: string, onViewportChange?: () => void, selectionManager?: SelectionManager, onSelectionChange?: () => void, conflictHighlighter?: ConflictHighlighter, activeTool?: DrawingToolType, drawingLayerId?: string, onDrawComplete?: (input: ElementInput) => void, onTextEditRequest?: (elementId: string) => void, onConnectorRouteChange?: (connectorId: string, routePoints: { x: number; y: number }[]) => void } |
| 输出参数 | ReactElement - SVG 元素，包含按图层组织的 `<g>` 元素树、框选矩形和选择覆盖层 |
| 典型用例 | `<CanvasView scene={scene} viewport={viewport} selectionManager={selectionMgr} onViewportChange={update} onSelectionChange={update} />` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建（T-02-02）；2026-05-19, OpenCode/deepseek-v4-pro, T-02-03 新增 onViewportChange prop、滚轮缩放、空格/中键拖拽平移和光标样式切换；2026-05-19, OpenCode/deepseek-v4-pro, T-02-04 新增 selectionManager/onSelectionChange props、元素点击选择和多选交互、选择覆盖层渲染；2026-05-19, OpenCode/deepseek-v4-pro, T-02-05 新增框选（marquee selection）功能：空白区域拖拽选区、Shift+框选追加、视口变换适配、锁定/隐藏元素过滤；2026-05-19, OpenCode/deepseek-v4-pro, T-04-04 隐藏图层改为 visibility:hidden（保留 DOM 空间）、锁定图层（layer.locked）元素不响应点击和框选交互、marquee 框选排除锁定图层内元素；2026-05-20, OpenCode/deepseek-v4-pro, T-05-07 新增 activeTool/drawingLayerId/onDrawComplete props、拖拽绘制（rect/circle/ellipse/line）、多边形逐点绘制、实时预览渲染、crosshair 光标；2026-05-20, OpenCode/deepseek-v4-pro, T-05-08 新增 onTextEditRequest prop（文本双击编辑）、text 工具（点击创建文本）、renderTextElement 支持背景色/边框渲染；2026-05-20, OpenCode/deepseek-v4-pro, T-07-02 新增 connector 工具（锚点高亮交互、拖拽锚点创建连接线、直线/折线路由渲染、实时预览线）、connector 渲染从 polyline 改为根据 route.type 选择 line 或 polyline；2026-05-20, OpenCode/deepseek-v4-pro, T-07-03 新增箭头和标签渲染；2026-05-20, OpenCode/deepseek-v4-pro, T-07-04 新增 orthogonal 路由支持、弯折点渲染和拖拽交互、onConnectorRouteChange 回调 |

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
| 功能描述 | 选择管理器类，维护当前选中元素的 ID 集合。提供单选（select，清空其他选择）、切换选择（toggleSelect，用于 Shift+点击多选）、清空选择（clearSelection）、全选可见未锁定元素（selectAll）、批量选择（selectByIds/addToSelection/removeFromSelection）、分组选择（selectGroup 按 ElementGroup 选中全部成员、selectGroupByName 按组名选中、getGroupsForSelected 获取当前选中元素所属的组）、选中状态查询（isSelected）、选中元素获取（getSelectedElements）和选中计数（count）等功能 |
| 输入参数 | constructor() - 无参数，初始状态为空 |
| 输出参数 | select(id): void; toggleSelect(id): void; clearSelection(): void; selectAll(scene): void; selectByIds(ids): void; addToSelection(ids): void; removeFromSelection(ids): void; selectGroup(group: ElementGroup): void; selectGroupByName(scene: SceneDocument, groupName: string): boolean; getGroupsForSelected(scene: SceneDocument): ElementGroup[]; isSelected(id): boolean; getSelectedElements(scene): SceneElement[]; count: number; selectedIds: ReadonlySet<string> |
| 典型用例 | `const sm = new SelectionManager(); sm.select('e1'); sm.toggleSelect('e2'); const els = sm.getSelectedElements(scene); sm.selectGroup(group);` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建（T-02-04）；2026-05-20, OpenCode/deepseek-v4-pro, T-06-01 新增 selectGroup/selectGroupByName/getGroupsForSelected 方法 |

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

### API-0067 getBBox

| 字段 | 内容 |
|---|---|
| 序号 | API-0067 |
| 名称 | getBBox |
| 所属系统 | core |
| 所属模块 | geometry |
| 状态 | 活跃 |
| 创建日期 | 2026-05-19 |
| 最后修订日期 | 2026-05-19 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 计算任意场景元素的轴对齐包围盒（BBox）。根据元素类型分别处理：shape 使用几何属性（rect 用 transform 边界、circle/ellipse 用内接矩形、polygon 用点集边界、path 用 transform 边界），text 根据字符数和字体大小估算尺寸（取与 transform 维度的最大值），image 用 transform 尺寸或原始图片尺寸，connector 计算所有端点和路径点的边界，其他类型使用 transform 边界。旋转通过计算旋转后四个角点的 AABB 处理。circle 跳过旋转（旋转对称） |
| 输入参数 | element: SceneElement - 需计算包围盒的场景元素 |
| 输出参数 | BBox - 轴对齐包围盒 { x: number, y: number, width: number, height: number } |
| 典型用例 | `const bbox = getBBox(someShapeElement); if (bbox.x < 0) { /* out of bounds */ }` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建（T-04-01）|

### API-0068 createGeometryAdapter

| 字段 | 内容 |
|---|---|
| 序号 | API-0068 |
| 名称 | createGeometryAdapter |
| 所属系统 | core |
| 所属模块 | geometry |
| 状态 | 活跃 |
| 创建日期 | 2026-05-19 |
| 最后修订日期 | 2026-05-19 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 创建 GeometryAdapter 实例的工厂函数。返回的适配器对象包含完整实现的 getBBox 方法，getGeometry 和 intersects 方法预留为 undefined 供未来高级碰撞检测实现 |
| 输入参数 | 无 |
| 输出参数 | GeometryAdapter - 包含 getBBox（已实现）、getGeometry（undefined 占位）、intersects（undefined 占位）的适配器对象 |
| 典型用例 | `const adapter = createGeometryAdapter(); const bbox = adapter.getBBox(element);` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建（T-04-01）|

### API-0069 checkLayerCollisions

| 字段 | 内容 |
|---|---|
| 序号 | API-0069 |
| 名称 | checkLayerCollisions |
| 所属系统 | core |
| 所属模块 | collision |
| 状态 | 活跃 |
| 创建日期 | 2026-05-19 |
| 最后修订日期 | 2026-05-19 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 检查指定元素数组中是否存在同层元素包围盒相交的碰撞。自动排除 connector 类型元素（连接线豁免）。隐藏元素和锁定元素默认参与检测，可通过 CollisionCheckOptions 跳过。第一版使用线性扫描（O(n^2)），预留 GeometryAdapter 参数接口供未来空间索引加速替换 |
| 输入参数 | elements: SceneElement[] - 待检测的图层元素数组；geometryAdapter: GeometryAdapter - 几何适配器（用于获取元素 BBox）；options?: CollisionCheckOptions - 可选配置 { skipHidden?: boolean（跳过隐藏元素，默认 false），skipLocked?: boolean（跳过锁定元素，默认 false）} |
| 输出参数 | CollisionResult - { hasCollision: boolean, collisions: CollisionEntry[] }，其中 CollisionEntry = { elementA: string, elementB: string, overlapBBox: BBox } |
| 典型用例 | `const result = checkLayerCollisions(layerElements, geometryAdapter); if (result.hasCollision) { result.collisions.forEach(c => console.log(c.elementA, c.elementB)); }` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建（T-04-02）|

### API-0070 CollisionEntry

| 字段 | 内容 |
|---|---|
| 序号 | API-0070 |
| 名称 | CollisionEntry |
| 所属系统 | core |
| 所属模块 | collision |
| 状态 | 活跃 |
| 创建日期 | 2026-05-19 |
| 最后修订日期 | 2026-05-19 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 单次碰撞记录，包含两个重叠元素的 ID 和交集包围盒 |
| 输入参数 | elementA: string, elementB: string, overlapBBox: BBox |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const entry: CollisionEntry = { elementA: 'e1', elementB: 'e2', overlapBBox: { x: 10, y: 10, width: 20, height: 20 } }` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建（T-04-02）|

### API-0071 CollisionResult

| 字段 | 内容 |
|---|---|
| 序号 | API-0071 |
| 名称 | CollisionResult |
| 所属系统 | core |
| 所属模块 | collision |
| 状态 | 活跃 |
| 创建日期 | 2026-05-19 |
| 最后修订日期 | 2026-05-19 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 碰撞检测结果接口，包含是否有碰撞的标志和碰撞记录数组 |
| 输入参数 | hasCollision: boolean, collisions: CollisionEntry[] |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const result: CollisionResult = checkLayerCollisions(elements, adapter);` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建（T-04-02）|

### API-0072 CollisionCheckOptions

| 字段 | 内容 |
|---|---|
| 序号 | API-0072 |
| 名称 | CollisionCheckOptions |
| 所属系统 | core |
| 所属模块 | collision |
| 状态 | 活跃 |
| 创建日期 | 2026-05-19 |
| 最后修订日期 | 2026-05-19 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 碰撞检测的过滤选项，控制是否跳过隐藏或锁定元素的检测 |
| 输入参数 | skipHidden?: boolean（跳过隐藏元素，默认 false 参与检测），skipLocked?: boolean（跳过锁定元素，默认 false 参与检测） |
| 输出参数 | 无（接口类型） |
| 典型用例 | `checkLayerCollisions(elements, adapter, { skipHidden: true })` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建（T-04-02）|

### API-0073 validateGeometryRules

| 字段 | 内容 |
|---|---|
| 序号 | API-0073 |
| 名称 | validateGeometryRules |
| 所属系统 | core |
| 所属模块 | validator |
| 状态 | 活跃 |
| 创建日期 | 2026-05-19 |
| 最后修订日期 | 2026-05-19 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 内部校验函数，对已通过结构和引用校验的数据执行几何规则检查：图层数不超过 rules.maxLayerCount（返回 RULE_MAX_LAYER_EXCEEDED）、每层内部非连接线元素的包围盒碰撞检测（返回 GEO_SAME_LAYER_OVERLAP）。碰撞检测使用 checkLayerCollisions，按 SceneRules 的 hiddenElementsCollide 和 lockedElementsCollide 配置决定是否跳过隐藏/锁定元素 |
| 输入参数 | data: Record<string, unknown> - 已通过结构和引用校验的 scene 对象 |
| 输出参数 | ValidationError[] - 几何规则错误列表，无错误时为空数组 |
| 典型用例 | `validateScene` 内部调用 `allErrors.push(...validateGeometryRules(obj))` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建（T-04-03）|

### API-0074 ConflictHighlighter

| 字段 | 内容 |
|---|---|
| 序号 | API-0074 |
| 名称 | ConflictHighlighter |
| 所属系统 | canvas |
| 所属模块 | conflict |
| 状态 | 活跃 |
| 创建日期 | 2026-05-19 |
| 最后修订日期 | 2026-05-19 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 冲突高亮管理器类。接收碰撞检测结果（CollisionEntry[]）和场景数据（elements、layers），生成包含图层名、元素名、重叠区域和建议文本的 ConflictInfo 列表。提供 hasConflicts 标志、conflictingLayerIds/conflictingElementIds 集合查询、subscribe 监听机制用于 React 组件订阅更新。clearCollisions 清空所有冲突状态。用于在画布冲突叠层（红色虚线包围盒）和冲突面板中驱动 UI |
| 输入参数 | constructor() - 无参数，初始无冲突 |
| 输出参数 | hasConflicts: boolean; conflictingLayerIds: ReadonlySet\<string\>; conflictingElementIds: ReadonlySet\<string\>; getConflicts(): readonly ConflictInfo[]; setCollisions(collisions: CollisionEntry[], elements: SceneElement[], layers: Layer[]): void; clearCollisions(): void; subscribe(listener: () => void): () => void |
| 典型用例 | `const hl = new ConflictHighlighter(); hl.setCollisions(result.collisions, scene.elements, scene.layers); if (hl.hasConflicts) { showPanel(hl.getConflicts()); }` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建（T-04-05）|

### API-0075 ConflictInfo
| 字段 | 内容 |
|---|---|
| 序号 | API-0075 |
| 名称 | ConflictInfo |
| 所属系统 | canvas |
| 所属模块 | conflict |
| 状态 | 活跃 |
| 创建日期 | 2026-05-19 |
| 最后修订日期 | 2026-05-19 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 单条冲突信息接口，包含冲突 ID（由冲突元素 ID 拼接）、所在图层 ID 和名称、冲突双方的元素 ID 和名称、重叠包围盒、修复建议文本。由 ConflictHighlighter.setCollisions 生成，供 ConflictPanel 渲染和画布冲突叠层查询使用 |
| 输入参数 | id: string, layerId: string, layerName: string, elementAId: string, elementAName: string, elementBId: string, elementBName: string, overlapBBox: BBox, suggestion: string |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const info: ConflictInfo = { id: 'e1-e2', layerId: 'l1', layerName: 'Layer 1', elementAId: 'e1', elementAName: 'RectA', elementBId: 'e2', elementBName: 'RectB', overlapBBox: { x: 50, y: 50, width: 50, height: 50 }, suggestion: 'Move "RectA" or "RectB" to avoid overlap.' }` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建（T-04-05）|

### API-0076 ConflictPanel

| 字段 | 内容 |
|---|---|
| 序号 | API-0076 |
| 名称 | ConflictPanel |
| 所属系统 | ui |
| 所属模块 | ConflictPanel |
| 状态 | 活跃 |
| 创建日期 | 2026-05-19 |
| 最后修订日期 | 2026-05-19 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 冲突面板 React 组件。接收 ConflictHighlighter 实例，通过 subscribe 监听冲突变化。当存在冲突时在右下角显示浮动面板，红底白字标题显示冲突数量，列表中每条冲突显示图层名标签、冲突双方元素名、箭头连接符和修复建议。提供关闭按钮临时隐藏面板，新冲突触发时自动重新显示。冲突清除后面板自动消失 |
| 输入参数 | props: { conflictHighlighter: ConflictHighlighter } |
| 输出参数 | ReactElement（条件渲染：有冲突且未关闭时显示，否则返回 null） |
| 典型用例 | `<ConflictPanel conflictHighlighter={conflictHighlighter} />` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建（T-04-05）|

### API-0077 ConflictPanelProps

| 字段 | 内容 |
|---|---|
| 序号 | API-0077 |
| 名称 | ConflictPanelProps |
| 所属系统 | ui |
| 所属模块 | ConflictPanel |
| 状态 | 活跃 |
| 创建日期 | 2026-05-19 |
| 最后修订日期 | 2026-05-19 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | ConflictPanel 组件的 Props 类型接口，包含一个 ConflictHighlighter 实例引用 |
| 输入参数 | conflictHighlighter: ConflictHighlighter |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const props: ConflictPanelProps = { conflictHighlighter: highlighter }` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建（T-04-05）|

### API-0078 SceneCommand
| 字段 | 内容 |
|---|---|
| 序号 | API-0078 |
| 名称 | SceneCommand |
| 所属系统 | core |
| 所属模块 | commands |
| 状态 | 活跃 |
| 创建日期 | 2026-05-19 |
| 最后修订日期 | 2026-05-19 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 所有编辑命令的基础接口。定义命令的 id、label、validate（预执行校验，返回非 valid 结果时阻止执行）、execute（纯函数式应用命令到场景，返回新场景）和 invert（生成反向命令用于重做支持，返回 null 表示不可逆）。所有具体命令（CreateElement、MoveElements、UpdateElement、ChangeLayer、TransformElements 等）均实现此接口并通过 CommandExecutor 执行 |
| 输入参数 | id: string（唯一标识）, label: string（历史记录显示名称）, validate: (scene: SceneDocument) => ValidationResult, execute: (scene: SceneDocument) => SceneDocument, invert: (scene: SceneDocument) => SceneCommand | null |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const cmd: SceneCommand = { id: 'move-1', label: 'Move Elements', validate: (s) => successResult(), execute: (s) => applyMove(s), invert: (s) => reverseMove(s) }` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建（T-05-01）|

### API-0079 CommandHistoryEntry

| 字段 | 内容 |
|---|---|
| 序号 | API-0079 |
| 名称 | CommandHistoryEntry |
| 所属系统 | core |
| 所属模块 | commands |
| 状态 | 活跃 |
| 创建日期 | 2026-05-19 |
| 最后修订日期 | 2026-05-19 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 命令历史记录条目。包含执行的 SceneCommand 和执行前的完整场景快照（SceneDocument）。快照用于 undo 时回滚到命令执行前的状态 |
| 输入参数 | command: SceneCommand, snapshot: SceneDocument |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const entry: CommandHistoryEntry = { command: cmd, snapshot: preExecScene }` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建（T-05-01）|

### API-0080 CommandExecutor

| 字段 | 内容 |
|---|---|
| 序号 | API-0080 |
| 名称 | CommandExecutor |
| 所属系统 | core |
| 所属模块 | commands |
| 状态 | 活跃 |
| 创建日期 | 2026-05-19 |
| 最后修订日期 | 2026-05-19 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 命令执行器类，管理命令执行、撤销和重做的完整生命周期。execute 先调用命令的 validate 进行预校验，失败返回 ValidationResult 不改变状态；成功时拍摄执行前快照，通过 store.updateScene 应用命令，压入历史栈（超出 maxHistory 时移除最早记录），清空重做栈。undo 弹出历史栈顶、恢复快照、压入重做栈。redo 弹出重做栈顶、拍新快照、重新执行命令。提供 canUndo/canRedo 状态查询和 getHistory 只读历史访问 |
| 输入参数 | constructor(maxHistory?: number) - 历史最大条数（默认 100） |
| 输出参数 | execute(command: SceneCommand): ValidationResult; undo(): boolean; redo(): boolean; canUndo(): boolean; canRedo(): boolean; getHistory(): readonly CommandHistoryEntry[] |
| 典型用例 | `const executor = new CommandExecutor(50); const result = executor.execute(createCmd); if (result.valid) { /* done */ } else { showErrors(result.errors); }` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建（T-05-01）|

### API-0081 ElementInput

| 字段 | 内容 |
|---|---|
| 序号 | API-0081 |
| 名称 | ElementInput |
| 所属系统 | core |
| 所属模块 | commands |
| 状态 | 活跃 |
| 创建日期 | 2026-05-19 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 元素创建输入接口，是 CreateElementCommand 构造函数的参数类型。包含创建任意元素类型所需的平面字段。T-09-03 新增 chart 类型专用字段：dataSourceId、chartType、columnMappings、options、svgContent。 |
| 输入参数 | type: ElementType（必需）、layerId: string（必需）、transform: Transform2D（必需）、style: ElementStyle（必需）、name?: string、visible?: boolean、locked?: boolean、tags?: string[]、metadata?: Record<string,unknown>、shapeKind?、cornerRadius?、points?、pathCommands?、text?、src?、originalWidth?、originalHeight?、objectFit?、source?、target?、route?、arrowStart?、arrowEnd?、labels?、dataSourceId?: string、chartType?: ChartType、columnMappings?: ColumnMappings、options?: Record<string,unknown>、svgContent?: string |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const input: ElementInput = { type: 'shape', layerId: 'l1', shapeKind: 'rect', transform: { x: 0, y: 0, width: 100, height: 50, rotation: 0, scaleX: 1, scaleY: 1 }, style: { fill: '#fff', stroke: '#000', strokeWidth: 2, opacity: 1 } }` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建（T-05-02）；2026-05-20, OpenCode/deepseek-v4-pro, T-05-06 新增 metadata 字段以支持自定义锚点（通过 metadata.anchors）；2026-05-20, OpenCode/deepseek-v4-pro, T-05-07 新增 cornerRadius 字段以支持圆角矩形绘制；2026-05-20, OpenCode/deepseek-v4-pro, T-05-09 新增 objectFit 字段以支持图片填充模式；2026-05-21, OpenCode/deepseek-v4-pro, T-09-03 新增 chart 专用字段（dataSourceId、chartType、columnMappings、options、svgContent）以支持图表元素创建 |

### API-0082 CreateElementCommand

| 字段 | 内容 |
|---|---|
| 序号 | API-0082 |
| 名称 | CreateElementCommand |
| 所属系统 | core |
| 所属模块 | commands |
| 状态 | 活跃 |
| 创建日期 | 2026-05-19 |
| 最后修订日期 | 2026-05-19 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 在指定图层创建新元素的命令。validate 检查目标图层存在且新元素不与同层其他元素重叠（connector 豁免）。execute 将元素添加到 scene.elements 数组。invert 生成删除元素的逆命令。支持创建 shape、text、image 类型元素。getElementId() 返回自动生成的元素 ID |
| 输入参数 | constructor(input: ElementInput, label?: string) - elementId 由内部 generateId 自动生成 |
| 输出参数 | implements SceneCommand - scenes 可通过 CommandExecutor 执行、撤销和重做；getElementId(): string - 返回自动生成的元素 ID |
| 典型用例 | `const cmd = new CreateElementCommand({ type: 'shape', layerId: 'l1', shapeKind: 'rect', transform, style }); executor.execute(cmd); const newId = cmd.getElementId();` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建（T-05-02）；2026-05-20, OpenCode/deepseek-v4-pro, T-05-08 新增 getElementId 方法 |

### API-0083 MoveElementsCommand

| 字段 | 内容 |
|---|---|
| 序号 | API-0083 |
| 名称 | MoveElementsCommand |
| 所属系统 | core |
| 所属模块 | commands |
| 状态 | 活跃 |
| 创建日期 | 2026-05-19 |
| 最后修订日期 | 2026-05-19 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 移动一个或多个元素平面位置的命令。validate 检查元素存在、未锁定且移动后不与同层其他元素重叠（connector 豁免）。execute 更新元素 transform.x 和 transform.y。连接线端点跟随其锚定元素自动位移。invert 生成反向 delta 的 MoveElements 命令 |
| 输入参数 | constructor(elementIds: string[], delta: { dx: number, dy: number }, label?: string) |
| 输出参数 | implements SceneCommand |
| 典型用例 | `executor.execute(new MoveElementsCommand(['e1', 'e2'], { dx: 50, dy: 30 }));` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建（T-05-03）|

### API-0084 ElementChanges

| 字段 | 内容 |
|---|---|
| 序号 | API-0084 |
| 名称 | ElementChanges |
| 所属系统 | core |
| 所属模块 | commands |
| 状态 | 活跃 |
| 创建日期 | 2026-05-19 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | UpdateElementCommand 的变更参数类型。支持修改元素的 style、transform、visible、locked、name、text、shapeKind 等部分属性。修改 transform（位置/尺寸）时触发碰撞检测。新增图表相关字段：dataSourceId（数据源 ID）、chartType（图表类型）、columnMappings（列映射）、options（样式选项，如 title/showGrid/colorScheme/legendPosition/xAxisLabel/yAxisLabel）、svgContent（渲染后的 SVG 内容） |
| 输入参数 | Partial<{ style, transform, visible, locked, name, text, shapeKind, labels, dataSourceId, chartType, columnMappings, options, svgContent, ... }> |
| 输出参数 | 无（类型别名） |
| 典型用例 | `const changes: ElementChanges = { style: { fill: '#f00' }, visible: false }` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建（T-05-04）
2026-05-21, OpenCode/deepseek-v4-pro, 新增 dataSourceId/chartType/columnMappings/options/svgContent 图表字段；2026-05-20, OpenCode/deepseek-v4-pro, 修订 |

### API-0085 UpdateElementCommand

| 字段 | 内容 |
|---|---|
| 序号 | API-0085 |
| 名称 | UpdateElementCommand |
| 所属系统 | core |
| 所属模块 | commands |
| 状态 | 活跃 |
| 创建日期 | 2026-05-19 |
| 最后修订日期 | 2026-05-19 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 修改元素属性的命令。validate 检查元素存在、未锁定，若修改 transform 则检查碰撞。execute 合并 changes 到目标元素。invert 保存修改前的值并生成反向 UpdateElement 命令。支持 style、transform、visible、locked、name、text、shapeKind 等属性修改 |
| 输入参数 | constructor(elementId: string, changes: ElementChanges, label?: string) |
| 输出参数 | implements SceneCommand |
| 典型用例 | `executor.execute(new UpdateElementCommand('e1', { style: { fill: '#f00' } }));` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建（T-05-04）|

### API-0086 ChangeLayerCommand

| 字段 | 内容 |
|---|---|
| 序号 | API-0086 |
| 名称 | ChangeLayerCommand |
| 所属系统 | core |
| 所属模块 | commands |
| 状态 | 活跃 |
| 创建日期 | 2026-05-19 |
| 最后修订日期 | 2026-05-19 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 将元素移动到另一图层的命令。validate 检查目标图层存在、元素存在且未锁定、移入后不与目标图层现有元素重叠（connector 豁免碰撞检查）。execute 更新 element.layerId。invert 记录原始 layerId 并生成还原命令 |
| 输入参数 | constructor(elementIds: string[], targetLayerId: string, label?: string) |
| 输出参数 | implements SceneCommand |
| 典型用例 | `executor.execute(new ChangeLayerCommand(['e1', 'e2'], 'l2'));` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建（T-05-05）|

### API-0087 TransformParams

| 字段 | 内容 |
|---|---|
| 序号 | API-0087 |
| 名称 | TransformParams |
| 所属系统 | core |
| 所属模块 | commands |
| 状态 | 活跃 |
| 创建日期 | 2026-05-19 |
| 最后修订日期 | 2026-05-19 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | TransformElementsCommand 的变换参数类型。支持缩放（scaleX、scaleY）、旋转（rotation）、尺寸（width、height）和位置（x、y）的变化，所有字段均为可选 |
| 输入参数 | scaleX?, scaleY?, rotation?, width?, height?, x?, y? |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const params: TransformParams = { scaleX: 2, rotation: 45 }` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建（T-05-06）|

### API-0088 TransformElementsCommand

| 字段 | 内容 |
|---|---|
| 序号 | API-0088 |
| 名称 | TransformElementsCommand |
| 所属系统 | core |
| 所属模块 | commands |
| 状态 | 活跃 |
| 创建日期 | 2026-05-19 |
| 最后修订日期 | 2026-05-19 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 缩放和旋转元素的命令。validate 检查元素存在、未锁定且变换后不与同层其他元素重叠（connector 豁免）。execute 将 TransformParams 合并到元素 transform。invert 保存变换前完整 transform 并生成还原命令。支持同时变换多个元素 |
| 输入参数 | constructor(elementIds: string[], params: TransformParams, label?: string) |
| 输出参数 | implements SceneCommand |
| 典型用例 | `executor.execute(new TransformElementsCommand(['e1'], { scaleX: 2, rotation: 45 }));` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建（T-05-06）|

### API-0089 DrawingToolType

| 字段 | 内容 |
|---|---|
| 序号 | API-0089 |
| 名称 | DrawingToolType |
| 所属系统 | canvas |
| 所属模块 | CanvasView |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 画布绘制工具类型字面量联合类型，定义用户可在工具栏中选择的绘制模式 |
| 输入参数 | 无（类型别名） |
| 输出参数 | 'select' \| 'rect' \| 'circle' \| 'ellipse' \| 'line' \| 'polygon' \| 'text' \| 'connector' |
| 典型用例 | `const tool: DrawingToolType = 'rect'` |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建（T-05-07）；2026-05-20, OpenCode/deepseek-v4-pro, T-05-08 新增 'text' 类型；2026-05-20, OpenCode/deepseek-v4-pro, T-07-02 新增 'connector' 类型 |

### API-0090 ShapeToolbar

| 字段 | 内容 |
|---|---|
| 序号 | API-0090 |
| 名称 | ShapeToolbar |
| 所属系统 | ui |
| 所属模块 | ShapeToolbar |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 浮动形状绘制工具栏 React 组件。显示矩形、圆、椭圆、线条、多边形、文本的工具按钮（含 SVG 图标），高亮当前激活工具，点击切换工具。固定排列在画布左侧垂直工具栏中 |
| 输入参数 | props: { activeTool: DrawingToolType, onToolChange: (tool: DrawingToolType) => void } |
| 输出参数 | ReactElement - 包含 7 个工具按钮的浮动 div |
| 典型用例 | `<ShapeToolbar activeTool={activeTool} onToolChange={setActiveTool} />` |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建（T-05-07）；2026-05-20, OpenCode/deepseek-v4-pro, T-05-08 新增 Text 工具按钮 |

### API-0091 ShapeToolbarProps

| 字段 | 内容 |
|---|---|
| 序号 | API-0091 |
| 名称 | ShapeToolbarProps |
| 所属系统 | ui |
| 所属模块 | ShapeToolbar |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | ShapeToolbar 组件的 Props 类型接口，包含当前激活工具和工具变更回调 |
| 输入参数 | activeTool: DrawingToolType, onToolChange: (tool: DrawingToolType) => void |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const props: ShapeToolbarProps = { activeTool: 'rect', onToolChange: handleChange }` |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建（T-05-07）|

### API-0092 drawStateToInput

| 字段 | 内容 |
|---|---|
| 序号 | API-0092 |
| 名称 | drawStateToInput |
| 所属系统 | canvas |
| 所属模块 | CanvasView |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 辅助函数，将画布上的绘制状态（工具类型、起始/当前坐标、多边形顶点）转换为 CreateElementCommand 所需的 ElementInput。支持所有 DrawingToolType（select/rect/circle/ellipse/line/polygon/text）。text 工具创建默认 200x30 的文本框，字体 16px Arial 黑色 |
| 输入参数 | tool: DrawingToolType, state: DrawState, layerId: string |
| 输出参数 | ElementInput - 可直接传入 CreateElementCommand 的元素创建参数 |
| 典型用例 | `const input = drawStateToInput('rect', { x1: 0, y1: 0, x2: 100, y2: 100, points: [] }, 'l1')` |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建（T-05-07）；2026-05-20, OpenCode/deepseek-v4-pro, T-05-08 导出函数 + 新增 text case |

### API-0093 renderDrawPreview

| 字段 | 内容 |
|---|---|
| 序号 | API-0093 |
| 名称 | renderDrawPreview |
| 所属系统 | canvas |
| 所属模块 | CanvasView |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 渲染函数，根据当前绘制状态渲染各形状类型的实时预览轮廓。矩形/圆/椭圆/线条使用虚线描边半透明填充预览，多边形使用顶点圆圈和虚线连线预览，text 工具返回 null（文本工具点击即创建无需拖拽预览） |
| 输入参数 | tool: DrawingToolType, state: DrawState |
| 输出参数 | React.ReactNode - SVG 预览元素组 |
| 典型用例 | 在 CanvasView 内部调用：`renderDrawPreview(activeTool, drawState)` 渲染到 SVG 中 |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建（T-05-07）；2026-05-20, OpenCode/deepseek-v4-pro, T-05-08 导出函数 + 新增 text case |

### API-0094 TextEditor

| 字段 | 内容 |
|---|---|
| 序号 | API-0094 |
| 名称 | TextEditor |
| 所属系统 | ui |
| 所属模块 | TextEditor |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 浮动文本编辑器 React 组件。在最上层渲染覆盖层（z-index 200），包含可编辑 textarea 和样式工具栏。工具栏支持：字体选择（Arial/Helvetica/Times New Roman 等）、字号选择（8-48px）、加粗/斜体切换、文字颜色选择器、背景颜色选择器、边框颜色选择器和边框宽度选择。Enter 保存、Escape 取消、blur 自动保存。通过 onCommit 回调提交文本内容、样式变更和背景/边框变更 |
| 输入参数 | props: { element: TextElement, viewport: Viewport, onCommit: (elementId: string, changes: { text: string; style?: Partial<ElementStyle>; backgroundColor?: string; borderColor?: string; borderWidth?: number }) => void, onCancel: () => void } |
| 输出参数 | ReactElement - 绝对定位的浮动编辑器窗口 |
| 典型用例 | `<TextEditor element={textEl} viewport={vp} onCommit={handleSave} onCancel={handleClose} />` |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建（T-05-08）|

### API-0095 TextEditorProps

| 字段 | 内容 |
|---|---|
| 序号 | API-0095 |
| 名称 | TextEditorProps |
| 所属系统 | ui |
| 所属模块 | TextEditor |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | TextEditor 组件的 Props 类型接口，包含待编辑的 TextElement、Viewport 实例、提交回调和取消回调 |
| 输入参数 | element: TextElement, viewport: Viewport, onCommit: (elementId: string, changes: { text: string, style?: Partial<ElementStyle>, backgroundColor?: string, borderColor?: string, borderWidth?: number }) => void, onCancel: () => void |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const props: TextEditorProps = { element: textEl, viewport: vp, onCommit: handleSave, onCancel: handleCancel }` |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建（T-05-08）|

### API-0096 sanitizeSvg

| 字段 | 内容 |
|---|---|
| 序号 | API-0096 |
| 名称 | sanitizeSvg |
| 所属系统 | io |
| 所属模块 | svg-sanitizer |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | SVG 安全清洗函数。解析 SVG 字符串，移除危险元素（script、foreignObject、use）和事件处理器属性（on*），清除 javascript: 协议链接。清洗后通过 XMLSerializer 序列化返回安全 SVG 字符串。若 SVG 解析失败则抛出错误 |
| 输入参数 | svgText: string - 原始 SVG 文本内容 |
| 输出参数 | string - 清洗后的安全 SVG 字符串 |
| 典型用例 | `const safe = sanitizeSvg(dangerousSvgString); const blob = new Blob([safe], { type: 'image/svg+xml' });` |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建（T-05-09）|

### API-0097 sanitizeSvgToBlob

| 字段 | 内容 |
|---|---|
| 序号 | API-0097 |
| 名称 | sanitizeSvgToBlob |
| 所属系统 | io |
| 所属模块 | svg-sanitizer |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | SVG 安全清洗便捷封装。调用 sanitizeSvg 清洗 SVG 文本后封装为 Blob 对象，MIME 类型为 image/svg+xml，可直接用于创建 blob URL |
| 输入参数 | svgText: string - 原始 SVG 文本内容 |
| 输出参数 | Blob - 清洗后的 SVG Blob，type 为 'image/svg+xml' |
| 典型用例 | `const blob = sanitizeSvgToBlob(svgString); const url = URL.createObjectURL(blob);` |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建（T-05-09）|

### API-0098 isSupportedImageFile

| 字段 | 内容 |
|---|---|
| 序号 | API-0098 |
| 名称 | isSupportedImageFile |
| 所属系统 | io |
| 所属模块 | image-utils |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 检查 File 对象是否为支持的图片格式。通过文件扩展名（png/jpg/jpeg/svg/gif/webp）和 MIME 类型双重判断 |
| 输入参数 | file: File - 浏览器 File 对象 |
| 输出参数 | boolean - 是支持的图片格式返回 true |
| 典型用例 | `if (isSupportedImageFile(file)) { const input = await importImageFromFile(file, layerId); }` |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建（T-05-09）|

### API-0099 importImageFromFile

| 字段 | 内容 |
|---|---|
| 序号 | API-0099 |
| 名称 | importImageFromFile |
| 所属系统 | io |
| 所属模块 | image-utils |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 从浏览器 File 对象导入图片并生成 ElementInput。SVG 文件先执行 sanitizeSvg 安全清洗；所有图片创建 blob URL 存储。自动解析图片原始尺寸（SVG 从 viewBox/width/height 解析，光栅图片通过 Image 元素加载获取）。大图片自动缩放到最大 600px 初始展示尺寸。返回的 ElementInput 可直接传入 CreateElementCommand 创建 ImageElement |
| 输入参数 | file: File - 图片文件对象；layerId: string - 目标图层 ID |
| 输出参数 | Promise<ElementInput> - type 为 'image' 的元素输入，包含 blob src、原始尺寸、变换和样式 |
| 典型用例 | `const input = await importImageFromFile(imageFile, 'l1'); const cmd = new CreateElementCommand(input); executor.execute(cmd);` |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建（T-05-09）|

### API-0100 ImageImportButton

| 字段 | 内容 |
|---|---|
| 序号 | API-0100 |
| 名称 | ImageImportButton |
| 所属系统 | ui |
| 所属模块 | ImageImportButton |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 图片导入按钮 React 组件。渲染一个浮动按钮（带图片图标），点击触发隐藏的 `<input type="file">` 文件选择器。选定文件后调用 importImageFromFile 处理，通过 onImport 回调返回生成的 ElementInput。导入失败时通过 onError 回调报告错误 |
| 输入参数 | props: { layerId: string, onImport: (input: ElementInput) => void, onError?: (message: string) => void } |
| 输出参数 | ReactElement - 包含隐藏文件 input 和可见 SVG 图标按钮 |
| 典型用例 | `<ImageImportButton layerId={drawingLayerId} onImport={handleImageImport} />` |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建（T-05-09）|

### API-0101 ImageImportButtonProps

| 字段 | 内容 |
|---|---|
| 序号 | API-0101 |
| 名称 | ImageImportButtonProps |
| 所属系统 | ui |
| 所属模块 | ImageImportButton |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | ImageImportButton 组件的 Props 类型接口 |
| 输入参数 | layerId: string, onImport: (input: ElementInput) => void, onError?: (message: string) => void |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const props: ImageImportButtonProps = { layerId: 'l1', onImport: handleImport, onError: handleError }` |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建（T-05-09）|

### API-0102 PropertyPanel

| 字段 | 内容 |
|---|---|
| 序号 | API-0102 |
| 名称 | PropertyPanel |
| 所属系统 | ui |
| 所属模块 | PropertyPanel |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 属性面板 React 组件。选中元素时显示可编辑属性，多选显示公共属性。属性分组：位置/尺寸、填充/描边、文本样式（仅文本元素）、连接线样式（仅连接线元素）、图表样式（仅图表元素：标题/X轴标签/Y轴标签、配色方案选择、图例位置、网格线开关）、图层、可见性/锁定。图表样式编辑支持 SVG 重新生成（当提供 parsedDataMap 时）。新增 parsedDataMap 可选 prop 用于传递已解析的 CSV 数据，支持图表选项变更时自动重新渲染 SVG。 |
| 输入参数 | props: { scene, selectionManager, onPropertyChange, onLayerChange, parsedDataMap?: Map<string, ParsedData> } |
| 输出参数 | ReactElement（有选中元素时显示浮动属性面板，无选中元素返回 null，关闭后显示小恢复按钮） |
| 典型用例 | <PropertyPanel scene={scene} selectionManager={selectionMgr} onPropertyChange={handleChange} onLayerChange={handleLayerChange} parsedDataMap={parsedDataMap} /> |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建（T-05-10）
2026-05-21, OpenCode/deepseek-v4-pro, 新增图表样式编辑区、parsedDataMap prop、图表 SVG 重新生成功能 |

### API-0103 PropertyPanelProps

| 字段 | 内容 |
|---|---|
| 序号 | API-0103 |
| 名称 | PropertyPanelProps |
| 所属系统 | ui |
| 所属模块 | PropertyPanel |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | PropertyPanel 组件的 Props 类型接口 |
| 输入参数 | scene: SceneDocument, selectionManager: SelectionManager, onPropertyChange: (elementIds: string[], changes: Record<string, unknown>) => void, onLayerChange: (elementIds: string[], targetLayerId: string) => void |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const props: PropertyPanelProps = { scene, selectionManager, onPropertyChange, onLayerChange }` |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建（T-05-10）|

### API-0104 GroupElementsCommand

| 字段 | 内容 |
|---|---|
| 序号 | API-0104 |
| 名称 | GroupElementsCommand |
| 所属系统 | core |
| 所属模块 | commands |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 创建元素分组命令。接收 elementIds 和 groupName，在 scene.groups 中创建新的 ElementGroup。分组可跨图层。validate 检查所有引用元素存在且 elementIds 非空。execute 将新 ElementGroup 追加到 scene.groups。invert 生成 UngroupCommand 用于撤销。getGroupId() 返回自动生成的组 ID |
| 输入参数 | constructor(elementIds: string[], groupName: string, label?: string) |
| 输出参数 | implements SceneCommand - 可通过 CommandExecutor 执行、撤销和重做；getGroupId(): string - 返回生成的组 ID |
| 典型用例 | `const cmd = new GroupElementsCommand(['e1', 'e2'], 'MyGroup'); executor.execute(cmd); const gid = cmd.getGroupId();` |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建（T-06-01）|

### API-0105 UngroupCommand

| 字段 | 内容 |
|---|---|
| 序号 | API-0105 |
| 名称 | UngroupCommand |
| 所属系统 | core |
| 所属模块 | commands |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 解散分组命令。接收 groupId，从 scene.groups 中移除指定组。元素本身不受影响（保留在 scene.elements 中）。validate 检查组存在。execute 移除组并保存完整组信息。invert 生成 GroupElementsCommand 用于恢复组 |
| 输入参数 | constructor(groupId: string, label?: string) |
| 输出参数 | implements SceneCommand |
| 典型用例 | `executor.execute(new UngroupCommand('g1'));` |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建（T-06-01）|

### API-0106 AddToGroupCommand

| 字段 | 内容 |
|---|---|
| 序号 | API-0106 |
| 名称 | AddToGroupCommand |
| 所属系统 | core |
| 所属模块 | commands |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 追加成员命令。接收 groupId 和 elementIds，将元素追加到已有分组。execute 自动去重（已在组中的元素不重复添加）。validate 检查组存在且所有引用元素存在。invert 生成 RemoveFromGroupCommand 用于撤销 |
| 输入参数 | constructor(groupId: string, elementIds: string[], label?: string) |
| 输出参数 | implements SceneCommand |
| 典型用例 | `executor.execute(new AddToGroupCommand('g1', ['e3', 'e4']));` |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建（T-06-01）|

### API-0107 RemoveFromGroupCommand

| 字段 | 内容 |
|---|---|
| 序号 | API-0107 |
| 名称 | RemoveFromGroupCommand |
| 所属系统 | core |
| 所属模块 | commands |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 从分组中移除成员命令。接收 groupId 和 elementIds，将指定元素从已有分组中移除。元素本身不受影响（保留在 scene.elements 中）。validate 检查组存在且所有引用元素存在。execute 移除指定成员。invert 生成 AddToGroupCommand 用于撤销 |
| 输入参数 | constructor(groupId: string, elementIds: string[], label?: string) |
| 输出参数 | implements SceneCommand |
| 典型用例 | `executor.execute(new RemoveFromGroupCommand('g1', ['e3']));` |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 补充文档 |

### API-0108 AlignType

| 字段 | 内容 |
|---|---|
| 序号 | API-0108 |
| 名称 | AlignType |
| 所属系统 | core |
| 所属模块 | commands |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 对齐类型字面量联合类型。定义七种对齐方式：left（左对齐）、right（右对齐）、top（上对齐）、bottom（下对齐）、centerHorizontal（水平居中）、centerVertical（垂直居中）、center（双向居中） |
| 输入参数 | 无（类型别名） |
| 输出参数 | 'left' \| 'right' \| 'top' \| 'bottom' \| 'centerHorizontal' \| 'centerVertical' \| 'center' |
| 典型用例 | `const align: AlignType = 'left'` |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建（T-06-02）|

### API-0109 AlignElementsCommand

| 字段 | 内容 |
|---|---|
| 序号 | API-0109 |
| 名称 | AlignElementsCommand |
| 所属系统 | core |
| 所属模块 | commands |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 元素对齐命令。接收 elementIds 和 alignType，计算所有选中元素的统一包围盒，按对齐类型移动各元素位置。支持跨图层对齐（元素保持各自所属图层）。validate 检查至少 2 个非 connector 元素存在且未锁定，移动后不与同层非对齐元素重叠。execute 更新元素 transform 位置。连接线端点跟随其锚定元素自动位移。invert 生成逆命令恢复原始位置 |
| 输入参数 | constructor(elementIds: string[], alignType: AlignType, label?: string) |
| 输出参数 | implements SceneCommand - 可通过 CommandExecutor 执行、撤销和重做 |
| 典型用例 | `executor.execute(new AlignElementsCommand(['e1', 'e2', 'e3'], 'centerHorizontal'));` |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建（T-06-02）|

### API-0110 DistributeType

| 字段 | 内容 |
|---|---|
| 序号 | API-0110 |
| 名称 | DistributeType |
| 所属系统 | core |
| 所属模块 | commands |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 分布类型字面量联合类型。定义三种分布方式：horizontal（水平均匀分布）、vertical（垂直均匀分布）、circular（环形等距排列） |
| 输入参数 | 无（类型别名） |
| 输出参数 | 'horizontal' \| 'vertical' \| 'circular' |
| 典型用例 | `const distType: DistributeType = 'horizontal'` |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建（T-06-03）|

### API-0111 CircularDistributeOptions

| 字段 | 内容 |
|---|---|
| 序号 | API-0111 |
| 名称 | CircularDistributeOptions |
| 所属系统 | core |
| 所属模块 | commands |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 环形分布配置接口。定义环形分布所需的圆心坐标和半径参数。centerX/centerY 为圆心在画布中的绝对坐标，radius 为分布圆的半径（必须为正数） |
| 输入参数 | centerX: number - 圆心 X 坐标；centerY: number - 圆心 Y 坐标；radius: number - 分布圆半径 |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const opts: CircularDistributeOptions = { centerX: 200, centerY: 200, radius: 100 }` |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建（T-06-03）|

### API-0112 DistributeElementsCommand

| 字段 | 内容 |
|---|---|
| 序号 | API-0112 |
| 名称 | DistributeElementsCommand |
| 所属系统 | core |
| 所属模块 | commands |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 元素分布命令。接收 elementIds 和 distributeType，按分布类型排列元素位置。水平分布：按中心点 X 坐标排序，最左最右元素保持原位，中间元素等距分布。垂直分布：按中心点 Y 坐标排序，最上最下元素保持原位，中间元素等距分布。环形分布：接收圆心和半径，将元素按等角弧度排列在圆周上（从顶部 -PI/2 开始）。支持跨图层分布（元素保持各自所属图层）。validate 检查至少 3 个非 connector 元素存在且未锁定，circular 模式须提供有效的 centerX/centerY/radius（radius > 0），移动后不与同层非分布元素重叠。execute 更新元素 transform 位置。连接线端点跟随其锚定元素自动位移。invert 生成逆命令恢复原始位置 |
| 输入参数 | constructor(elementIds: string[], distributeType: DistributeType, options?: CircularDistributeOptions, label?: string) |
| 输出参数 | implements SceneCommand - 可通过 CommandExecutor 执行、撤销和重做 |
| 典型用例 | `executor.execute(new DistributeElementsCommand(['e1', 'e2', 'e3'], 'horizontal'));` / `executor.execute(new DistributeElementsCommand(['e1', 'e2', 'e3', 'e4'], 'circular', { centerX: 200, centerY: 200, radius: 120 }));` |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建（T-06-03）|

### API-0113 BatchLayerOperation

| 字段 | 内容 |
|---|---|
| 序号 | API-0113 |
| 名称 | BatchLayerOperation |
| 所属系统 | core |
| 所属模块 | commands |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 按层批量操作类型字面量联合类型。定义八种图层级批量操作：setFill（统一填充色）、setStroke（统一轮廓色）、setOpacity（统一透明度，值须 0-1）、showAll（显示层内全部元素）、hideAll（隐藏层内全部元素）、deleteAll（删除层内全部元素，自动解绑关联连接线端点）、copyAll（复制全部元素到目标层，生成新 ID，检查冲突）、moveAll（移动全部元素到目标层，检查冲突） |
| 输入参数 | 无（类型别名） |
| 输出参数 | 'setFill' \| 'setStroke' \| 'setOpacity' \| 'showAll' \| 'hideAll' \| 'deleteAll' \| 'copyAll' \| 'moveAll' |
| 典型用例 | `const op: BatchLayerOperation = 'setFill'` |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建（T-06-04）|

### API-0114 BatchLayerEditCommand

| 字段 | 内容 |
|---|---|
| 序号 | API-0114 |
| 名称 | BatchLayerEditCommand |
| 所属系统 | core |
| 所属模块 | commands |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 按层批量编辑命令。对指定图层内的全部元素执行统一操作。setFill/setStroke：修改所有元素的 fill/stroke 样式属性（value 为颜色字符串）。setOpacity：修改所有元素的 opacity（value 为 0-1 数值）。showAll/hideAll：切换所有元素的 visible 为 true/false。deleteAll：删除图层内全部元素，同时解绑所有引用被删元素的连接线端点（设为自由端点）。copyAll：深克隆图层内全部元素到目标层，每个元素生成新 ID，检查目标层冲突。moveAll：将所有元素的 layerId 修改为目标层，检查目标层冲突和锁定状态。所有修改操作均检查元素锁定状态，锁定元素不可修改。完整支持 undo/redo（通过快照还原原始属性、已删除元素、已复制的元素 ID 等） |
| 输入参数 | constructor(layerId: string, operation: BatchLayerOperation, value?: string \| number, targetLayerId?: string, label?: string) |
| 输出参数 | implements SceneCommand - 可通过 CommandExecutor 执行、撤销和重做 |
| 典型用例 | `executor.execute(new BatchLayerEditCommand('l1', 'setFill', '#ff0000'));` / `executor.execute(new BatchLayerEditCommand('l1', 'copyAll', undefined, 'l2'));` / `executor.execute(new BatchLayerEditCommand('l1', 'hideAll'));` |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建（T-06-04）|

### API-0115 LayerMoveDirection

| 字段 | 内容 |
|---|---|
| 序号 | API-0115 |
| 名称 | LayerMoveDirection |
| 所属系统 | core |
| 所属模块 | commands |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 图层移动方向字面量联合类型。up 表示上移（增大 order 值，渲染到更高层级），down 表示下移（减小 order 值）。由 MoveLayersCommand 使用 |
| 输入参数 | 无（类型别名） |
| 输出参数 | 'up' \| 'down' |
| 典型用例 | `const dir: LayerMoveDirection = 'up'` |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建（T-06-05）|

### API-0116 MoveLayersCommand

| 字段 | 内容 |
|---|---|
| 序号 | API-0116 |
| 名称 | MoveLayersCommand |
| 所属系统 | core |
| 所属模块 | commands |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 多图层整体上移或下移命令。接收 layerIds、direction（up/down）和 steps，将选中图层以指定方向和步数移动。每个选中图层独立计算目标位置：上移时跳过上方非选中图层，下移时跳过下方非选中图层。非连续选中层各层独立移动但保持选中层之间的相对顺序。使用事务式校验：计算所有图层移动后的最终状态（包括连续 order 值重分配），检查每层内元素同层碰撞冲突，检查图层数是否超过 rules.maxLayerCount。任一层冲突则整体操作回滚。冲突时返回详细错误信息（图层 ID、元素 ID、重叠包围盒）。完整支持 undo/redo（通过保存执行前各图层 order 值，撤销时还原） |
| 输入参数 | constructor(layerIds: string[], direction: LayerMoveDirection, steps?: number, label?: string) - steps 默认 1，最小 1，自动向下取整 |
| 输出参数 | implements SceneCommand - 可通过 CommandExecutor 执行、撤销和重做 |
| 典型用例 | `executor.execute(new MoveLayersCommand(['l2', 'l3'], 'up', 2));` / `executor.execute(new MoveLayersCommand(['l1'], 'down'));` |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建（T-06-05）|

### API-0117 getAnchors

| 字段 | 内容 |
|---|---|
| 序号 | API-0117 |
| 名称 | getAnchors |
| 所属系统 | core |
| 所属模块 | anchors |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 返回元素的可用连接锚点列表。默认返回 9 个标准锚点（top、bottom、left、right、center、top-left、top-right、bottom-left、bottom-right），每个锚点包含 id、相对位置（0-1 范围相对于元素左上角）和法线方向（弧度，指向外侧）。对于 shape 类型元素，若 metadata.anchors 存在且为非空数组，则返回自定义锚点替代默认锚点。其他元素类型始终使用默认锚点 |
| 输入参数 | element: SceneElement - 需要获取锚点的场景元素 |
| 输出参数 | AnchorPoint[] - 锚点数组，每个包含 id（唯一标识）、position（{ x: number, y: number } 相对坐标 0-1）、direction（弧度） |
| 典型用例 | `const anchors = getAnchors(shapeElement); anchors.forEach(a => console.log(a.id, a.position));` |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建（T-07-01）；2026-05-20, OpenCode/deepseek-v4-pro, T-07-02 CanvasView 连接器工具调用此函数获取元素锚点以渲染可交互锚点 |

### API-0118 resolveAnchor

| 字段 | 内容 |
|---|---|
| 序号 | API-0118 |
| 名称 | resolveAnchor |
| 所属系统 | core |
| 所属模块 | anchors |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 将元素的指定锚点解析为画布中的绝对坐标。先调用 getAnchors 查找锚点，再根据锚点的相对位置（0-1）和元素的 transform（x、y、width、height）计算画布绝对坐标。若元素有旋转，则以元素中心为原点进行旋转计算。返回 null 表示锚点 ID 不存在 |
| 输入参数 | element: SceneElement - 所属元素；anchorId: string - 要解析的锚点 ID |
| 输出参数 | { x: number, y: number } | null - 锚点在画布中的绝对坐标，锚点不存在时返回 null |
| 典型用例 | `const abs = resolveAnchor(rectElement, 'right'); if (abs) { connector.source.x = abs.x; connector.source.y = abs.y; }` |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建（T-07-01）；2026-05-20, OpenCode/deepseek-v4-pro, T-07-02 CanvasView 连接器工具调用此函数解析锚点绝对坐标用于端点定位 |


### API-0119 computePointOnPath

| 字段 | 内容 |
|---|---|
| 序号 | API-0119 |
| 名称 | computePointOnPath |
| 所属系统 | canvas |
| 所属模块 | CanvasView |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 根据参数 t（0-1）计算多段路径上的点坐标。按路径总长度比例插值，t=0 返回起点，t=1 返回终点，t=0.5 返回路径中点。用于在连接线路径上定位标签文本 |
| 输入参数 | points: { x: number, y: number }[] - 路径点数组；t: number - 位置参数（0-1），自动截断到 [0,1] |
| 输出参数 | { x: number, y: number } - 路径上对应位置的绝对坐标 |
| 典型用例 | const pt = computePointOnPath(pathPoints, 0.5); |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建（T-07-03） |

### API-0120 buildArrowMarkers

| 字段 | 内容 |
|---|---|
| 序号 | API-0120 |
| 名称 | buildArrowMarkers |
| 所属系统 | canvas |
| 所属模块 | CanvasView |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 遍历场景中的所有连接线元素，为每个不同的箭头样式配置生成 SVG marker 定义。支持 triangle（实心三角形）、openTriangle（开放三角形）、diamond（菱形）、circle（圆点）四种箭头类型。每个 marker 使用 orient="auto" 自动跟随线段方向。使用缓存（Set）避免重复定义相同的 marker |
| 输入参数 | scene: SceneDocument - 当前场景文档 |
| 输出参数 | React.ReactElement[] - SVG marker 元素数组，放在 defs 中使用 |
| 典型用例 | 在 CanvasView 的 SVG render 中使用 `<defs>{buildArrowMarkers(scene)}</defs>` |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建（T-07-03） |


### API-0121 directionToCardinal

| 字段 | 内容 |
|---|---|
| 序号 | API-0121 |
| 名称 | directionToCardinal |
| 所属系统 | core |
| 所属模块 | routing |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 将锚点方向角度（弧度）转换为最接近的四个基本方向（up/down/left/right）。使用 45 度象限阈值：right=[0,45)∪[315,360)、down=[45,135)、left=[135,225)、up=[225,315) |
| 输入参数 | dir: number - 锚点方向弧度值 |
| 输出参数 | CardinalDirection - 'up' \| 'down' \| 'left' \| 'right' |
| 典型用例 | `const card = directionToCardinal(Math.PI / 2); // 'down'` |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建（T-07-04）|

### API-0122 computeOrthogonalRoute

| 字段 | 内容 |
|---|---|
| 序号 | API-0122 |
| 名称 | computeOrthogonalRoute |
| 所属系统 | core |
| 所属模块 | routing |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 计算两个锚定端点之间的正交路由路径点。路由仅由水平和垂直线段组成，路径点选择避免穿过源和目标元素的包围盒。通过 extendPoint 从源向外延伸并从目标向内延伸，然后连接两个延伸点。尝试两种弯曲策略（先水平后垂直 / 先垂直后水平），选择不穿过元素包围盒的策略 |
| 输入参数 | sourcePos: { x, y } - 源锚点绝对画布坐标；sourceAnchorDir: number - 源锚点方向（弧度）；targetPos: { x, y } - 目标锚点绝对画布坐标；targetAnchorDir: number - 目标锚点方向（弧度）；sourceBBox: BBox - 源元素包围盒；targetBBox: BBox - 目标元素包围盒；margin?: number - 延伸距离（默认 30） |
| 输出参数 | { x: number; y: number }[] - 中间路径点数组（不包含源/目标端点） |
| 典型用例 | `const pts = computeOrthogonalRoute(srcPos, 0, tgtPos, Math.PI, srcBBox, tgtBBox);` |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建（T-07-04）|

### API-0123 recalculateConnectorRoute

| 字段 | 内容 |
|---|---|
| 序号 | API-0123 |
| 名称 | recalculateConnectorRoute |
| 所属系统 | core |
| 所属模块 | routing |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 重新计算单个连接器元素的正交路由路径点。仅当 route.type 为 'orthogonal' 时重新计算。通过 resolveEndpointForRouting 解析端点引用的元素和锚点，获取最新位置和方向，然后调用 computeOrthogonalRoute 生成新路径。同时更新端点坐标为解析后的绝对坐标。若端点引用的元素或锚点不存在则返回原连接器不变 |
| 输入参数 | connector: ConnectorElement - 要重新计算的连接器元素；elements: SceneDocument['elements'] - 当前场景的元素列表（用于查找源/目标元素） |
| 输出参数 | ConnectorElement - 更新后的连接器元素，route.points 已重新计算 |
| 典型用例 | `const updated = recalculateConnectorRoute(conn, scene.elements);` |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建（T-07-04）|

### API-0124 recalculateRoutesForElements

| 字段 | 内容 |
|---|---|
| 序号 | API-0124 |
| 名称 | recalculateRoutesForElements |
| 所属系统 | core |
| 所属模块 | routing |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 为场景中所有引用指定元素 ID 的连接器重新计算正交路由。遍历 scene.elements，找出所有 source 或 target 端点引用 movedElementIds 中任意 ID 的 connector 元素，对每个调用 recalculateConnectorRoute 更新路由路径点。非正交连接器不受影响。用于 MoveElementsCommand、AlignElementsCommand 等位置变更命令的 execute 方法中自动更新路由 |
| 输入参数 | scene: SceneDocument - 当前场景文档；movedElementIds: Set<string> - 移动过的元素 ID 集合 |
| 输出参数 | SceneDocument - 更新后的场景文档，包含重新计算路由的连接器 |
| 典型用例 | `const newScene = recalculateRoutesForElements(scene, new Set(['e1', 'e2']));` |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建（T-07-04）|
### API-0125 DeleteElementStrategy

| 字段 | 内容 |
|---|---|
| 序号 | API-0125 |
| 名称 | DeleteElementStrategy |
| 所属系统 | core |
| 所属模块 | commands |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 删除元素时处理引用该元素的连接线的策略：unbind（解除绑定，保留自由端点），cascade（级联删除连接线），block（阻止删除） |
| 输入参数 | 无（类型别名：'unbind' | 'cascade' | 'block'） |
| 输出参数 | DeleteElementStrategy 类型 |
| 典型用例 | new DeleteElementCommand(['el1', 'el2'], 'unbind') |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建 |
### API-0126 DeleteElementCommand

| 字段 | 内容 |
|---|---|
| 序号 | API-0126 |
| 名称 | DeleteElementCommand |
| 所属系统 | core |
| 所属模块 | commands |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 删除指定元素并根据策略处理关联连接线：unbind 解除绑定保留自由端点，cascade 级联删除连接线，block 阻止删除；支持撤销/重做，撤销时恢复元素并重新绑定连接线 |
| 输入参数 | elementIds: string[]（要删除的元素ID列表），strategy: DeleteElementStrategy（可选，默认 'unbind'），label?: string（操作标签） |
| 输出参数 | SceneCommand 接口实现，execute 返回删除后的 SceneDocument，invert 返回恢复命令 |
| 典型用例 | executor.execute(new DeleteElementCommand([elementId]))  // 默认 unbind<br>executor.execute(new DeleteElementCommand([elementId], 'cascade'))  // 级联 |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0127 TemplateElementDef

| 字段 | 内容 |
|---|---|
| 序号 | API-0127 |
| 名称 | TemplateElementDef |
| 所属系统 | core |
| 所属模块 | templates |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 模板元素定义接口。存储单个元素在模板中的蓝图信息，坐标相对于模板锚点（0,0）。实例化时由 instantiateTemplate 创建完整 SceneElement。支持所有元素类型（shape、text、image、connector、container、rtlModule、rtlPort、mindNode、topologyNode、chart），通过 type 字段区分。transform 使用相对坐标，实例化时加上 position 偏移。defaultStyle 优先级低于 element.style |
| 输入参数 | type: ElementType（必需），transform: Transform2D（必需，相对坐标），style: ElementStyle（必需），name?: string（可选，用作生成 ID 的前缀），visible?: boolean（默认 true），locked?: boolean（默认 false），tags?: string[]，metadata?: Record<string,unknown>，ports?: TemplateRtlPortDef[]（可选，rtlModule 类型的端口定义），以及各元素类型的特有字段（shapeKind、text、src 等） |
| 输出参数 | 无（接口类型） |
| 典型用例 | const def: TemplateElementDef = { type: 'shape', name: 'rect', shapeKind: 'rect', transform: { x: 0, y: 0, width: 100, height: 60, rotation: 0, scaleX: 1, scaleY: 1 }, style: { fill: '#fff', stroke: '#000', strokeWidth: 2, opacity: 1 } } |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建；2026-05-20, OpenCode/deepseek-v4-pro, T-08-05 新增 TemplateRtlPortDef 和 ports 字段支持；ports 类型从 never[] 改为 TemplateRtlPortDef[] |
### API-0128 TemplateConnectorDef

| 字段 | 内容 |
|---|---|
| 序号 | API-0128 |
| 名称 | TemplateConnectorDef |
| 所属系统 | core |
| 所属模块 | templates |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 模板连接线定义接口。描述模板内部元素之间的连接关系。通过 sourceElementIndex/targetElementIndex（基于0的数组索引）引用模板中的元素。实例化时自动关联到实际生成的元素 ID。支持设置路由、箭头样式、标签和语义分类 |
| 输入参数 | sourceElementIndex: number（源元素在 template.elements 中的索引，0-based），targetElementIndex: number（目标元素索引），sourceAnchorId?: string（源锚点 ID），targetAnchorId?: string（目标锚点 ID），route?: ConnectorRoute（路由定义，坐标相对），arrowStart?: ArrowStyle，arrowEnd?: ArrowStyle，labels?: ConnectorLabel[]，semanticKind?: ConnectorSemanticKind |
| 输出参数 | 无（接口类型） |
| 典型用例 | const cd: TemplateConnectorDef = { sourceElementIndex: 0, targetElementIndex: 1, sourceAnchorId: 'right', targetAnchorId: 'left', arrowEnd: { type: 'triangle' } } |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建 |
### API-0129 TemplateDefinition

| 字段 | 内容 |
|---|---|
| 序号 | API-0129 |
| 名称 | TemplateDefinition |
| 所属系统 | core |
| 所属模块 | templates |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 完整的模板定义接口。包含 id、name、category 用于注册和查找，elements 数组存储模板元素蓝图（相对坐标），connectors 数组存储内部连接关系，defaultStyle 在实例化时合并到每个元素的样式（element.style 优先级更高）。模板在 TemplateRegistry 中注册后可通过 instantiateTemplate 在指定位置和图层创建场景元素 |
| 输入参数 | id: string（唯一标识），name: string（显示名称），category: string（分类，用于 UI 分组），defaultStyle?: Partial<ElementStyle>（默认样式），elements: TemplateElementDef[]（模板元素蓝图），connectors?: TemplateConnectorDef[]（内部连接线） |
| 输出参数 | 无（接口类型） |
| 典型用例 | const tpl: TemplateDefinition = { id: 'simple-rect', name: 'Simple Rect', category: '基础几何', elements: [{ type: 'shape', shapeKind: 'rect', transform: {...}, style: {...} }] } |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建 |
### API-0130 registerTemplate

| 字段 | 内容 |
|---|---|
| 序号 | API-0130 |
| 名称 | registerTemplate |
| 所属系统 | core |
| 所属模块 | templates |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 将模板定义注册到全局模板注册表。若模板 id 已存在则覆盖旧模板。注册后的模板可通过 getTemplate 查找，并可通过 instantiateTemplate 在画布上实例化 |
| 输入参数 | template: TemplateDefinition - 要注册的模板定义 |
| 输出参数 | void |
| 典型用例 | registerTemplate({ id: 'my-tpl', name: 'My Template', category: '基础几何', elements: [...] }) |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建 |
### API-0131 getTemplate

| 字段 | 内容 |
|---|---|
| 序号 | API-0131 |
| 名称 | getTemplate |
| 所属系统 | core |
| 所属模块 | templates |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 按 ID 查找已注册的模板定义。若模板不存在返回 undefined |
| 输入参数 | id: string - 模板唯一标识 |
| 输出参数 | TemplateDefinition | undefined - 找到返回模板定义，未找到返回 undefined |
| 典型用例 | const tpl = getTemplate('simple-rect'); if (tpl) { instantiateTemplate(tpl.id, pos, layerId) } |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建 |
### API-0132 getAllTemplates

| 字段 | 内容 |
|---|---|
| 序号 | API-0132 |
| 名称 | getAllTemplates |
| 所属系统 | core |
| 所属模块 | templates |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 返回所有已注册模板的只读列表 |
| 输入参数 | 无 |
| 输出参数 | TemplateDefinition[] - 注册表中所有模板的副本数组 |
| 典型用例 | const all = getAllTemplates(); all.forEach(tpl => console.log(tpl.name)) |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建 |
### API-0133 getTemplatesByCategory

| 字段 | 内容 |
|---|---|
| 序号 | API-0133 |
| 名称 | getTemplatesByCategory |
| 所属系统 | core |
| 所属模块 | templates |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 按分类筛选已注册模板，返回匹配分类的所有模板 |
| 输入参数 | category: string - 分类名称（如 '基础几何'、'流程图'、'架构图'、'RTL'） |
| 输出参数 | TemplateDefinition[] - 匹配分类的模板数组 |
| 典型用例 | const flowTpls = getTemplatesByCategory('流程图'); renderTemplatePanel(flowTpls) |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建 |
### API-0134 unregisterTemplate

| 字段 | 内容 |
|---|---|
| 序号 | API-0134 |
| 名称 | unregisterTemplate |
| 所属系统 | core |
| 所属模块 | templates |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 从注册表中移除指定模板。返回 true 表示成功移除，false 表示模板不存在 |
| 输入参数 | id: string - 要移除的模板标识 |
| 输出参数 | boolean - 模板存在并被移除返回 true，不存在返回 false |
| 典型用例 | if (unregisterTemplate('old-tpl')) { console.log('Template removed') } |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建 |
### API-0135 clearTemplates

| 字段 | 内容 |
|---|---|
| 序号 | API-0135 |
| 名称 | clearTemplates |
| 所属系统 | core |
| 所属模块 | templates |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 清空全局模板注册表，移除所有已注册模板 |
| 输入参数 | 无 |
| 输出参数 | void |
| 典型用例 | clearTemplates(); // 重置所有模板供测试使用 |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建 |
### API-0136 instantiateTemplate

| 字段 | 内容 |
|---|---|
| 序号 | API-0136 |
| 名称 | instantiateTemplate |
| 所属系统 | core |
| 所属模块 | templates |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 在画布指定位置和图层实例化模板，返回创建的 SceneElement 数组。元素坐标由模板相对坐标加上 position 偏移得到。所有元素分配新 ID（以元素 name 为前缀调用 generateId）。模板内连接线自动关联到对应的新元素 ID。连接线路由坐标同样应用 position 偏移。实例化后的元素为普通场景元素可自由编辑。若模板 id 不存在则抛出错误 |
| 输入参数 | templateId: string（模板标识），position: { x: number, y: number }（模板锚点在画布中的绝对位置），layerId: string（目标图层 ID） |
| 输出参数 | SceneElement[] - 创建的完整场景元素数组（包含模板元素和连接线），每个元素有独立 ID 和正确的 layerId |
| 典型用例 | const elements = instantiateTemplate('simple-rect', { x: 100, y: 200 }, 'l1'); elements.forEach(el => scene.elements.push(el)) |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建 |
### API-0137 createTemplateInstance

| 字段 | 内容 |
|---|---|
| 序号 | API-0137 |
| 名称 | createTemplateInstance |
| 所属系统 | core |
| 所属模块 | templates |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 从实例化参数创建 TemplateInstance 记录。记录包含 templateId、position、layerId、可选 params 和创建的元素 ID 列表。返回的记录可存入 scene.templates 数组以跟踪模板使用情况 |
| 输入参数 | templateId: string, position: { x, y }, layerId: string, elementIds: string[], params?: Record<string,unknown> |
| 输出参数 | { templateId, position, layerId, params?, elementIds } - 符合 TemplateInstance 接口的记录对象 |
| 典型用例 | const instance = createTemplateInstance('t1', pos, 'l1', elIds); scene.templates.push(instance) |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建 |
### API-0138 registerGeometricTemplates

| 字段 | 内容 |
|---|---|
| 序号 | API-0138 |
| 名称 | registerGeometricTemplates |
| 所属系统 | modules |
| 所属模块 | geometric-templates |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 注册全部 9 个基础几何图形模板到全局模板注册表（矩形、圆、椭圆、三角形、菱形、五角星、箭头、双向箭头、线条），全部分类为'基础几何'。可安全重复调用 |
| 输入参数 | 无 |
| 输出参数 | void |
| 典型用例 | import { registerGeometricTemplates } from './modules/geometric-templates'; registerGeometricTemplates(); |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建 |
### API-0139 geometricTemplateDefinitions

| 字段 | 内容 |
|---|---|
| 序号 | API-0139 |
| 名称 | geometricTemplateDefinitions |
| 所属系统 | modules |
| 所属模块 | geometric-templates |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 基础几何模板定义数组，包含 9 个 TemplateDefinition 对象（geom-rect/geom-circle/geom-ellipse/geom-triangle/geom-diamond/geom-pentagram/geom-arrow/geom-bidirectional-arrow/geom-line），供模块外引用模板定义数据 |
| 输入参数 | 无（常量导出） |
| 输出参数 | TemplateDefinition[]（9 个基础几何模板定义） |
| 典型用例 | import { geometricTemplateDefinitions } from './modules/geometric-templates'; const rectTpl = geometricTemplateDefinitions.find(t => t.id === 'geom-rect'); |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建 |
### API-0140 registerFlowchartTemplates

| 字段 | 内容 |
|---|---|
| 序号 | API-0140 |
| 名称 | registerFlowchartTemplates |
| 所属系统 | modules |
| 所属模块 | flowchart-templates |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 注册全部 7 个流程图专用模板到全局模板注册表（开始/结束（圆角矩形）、处理（矩形）、判断（菱形，含 是/否 标注锚点）、输入输出（平行四边形）、子流程（双边框矩形）、泳道（容器）、注释（文本，虚线边框）），全部分类为'流程图'。判断节点的 bottom_yes/left_no/right_no 锚点通过 metadata.anchors 自定义实现，可安全重复调用 |
| 输入参数 | 无 |
| 输出参数 | void |
| 典型用例 | import { registerFlowchartTemplates } from './modules/flowchart-templates'; registerFlowchartTemplates(); |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建 |
### API-0141 flowchartTemplateDefinitions

| 字段 | 内容 |
|---|---|
| 序号 | API-0141 |
| 名称 | flowchartTemplateDefinitions |
| 所属系统 | modules |
| 所属模块 | flowchart-templates |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 流程图模板定义数组，包含 7 个 TemplateDefinition 对象（fc-terminator/fc-process/fc-decision/fc-io/fc-subprocess/fc-swimlane/fc-annotation），供模块外引用模板定义数据 |
| 输入参数 | 无（常量导出） |
| 输出参数 | TemplateDefinition[]（7 个流程图模板定义） |
| 典型用例 | import { flowchartTemplateDefinitions } from './modules/flowchart-templates'; const decisionTpl = flowchartTemplateDefinitions.find(t => t.id === 'fc-decision'); |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建 |
### API-0142 registerArchitectureTemplates

| 字段 | 内容 |
|---|---|
| 序号 | API-0142 |
| 名称 | registerArchitectureTemplates |
| 所属系统 | modules |
| 所属模块 | architecture-templates |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 注册全部 8 个架构图专用模板到全局模板注册表：服务（矩形，蓝色）、数据库（圆柱体路径形状）、缓存（闪电形状多边形，橙色）、消息队列（三叠矩形，黄色）、API网关（六边形，紫色）、负载均衡（圆形+四向白色箭头，绿色）、云区域（容器，虚线边框，浅蓝半透明）、浏览器/客户端（窗口框架+标题栏+红黄绿三点+地址栏，灰色），全部分类为'架构图'。可安全重复调用。 |
| 输入参数 | 无 |
| 输出参数 | void |
| 典型用例 | import { registerArchitectureTemplates } from './modules/architecture-templates'; registerArchitectureTemplates(); |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建 |
### API-0143 architectureTemplateDefinitions

| 字段 | 内容 |
|---|---|
| 序号 | API-0143 |
| 名称 | architectureTemplateDefinitions |
| 所属系统 | modules |
| 所属模块 | architecture-templates |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 架构图模板定义数组，包含 8 个 TemplateDefinition 对象（arch-service/arch-database/arch-cache/arch-mq/arch-gateway/arch-lb/arch-cloud/arch-client），供模块外引用模板定义数据 |
| 输入参数 | 无（常量导出） |
| 输出参数 | TemplateDefinition[]（8 个架构图模板定义） |
| 典型用例 | import { architectureTemplateDefinitions } from './modules/architecture-templates'; const dbTpl = architectureTemplateDefinitions.find(t => t.id === 'arch-database'); |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0144 registerRtlTemplates

| 字段 | 内容 |
|---|---|
| 序号 | API-0144 |
| 名称 | registerRtlTemplates |
| 所属系统 | modules |
| 所属模块 | rtl-templates |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 注册全部 9 个 RTL 硬件模块连接图专用模板到全局模板注册表：通用模块（rtlModule，80×70，clk/rst/data_in/data_out 端口）、寄存器（rtlModule，80×50，clk/rst/d/q）、多路选择器（rtlModule，80×60，a/b/sel/y）、ALU（rtlModule，90×80，a/b/op/result/zero/carry）、FSM（rtlModule，90×70，clk/rst/in/state/next_state）、存储器（rtlModule，100×80，clk/addr/wdata/wen/rdata）、流水线级（rtlModule，80×60，clk/din/dout）、控制器（rtlModule，90×70，clk/rst/status/ctrl_sigs）、数据通路（container，400×300，虚线边框），全部分类为'RTL'。端口自动按方向分布（input 左侧绿色、output 右侧红色、inout 上方蓝色）。可安全重复调用。 |
| 输入参数 | 无 |
| 输出参数 | void |
| 典型用例 | import { registerRtlTemplates } from './modules/rtl-templates'; registerRtlTemplates(); |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0145 rtlTemplateDefinitions

| 字段 | 内容 |
|---|---|
| 序号 | API-0145 |
| 名称 | rtlTemplateDefinitions |
| 所属系统 | modules |
| 所属模块 | rtl-templates |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | RTL 模板定义数组，包含 9 个 TemplateDefinition 对象（rtl-gen-module/rtl-register/rtl-mux/rtl-alu/rtl-fsm/rtl-memory/rtl-pipeline/rtl-controller/rtl-datapath），供模块外引用模板定义数据 |
| 输入参数 | 无（常量导出） |
| 输出参数 | TemplateDefinition[]（9 个 RTL 模板定义） |
| 典型用例 | import { rtlTemplateDefinitions } from './modules/rtl-templates'; const regTpl = rtlTemplateDefinitions.find(t => t.id === 'rtl-register'); |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0146 TemplateRtlPortDef

| 字段 | 内容 |
|---|---|
| 序号 | API-0146 |
| 名称 | TemplateRtlPortDef |
| 所属系统 | core |
| 所属模块 | templates |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 模板 RTL 端口定义接口，用于在 TemplateElementDef 的 ports 字段中定义 rtlModule 类型元素的端口。包含信号方向（input/output/inout）、位宽和端口名称。实例化时由 buildElement 根据方向自动计算端口在模块边缘的位置（input 左侧、output 右侧、inout 上方），并生成完整的 RtlPortElement 对象 |
| 输入参数 | direction: 'input' \| 'output' \| 'inout'（信号方向），bitWidth: number（位宽，如 1 表示单比特、32 表示 32 位总线），portName: string（信号名称） |
| 输出参数 | 无（接口类型） |
| 典型用例 | ports: [{ direction: 'input', bitWidth: 32, portName: 'data_in' }, { direction: 'output', bitWidth: 32, portName: 'data_out' }] |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0147 TemplatePanel

| 字段 | 内容 |
|---|---|
| 序号 | API-0147 |
| 名称 | TemplatePanel |
| 所属系统 | ui |
| 所属模块 | TemplatePanel |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 模板面板 React 浮动组件。按分类（基础几何、流程图、架构图、RTL 等）分组展示所有已注册模板。每个模板显示 SVG 缩略图预览和名称。支持搜索框按名称模糊搜索过滤模板。点击模板通过 onTemplateInsert 回调通知父组件插入。面板可折叠各组分类、右上角关闭按钮可临时隐藏面板（显示 Show Templates 按钮恢复） |
| 输入参数 | props: { onTemplateInsert: (templateId: string) => void } - 模板插入回调，接收被点击模板的 ID |
| 输出参数 | ReactElement - 按分类分组的模板网格面板，含搜索框和折叠/关闭交互 |
| 典型用例 | <TemplatePanel onTemplateInsert={(id) => { const els = instantiateTemplate(id, {x: 400, y: 300}, layerId); els.forEach(el => executor.execute(new CreateElementCommand(el))); }} /> |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0148 TemplatePanelProps

| 字段 | 内容 |
|---|---|
| 序号 | API-0148 |
| 名称 | TemplatePanelProps |
| 所属系统 | ui |
| 所属模块 | TemplatePanel |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | TemplatePanel 组件的 Props 类型接口 |
| 输入参数 | onTemplateInsert: (templateId: string) => void |
| 输出参数 | 无（接口类型） |
| 典型用例 | const props: TemplatePanelProps = { onTemplateInsert: handleInsert } |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0149 parseCSV

| 字段 | 内容 |
|---|---|
| 序号 | API-0149 |
| 名称 | parseCSV |
| 所属系统 | io |
| 所属模块 | csv-parser |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 使用 PapaParse 解析 CSV 文本内容，返回 ParsedData 结构。自动推断每列的数据类型（number/string/date/boolean），统计缺失率，识别缺失值（空字符串、null、NA、N/A）。支持自定义分隔符、有无表头等选项 |
| 输入参数 | content: string（CSV 文本内容）, options?: CsvParseOptions（解析选项：header 是否有表头默认 true、skipEmptyLines 是否跳过空行默认 true、delimiter 分隔符自定义） |
| 输出参数 | ParsedData — 包含 columns（ColumnInfo[] 列名/推断类型/缺失率）、rows（解析后的数据行数组）、rowCount（数据行数）、headers（列名字符串数组）、parseErrors（解析错误信息数组） |
| 典型用例 | `const result = parseCSV(fileContent); result.columns.forEach(c => console.log(c.name, c.inferredType));` |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0150 ParsedData

| 字段 | 内容 |
|---|---|
| 序号 | API-0150 |
| 名称 | ParsedData |
| 所属系统 | io |
| 所属模块 | csv-parser |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | CSV 解析结果的数据结构。包含列的元数据信息（类型推断、缺失统计）、解析后的数据行、以及解析过程中的错误信息 |
| 输入参数 | columns: ColumnInfo[]（列元数据数组）、rows: Record<string, string \| number \| boolean \| null>[]（解析后的数据行）、rowCount: number（数据行数）、headers: string[]（列名数组）、parseErrors: string[]（解析错误信息） |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const data: ParsedData = parseCSV(csvContent);` |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0151 ColumnInfo

| 字段 | 内容 |
|---|---|
| 序号 | API-0151 |
| 名称 | ColumnInfo |
| 所属系统 | io |
| 所属模块 | csv-parser |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | CSV 解析后单个列的元数据信息，包含列名、自动推断的数据类型和缺失值比率 |
| 输入参数 | name: string（列名）、inferredType: 'number' \| 'string' \| 'date' \| 'boolean'（推断类型）、missingRate: number（缺失率 0-1） |
| 输出参数 | 无（接口类型） |
| 典型用例 | `col.inferredType === 'number' && col.missingRate < 0.1` |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0152 CsvParseOptions

| 字段 | 内容 |
|---|---|
| 序号 | API-0152 |
| 名称 | CsvParseOptions |
| 所属系统 | io |
| 所属模块 | csv-parser |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | parseCSV 函数的可选配置参数 |
| 输入参数 | header?: boolean（是否有表头，默认 true）、skipEmptyLines?: boolean（是否跳过空行，默认 true）、delimiter?: string（自定义列分隔符） |
| 输出参数 | 无（接口类型） |
| 典型用例 | `parseCSV(content, { delimiter: ';', header: false })` |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0153 DataPanel

| 字段 | 内容 |
|---|---|
| 序号 | API-0153 |
| 名称 | DataPanel |
| 所属系统 | ui |
| 所属模块 | DataPanel |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | React 组件，提供数据面板 UI。展示当前项目的数据源列表，选择数据源后显示列名、类型、缺失率和样例值。提供图表类型选择（柱状图、折线图、散点图、箱线图、直方图、热图）和数据列到图表轴/分组/颜色的映射配置，点击生成图表按钮时通过回调输出 ChartConfig。 |
| 输入参数 | dataSources: DataSource[]（数据源列表）、parsedData: ParsedData | null（已解析的 CSV 数据，null 表示未选择或加载中）、loading: boolean（是否正在加载数据）、parseError: string | null（解析错误信息）、onSelectDataSource: (dataSourceId: string) => void（选择数据源回调）、onGenerateChart: (config: ChartConfig) => void（生成图表回调） |
| 输出参数 | 无（React 组件，通过回调传出数据） |
| 典型用例 | <DataPanel dataSources={scene.dataSources} parsedData={parsedData} loading={loading} parseError={parseError} onSelectDataSource={(id) => loadAndParseDs(id)} onGenerateChart={(config) => createChartElement(config)} /> |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0154 ChartConfig

| 字段 | 内容 |
|---|---|
| 序号 | API-0154 |
| 名称 | ChartConfig |
| 所属系统 | ui |
| 所属模块 | DataPanel |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 图表生成配置的数据结构，被 DataPanel 通过 onGenerateChart 回调传出，后续由图表生成器消费。 |
| 输入参数 | dataSourceId: string（数据源 ID）、chartType: ChartType（图表类型，bar/line/scatter/boxplot/histogram/heatmap）、columnMappings: { x?: string, y?: string, group?: string, color?: string }（列映射，y 通常必选） |
| 输出参数 | 无（接口类型） |
| 典型用例 | const config: ChartConfig = { dataSourceId: 'ds-1', chartType: 'bar', columnMappings: { y: 'Revenue', x: 'Month' } } |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0155 generateChart

| 字段 | 内容 |
|---|---|
| 序号 | API-0155 |
| 名称 | generateChart |
| 所属系统 | modules |
| 所属模块 | chart/generator |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 图表生成函数。接收已解析的 CSV 数据（ParsedData）、图表配置（ChartGenerationConfig）、数据源 ID、图层 ID 和可选的已有样式选项（existingOptions），生成包含渲染 SVG 内容的 ChartElement。Lite 包使用自研 SVG 渲染器支持全部 6 种图表类型。支持配色方案（colorScheme）、网格线开关（showGrid）、图例位置（legendPosition）、轴标签（xAxisLabel/yAxisLabel）等样式选项。自动合并已有选项与传入配置。 |
| 输入参数 | data: ParsedData、config: ChartGenerationConfig、dataSourceId: string、layerId: string、existingOptions?: Record<string, unknown>（可选的已有样式选项，用于重新生成时保留样式） |
| 输出参数 | ChartElement - 包含 id（自动生成）、type: 'chart'、layerId、transform（默认 600x400）、style、visible、dataSourceId、chartType、columnMappings、svgContent（渲染的完整 SVG 字符串） |
| 典型用例 | const chartEl = generateChart(parsedData, { chartType: 'bar', columnMappings: { x: 'category', y: 'value' }, title: 'Revenue', showGrid: true, colorScheme: 'pastel', legendPosition: 'bottom' }, 'ds-1', 'layer-1'); |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建
2026-05-21, OpenCode/deepseek-v4-pro, 新增 existingOptions 参数支持样式合并和图表重新生成 |

### API-0156 ChartGenerationConfig

| 字段 | 内容 |
|---|---|
| 序号 | API-0156 |
| 名称 | ChartGenerationConfig |
| 所属系统 | modules |
| 所属模块 | chart/generator |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 图表生成配置接口。定义图表类型、列映射、尺寸、标题和样式选项。新增 5 个样式字段：showGrid（是否显示网格线，默认 true）、colorScheme（配色方案名称，如 default/pastel/vivid/monochrome/warm/cool）、legendPosition（图例位置：bottom/right/top/none）、xAxisLabel（X 轴标签文本）、yAxisLabel（Y 轴标签文本）。 |
| 输入参数 | chartType: ChartType、columnMappings: { x?, y?, group?, color? }、width?: number（默认 600）、height?: number（默认 400）、title?: string、showGrid?: boolean（默认 true）、colorScheme?: string、legendPosition?: LegendPosition、xAxisLabel?: string、yAxisLabel?: string |
| 输出参数 | 无（接口类型） |
| 典型用例 | const config: ChartGenerationConfig = { chartType: 'bar', columnMappings: { x: 'Month', y: 'Revenue' }, width: 800, height: 500, title: 'Monthly Revenue', colorScheme: 'warm', showGrid: true, legendPosition: 'bottom' } |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建
2026-05-21, OpenCode/deepseek-v4-pro, 新增 5 个样式字段：showGrid/colorScheme/legendPosition/xAxisLabel/yAxisLabel |

### API-0157 ChartColorScheme

| 字段 | 内容 |
|---|---|
| 序号 | API-0157 |
| 名称 | ChartColorScheme |
| 所属系统 | modules |
| 所属模块 | chart/generator |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 配色方案接口。定义图表配色方案的名称和颜色数组。name 为方案标识名（如 default/pastel/vivid/monochrome/warm/cool），colors 为 hex 颜色字符串数组（10 个颜色）。用于 ChartGenerationConfig.colorScheme 字段和 CHART_COLOR_SCHEMES 常量 |
| 输入参数 | name: string（方案名称）、colors: string[]（颜色数组，hex 格式） |
| 输出参数 | 无（接口类型） |
| 典型用例 | const scheme: ChartColorScheme = { name: 'pastel', colors: ['#a8d4f0', '#f5c6d0'] } |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0158 CHART_COLOR_SCHEMES

| 字段 | 内容 |
|---|---|
| 序号 | API-0158 |
| 名称 | CHART_COLOR_SCHEMES |
| 所属系统 | modules |
| 所属模块 | chart/generator |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 预定义图表配色方案常量数组。包含 6 种配色方案：default（默认蓝橙红基调）、pastel（柔和粉彩色系）、vivid（鲜艳高饱和色系）、monochrome（黑白灰单色系）、warm（暖色系）、cool（冷色系）。每种方案包含 10 个 hex 颜色值。在图表渲染时通过 resolveColors(config) 根据 ChartGenerationConfig.colorScheme 选择对应方案。供 PropertyPanel 图表样式编辑区的配色方案下拉菜单直接引用 |
| 输入参数 | 无（常量导出） |
| 输出参数 | ChartColorScheme[]（6 个配色方案对象） |
| 典型用例 | import { CHART_COLOR_SCHEMES } from './modules/chart'; const names = CHART_COLOR_SCHEMES.map(s => s.name); |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0159 LegendPosition

| 字段 | 内容 |
|---|---|
| 序号 | API-0159 |
| 名称 | LegendPosition |
| 所属系统 | modules |
| 所属模块 | chart/generator |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 图例位置类型。字符串字面量联合类型，定义图表图例的显示位置：'bottom'（底部居中，默认）、'right'（右侧垂直排列）、'top'（标题下方水平排列）、'none'（不显示图例）。在 ChartGenerationConfig.legendPosition 字段中使用，renderLegend 函数根据此值定位图例 |
| 输入参数 | 'bottom' | 'right' | 'top' | 'none' |
| 输出参数 | 无（类型别名） |
| 典型用例 | const cfg: ChartGenerationConfig = { ..., legendPosition: 'right' } |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0160 convertChartSvgToElements

| 字段 | 内容 |
|---|---|
| 序号 | API-0160 |
| 名称 | convertChartSvgToElements |
| 所属系统 | modules |
| 所属模块 | chart/convert |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 将图表的缓存 SVG 内容解析并转换为独立的矢量元素。遍历 SVG 中的 rect/circle/ellipse/line/polyline/polygon/path/text 标签，按 ChartElement 的 transform 坐标和尺寸进行缩放映射，生成对应的 ShapeElement 和 TextElement 数组。转换后所有元素 target layerId 保持一致 |
| 输入参数 | chartElement: ChartElement（含 svgContent 的图表元素）, targetLayerId: string（目标图层 ID） |
| 输出参数 | ConvertedElementResult - { elements: Array<ShapeElement | TextElement> }，elements 为空数组表示 svgContent 缺失或无可转换元素 |
| 典型用例 | const { elements } = convertChartSvgToElements(chartEl, 'new-layer'); elements.forEach(el => scene.elements.push(el)); |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0161 ConvertedElementResult

| 字段 | 内容 |
|---|---|
| 序号 | API-0161 |
| 名称 | ConvertedElementResult |
| 所属系统 | modules |
| 所属模块 | chart/convert |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | convertChartSvgToElements 函数的返回值接口，包含转换后的独立矢量元素数组 |
| 输入参数 | elements: Array<ShapeElement | TextElement> |
| 输出参数 | 无（接口类型） |
| 典型用例 | const result: ConvertedElementResult = { elements: [...] } |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0162 ChartToVectorCommand

| 字段 | 内容 |
|---|---|
| 序号 | API-0162 |
| 名称 | ChartToVectorCommand |
| 所属系统 | core |
| 所属模块 | commands |
| 状态 | 活跃 |
| 创建日期 | 2026-05-20 |
| 最后修订日期 | 2026-05-20 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 图表转矢量组命令。validate 检查所有目标元素为 chart 类型且有缓存的 svgContent、最大图层数未超限。execute 创建新图层、调用 convertChartSvgToElements 将 SVG 拆解为独立 shape/text 元素、创建 ElementGroup 包含所有新元素、从场景中移除原 chart 元素。invert 恢复原 chart 元素、删除新图层和新组、移除所有转化后的元素。getNewLayerId() 返回新创建的图层 ID |
| 输入参数 | constructor(elementIds: string[], label?: string) |
| 输出参数 | implements SceneCommand - 可通过 CommandExecutor 执行、撤销和重做；getNewLayerId(): string - 返回新图层 ID |
| 典型用例 | const cmd = new ChartToVectorCommand(['chart1']); executor.execute(cmd); const newLayerId = cmd.getNewLayerId(); |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0163 parseExcel

| 字段 | 内容 |
|---|---|
| 序号 | API-0163 |
| 名称 | parseExcel |
| 所属系统 | io |
| 所属模块 | excel-parser |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 解析 Excel 文件（.xlsx / .xls），返回与 parseCSV 相同的 ParsedData 格式。动态加载 SheetJS（xlsx 库），在 Lite 包中该库不可用时返回友好错误提示。支持通过 ExcelParseOptions 指定工作表（sheetName）。内部先调用 xlsx 将工作表转为 CSV，再通过 parseCSV 解析，确保列类型推断、缺失值处理与 CSV 解析器完全一致。 |
| 输入参数 | file: File（Excel 文件对象）, options?: ExcelParseOptions（可选：sheetName 指定工作表名称） |
| 输出参数 | Promise<ParsedData> — 与 CSV 解析器相同格式的解析结果。Lite 包下 parseErrors 包含提示需要 Full 包的错误信息 |
| 典型用例 | const result = await parseExcel(file, { sheetName: 'Sheet1' }); console.log(result.columns); |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0164 parseExcelFromBuffer

| 字段 | 内容 |
|---|---|
| 序号 | API-0164 |
| 名称 | parseExcelFromBuffer |
| 所属系统 | io |
| 所属模块 | excel-parser |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 从 ArrayBuffer 解析 Excel 数据，适用于从 ZIP 文件或 File System Access API 目录读取后解析。行为与 parseExcel 一致。 |
| 输入参数 | buffer: ArrayBuffer, options?: ExcelParseOptions |
| 输出参数 | Promise<ParsedData> |
| 典型用例 | const result = await parseExcelFromBuffer(buffer, { sheetName: 'Data' }); |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0165 getExcelSheetNames

| 字段 | 内容 |
|---|---|
| 序号 | API-0165 |
| 名称 | getExcelSheetNames |
| 所属系统 | io |
| 所属模块 | excel-parser |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 返回 Excel 文件中所有工作表的名称列表，用于构建工作表选择 UI。Lite 包下返回空数组。 |
| 输入参数 | file: File（Excel 文件对象） |
| 输出参数 | Promise<string[]> — 工作表名称数组 |
| 典型用例 | const names = await getExcelSheetNames(file); // ['Sheet1', 'Sheet2', 'Sheet3'] |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0166 getExcelSheetNamesFromBuffer

| 字段 | 内容 |
|---|---|
| 序号 | API-0166 |
| 名称 | getExcelSheetNamesFromBuffer |
| 所属系统 | io |
| 所属模块 | excel-parser |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 从 ArrayBuffer 返回 Excel 文件中所有工作表的名称列表，适用于从 ZIP 等场景读取。 |
| 输入参数 | buffer: ArrayBuffer |
| 输出参数 | Promise<string[]> — 工作表名称数组 |
| 典型用例 | const names = await getExcelSheetNamesFromBuffer(buffer); |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0167 ExcelParseOptions

| 字段 | 内容 |
|---|---|
| 序号 | API-0167 |
| 名称 | ExcelParseOptions |
| 所属系统 | io |
| 所属模块 | excel-parser |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | Excel 解析函数的可选配置接口，目前支持指定目标工作表名称。 |
| 输入参数 | sheetName?: string（可选，目标工作表名称，默认使用第一个工作表） |
| 输出参数 | 无（接口类型） |
| 典型用例 | const options: ExcelParseOptions = { sheetName: 'Sheet2' }; |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0168 LayoutDirection

| 字段 | 内容 |
|---|---|
| 序号 | API-0168 |
| 名称 | LayoutDirection |
| 所属系统 | core |
| 所属模块 | layout |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 布局方向类型。LR=左到右、RL=右到左、TB=上到下、BT=下到上。用于 LayoutOptions.direction 字段控制图的走向 |
| 输入参数 | 无（类型别名） |
| 输出参数 | 'LR' \| 'RL' \| 'TB' \| 'BT' |
| 典型用例 | `const dir: LayoutDirection = 'TB'` |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建（T-10-01）|

### API-0169 LayoutHAlign

| 字段 | 内容 |
|---|---|
| 序号 | API-0169 |
| 名称 | LayoutHAlign |
| 所属系统 | core |
| 所属模块 | layout |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 布局行内水平对齐方式。start=左对齐、center=居中、end=右对齐、stretch=拉伸填充。用于 LayoutOptions.hAlign |
| 输入参数 | 无（类型别名） |
| 输出参数 | 'start' \| 'center' \| 'end' \| 'stretch' |
| 典型用例 | `const ha: LayoutHAlign = 'center'` |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建（T-10-01）|

### API-0170 LayoutVAlign

| 字段 | 内容 |
|---|---|
| 序号 | API-0170 |
| 名称 | LayoutVAlign |
| 所属系统 | core |
| 所属模块 | layout |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 布局列内垂直对齐方式。start=上对齐、center=居中、end=下对齐、stretch=拉伸填充。用于 LayoutOptions.vAlign |
| 输入参数 | 无（类型别名） |
| 输出参数 | 'start' \| 'center' \| 'end' \| 'stretch' |
| 典型用例 | `const va: LayoutVAlign = 'center'` |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建（T-10-01）|

### API-0171 LayoutOptions

| 字段 | 内容 |
|---|---|
| 序号 | API-0171 |
| 名称 | LayoutOptions |
| 所属系统 | core |
| 所属模块 | layout |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 布局引擎配置选项接口。控制图的走向（direction）、节点间距（hSpacing/vSpacing）、对齐方式（hAlign/vAlign），并提供 extra 字段供具体算法扩展参数 |
| 输入参数 | direction?: LayoutDirection（默认 'TB'），hSpacing?: number（默认 80），vSpacing?: number（默认 60），hAlign?: LayoutHAlign（默认 'center'），vAlign?: LayoutVAlign（默认 'center'），extra?: Record<string, unknown>（算法专用额外参数） |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const opts: LayoutOptions = { direction: 'LR', hSpacing: 120, vSpacing: 80, hAlign: 'center' }` |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建（T-10-01）|

### API-0172 LayoutNode

| 字段 | 内容 |
|---|---|
| 序号 | API-0172 |
| 名称 | LayoutNode |
| 所属系统 | core |
| 所属模块 | layout |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 布局输入节点。代表需要被布局算法定位的单个节点，包含场景元素 ID、宽度、高度和可选元数据 |
| 输入参数 | id: string（场景元素 ID），width: number（节点宽度），height: number（节点高度），metadata?: Record<string, unknown>（算法提示元数据） |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const node: LayoutNode = { id: 'e1', width: 100, height: 60, metadata: { rank: 0 } }` |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建（T-10-01）|

### API-0173 LayoutEdge

| 字段 | 内容 |
|---|---|
| 序号 | API-0173 |
| 名称 | LayoutEdge |
| 所属系统 | core |
| 所属模块 | layout |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 布局输入边。代表两个节点之间的有向连接，可关联场景中的连接线元素 ID |
| 输入参数 | source: string（源节点 ID），target: string（目标节点 ID），connectorId?: string（关联的连接线元素 ID），metadata?: Record<string, unknown>（算法提示元数据） |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const edge: LayoutEdge = { source: 'e1', target: 'e2', connectorId: 'c1' }` |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建（T-10-01）|

### API-0174 LayoutNodeResult

| 字段 | 内容 |
|---|---|
| 序号 | API-0174 |
| 名称 | LayoutNodeResult |
| 所属系统 | core |
| 所属模块 | layout |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 布局节点结果。包含节点 ID 和布局算法为其计算的画布绝对坐标 |
| 输入参数 | id: string（场景元素 ID），x: number（计算后的 X 坐标），y: number（计算后的 Y 坐标） |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const nr: LayoutNodeResult = { id: 'e1', x: 100, y: 200 }` |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建（T-10-01）|

### API-0175 LayoutEdgeResult

| 字段 | 内容 |
|---|---|
| 序号 | API-0175 |
| 名称 | LayoutEdgeResult |
| 所属系统 | core |
| 所属模块 | layout |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 布局边结果。包含源/目标节点 ID、关联连接线 ID 和布局算法计算的路径点数组 |
| 输入参数 | source: string（源节点 ID），target: string（目标节点 ID），connectorId?: string（关联连接线 ID），points: { x: number, y: number }[]（路由路径点） |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const er: LayoutEdgeResult = { source: 'e1', target: 'e2', connectorId: 'c1', points: [{x:100,y:30},{x:150,y:30},{x:200,y:30}] }` |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建（T-10-01）|

### API-0176 LayoutResult

| 字段 | 内容 |
|---|---|
| 序号 | API-0176 |
| 名称 | LayoutResult |
| 所属系统 | core |
| 所属模块 | layout |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 布局计算结果。包含所有节点的计算位置（nodes）、所有边的路由路径点（edges）和覆盖全部节点的总围盒（totalBBox） |
| 输入参数 | nodes: LayoutNodeResult[]（节点位置结果），edges: LayoutEdgeResult[]（边路由结果），totalBBox: BBox（覆盖所有节点的轴对齐包围盒） |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const result: LayoutResult = engine.layout(nodes, edges, opts)` |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建（T-10-01）|

### API-0177 LayoutEngine

| 字段 | 内容 |
|---|---|
| 序号 | API-0177 |
| 名称 | LayoutEngine |
| 所属系统 | core |
| 所属模块 | layout |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 布局引擎统一接口。定义所有布局算法实现的契约：提供引擎名称（name）和 layout 方法接收节点、边、选项返回计算结果。不同图类型可接入 dagre、ELK.js 或自研实现 |
| 输入参数 | name: string（引擎名称），layout: (nodes: LayoutNode[], edges: LayoutEdge[], options?: LayoutOptions) => LayoutResult（布局计算方法） |
| 输出参数 | LayoutResult - 包含节点位置、边路由和总围盒的布局结果 |
| 典型用例 | `const engine: LayoutEngine = { name: 'dagre', layout: (n, e, o) => computeDagre(n, e, o) }` |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建（T-10-01）|

### API-0178 applyLayoutToScene

| 字段 | 内容 |
|---|---|
| 序号 | API-0178 |
| 名称 | applyLayoutToScene |
| 所属系统 | core |
| 所属模块 | layout |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 将 LayoutResult 应用到 SceneDocument。更新匹配元素的 transform.x/y，更新连接线的 route.points 和端点坐标。不修改原始 scene，返回新 SceneDocument。未在布局结果中的元素保持不变 |
| 输入参数 | scene: SceneDocument（原始场景文档），result: LayoutResult（布局计算结果） |
| 输出参数 | SceneDocument - 应用布局后的新场景文档（不可变） |
| 典型用例 | `const updatedScene = applyLayoutToScene(scene, engine.layout(nodes, edges, opts))` |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建（T-10-01）|

### API-0179 extractLayoutNodes

| 字段 | 内容 |
|---|---|
| 序号 | API-0179 |
| 名称 | extractLayoutNodes |
| 所属系统 | core |
| 所属模块 | layout |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 从场景元素中提取 LayoutNode 输入。仅提取 ID 在给定集合中且类型不为 'connector' 的元素，读取 id、transform.width、transform.height 和 metadata |
| 输入参数 | elements: SceneElement[]（场景元素数组），elementIds: Set<string>（需要包含的元素 ID 集合） |
| 输出参数 | LayoutNode[] - 布局输入节点数组 |
| 典型用例 | `const nodes = extractLayoutNodes(scene.elements, new Set(['e1', 'e2', 'e3']))` |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建（T-10-01） | 2026-05-21, OpenCode/deepseek-v4-pro, T-10-02 增加 connector 类型过滤 |

### API-0180 extractLayoutEdges

| 字段 | 内容 |
|---|---|
| 序号 | API-0180 |
| 名称 | extractLayoutEdges |
| 所属系统 | core |
| 所属模块 | layout |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 从场景连接线中提取 LayoutEdge 输入。仅提取两端 elementId 都在给定集合中的 connector 元素，映射 source/target 元素 ID 和 connectorId |
| 输入参数 | elements: SceneElement[]（场景元素数组），elementIds: Set<string>（布局节点 ID 集合） |
| 输出参数 | LayoutEdge[] - 布局输入边数组 |
| 典型用例 | `const edges = extractLayoutEdges(scene.elements, new Set(['e1', 'e2', 'e3']))` |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建（T-10-01）|

### API-0181 DataPanelProps

| 字段 | 内容 |
|---|---|
| 序号 | API-0181 |
| 名称 | DataPanelProps |
| 所属系统 | ui |
| 所属模块 | DataPanel |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | DataPanel 组件的 Props 类型接口，包含数据源列表、已解析数据、加载/错误状态和选择/生成回调 |
| 输入参数 | dataSources: DataSource[], parsedData: ParsedData \| null, loading: boolean, parseError: string \| null, onSelectDataSource: (dataSourceId: string) => void, onGenerateChart: (config: ChartConfig) => void |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const props: DataPanelProps = { dataSources: scene.dataSources, parsedData, loading: false, parseError: null, onSelectDataSource: handleSelect, onGenerateChart: handleGenerate }` |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 补充文档 |

### API-0182 FlowchartLayoutEngine

| 字段 | 内容 |
|---|---|
| 序号 | API-0182 |
| 名称 | FlowchartLayoutEngine |
| 所属系统 | modules |
| 所属模块 | flowchart/layout |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 流程图自动布局引擎，实现 LayoutEngine 接口。使用简化 dagre 式算法：最长路径 rank 分配、barycenter 启发式交叉减少、正交边界路由。支持 TB（从上到下）、LR（从左到右）、BT（从下到上）、RL（从右到左）四种方向 |
| 输入参数 | nodes: LayoutNode[]（待布局节点列表，含 id/width/height）, edges: LayoutEdge[]（含 source/target/connectorId）, options?: LayoutOptions（方向、水平间距、垂直间距等配置） |
| 输出参数 | LayoutResult（含 nodes: LayoutNodeResult[] 节点位置、edges: LayoutEdgeResult[] 边路由点、totalBBox: BBox 总包围盒） |
| 典型用例 | const result = flowchartLayoutEngine.layout(nodes, edges, { direction: 'TB', hSpacing: 100, vSpacing: 80 }) |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0183 flowchartLayoutEngine

| 字段 | 内容 |
|---|---|
| 序号 | API-0183 |
| 名称 | flowchartLayoutEngine |
| 所属系统 | modules |
| 所属模块 | flowchart/layout |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | FlowchartLayoutEngine 的单例实例 |
| 输入参数 | 无 |
| 输出参数 | FlowchartLayoutEngine 实例 |
| 典型用例 | import { flowchartLayoutEngine } from './modules/flowchart/layout' |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0184 LayoutCommand

| 字段 | 内容 |
|---|---|
| 序号 | API-0184 |
| 名称 | LayoutCommand |
| 所属系统 | core |
| 所属模块 | commands |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 布局命令，将自动布局操作纳入命令系统。封装三个原子操作：提取布局节点和边、运行 LayoutEngine 计算位置和路由、应用 LayoutResult 到场景。保存布局前位置和路由以支持撤销 |
| 输入参数 | engine: LayoutEngine（布局引擎）, elementIds: string[]（参与布局的元素 ID 列表）, options?: LayoutOptions（布局配置） |
| 输出参数 | 无（命令执行修改场景状态） |
| 典型用例 | const cmd = new LayoutCommand(flowchartLayoutEngine, ['a', 'b', 'c1'], { direction: 'LR' }); executor.execute(cmd) |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0185 createLayoutCommand

| 字段 | 内容 |
|---|---|
| 序号 | API-0185 |
| 名称 | createLayoutCommand |
| 所属系统 | core |
| 所属模块 | commands |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 创建 LayoutCommand 的工厂函数 |
| 输入参数 | engine: LayoutEngine, elementIds: string[], options?: LayoutOptions |
| 输出参数 | LayoutCommand |
| 典型用例 | const cmd = createLayoutCommand(flowchartLayoutEngine, ids, { direction: 'TB' }) |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0186 RtlLayoutEngine

| 字段 | 内容 |
|---|---|
| 序号 | API-0186 |
| 名称 | RtlLayoutEngine |
| 所属系统 | modules |
| 所属模块 | rtl/layout |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | RTL 硬件模块连接图自动布局引擎，实现 LayoutEngine 接口。默认 LR（左到右）数据流方向，使用简化 dagre 式算法进行 rank 分配、port-position-aware 节点排序减少交叉、正交边界路由。额外增强：bus 信号线偏移可视化、clock/reset 信号元数据标记、折叠模块高度压缩。支持 TB/LR/BT/RL 四种方向 |
| 输入参数 | nodes: LayoutNode[]（待布局节点）, edges: LayoutEdge[]（边列表）, options?: LayoutOptions（布局选项，默认 direction='LR'） |
| 输出参数 | LayoutResult（nodes: LayoutNodeResult[] 节点位置, edges: LayoutEdgeResult[] 边路由, totalBBox: BBox 总包围盒） |
| 典型用例 | const result = rtlLayoutEngine.layout(nodes, edges, { direction: 'LR', hSpacing: 120 }) |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0187 rtlLayoutEngine

| 字段 | 内容 |
|---|---|
| 序号 | API-0187 |
| 名称 | rtlLayoutEngine |
| 所属系统 | modules |
| 所属模块 | rtl/layout |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | RtlLayoutEngine 的单例实例 |
| 输入参数 | 无 |
| 输出参数 | RtlLayoutEngine 实例 |
| 典型用例 | import { rtlLayoutEngine } from './modules/rtl/layout' |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0188 extractRtlLayoutNodes

| 字段 | 内容 |
|---|---|
| 序号 | API-0188 |
| 名称 | extractRtlLayoutNodes |
| 所属系统 | modules |
| 所属模块 | rtl/layout |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 从场景元素中提取 RTL 布局节点。与通用 extractLayoutNodes 区别：对 rtlModule 元素提取 moduleName/instanceName/ports/portCount/inputPortCount/outputPortCount/hasClock/hasReset 到 metadata，折叠模块降低有效高度（40px），排除 rtlPort 和 connector 元素 |
| 输入参数 | elements: SceneElement[]（场景元素数组）, elementIds: Set<string>（需要包含的元素 ID） |
| 输出参数 | LayoutNode[] - 含 RTL 元数据的布局节点数组 |
| 典型用例 | const nodes = extractRtlLayoutNodes(scene.elements, new Set(['mod1', 'mod2'])) |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0189 extractRtlLayoutEdges

| 字段 | 内容 |
|---|---|
| 序号 | API-0189 |
| 名称 | extractRtlLayoutEdges |
| 所属系统 | modules |
| 所属模块 | rtl/layout |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 从场景连接线中提取 RTL 布局边。与通用 extractLayoutEdges 区别：读取 connector 的 semanticKind 标记 signalType（rtl-net/rtl-bus），提取 source.anchorId/target.anchorId 记录端口连接关系，检测 clock/reset 信号（从锚点名或标签文本识别 clk/rst/clock/reset）并标记 highlightSignal 元数据 |
| 输入参数 | elements: SceneElement[]（场景元素数组）, elementIds: Set<string>（布局节点 ID 集合） |
| 输出参数 | LayoutEdge[] - 含 RTL 信号类型/端口/时钟复位标记的布局边数组 |
| 典型用例 | const edges = extractRtlLayoutEdges(scene.elements, new Set(['mod1', 'mod2'])) |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0190 RtlLayoutOptions

| 字段 | 内容 |
|---|---|
| 序号 | API-0190 |
| 名称 | RtlLayoutOptions |
| 所属系统 | modules |
| 所属模块 | rtl/layout |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | RTL 布局扩展选项接口，继承 LayoutOptions 添加 RTL 专用配置：highlightClockReset 控制是否输出时钟复位元数据标记，busSpacing 控制 bus 信号线垂直偏置量（默认 30） |
| 输入参数 | highlightClockReset?: boolean, busSpacing?: number（默认 30） |
| 输出参数 | 无（接口类型） |
| 典型用例 | const opts: RtlLayoutOptions = { direction: 'LR', busSpacing: 40, highlightClockReset: true } |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0191 RtlLayoutCommand

| 字段 | 内容 |
|---|---|
| 序号 | API-0191 |
| 名称 | RtlLayoutCommand |
| 所属系统 | modules |
| 所属模块 | rtl/layout |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | RTL 布局命令，将自动布局操作纳入命令系统。使用 RTL 专用提取函数（extractRtlLayoutNodes/extractRtlLayoutEdges）提供端口/信号类型元数据，通过 RtlLayoutEngine 计算布局，保存前态支持撤销/重做。符合 SceneCommand 接口 |
| 输入参数 | engine: RtlLayoutEngine, elementIds: string[], options?: RtlLayoutOptions |
| 输出参数 | 无（命令执行修改场景状态） |
| 典型用例 | const cmd = new RtlLayoutCommand(rtlLayoutEngine, ['mod1', 'mod2', 'c1'], { direction: 'LR' }); executor.execute(cmd) |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0192 createRtlLayoutCommand

| 字段 | 内容 |
|---|---|
| 序号 | API-0192 |
| 名称 | createRtlLayoutCommand |
| 所属系统 | modules |
| 所属模块 | rtl/layout |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 创建 RtlLayoutCommand 的工厂函数，使用默认 rtlLayoutEngine 实例 |
| 输入参数 | elementIds: string[], options?: RtlLayoutOptions |
| 输出参数 | RtlLayoutCommand |
| 典型用例 | const cmd = createRtlLayoutCommand(['mod1', 'mod2', 'c1'], { direction: 'LR' }) |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0193 MindmapLayoutEngine

| 字段 | 内容 |
|---|---|
| 序号 | API-0193 |
| 名称 | MindmapLayoutEngine |
| 所属系统 | modules |
| 所属模块 | mindmap/layout |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 思维导图自动布局引擎，实现 LayoutEngine 接口。支持两种布局模式：lr-split（默认，根节点居中，子节点交替左右侧排列，每个分支水平向外延伸）和 radial（根节点居中，子节点按扇形角度均匀分布，每层半径递增）。折叠的节点子树不参与布局计算 |
| 输入参数 | LayoutEngine 接口布局方法：nodes: LayoutNode[]（待布局节点，含 mindNode 元数据 parentId/childrenIds/collapsed）, edges: LayoutEdge[]（边列表）, options?: LayoutOptions（支持 hSpacing/vSpacing 间距控制，extra.mode 控制布局模式） |
| 输出参数 | LayoutResult — 含 nodes: LayoutNodeResult[] 节点位置、edges: LayoutEdgeResult[] 贝塞尔曲线路由点、totalBBox: BBox 总包围盒 |
| 典型用例 | const result = mindmapLayoutEngine.layout(nodes, edges, { extra: { mode: 'lr-split' }, hSpacing: 80 }) |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0194 mindmapLayoutEngine

| 字段 | 内容 |
|---|---|
| 序号 | API-0194 |
| 名称 | mindmapLayoutEngine |
| 所属系统 | modules |
| 所属模块 | mindmap/layout |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | MindmapLayoutEngine 的单例实例 |
| 输入参数 | 无 |
| 输出参数 | MindmapLayoutEngine 实例 |
| 典型用例 | import { mindmapLayoutEngine } from './modules/mindmap/layout' |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0195 extractMindmapLayoutNodes

| 字段 | 内容 |
|---|---|
| 序号 | API-0195 |
| 名称 | extractMindmapLayoutNodes |
| 所属系统 | modules |
| 所属模块 | mindmap/layout |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 从场景元素中提取思维导图布局节点。与通用 extractLayoutNodes 区别：对 mindNode 类型元素提取 parentId、childrenIds、collapsed、text 到 metadata，支持 shape 类型元素作为节点。排除 connector 和 rtlPort 等非节点类型 |
| 输入参数 | elements: SceneElement[]（场景元素数组）, elementIds: Set<string>（需要包含的元素 ID） |
| 输出参数 | LayoutNode[] — 含父/子节点 ID、折叠状态、文本等元数据的布局节点数组 |
| 典型用例 | const nodes = extractMindmapLayoutNodes(scene.elements, new Set(['root', 'topic1'])) |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0196 extractMindmapLayoutEdges

| 字段 | 内容 |
|---|---|
| 序号 | API-0196 |
| 名称 | extractMindmapLayoutEdges |
| 所属系统 | modules |
| 所属模块 | mindmap/layout |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 从场景连接线中提取思维导图布局边。过滤出两端 elementId 都在给定节点集合中的 connector 元素，映射 source/target 元素 ID 和 connectorId |
| 输入参数 | elements: SceneElement[]（场景元素数组）, elementIds: Set<string>（布局节点 ID 集合） |
| 输出参数 | LayoutEdge[] — 布局输入边数组 |
| 典型用例 | const edges = extractMindmapLayoutEdges(scene.elements, new Set(['root', 'topic1'])) |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0197 MindmapLayoutOptions

| 字段 | 内容 |
|---|---|
| 序号 | API-0197 |
| 名称 | MindmapLayoutOptions |
| 所属系统 | modules |
| 所属模块 | mindmap/layout |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 思维导图布局扩展选项接口，继承 LayoutOptions 添加 mode 字段控制布局模式（radial 或 lr-split） |
| 输入参数 | mode?: MindmapLayoutMode（'radial' | 'lr-split'，默认 'lr-split'） |
| 输出参数 | 无（接口类型） |
| 典型用例 | const opts: MindmapLayoutOptions = { mode: 'radial', hSpacing: 100 } |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0198 MindmapLayoutMode

| 字段 | 内容 |
|---|---|
| 序号 | API-0198 |
| 名称 | MindmapLayoutMode |
| 所属系统 | modules |
| 所属模块 | mindmap/layout |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 思维导图布局模式类型。radial=根节点居中子节点扇形辐射，lr-split=根节点居中子节点交替左右分列 |
| 输入参数 | 无（类型别名） |
| 输出参数 | 'radial' | 'lr-split' |
| 典型用例 | const mode: MindmapLayoutMode = 'lr-split' |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0199 MindmapLayoutCommand

| 字段 | 内容 |
|---|---|
| 序号 | API-0199 |
| 名称 | MindmapLayoutCommand |
| 所属系统 | modules |
| 所属模块 | mindmap/layout |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 思维导图布局命令，将自动布局操作纳入命令系统。使用思维导图专用提取函数（extractMindmapLayoutNodes/extractMindmapLayoutEdges）获取树结构和折叠状态元数据，通过 MindmapLayoutEngine 计算布局，保存前态支持撤销/重做。符合 SceneCommand 接口 |
| 输入参数 | engine: MindmapLayoutEngine, elementIds: string[], options?: MindmapLayoutOptions |
| 输出参数 | 无（命令执行修改场景状态） |
| 典型用例 | const cmd = new MindmapLayoutCommand(mindmapLayoutEngine, ['root', 'topic1', 'c1'], { mode: 'lr-split' }); executor.execute(cmd) |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0200 createMindmapLayoutCommand

| 字段 | 内容 |
|---|---|
| 序号 | API-0200 |
| 名称 | createMindmapLayoutCommand |
| 所属系统 | modules |
| 所属模块 | mindmap/layout |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 创建 MindmapLayoutCommand 的工厂函数，使用默认 mindmapLayoutEngine 实例 |
| 输入参数 | elementIds: string[], options?: MindmapLayoutOptions |
| 输出参数 | MindmapLayoutCommand |
| 典型用例 | const cmd = createMindmapLayoutCommand(['root', 'topic1', 'c1'], { mode: 'radial' }) |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0201 TopologyLayoutEngine

| 字段 | 内容 |
|---|---|
| 序号 | API-0201 |
| 名称 | TopologyLayoutEngine |
| 所属系统 | modules |
| 所属模块 | topology/layout |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 网络拓扑图自动布局引擎，实现 LayoutEngine 接口。支持两种模式：hierarchical（按网络层级 core/distribution/access 分层排列，默认 TB 方向）和 force-directed（力导向迭代模拟）。设备类型自动分配 rank：router=0(core), switch=1(distribution), firewall/loadBalancer/gateway=2, server=3(access)。支持容器子网区域自动扩边包含子设备。使用简化 dagre 式算法（最长路径 rank + barycenter 交叉减少 + 正交边路由） |
| 输入参数 | nodes: LayoutNode[], edges: LayoutEdge[], options?: LayoutOptions |
| 输出参数 | LayoutResult（含节点位置、边路由和总包围盒） |
| 典型用例 | topologyLayoutEngine.layout(nodes, edges, { direction: 'TB', extra: { mode: 'hierarchical' } }) |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0202 topologyLayoutEngine

| 字段 | 内容 |
|---|---|
| 序号 | API-0202 |
| 名称 | topologyLayoutEngine |
| 所属系统 | modules |
| 所属模块 | topology/layout |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | TopologyLayoutEngine 的单例实例 |
| 输入参数 | 无 |
| 输出参数 | TopologyLayoutEngine 实例 |
| 典型用例 | import { topologyLayoutEngine } from './modules/topology/layout' |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0203 extractTopologyLayoutNodes

| 字段 | 内容 |
|---|---|
| 序号 | API-0203 |
| 名称 | extractTopologyLayoutNodes |
| 所属系统 | modules |
| 所属模块 | topology/layout |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 从场景元素中提取拓扑布局节点。仅提取 topologyNode 和 container 类型元素。对 topologyNode 元素提取 deviceType、label、properties 到 metadata，并根据设备类型自动分配 rank。对 container 元素提取 isContainer/containerKind/childElementIds |
| 输入参数 | elements: SceneElement[], elementIds: Set<string> |
| 输出参数 | LayoutNode[] — 含设备类型、rank、容器信息等元数据的布局节点数组 |
| 典型用例 | const nodes = extractTopologyLayoutNodes(scene.elements, new Set(['router1', 'switch1'])) |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0204 extractTopologyLayoutEdges

| 字段 | 内容 |
|---|---|
| 序号 | API-0204 |
| 名称 | extractTopologyLayoutEdges |
| 所属系统 | modules |
| 所属模块 | topology/layout |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 从场景连接线中提取拓扑布局边。过滤出两端 elementId 都在给定节点集合中的 connector 元素，丰富边元数据含 semanticKind 和 linkLabels |
| 输入参数 | elements: SceneElement[], elementIds: Set<string> |
| 输出参数 | LayoutEdge[] — 含链路标签和语义类型的布局输入边数组 |
| 典型用例 | const edges = extractTopologyLayoutEdges(scene.elements, new Set(['router1', 'switch1'])) |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0205 TopologyLayoutOptions

| 字段 | 内容 |
|---|---|
| 序号 | API-0205 |
| 名称 | TopologyLayoutOptions |
| 所属系统 | modules |
| 所属模块 | topology/layout |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 拓扑布局扩展选项接口，继承 LayoutOptions。添加 mode 字段和 containerPadding 字段 |
| 输入参数 | mode?: TopologyLayoutMode（默认 'hierarchical'）, containerPadding?: number（默认 30） |
| 输出参数 | 无（接口类型） |
| 典型用例 | const opts: TopologyLayoutOptions = { mode: 'force-directed', containerPadding: 40 } |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0206 TopologyLayoutMode

| 字段 | 内容 |
|---|---|
| 序号 | API-0206 |
| 名称 | TopologyLayoutMode |
| 所属系统 | modules |
| 所属模块 | topology/layout |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 拓扑布局模式类型。hierarchical=按网络层级分层排列，force-directed=力导向算法迭代模拟 |
| 输入参数 | 无（类型别名） |
| 输出参数 | 'hierarchical' | 'force-directed' |
| 典型用例 | const mode: TopologyLayoutMode = 'hierarchical' |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0207 TopologyLayoutCommand

| 字段 | 内容 |
|---|---|
| 序号 | API-0207 |
| 名称 | TopologyLayoutCommand |
| 所属系统 | modules |
| 所属模块 | topology/layout |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 网络拓扑布局命令，将自动布局纳入命令系统。使用拓扑专用提取函数获取设备类型和链路元数据，通过 TopologyLayoutEngine 计算布局。保存前态（位置、尺寸、连接线路由）支持撤销/重做 |
| 输入参数 | engine: TopologyLayoutEngine, elementIds: string[], options?: TopologyLayoutOptions |
| 输出参数 | 无（命令执行修改场景状态） |
| 典型用例 | const cmd = new TopologyLayoutCommand(topologyLayoutEngine, ['router1', 'switch1', 'c1'], { mode: 'hierarchical' }); executor.execute(cmd) |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建 |

### API-0208 createTopologyLayoutCommand

| 字段 | 内容 |
|---|---|
| 序号 | API-0208 |
| 名称 | createTopologyLayoutCommand |
| 所属系统 | modules |
| 所属模块 | topology/layout |
| 状态 | 活跃 |
| 创建日期 | 2026-05-21 |
| 最后修订日期 | 2026-05-21 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | 创建 TopologyLayoutCommand 的工厂函数，使用默认 topologyLayoutEngine 实例 |
| 输入参数 | elementIds: string[], options?: TopologyLayoutOptions |
| 输出参数 | TopologyLayoutCommand |
| 典型用例 | const cmd = createTopologyLayoutCommand(['router1', 'switch1', 'c1'], { mode: 'hierarchical' }) |
| 修订历史 | 2026-05-21, OpenCode/deepseek-v4-pro, 初始创建 |
