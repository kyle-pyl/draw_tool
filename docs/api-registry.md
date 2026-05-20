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
| 最后修订日期 | 2026-05-19 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | React SVG 画布渲染组件。接收 SceneDocument 和 Viewport 作为 props，按图层 order 升序渲染所有元素到 SVG。支持渲染 shape（rect、circle、ellipse、polygon、path）、text（含文本样式、背景色、边框渲染）、image（img 引用）、connector（polyline 占位）。支持滚轮缩放（以鼠标位置为中心）、空格+拖拽平移、中键拖拽平移交互，光标样式自动切换。支持元素单选（点击）、多选（Shift+点击）、空白区域取消选中、锁定元素不可选中、框选（marquee selection）。支持绘制工具（rect/circle/ellipse/line/polygon/text），text 工具点击即创建文本无需拖拽。支持文本元素双击编辑（onTextEditRequest 回调） |
| 输入参数 | props: { scene: SceneDocument, viewport: Viewport, width?: number | string, height?: number | string, className?: string, onViewportChange?: () => void, selectionManager?: SelectionManager, onSelectionChange?: () => void, conflictHighlighter?: ConflictHighlighter, activeTool?: DrawingToolType, drawingLayerId?: string, onDrawComplete?: (input: ElementInput) => void, onTextEditRequest?: (elementId: string) => void } |
| 输出参数 | ReactElement - SVG 元素，包含按图层组织的 `<g>` 元素树、框选矩形和选择覆盖层 |
| 典型用例 | `<CanvasView scene={scene} viewport={viewport} selectionManager={selectionMgr} onViewportChange={update} onSelectionChange={update} />` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建（T-02-02）；2026-05-19, OpenCode/deepseek-v4-pro, T-02-03 新增 onViewportChange prop、滚轮缩放、空格/中键拖拽平移和光标样式切换；2026-05-19, OpenCode/deepseek-v4-pro, T-02-04 新增 selectionManager/onSelectionChange props、元素点击选择和多选交互、选择覆盖层渲染；2026-05-19, OpenCode/deepseek-v4-pro, T-02-05 新增框选（marquee selection）功能：空白区域拖拽选区、Shift+框选追加、视口变换适配、锁定/隐藏元素过滤；2026-05-19, OpenCode/deepseek-v4-pro, T-04-04 隐藏图层改为 visibility:hidden（保留 DOM 空间）、锁定图层（layer.locked）元素不响应点击和框选交互、marquee 框选排除锁定图层内元素；2026-05-20, OpenCode/deepseek-v4-pro, T-05-07 新增 activeTool/drawingLayerId/onDrawComplete props、拖拽绘制（rect/circle/ellipse/line）、多边形逐点绘制、实时预览渲染、crosshair 光标；2026-05-20, OpenCode/deepseek-v4-pro, T-05-08 新增 onTextEditRequest prop（文本双击编辑）、text 工具（点击创建文本）、renderTextElement 支持背景色/边框渲染 |

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
| 最后修订日期 | 2026-05-19 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | CreateElementCommand 的元素输入接口。定义创建新元素所需的全部参数，包括 type（必需）、layerId（必需）、transform、style 及各类元素特有字段（shapeKind、text、src 等）。buildElementFromInput 函数据此构建完整的 SceneElement 对象 |
| 输入参数 | type: ElementType, layerId: string, name?, transform: Transform2D, style: ElementStyle, visible?, locked?, shapeKind?, text?, src?, 等 |
| 输出参数 | 无（接口类型） |
| 典型用例 | `const input: ElementInput = { type: 'shape', layerId: 'l1', shapeKind: 'rect', transform: { x: 0, y: 0, width: 100, height: 50, rotation: 0, scaleX: 1, scaleY: 1 }, style: { fill: '#fff', stroke: '#000', strokeWidth: 2, opacity: 1 } }` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建（T-05-02）|

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
| 最后修订日期 | 2026-05-19 |
| 创建者 | OpenCode/deepseek-v4-pro |
| 最后修订者 | OpenCode/deepseek-v4-pro |
| 功能描述 | UpdateElementCommand 的变更参数类型。支持修改元素的 style、transform、visible、locked、name、text、shapeKind 等部分属性。修改 transform（位置/尺寸）时触发碰撞检测 |
| 输入参数 | Partial<{ style: Partial<ElementStyle>, transform: Partial<Transform2D>, visible, locked, name, text, ... }> |
| 输出参数 | 无（类型别名） |
| 典型用例 | `const changes: ElementChanges = { style: { fill: '#f00' }, visible: false }` |
| 修订历史 | 2026-05-19, OpenCode/deepseek-v4-pro, 初始创建（T-05-04）|

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
| 输出参数 | 'select' \| 'rect' \| 'circle' \| 'ellipse' \| 'line' \| 'polygon' \| 'text' |
| 典型用例 | `const tool: DrawingToolType = 'rect'` |
| 修订历史 | 2026-05-20, OpenCode/deepseek-v4-pro, 初始创建（T-05-07）；2026-05-20, OpenCode/deepseek-v4-pro, T-05-08 新增 'text' 类型 |

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
