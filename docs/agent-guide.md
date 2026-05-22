# Agent 生成指南

本指南面向需要生成 scene.json 的 AI Agent。覆盖 scene.json Schema 参考、数据格式、所有字段定义、错误码和完整的生成示例。

## 1. 概述

绘图工具通过 `scene.json` 文件描述完整的绘图场景。Agent 应根据用户的自然语言需求和数据文件，生成合法的 `scene.json`，工具负责校验、渲染和允许人类继续编辑。

文件必须命名为 `scene.json`，放置在项目根目录中，使用 JSON 格式，UTF-8 编码。

## 2. 顶层结构

```json
{
  "schemaVersion": "1.0.0",
  "project": { ... },
  "canvas": { ... },
  "viewport": { ... },
  "rules": { ... },
  "layers": [ ... ],
  "elements": [ ... ],
  "groups": [ ... ],
  "dataSources": [ ... ],
  "charts": [ ... ],
  "templates": [ ... ],
  "exportPresets": [ ... ]
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| schemaVersion | string | **是** | 当前版本 `"1.0.0"`，用于兼容性判断 |
| project | ProjectMeta | **是** | 项目元数据：名称、作者、描述 |
| canvas | CanvasConfig | **是** | 画布单位、背景、默认字体、网格配置 |
| viewport | ViewportState | 否 | 当前缩放和平移状态，可在运行时自动更新 |
| rules | SceneRules | **是** | 图层数上限、碰撞策略、连接线豁免 |
| layers | Layer[] | **是** | 所有图层定义（至少 1 个图层） |
| elements | SceneElement[] | **是** | 所有可渲染元素 |
| groups | ElementGroup[] | 否 | 跨层元素分组 |
| dataSources | DataSource[] | 否 | 数据文件引用和解析配置 |
| charts | ChartDefinition[] | 否 | 数据绑定图表定义 |
| templates | TemplateInstance[] | 否 | 模板实例记录 |
| exportPresets | ExportPreset[] | 否 | 预设导出配置 |

## 3. 字段详细说明

### 3.1 ProjectMeta

```json
{
  "name": "My Figure",
  "author": "Agent Name",
  "description": "A flowchart showing the login process."
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | **是** | 项目/图形名称 |
| author | string | 否 | 作者名称 |
| createdAt | string | 否 | ISO 8601 创建时间 |
| updatedAt | string | 否 | ISO 8601 更新时间 |
| description | string | 否 | 项目描述 |

### 3.2 CanvasConfig

```json
{
  "units": "px",
  "background": "#ffffff",
  "defaultFont": "Arial",
  "gridSize": 10,
  "snapToGrid": true
}
```

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| units | string | 否 | `"px"` | 坐标单位 |
| background | string | 否 | `"#ffffff"` | 背景颜色（CSS 值） |
| defaultFont | string | 否 | `"Arial"` | 默认字体 |
| gridSize | number | 否 | 0 | 网格间距（0=禁用） |
| snapToGrid | boolean | 否 | false | 是否启用网格吸附 |
| artboard | object | 否 | - | 画板尺寸 `{ width, height }` |

### 3.3 ViewportState

```json
{
  "zoom": 1,
  "offsetX": 0,
  "offsetY": 0,
  "selectedElementId": "e1"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| zoom | number | **是** | 当前缩放比例 |
| offsetX | number | **是** | 水平平移偏移 |
| offsetY | number | **是** | 垂直平移偏移 |
| selectedElementId | string | 否 | 最后选中的元素 ID |

### 3.4 SceneRules

```json
{
  "maxLayerCount": 10,
  "collisionStrategy": "bbox",
  "hiddenElementsCollide": true,
  "lockedElementsCollide": true,
  "connectorsExempt": true
}
```

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| maxLayerCount | number | **是** | - | 最大图层数量 |
| collisionStrategy | string | 否 | `"bbox"` | 碰撞策略：`"bbox"` 或 `"geometry"` |
| hiddenElementsCollide | boolean | 否 | true | 隐藏元素是否参与碰撞检测 |
| lockedElementsCollide | boolean | 否 | true | 锁定元素是否参与碰撞检测 |
| connectorsExempt | boolean | 否 | true | 连接线是否豁免同层碰撞规则 |

### 3.5 Layer

```json
{
  "id": "l_shapes",
  "name": "Shapes Layer",
  "order": 1,
  "visible": true,
  "locked": false,
  "defaultStyle": {
    "fill": "#4A90D9",
    "stroke": "#333333",
    "strokeWidth": 2,
    "opacity": 1
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | **是** | 图层唯一标识符 |
| name | string | **是** | 图层显示名称 |
| order | number | **是** | 渲染顺序（升序：order 小的在下层，大的在上层） |
| visible | boolean | **是** | 图层是否可见 |
| locked | boolean | **是** | 图层是否锁定（锁定后元素不可编辑） |
| defaultStyle | Partial\<ElementStyle\> | 否 | 该图层新元素的默认样式 |
| metadata | object | 否 | 扩展元数据 |

**重要规则**：
- 图层 ID 必须在 layers 数组中唯一
- order 值决定渲染上下顺序，建议使用连续整数（如 1, 2, 3）
- 同层内普通元素（shape、text、image、container 等）**不允许包围盒重叠**
- connector 元素豁免同层重叠约束，可跨层连接

### 3.6 元素通用字段 (BaseElement)

所有元素共享以下字段：

```json
{
  "id": "e_001",
  "type": "shape",
  "layerId": "l_shapes",
  "name": "My Rectangle",
  "transform": {
    "x": 100, "y": 100,
    "width": 120, "height": 80,
    "rotation": 0, "scaleX": 1, "scaleY": 1
  },
  "style": {
    "fill": "#4A90D9",
    "stroke": "#333333",
    "strokeWidth": 2,
    "opacity": 1
  },
  "visible": true,
  "locked": false
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | **是** | 全局唯一标识符，建议使用有意义的前缀（如 `e_`、`fn_`） |
| type | string | **是** | 元素类型（见 §3.7） |
| layerId | string | **是** | 所属图层 ID，必须存在于 layers 数组中 |
| name | string | 否 | 人类可读名称 |
| transform | Transform2D | **是** | 位置、尺寸、旋转和缩放 |
| style | ElementStyle | **是** | 视觉样式属性 |
| visible | boolean | **是** | 是否渲染可见 |
| locked | boolean | **是** | 是否锁定不可编辑 |
| tags | string[] | 否 | 用户自定义标签 |
| metadata | object | 否 | 扩展元数据 |

### 3.7 元素类型详解

#### 3.7.1 Transform2D

```json
{
  "x": 100,
  "y": 200,
  "width": 120,
  "height": 80,
  "rotation": 0,
  "scaleX": 1,
  "scaleY": 1
}
```

| 字段 | 说明 |
|------|------|
| x, y | 画布坐标（左上角位置） |
| width, height | 元素尺寸 |
| rotation | 旋转角度（度数，顺时针） |
| scaleX, scaleY | 缩放倍数（1.0 = 原始大小） |

#### 3.7.2 ElementStyle

```json
{
  "fill": "#4A90D9",
  "stroke": "#333333",
  "strokeWidth": 2,
  "opacity": 1
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| fill | string | **是** | 填充颜色（CSS 值） |
| stroke | string | **是** | 描边颜色（CSS 值） |
| strokeWidth | number | **是** | 描边宽度 |
| strokeDasharray | string | 否 | 虚线模式（如 `"5,3"`、`"10,5,2,5"`） |
| opacity | number | **是** | 整体透明度（0-1） |
| fillOpacity | number | 否 | 填充透明度覆盖（0-1） |
| strokeOpacity | number | 否 | 描边透明度覆盖（0-1） |
| fontSize | number | 否 | 字体大小 |
| fontFamily | string | 否 | 字体名称 |
| fontWeight | string | 否 | 字重（`"normal"`、`"bold"`） |
| fontStyle | string | 否 | 字形（`"normal"`、`"italic"`） |
| textAlign | string | 否 | 文本对齐（`"left"`、`"center"`、`"right"`） |
| textDecoration | string | 否 | 文本装饰（`"underline"`、`"line-through"`） |

#### 3.7.3 ShapeElement (`"shape"`)

```json
{
  "id": "fn_start",
  "type": "shape",
  "layerId": "l_nodes",
  "name": "Start",
  "transform": { "x": 300, "y": 30, "width": 140, "height": 50, "rotation": 0, "scaleX": 1, "scaleY": 1 },
  "style": { "fill": "#C8E6C9", "stroke": "#4CAF50", "strokeWidth": 2, "opacity": 1 },
  "visible": true,
  "locked": false,
  "shapeKind": "rect",
  "cornerRadius": [25, 25, 25, 25]
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| shapeKind | string | **是** | 形状类型：`"rect"`、`"circle"`、`"ellipse"`、`"polygon"`、`"path"` |
| cornerRadius | [number,number,number,number] | 否 | 圆角矩形四个角的圆角半径 [topLeft, topRight, bottomRight, bottomLeft] |
| points | {x,y}[] | 否 | 多边形顶点坐标（相对于元素原点），shapeKind 为 polygon 时使用 |
| pathCommands | string | 否 | SVG path 命令字符串，shapeKind 为 path 时使用 |

ShapeKind 说明：

| shapeKind | 渲染方式 | 示例 |
|-----------|----------|------|
| rect | 矩形，由 transform.width/height 决定尺寸 | 流程图处理节点 |
| circle | 正圆，直径 = min(width, height) | 连接点标记 |
| ellipse | 椭圆，由 width/height 决定轴长 | 泳道端头 |
| polygon | 多边形，由 points 数组定义顶点 | 菱形判断节点 |
| path | 自由路径，由 pathCommands 定义 | 自定义图标 |

Polygon 示例（菱形判断节点）：
```json
{
  "type": "shape",
  "shapeKind": "polygon",
  "points": [
    { "x": 90, "y": 0 },
    { "x": 180, "y": 50 },
    { "x": 90, "y": 100 },
    { "x": 0, "y": 50 }
  ],
  "transform": { "x": 200, "y": 300, "width": 180, "height": 100, "rotation": 0, "scaleX": 1, "scaleY": 1 }
}
```

#### 3.7.4 TextElement (`"text"`)

```json
{
  "id": "t_title",
  "type": "text",
  "layerId": "l_text",
  "name": "Title",
  "transform": { "x": 100, "y": 20, "width": 200, "height": 30, "rotation": 0, "scaleX": 1, "scaleY": 1 },
  "style": { "fill": "#333333", "stroke": "none", "strokeWidth": 0, "opacity": 1, "fontSize": 20, "fontFamily": "Arial", "fontWeight": "bold", "textAlign": "center" },
  "visible": true,
  "locked": false,
  "text": "Figure 1: System Architecture"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| text | string | **是** | 文本内容 |
| backgroundColor | string | 否 | 文本框背景色（CSS 值） |
| borderColor | string | 否 | 文本框边框色（CSS 值） |
| borderWidth | number | 否 | 文本框边框宽度 |

#### 3.7.5 ImageElement (`"image"`)

```json
{
  "id": "img_logo",
  "type": "image",
  "layerId": "l_images",
  "name": "Logo",
  "transform": { "x": 50, "y": 50, "width": 200, "height": 100, "rotation": 0, "scaleX": 1, "scaleY": 1 },
  "style": { "fill": "none", "stroke": "none", "strokeWidth": 0, "opacity": 1 },
  "visible": true,
  "locked": false,
  "src": "assets/logo.png",
  "originalWidth": 400,
  "originalHeight": 200,
  "objectFit": "contain"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| src | string | **是** | 图片路径（相对路径或 blob URL） |
| originalWidth | number | **是** | 原始图片宽度（用于宽高比计算） |
| originalHeight | number | **是** | 原始图片高度 |
| objectFit | string | 否 | 适应方式：`"fill"`、`"contain"`、`"cover"`、`"none"` |

#### 3.7.6 ConnectorElement (`"connector"`)

```json
{
  "id": "c_start_to_input",
  "type": "connector",
  "layerId": "l_connectors",
  "name": "Start to Input",
  "transform": { "x": 0, "y": 0, "width": 0, "height": 0, "rotation": 0, "scaleX": 1, "scaleY": 1 },
  "style": { "fill": "none", "stroke": "#666666", "strokeWidth": 2, "opacity": 1 },
  "visible": true,
  "locked": false,
  "source": { "elementId": "fn_start", "anchorId": "bottom", "x": 370, "y": 80 },
  "target": { "elementId": "fn_input", "x": 370, "y": 130 },
  "route": { "type": "straight", "points": [{ "x": 370, "y": 80 }, { "x": 370, "y": 130 }] },
  "arrowEnd": { "type": "triangle", "size": 1.2 },
  "semanticKind": "flow"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| source | ConnectorEndpoint | **是** | 起点端点 |
| target | ConnectorEndpoint | **是** | 终点端点 |
| route | ConnectorRoute | **是** | 路由定义 |
| labels | ConnectorLabel[] | 否 | 线上标签 |
| arrowStart | ArrowStyle | 否 | 起点箭头样式 |
| arrowEnd | ArrowStyle | 否 | 终点箭头样式 |
| semanticKind | string | 否 | 语义类型：`"flow"`、`"dependency"`、`"rtl-net"`、`"rtl-bus"`、`"network-link"`、`"mind-edge"` |

**ConnectorEndpoint：**

```json
{
  "elementId": "fn_start",
  "anchorId": "bottom",
  "x": 370,
  "y": 80
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| elementId | string | 否 | 锚定元素的 ID（不存在则为自由点） |
| anchorId | string | 否 | 锚点 ID（如 `"top"`、`"bottom"`、`"left"`、`"right"`、`"center"`、`"topLeft"` 等） |
| x | number | **是** | 端点绝对 x 坐标 |
| y | number | **是** | 端点绝对 y 坐标 |

**ConnectorRoute：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | **是** | 路由类型：`"straight"`、`"polyline"`、`"orthogonal"`、`"curve"` |
| points | {x,y}[] | **是** | 路径点数组（至少包含起点和终点） |

**ConnectorLabel：**

```json
{
  "text": "Yes",
  "position": 0.45,
  "offset": { "dx": 20, "dy": 0 }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| text | string | **是** | 标签文本 |
| position | number | **是** | 在线上的位置（0=起点, 0.5=中点, 1=终点） |
| offset | {dx,dy} | **是** | 标签偏移量 |

**ArrowStyle：**

```json
{
  "type": "triangle",
  "size": 1.2,
  "color": "#333333"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | **是** | 箭头类型：`"none"`、`"triangle"`、`"openTriangle"`、`"diamond"`、`"circle"` |
| size | number | 否 | 箭头大小倍数（默认 1.0） |
| color | string | 否 | 箭头颜色覆盖 |

#### 3.7.7 ContainerElement (`"container"`)

```json
{
  "id": "ctr_cloud",
  "type": "container",
  "layerId": "l_containers",
  "name": "Cloud Region",
  "transform": { "x": 50, "y": 50, "width": 400, "height": 300, "rotation": 0, "scaleX": 1, "scaleY": 1 },
  "style": { "fill": "#F0F8FF", "stroke": "#B0C4DE", "strokeWidth": 2, "opacity": 0.5, "strokeDasharray": "8,4" },
  "visible": true,
  "locked": false,
  "containerLabel": "AWS Cloud"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| containerLabel | string | 否 | 容器标签文本 |

容器用虚线边框绘制，内部可包含其他元素（通过图层关系或分组）。

#### 3.7.8 RtlModuleElement (`"rtlModule"`)

```json
{
  "id": "rm_alu",
  "type": "rtlModule",
  "layerId": "l_rtl",
  "name": "ALU Module",
  "transform": { "x": 400, "y": 200, "width": 120, "height": 100, "rotation": 0, "scaleX": 1, "scaleY": 1 },
  "style": { "fill": "#E8F4FD", "stroke": "#1565C0", "strokeWidth": 2, "opacity": 1 },
  "visible": true,
  "locked": false,
  "moduleName": "ALU",
  "instanceName": "alu_inst",
  "parameters": { "WIDTH": 32 },
  "ports": [
    {
      "id": "p_alu_a",
      "type": "rtlPort",
      "layerId": "l_rtl",
      "name": "Operand A",
      "transform": { "x": 0, "y": 0, "width": 0, "height": 0, "rotation": 0, "scaleX": 1, "scaleY": 1 },
      "style": { "fill": "none", "stroke": "none", "strokeWidth": 0, "opacity": 1 },
      "visible": true,
      "locked": false,
      "direction": "input",
      "bitWidth": 32,
      "portName": "a"
    }
  ]
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| moduleName | string | **是** | 模块类型名（如 `"register"`、`"mux"`、`"ALU"`） |
| instanceName | string | **是** | 实例名（设计中唯一） |
| parameters | object | 否 | 泛型参数（如 `{"WIDTH": 32, "DEPTH": 16}`） |
| ports | RtlPortElement[] | 否 | 端口列表 |
| collapsed | boolean | 否 | 是否折叠显示 |

**RtlPortElement (`"rtlPort"`)：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| direction | string | **是** | 信号方向：`"input"`、`"output"`、`"inout"` |
| bitWidth | number | **是** | 位宽（1 为单比特） |
| portName | string | **是** | 端口信号名 |

#### 3.7.9 MindNodeElement (`"mindNode"`)

```json
{
  "id": "mn_root",
  "type": "mindNode",
  "layerId": "l_mindmap",
  "name": "Root",
  "transform": { "x": 400, "y": 300, "width": 120, "height": 50, "rotation": 0, "scaleX": 1, "scaleY": 1 },
  "style": { "fill": "#FF7043", "stroke": "#D84315", "strokeWidth": 2, "opacity": 1 },
  "visible": true,
  "locked": false,
  "text": "Main Topic",
  "childrenIds": ["mn_child1", "mn_child2"]
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| text | string | **是** | 节点内容文本 |
| parentId | string | 否 | 父节点 ID（根节点无） |
| childrenIds | string[] | 否 | 子节点 ID 列表 |
| collapsed | boolean | 否 | 子树是否折叠 |

#### 3.7.10 TopologyNodeElement (`"topologyNode"`)

```json
{
  "id": "tn_router_core",
  "type": "topologyNode",
  "layerId": "l_topo",
  "name": "Core Router",
  "transform": { "x": 400, "y": 100, "width": 80, "height": 80, "rotation": 0, "scaleX": 1, "scaleY": 1 },
  "style": { "fill": "#BBDEFB", "stroke": "#1565C0", "strokeWidth": 2, "opacity": 1 },
  "visible": true,
  "locked": false,
  "deviceType": "router",
  "label": "CR-01"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| deviceType | string | **是** | 设备类型：`"router"`、`"switch"`、`"server"`、`"cloud"`、`"firewall"`、`"loadBalancer"`、`"gateway"`、`"custom"` |
| label | string | 否 | 设备标签（如主机名） |
| properties | object | 否 | 设备属性（如 IP、型号、厂商） |

#### 3.7.11 ChartElement (`"chart"`)

```json
{
  "id": "ch_bar",
  "type": "chart",
  "layerId": "l_charts",
  "name": "Performance Chart",
  "transform": { "x": 50, "y": 50, "width": 600, "height": 400, "rotation": 0, "scaleX": 1, "scaleY": 1 },
  "style": { "fill": "none", "stroke": "none", "strokeWidth": 0, "opacity": 1 },
  "visible": true,
  "locked": false,
  "dataSourceId": "ds1",
  "chartType": "bar",
  "columnMappings": {
    "x": "category",
    "y": "value",
    "group": "series",
    "color": "series"
  },
  "options": {
    "title": "Performance Metrics",
    "xAxisLabel": "Category",
    "yAxisLabel": "Value",
    "colorScheme": "category10"
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| dataSourceId | string | **是** | 数据源 ID（引用 scene.dataSources 中的项） |
| chartType | string | **是** | 图表类型：`"bar"`、`"line"`、`"scatter"`、`"boxplot"`、`"histogram"`、`"heatmap"` |
| columnMappings | ColumnMappings | **是** | 列映射 |
| options | object | 否 | 图表渲染选项（标题、轴标签、配色等） |
| svgContent | string | 否 | 缓存的 SVG 内容（运行时生成） |

### 3.8 其他顶层字段

#### ElementGroup

```json
{
  "id": "g1",
  "name": "Shape Pair",
  "elementIds": ["e1", "e2"]
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | **是** | 分组唯一 ID |
| name | string | **是** | 分组名称 |
| elementIds | string[] | **是** | 组成员的元素 ID 列表 |

#### DataSource

```json
{
  "id": "ds1",
  "path": "data/measurements.csv",
  "type": "csv",
  "parseConfig": { "header": true, "delimiter": "," }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | **是** | 数据源唯一 ID |
| path | string | **是** | 相对路径（如 `"data/table.csv"`） |
| type | string | **是** | 文件类型：`"csv"`、`"json"`、`"xlsx"`、`"xls"` |
| parseConfig | object | 否 | 解析选项（如 `{"header": true}`） |

#### ChartDefinition

```json
{
  "id": "ch_def_1",
  "dataSourceId": "ds1",
  "chartType": "bar",
  "columnMappings": {
    "x": "category",
    "y": "value"
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | **是** | 图表定义唯一 ID |
| dataSourceId | string | **是** | 数据源 ID |
| chartType | string | **是** | 图表类型 |
| columnMappings | ColumnMappings | **是** | 列映射 |
| options | object | 否 | 渲染选项 |

#### TemplateInstance

```json
{
  "templateId": "tpl_rect",
  "position": { "x": 100, "y": 200 },
  "layerId": "l_shapes",
  "elementIds": ["e_new_001"]
}
```

#### ExportPreset

```json
{
  "id": "export_svg_full",
  "name": "Full SVG Export",
  "region": "full",
  "format": "svg",
  "options": { "background": "#ffffff", "margin": 20 }
}
```

| 字段 | 说明 |
|------|------|
| region | 导出区域：`"viewport"`、`"selection"`、`"artboard"`、`"full"` |
| format | 导出格式：`"svg"`、`"png"`、`"jpg"` |

## 4. 错误码参考

Agent 生成的 scene.json 会被 validator 校验。以下是所有可能的错误码及其含义，Agent 应据此修复生成的 JSON。

### 4.1 Schema 校验错误

| 错误码 | 说明 | 修复方式 |
|--------|------|----------|
| `SCHEMA_MISSING_ID` | 元素、图层或分组缺少 id 字段 | 为每个对象添加唯一 id 字符串 |
| `SCHEMA_INVALID_TYPE` | 元素 type 不是合法的 ElementType | 使用 §3.7 中列出的合法 type 值 |
| `SCHEMA_FIELD_TYPE_ERROR` | 字段类型错误（如数字字段给了字符串） | 检查字段类型与 schema 定义一致 |

### 4.2 引用完整性错误

| 错误码 | 说明 | 修复方式 |
|--------|------|----------|
| `REF_LAYER_NOT_FOUND` | 元素的 layerId 引用的图层不存在 | 确保 layerId 存在于 layers 数组中 |
| `REF_GROUP_NOT_FOUND` | 分组引用的 elementId 不存在 | 确保组内 elementIds 都在 elements 中 |
| `REF_CONNECTOR_ENDPOINT_NOT_FOUND` | 连接线端点引用的元素不存在 | 确保 source/target.elementId 存在 |

### 4.3 几何规则错误

| 错误码 | 说明 | 修复方式 |
|--------|------|----------|
| `GEO_SAME_LAYER_OVERLAP` | 同层内有普通元素包围盒重叠 | 移动元素到不同图层，或调整位置使其不重叠 |
| `GEO_MOVE_TARGET_CONFLICT` | 移动元素会导致目标位置重叠 | 选择不重叠的目标位置或图层 |

### 4.4 业务规则错误

| 错误码 | 说明 | 修复方式 |
|--------|------|----------|
| `RULE_MAX_LAYER_EXCEEDED` | 图层数量超过 rules.maxLayerCount | 合并图层或增加 maxLayerCount |
| `RULE_LOCKED_ELEMENT_EDITED` | 尝试编辑锁定的元素 | 先解锁元素再编辑 |
| `RULE_HIDDEN_OVERLAP` | 隐藏元素位置占用冲突（预留） | 调整隐藏元素位置 |

## 5. 校验器的工作流程

工具调用 `validateScene(data)` 时按以下顺序执行校验：

```
1. Schema 校验 → 检查必填字段和类型
2. 引用完整性校验 → 检查 layerId、connector 端点、group 引用
3. 几何规则校验 → 检查同层元素重叠（connector 豁免）
4. 业务规则校验 → 检查图层数量、锁定状态等
```

**失败即停止**：任一阶段校验失败，返回 `{ valid: false, errors: [...] }`。

合法场景示例返回值：
```json
{
  "valid": true,
  "errors": []
}
```

非法场景示例返回值：
```json
{
  "valid": false,
  "errors": [
    {
      "code": "GEO_SAME_LAYER_OVERLAP",
      "message": "Elements overlap in layer 'l_shapes': e1 and e2",
      "severity": "error",
      "layerIds": ["l_shapes"],
      "elementIds": ["e1", "e2"],
      "bboxes": [
        { "x": 100, "y": 100, "width": 120, "height": 80 },
        { "x": 150, "y": 120, "width": 100, "height": 60 }
      ],
      "suggestion": "Move one element to a different layer or adjust position to eliminate overlap"
    }
  ]
}
```

## 6. 生成示例

### 6.1 最小合法场景

```json
{
  "schemaVersion": "1.0.0",
  "project": {
    "name": "Minimal Example"
  },
  "canvas": {
    "units": "px",
    "background": "#ffffff",
    "defaultFont": "Arial",
    "gridSize": 0,
    "snapToGrid": false
  },
  "rules": {
    "maxLayerCount": 10,
    "collisionStrategy": "bbox",
    "hiddenElementsCollide": true,
    "lockedElementsCollide": true,
    "connectorsExempt": true
  },
  "layers": [
    {
      "id": "l1",
      "name": "Default Layer",
      "order": 1,
      "visible": true,
      "locked": false
    }
  ],
  "elements": [
    {
      "id": "e1",
      "type": "shape",
      "layerId": "l1",
      "transform": { "x": 100, "y": 100, "width": 100, "height": 80, "rotation": 0, "scaleX": 1, "scaleY": 1 },
      "style": { "fill": "#4A90D9", "stroke": "#333333", "strokeWidth": 2, "opacity": 1 },
      "visible": true,
      "locked": false,
      "shapeKind": "rect"
    }
  ],
  "groups": [],
  "dataSources": [],
  "charts": [],
  "templates": [],
  "exportPresets": []
}
```

### 6.2 多元素场景

```json
{
  "schemaVersion": "1.0.0",
  "project": {
    "name": "Multi-element Example",
    "author": "AI Agent",
    "description": "Demonstrates shapes, text, and connectors on separate layers."
  },
  "canvas": {
    "units": "px",
    "background": "#ffffff",
    "defaultFont": "Arial",
    "gridSize": 0,
    "snapToGrid": false
  },
  "rules": {
    "maxLayerCount": 10,
    "collisionStrategy": "bbox",
    "hiddenElementsCollide": true,
    "lockedElementsCollide": true,
    "connectorsExempt": true
  },
  "layers": [
    {
      "id": "l_shapes",
      "name": "Shapes",
      "order": 1,
      "visible": true,
      "locked": false,
      "defaultStyle": {
        "fill": "#BBDEFB",
        "stroke": "#1565C0",
        "strokeWidth": 2,
        "opacity": 1
      }
    },
    {
      "id": "l_text",
      "name": "Labels",
      "order": 2,
      "visible": true,
      "locked": false,
      "defaultStyle": {
        "fill": "#333333",
        "stroke": "none",
        "strokeWidth": 0,
        "opacity": 1,
        "fontSize": 14,
        "fontFamily": "Arial",
        "fontWeight": "bold"
      }
    },
    {
      "id": "l_connectors",
      "name": "Connectors",
      "order": 3,
      "visible": true,
      "locked": false
    }
  ],
  "elements": [
    {
      "id": "s1",
      "type": "shape",
      "layerId": "l_shapes",
      "name": "Box A",
      "transform": { "x": 100, "y": 100, "width": 100, "height": 60, "rotation": 0, "scaleX": 1, "scaleY": 1 },
      "style": { "fill": "#BBDEFB", "stroke": "#1565C0", "strokeWidth": 2, "opacity": 1 },
      "visible": true,
      "locked": false,
      "shapeKind": "rect",
      "cornerRadius": [6, 6, 6, 6]
    },
    {
      "id": "s2",
      "type": "shape",
      "layerId": "l_shapes",
      "name": "Box B",
      "transform": { "x": 350, "y": 100, "width": 100, "height": 60, "rotation": 0, "scaleX": 1, "scaleY": 1 },
      "style": { "fill": "#C8E6C9", "stroke": "#2E7D32", "strokeWidth": 2, "opacity": 1 },
      "visible": true,
      "locked": false,
      "shapeKind": "rect",
      "cornerRadius": [6, 6, 6, 6]
    },
    {
      "id": "t1",
      "type": "text",
      "layerId": "l_text",
      "name": "Label A",
      "transform": { "x": 115, "y": 118, "width": 70, "height": 24, "rotation": 0, "scaleX": 1, "scaleY": 1 },
      "style": { "fill": "#0D47A1", "stroke": "none", "strokeWidth": 0, "opacity": 1, "fontSize": 14, "fontFamily": "Arial", "fontWeight": "bold", "textAlign": "center" },
      "visible": true,
      "locked": false,
      "text": "Service A"
    },
    {
      "id": "t2",
      "type": "text",
      "layerId": "l_text",
      "name": "Label B",
      "transform": { "x": 365, "y": 118, "width": 70, "height": 24, "rotation": 0, "scaleX": 1, "scaleY": 1 },
      "style": { "fill": "#1B5E20", "stroke": "none", "strokeWidth": 0, "opacity": 1, "fontSize": 14, "fontFamily": "Arial", "fontWeight": "bold", "textAlign": "center" },
      "visible": true,
      "locked": false,
      "text": "Service B"
    },
    {
      "id": "c1",
      "type": "connector",
      "layerId": "l_connectors",
      "name": "A to B",
      "transform": { "x": 0, "y": 0, "width": 0, "height": 0, "rotation": 0, "scaleX": 1, "scaleY": 1 },
      "style": { "fill": "none", "stroke": "#757575", "strokeWidth": 2, "opacity": 1 },
      "visible": true,
      "locked": false,
      "source": { "elementId": "s1", "anchorId": "right", "x": 200, "y": 130 },
      "target": { "elementId": "s2", "anchorId": "left", "x": 350, "y": 130 },
      "route": { "type": "straight", "points": [{ "x": 200, "y": 130 }, { "x": 350, "y": 130 }] },
      "arrowEnd": { "type": "triangle", "size": 1.2 },
      "semanticKind": "flow"
    }
  ],
  "groups": [],
  "dataSources": [],
  "charts": [],
  "templates": [],
  "exportPresets": []
}
```

### 6.3 流程图场景

关键模式：
- **节点**：使用 shape 元素，不同功能用不同 shapeKind
  - 开始/结束：`shapeKind: "rect"` + `cornerRadius: [25,25,25,25]`（圆角矩形）
  - 处理步骤：`shapeKind: "rect"`（普通矩形）
  - 判断：`shapeKind: "polygon"` + 菱形 points
  - 输入输出：`shapeKind: "polygon"` + 平行四边形 points
- **标签**：使用 text 元素，放置在单独的文字图层中
- **连接线**：使用 connector 元素，放在单独的连接线图层中
- **注释**：在分支连接线上使用 labels 字段

**图层划分建议**：
1. 节点图层 (order: 1)：所有 shape 元素
2. 文字图层 (order: 2)：节点标签 text 元素
3. 连接线图层 (order: 3)：所有 connector 元素
4. 注释图层 (order: 4)：分支标签等额外文本

### 6.4 架构图场景

关键模式：
- **容器**：使用 container 元素表示层/区域（表示层、应用层、数据层）
- **服务节点**：使用 shape 元素，放在容器范围内
- **数据库**：使用 shape 元素，通过 polygon 表示圆柱体
- **依赖关系**：使用 connector 元素，semanticKind 为 `"dependency"`
- **标签**：使用 text 元素标注组件名称

### 6.5 RTL 模块连接场景

关键模式：
- **模块**：使用 rtlModule 元素，moduleName 描述功能类型
- **端口**：在 rtlModule 的 ports 数组中定义，input 在左，output 在右
- **net 连接**：使用 connector 元素，semanticKind 为 `"rtl-net"`
- **bus 连接**：使用 connector 元素，semanticKind 为 `"rtl-bus"`，strokeWidth 加粗
- **时钟/复位**：使用特殊样式标记

### 6.6 网络拓扑场景

关键模式：
- **子网区域**：使用 container 元素表示核心层/分布层/接入层
- **设备节点**：使用 topologyNode 元素，deviceType 指定设备类型
- **链路**：使用 connector 元素，semanticKind 为 `"network-link"`
- **链路标签**：使用 labels 字段标注带宽、延迟等

### 6.7 统计图场景

关键模式：
- **数据源**：在 dataSources 中引用 CSV 文件
- **图表定义**：在 charts 中定义图表，或在 elements 中使用 chart 元素
- **图表元素**：使用 chart 元素，关联 dataSourceId 和 chartType
- **CSV 数据文件**：需要与 scene.json 一同提供，放在 data/ 目录中

## 7. 图层规划原则

避免碰撞错误的关键是合理的图层划分：

| 原则 | 说明 |
|------|------|
| 一个元素一个图层 | 最简单的策略，每个普通元素单独一个图层 |
| 按功能分隔 | 节点一图层、文字一图层、连接线一图层（连接线豁免碰撞） |
| 按区域分隔 | 不同区域或容器的元素放在不同图层 |
| streamId 策略 | 按空间位置分组，确保同层内元素不重叠 |

**连接线策略**：所有 connector 元素建议放在一个专门的连接线图层中。connector 不参与同层碰撞检测，因此可以密集放置。

## 8. 锚点参考

每个元素自动生成以下默认锚点，可在 connector 的 source/target 中使用：

| anchorId | 位置 | 说明 |
|----------|------|------|
| `"top"` | 上边中点 | 方向向上 |
| `"bottom"` | 下边中点 | 方向向下 |
| `"left"` | 左边中点 | 方向向左 |
| `"right"` | 右边中点 | 方向向右 |
| `"center"` | 元素中心 | 无方向 |
| `"topLeft"` | 左上角 | - |
| `"topRight"` | 右上角 | - |
| `"bottomLeft"` | 左下角 | - |
| `"bottomRight"` | 右下角 | - |

若 connector 端点的 `elementId` 和 `anchorId` 同时提供，端点自动跟随元素移动。若 `elementId` 为空，端点为自由点（固定坐标）。

## 9. 迁移和兼容性

- `schemaVersion` 用于版本判断。当前版本为 `"1.0.0"`。
- 若未来发生破坏性变更，工具将提供迁移逻辑。
- Agent 生成时始终使用最新版本的 schemaVersion。

## 10. 项目目录结构

Agent 生成的完整项目应包含：

```
my_project/
├── scene.json       # 主文件（必填）
├── data/            # 数据文件（如有图表则必填）
│   └── *.csv        # CSV 数据文件
├── assets/          # 资源文件（如有图片则必填）
│   └── *.png        # 图片文件
└── exports/         # 导出目录（可选，用户手动生成）
```

data 和 assets 中的路径在 scene.json 中必须使用相对路径（如 `"data/table.csv"`、`"assets/logo.png"`）。
