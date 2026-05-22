# 任务日志

本文件按任务编号索引，记录每个任务的完成情况。每条日志在对应任务完成时追加。

## 维护规则

1. 每次任务完成后，在本文件末尾追加一条日志记录。
2. 日志按任务编号升序排列。
3. 不得删除或修改已有日志，仅允许在缺陷修复后更新缺陷状态字段。
4. 任务日志与 git commit 一一对应，hash 字段在 commit 后补填。

## 日志格式

每条日志应包含以下字段：

| 字段          | 说明                                                      |
| ------------- | --------------------------------------------------------- |
| 任务编号      | 对应 task-list.md 中的编号，格式 T-XX-YY                  |
| 任务名称      | 简短描述                                                  |
| 完成时间      | 精确到分钟，格式 YYYY-MM-DD HH:mm                         |
| 作者/智能体   | 完成任务的人或 Agent 标识                                 |
| Git Commit    | 对应的 commit hash（提交后补填）                          |
| 修改记录      | 本次任务创建、修改、删除的文件清单                        |
| 发现缺陷      | 任务过程中发现的缺陷编号列表，引用 defect-log.md          |
| 产出接口/函数 | 本任务新增或修改的接口/函数编号列表，引用 api-registry.md |

## 日志记录

### T-00-01 项目脚手架初始化

| 字段          | 内容                                                                                                                                                                                                                                                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 任务编号      | T-00-01                                                                                                                                                                                                                                                                                                                         |
| 任务名称      | 项目脚手架初始化                                                                                                                                                                                                                                                                                                                |
| 完成时间      | 2026-05-18 20:35                                                                                                                                                                                                                                                                                                                |
| 作者/智能体   | OpenCode/claude-opus-4-6                                                                                                                                                                                                                                                                                                        |
| Git Commit    | ed27c07                                                                                                                                                                                                                                                                                                                         |
| 修改记录      | 新建：package.json, vite.config.ts, tsconfig.json, tsconfig.app.json, tsconfig.node.json, eslint.config.js, index.html, src/core/index.ts, src/canvas/index.ts, src/ui/index.ts, src/io/index.ts, src/modules/index.ts, src/tests/unit/sample.test.ts, src/main.tsx, src/App.tsx, src/App.css, src/index.css, src/vite-env.d.ts |
| 发现缺陷      | 无                                                                                                                                                                                                                                                                                                                              |
| 产出接口/函数 | 无（本任务仅建立工程骨架）                                                                                                                                                                                                                                                                                                      |

### T-01-01 定义核心 TypeScript 类型

| 字段          | 内容                                                                                                                        |
| ------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 任务编号      | T-01-01                                                                                                                     |
| 任务名称      | 定义核心 TypeScript 类型                                                                                                    |
| 完成时间      | 2026-05-18 21:02                                                                                                            |
| 作者/智能体   | OpenCode/deepseek-v4-pro                                                                                                    |
| Git Commit    | 1980dbe                                                                                                                     |
| 修改记录      | 新建：src/core/types.ts；修改：src/core/index.ts；新建：src/tests/unit/types.test.ts；修改：README.md、docs/api-registry.md |
| 发现缺陷      | 无                                                                                                                          |
| 产出接口/函数 | API-0001 ～ API-0045（共 45 项）                                                                                            |

### T-01-02 定义错误码和校验结果类型

| 字段          | 内容                                                                                                                          |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 任务编号      | T-01-02                                                                                                                       |
| 任务名称      | 定义错误码和校验结果类型                                                                                                      |
| 完成时间      | 2026-05-18 21:45                                                                                                              |
| 作者/智能体   | OpenCode/deepseek-v4-pro                                                                                                      |
| Git Commit    | 1e1fd10                                                                                                                       |
| 修改记录      | 新建：src/core/errors.ts；修改：src/core/index.ts；新建：src/tests/unit/errors.test.ts；修改：README.md、docs/api-registry.md |
| 发现缺陷      | 无                                                                                                                            |
| 产出接口/函数 | API-0046 ～ API-0050（共 5 项）                                                                                               |

### T-01-03 实现 scene.json Schema 校验器

| 字段          | 内容                                                                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 任务编号      | T-01-03                                                                                                                                    |
| 任务名称      | 实现 scene.json Schema 校验器                                                                                                              |
| 完成时间      | 2026-05-19 08:55                                                                                                                           |
| 作者/智能体   | OpenCode/deepseek-v4-pro                                                                                                                   |
| Git Commit    | 2bd8339                                                                                                                                    |
| 修改记录      | 新建：src/core/validator.ts、src/tests/unit/validator.test.ts；修改：src/core/index.ts、README.md、docs/api-registry.md、docs/task-list.md |
| 发现缺陷      | 无                                                                                                                                         |
| 产出接口/函数 | API-0051 ～ API-0052（共 2 项）                                                                                                            |

### T-01-04 实现引用完整性校验

| 字段          | 内容                                                                                                                                                                                                                   |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 任务编号      | T-01-04                                                                                                                                                                                                                |
| 任务名称      | 实现引用完整性校验                                                                                                                                                                                                     |
| 完成时间      | 2026-05-19 10:01                                                                                                                                                                                                       |
| 作者/智能体   | OpenCode/deepseek-v4-pro                                                                                                                                                                                               |
| Git Commit    | 0fe3fe1                                                                                                                                                                                                                |
| 修改记录      | 修改：src/core/validator.ts（新增 validateReferences 函数及其在 validateScene 中的集成）、src/tests/unit/validator.test.ts（新增 15 个引用完整性测试用例）；更新：docs/api-registry.md（更新 API-0051、新增 API-0053） |
| 发现缺陷      | 无                                                                                                                                                                                                                     |
| 产出接口/函数 | API-0053（新增 validateReferences）、API-0051（修订）                                                                                                                                                                  |

### T-01-05 创建示例项目文件

| 字段          | 内容                                                                                                                                                                                     |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 任务编号      | T-01-05                                                                                                                                                                                  |
| 任务名称      | 创建示例项目文件                                                                                                                                                                         |
| 完成时间      | 2026-05-19 10:32                                                                                                                                                                         |
| 作者/智能体   | OpenCode/deepseek-v4-pro                                                                                                                                                                 |
| Git Commit    | d5f8c24                                                                                                                                                                                  |
| 修改记录      | 新建：examples/basic/scene.json、examples/basic/data/sample.csv、examples/basic/assets/.gitkeep、src/tests/unit/example-scene.test.ts；修改：tsconfig.app.json（增加 resolveJsonModule） |
| 发现缺陷      | 无                                                                                                                                                                                       |
| 产出接口/函数 | 无（本任务仅创建示例文件，无新增 API）                                                                                                                                                   |

### T-01-06 实现 ID 生成工具函数

| 字段          | 内容                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| 任务编号      | T-01-06                                                                                                |
| 任务名称      | 实现 ID 生成工具函数                                                                                   |
| 完成时间      | 2026-05-19 11:01                                                                                       |
| 作者/智能体   | OpenCode/deepseek-v4-pro                                                                               |
| Git Commit    | e51a3c8                                                                                                |
| 修改记录      | 新建：src/core/utils.ts、src/tests/unit/utils.test.ts；修改：src/core/index.ts（新增 generateId 导出） |
| 发现缺陷      | 无                                                                                                     |
| 产出接口/函数 | API-0054（generateId）                                                                                 |

### T-02-01 实现视口变换管理器

| 字段          | 内容                                                                                                                             |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 任务编号      | T-02-01                                                                                                                          |
| 任务名称      | 实现视口变换管理器                                                                                                               |
| 完成时间      | 2026-05-19 11:15                                                                                                                 |
| 作者/智能体   | OpenCode/deepseek-v4-pro                                                                                                         |
| Git Commit    | 0f0c312                                                                                                                          |
| 修改记录      | 新建：src/canvas/viewport.ts、src/tests/unit/viewport.test.ts；修改：src/canvas/index.ts（新增 Viewport 和 ViewportConfig 导出） |
| 发现缺陷      | 无                                                                                                                               |
| 产出接口/函数 | API-0055（ViewportConfig）、API-0056（Viewport）                                                                                 |

### T-02-02 实现 SVG 画布渲染组件

| 字段          | 内容                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 任务编号      | T-02-02                                                                                                                                                                                                                                                                                                                                                                                                               |
| 任务名称      | 实现 SVG 画布渲染组件                                                                                                                                                                                                                                                                                                                                                                                                 |
| 完成时间      | 2026-05-19 14:31                                                                                                                                                                                                                                                                                                                                                                                                      |
| 作者/智能体   | OpenCode/deepseek-v4-pro                                                                                                                                                                                                                                                                                                                                                                                              |
| Git Commit    | 30e7a90                                                                                                                                                                                                                                                                                                                                                                                                               |
| 修改记录      | 新建：src/canvas/CanvasView.tsx、src/tests/unit/canvas-view.test.tsx、src/tests/unit/setup.ts；修改：src/canvas/index.ts（新增 CanvasView 导出）、src/App.tsx（改用 CanvasView 渲染示例 scene）、src/App.css（全屏画布布局）、src/index.css（全局样式重置）、vite.config.ts（配置 vitest jsdom 环境和测试设置文件）；新增 npm 依赖：@testing-library/react、@testing-library/jest-dom、@testing-library/dom、jsdom@24 |
| 发现缺陷      | 无                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 产出接口/函数 | API-0057（CanvasView）                                                                                                                                                                                                                                                                                                                                                                                                |

### T-02-03 实现画布缩放和平移交互

| 字段          | 内容                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 任务编号      | T-02-03                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 任务名称      | 实现画布缩放和平移交互                                                                                                                                                                                                                                                                                                                                                                                                   |
| 完成时间      | 2026-05-19 14:45                                                                                                                                                                                                                                                                                                                                                                                                         |
| 作者/智能体   | OpenCode/deepseek-v4-pro                                                                                                                                                                                                                                                                                                                                                                                                 |
| Git Commit    | 6abc2e8                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 修改记录      | 修改：src/canvas/CanvasView.tsx（新增 onViewportChange prop、滚轮缩放、空格+拖拽平移、中键拖拽平移、光标样式切换）、src/App.tsx（使用 useState 管理 viewport 并传入 onViewportChange 回调）、src/tests/unit/canvas-view.test.tsx（新增 15 个交互测试用例：zoom、pan、cursor、onViewportChange）；更新：docs/api-registry.md（更新 API-0057）、docs/task-list.md（T-02-03 状态改为已完成）、README.md（更新可用功能描述） |
| 发现缺陷      | 无                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 产出接口/函数 | API-0057（CanvasView：新增 onViewportChange prop、交互事件处理）                                                                                                                                                                                                                                                                                                                                                         |

### T-02-04 实现元素单选和多选

| 字段          | 内容                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 任务编号      | T-02-04                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 任务名称      | 实现元素单选和多选                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 完成时间      | 2026-05-19 15:00                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 作者/智能体   | OpenCode/deepseek-v4-pro                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Git Commit    | 5c3043aef                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 修改记录      | 新建：src/canvas/selection.ts（SelectionManager 类）、src/tests/unit/selection.test.ts（18 个 SelectionManager 单元测试）；修改：src/canvas/CanvasView.tsx（新增 selectionManager/onSelectionChange props、元素 onClick 包装、选择覆盖层渲染含蓝色包围盒和 8 个控制柄、spaceDownRef 避免平移时误选）、src/canvas/index.ts（新增 SelectionManager 导出）、src/App.tsx（集成 SelectionManager）、src/tests/unit/canvas-view.test.tsx（新增 12 个选择交互测试） |
| 发现缺陷      | 无                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 产出接口/函数 | API-0058（SelectionManager）、API-0057（CanvasView：新增 selectionManager/onSelectionChange props 和选择交互） |

### T-02-05 实现框选功能

| 字段 | 内容 |
|---|---|
| 任务编号 | T-02-05 |
| 任务名称 | 实现框选功能 |
| 完成时间 | 2026-05-19 15:30 |
| 作者/智能体 | OpenCode/deepseek-v4-pro |
| Git Commit | 633622c |
| 修改记录 | 修改：src/canvas/CanvasView.tsx（新增 marquee 状态管理、handleMouseDown/handleMouseMove/handleMouseUp 扩展、handleMouseLeave 分离、didDragRef 拖拽判断、MarqueeState 接口、框选矩形渲染——半透明蓝色虚线框位于屏幕空间）、src/tests/unit/canvas-view.test.tsx（新增 12 个框选交互测试：完全/部分包含选择、Shift+框选追加、框选矩形渲染、元素上不启动框选、平移时不启动框选、锁定/隐藏元素过滤、缩放视口适配、onSelectionChange 回调、小拖拽视为点击清空） |
| 发现缺陷 | 无 |
| 产出接口/函数 | API-0057（CanvasView：新增框选 marquee selection 功能） |

### T-03-01 实现 Document Store

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-03-01 |
| 任务名称      | 实现 Document Store |
| 完成时间      | 2026-05-19 15:38 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | 800538b |
| 修改记录      | 新建：src/core/store.ts、src/tests/unit/store.test.ts；修改：src/core/index.ts（新增 useDocumentStore 和 DocumentStore 导出） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0059（DocumentStore）、API-0060（useDocumentStore） |

### T-03-02 实现 JSON 项目文件加载

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-03-02 |
| 任务名称      | 实现 JSON 项目文件加载 |
| 完成时间      | 2026-05-19 15:55 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | 2a8dc2d |
| 修改记录      | 新建：src/io/importers.ts（loadSceneFromFile、loadSceneFromFileObject）、src/tests/unit/importers.test.ts（13 个测试用例）；修改：src/io/index.ts（新增导出） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0061（loadSceneFromFile）、API-0062（loadSceneFromFileObject） |

### T-03-03 实现 File System Access API 项目目录打开

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-03-03 |
| 任务名称      | 实现 File System Access API 项目目录打开 |
| 完成时间      | 2026-05-19 16:50 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | f8f6459 |
| 修改记录      | 修改：src/io/importers.ts（新增 loadProjectFromDirectory 及辅助函数 readFileFromDirectory、readAllFilesFromDirectory、isImageFile、inferDataSourceType、revokeTrackedBlobUrls）、src/core/store.ts（新增 directoryHandle 和 setDirectoryHandle）、src/io/index.ts（新增导出）、src/tests/unit/importers.test.ts（新增 14 个测试用例） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0063（loadProjectFromDirectory）、API-0059（DocumentStore 修订：新增 directoryHandle/setDirectoryHandle） |

### T-03-04 实现 ZIP 项目导入导出

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-03-04 |
| 任务名称      | 实现 ZIP 项目导入导出 |
| 完成时间      | 2026-05-19 18:36 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | ec250fc |
| 修改记录      | 新建：src/io/exporters.ts（exportProjectToZip）、src/tests/unit/zip-io.test.ts（19 个测试用例）；修改：src/io/importers.ts（新增 importProjectFromZip 及 fflate 导入）、src/io/index.ts（新增 importProjectFromZip 和 exportProjectToZip 导出）；package.json（新增 fflate 依赖） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0064（importProjectFromZip）、API-0065（exportProjectToZip） |

### T-03-05 实现项目保存功能

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-03-05 |
| 任务名称      | 实现项目保存功能 |
| 完成时间      | 2026-05-19 18:54 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | 3252b72 |
| 修改记录      | 修改：src/io/exporters.ts（新增 saveProject、triggerDownload 函数，新增 validateScene/failureResult/successResult/ValidationResult 导入）、src/io/index.ts（新增 saveProject 导出）、src/tests/unit/zip-io.test.ts（新增 6 个 saveProject 测试用例）、docs/（task-log.md、api-registry.md、task-list.md）、README.md |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0066（saveProject） |

### T-04-02 实现同层元素碰撞检测

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-04-02 |
| 任务名称      | 实现同层元素碰撞检测 |
| 完成时间      | 2026-05-19 20:55 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | c25d3c9 |
| 修改记录      | 新建：src/core/collision.ts（checkLayerCollisions 函数、CollisionEntry/CollisionResult/CollisionCheckOptions 接口）、src/tests/unit/collision.test.ts（15 个测试用例）；修改：src/core/index.ts（新增 collision 模块导出） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0069（checkLayerCollisions）、API-0070（CollisionEntry）、API-0071（CollisionResult）、API-0072（CollisionCheckOptions） |

### T-04-03 实现图层冲突校验器

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-04-03 |
| 任务名称      | 实现图层冲突校验器 |
| 完成时间      | 2026-05-19 21:15 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | 3aa1e90 |
| 修改记录      | 修改：src/core/validator.ts（新增 validateGeometryRules 函数，集成到 validateScene Stage 6，新增 checkLayerCollisions/CollisionCheckOptions/createGeometryAdapter/SceneElement 导入）；修改：src/tests/unit/validator.test.ts（新增 12 个几何规则测试用例：同层重叠检测、多层独立检测、connector 豁免、maxLayerCount 超限、hidden/locked 元素碰撞策略、错误包含 bboxes 字段；修复 3 个已有测试数据避免新校验引入的重叠冲突、新增 transform 缺失防护） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0051（validateScene 修订：新增 Stage 6 几何规则校验）、API-0073（validateGeometryRules） |

### T-04-04 实现图层渲染顺序

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-04-04 |
| 任务名称      | 实现图层渲染顺序 |
| 完成时间      | 2026-05-19 21:30 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | f1ee122 |
| 修改记录      | 修改：src/canvas/CanvasView.tsx（新增 layerMap 按 ID 快速查找图层、隐藏图层改用 visibility:hidden 而非 return null 以保留 DOM 空间、锁定图层元素不响应 onClick 事件、marquee 框选排除锁定图层内元素）；修改：src/tests/unit/canvas-view.test.tsx（更新隐藏图层测试期望 visibility:hidden、新增 locked layer 的 click 选择和 marquee 框选测试各 1 个）；修改：README.md、docs/api-registry.md、docs/task-list.md |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0057（CanvasView：修订 - 隐藏图层标记、锁定图层交互控制） |

### T-04-01 实现 BBox 计算器

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-04-01 |
| 任务名称      | 实现 BBox 计算器 |
| 完成时间      | 2026-05-19 20:02 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | 2c9c14a |
| 修改记录      | 新建：src/core/geometry.ts（getBBox 函数、createGeometryAdapter 工厂函数）、src/tests/unit/geometry.test.ts（41 个测试用例）；修改：src/core/index.ts（新增 getBBox 和 createGeometryAdapter 导出） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0067（getBBox）、API-0068（createGeometryAdapter） |

### T-04-05 实现冲突高亮显示

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-04-05 |
| 任务名称      | 实现冲突高亮显示 |
| 完成时间      | 2026-05-19 21:50 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | ee49ef6 |
| 修改记录      | 新建：src/canvas/conflict.ts（ConflictHighlighter 类、ConflictInfo 接口）、src/ui/ConflictPanel.tsx（ConflictPanel 组件）、src/tests/unit/conflict.test.ts（13 个 ConflictHighlighter 测试用例）、src/tests/unit/conflict-panel.test.tsx（10 个 ConflictPanel 测试用例）；修改：src/canvas/CanvasView.tsx（新增 conflictHighlighter prop、冲突叠层渲染红色虚线包围盒和重叠区域）、src/canvas/index.ts（新增 ConflictHighlighter 和 ConflictInfo 导出）、src/ui/index.ts（新增 ConflictPanel 和 ConflictPanelProps 导出）、src/App.tsx（集成 ConflictHighlighter、冲突检测逻辑和 ConflictPanel）、src/tests/unit/canvas-view.test.tsx（新增 8 个冲突叠层测试用例） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0074（ConflictHighlighter）、API-0075（ConflictInfo）、API-0076（ConflictPanel）、API-0077（ConflictPanelProps） |

### T-05-01 实现命令系统框架

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-05-01 |
| 任务名称      | 实现命令系统框架 |
| 完成时间      | 2026-05-19 22:01 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | 697fb31 |
| 修改记录      | 新建：src/core/commands.ts（SceneCommand 接口、CommandHistoryEntry 接口、CommandExecutor 类）、src/tests/unit/commands.test.ts（15 个测试用例）；修改：src/core/index.ts（新增 SceneCommand、CommandHistoryEntry、CommandExecutor 导出） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0078（SceneCommand）、API-0079（CommandHistoryEntry）、API-0080（CommandExecutor） |

### T-05-02 实现 CreateElement 命令

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-05-02 |
| 任务名称      | 实现 CreateElement 命令 |
| 完成时间      | 2026-05-19 22:06 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | 76fdde4 |
| 修改记录      | 修改：src/core/commands.ts（新增 ElementInput 接口、buildElementFromInput/checkElementCollision 辅助函数、CreateElementCommand 类）、src/tests/unit/commands.test.ts（新增 10 个 CreateElementCommand 测试用例） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0081（ElementInput）、API-0082（CreateElementCommand） |

### T-05-03 实现 MoveElements 命令

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-05-03 |
| 任务名称      | 实现 MoveElements 命令 |
| 完成时间      | 2026-05-19 22:14 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | b09e339 |
| 修改记录      | 修改：src/core/commands.ts（新增 MoveElementsCommand 类，支持碰撞检测、锁定检查、连接线端点跟随）、src/tests/unit/commands.test.ts（新增 9 个 MoveElementsCommand 测试用例） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0083（MoveElementsCommand） |

### T-05-04 实现 UpdateElement 命令

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-05-04 |
| 任务名称      | 实现 UpdateElement 命令 |
| 完成时间      | 2026-05-19 22:17 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | 1a653b8 |
| 修改记录      | 修改：src/core/commands.ts（新增 ElementChanges 类型、UpdateElementCommand 类，支持样式/位置/尺寸/可见性/锁定等属性修改）、src/tests/unit/commands.test.ts（新增 10 个 UpdateElementCommand 测试用例） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0084（ElementChanges）、API-0085（UpdateElementCommand） |

### T-05-05 实现 ChangeLayer 命令

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-05-05 |
| 任务名称      | 实现 ChangeLayer 命令 |
| 完成时间      | 2026-05-19 22:20 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | a2ccfc6 |
| 修改记录      | 修改：src/core/commands.ts（新增 ChangeLayerCommand 类，支持跨层移动、connector 豁免碰撞、锁定检查）、src/tests/unit/commands.test.ts（新增 9 个 ChangeLayerCommand 测试用例） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0086（ChangeLayerCommand） |

### T-05-06 实现 TransformElements 命令

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-05-06 |
| 任务名称      | 实现 TransformElements 命令 |
| 完成时间      | 2026-05-19 22:23 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | 58bffb4 |
| 修改记录      | 修改：src/core/commands.ts（新增 TransformParams 类型、TransformElementsCommand 类，支持缩放、旋转、尺寸变换及碰撞检测）、src/tests/unit/commands.test.ts（新增 9 个 TransformElementsCommand 测试用例） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0087（TransformParams）、API-0088（TransformElementsCommand） |

### T-05-07 实现图形绘制工具

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-05-07 |
| 任务名称      | 实现图形绘制工具 |
| 完成时间      | 2026-05-20 08:40 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | ec797b0 |
| 修改记录      | 新建：src/ui/ShapeToolbar.tsx、src/tests/unit/shape-toolbar.test.tsx（7 个测试用例）、src/tests/unit/drawing.test.tsx（23 个测试用例）；修改：src/canvas/CanvasView.tsx（新增 activeTool/drawingLayerId/onDrawComplete props、DrawState 内部状态、绘制预览渲染 renderDrawPreview、拖拽绘制交互、多边形逐点绘制交互、drawStateToInput 转换函数、crosshair 光标）、src/canvas/index.ts（新增 DrawingToolType 导出）、src/core/index.ts（新增 ElementInput/CreateElementCommand 导出）、src/ui/index.ts（新增 ShapeToolbar/ShapeToolbarProps 导出）、src/App.tsx（集成 Zustand store 和 CommandExecutor、activeTool 状态、ShapeToolbar、findActiveLayerId 辅助函数） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0057（CanvasView 修订：新增 drawing props）、API-0089（DrawingToolType）、API-0090（ShapeToolbar）、API-0091（ShapeToolbarProps）、API-0092（drawStateToInput：导出 + 新增 text case）、API-0093（renderDrawPreview：导出 + 新增 text case） |

### T-05-08 实现文本工具

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-05-08 |
| 任务名称      | 实现文本工具 |
| 完成时间      | 2026-05-20 09:22 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | e0b6c2a |
| 修改记录      | 新建：src/ui/TextEditor.tsx（覆盖层文本编辑器含样式工具栏）、src/tests/unit/text-editor.test.tsx（14 个测试用例）、src/tests/unit/text-tool.test.tsx（9 个测试用例）；修改：src/core/types.ts（TextElement 新增 backgroundColor/borderColor/borderWidth 字段）、src/core/commands.ts（CreateElementCommand 新增 getElementId 方法）、src/canvas/CanvasView.tsx（DrawingToolType 新增 'text'、导出 drawStateToInput/renderDrawPreview、新增 onTextEditRequest prop、drawStateToInput 新增 text case、renderDrawPreview 新增 text preview、renderTextElement 支持背景色/边框渲染、handleMouseDown 支持 text tool 在元素上点击创建文本、handleDoubleClick 支持文本元素双击编辑、SVG onDoubleClick 始终激活）、src/canvas/index.ts（导出 drawStateToInput/renderDrawPreview）、src/ui/ShapeToolbar.tsx（新增 Text 工具按钮和图标）、src/ui/index.ts（新增 TextEditor 和 TextEditorProps 导出）、src/App.tsx（集成 TextEditor 编辑器、editingTextId 状态、handleDrawComplete 支持 text 自动进入编辑、handleTextEditRequest/handleTextCommit/handleTextCancel 回调、handleToolChange 切换工具时退出编辑模式） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0094（TextEditor）、API-0095（TextEditorProps）、API-0018（TextElement 修订：新增 backgroundColor/borderColor/borderWidth）、API-0057（CanvasView 修订：新增 onTextEditRequest prop / 文本编辑和渲染）、API-0082（CreateElementCommand 修订：新增 getElementId）、API-0089（DrawingToolType 修订：新增 'text'）、API-0090（ShapeToolbar 修订：新增 Text 按钮）、API-0092（drawStateToInput 修订：导出 + 新增 text case）、API-0093（renderDrawPreview 修订：导出 + 新增 text preview） |

### T-05-09 实现图片导入工具

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-05-09 |
| 任务名称      | 实现图片导入工具 |
| 完成时间      | 2026-05-20 10:05 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | 2ad0a0a |
| 修改记录      | 新建：src/io/svg-sanitizer.ts（SVG 安全清洗：移除 script/foreignObject/use 标签、事件处理器属性和 javascript: 链接）、src/io/image-utils.ts（图片导入工具：PNG/JPG/SVG 文件导入、SVG 清洗集成、尺寸解析、缩放适配）、src/ui/ImageImportButton.tsx（导入图片按钮组件：文件选择器触发、导入回调）、src/tests/unit/svg-sanitizer.test.ts（13 个测试用例）、src/tests/unit/image-utils.test.ts（18 个测试用例）、src/tests/unit/image-import-button.test.tsx（6 个测试用例）；修改：src/io/index.ts（新增 sanitizeSvg/sanitizeSvgToBlob/isSupportedImageFile/importImageFromFile 导出）、src/ui/index.ts（新增 ImageImportButton/ImageImportButtonProps 导出）、src/App.tsx（集成 ImageImportButton、拖放导入支持含 drop-overlay、handleImageImport/handleDragOver/handleDragLeave/handleDrop 回调）、src/App.css（新增 drop-overlay 和 image-import-btn 样式） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0096（sanitizeSvg）、API-0097（sanitizeSvgToBlob）、API-0098（isSupportedImageFile）、API-0099（importImageFromFile）、API-0100（ImageImportButton）、API-0101（ImageImportButtonProps） |

### T-05-10 实现属性面板

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-05-10 |
| 任务名称      | 实现属性面板 |
| 完成时间      | 2026-05-20 10:40 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | ff99f6a |
| 修改记录      | 新建：src/ui/PropertyPanel.tsx、src/tests/unit/property-panel.test.tsx（27 个测试用例）；修改：src/ui/index.ts（新增 PropertyPanel/PropertyPanelProps 导出）、src/App.tsx（集成 PropertyPanel、handlePropertyChange/handleLayerChange 回调、ChangeLayerCommand 导入）、docs/api-registry.md（新增 API-0102/API-0103）、docs/task-list.md（T-05-10 状态改为已完成）、README.md（更新测试计数和功能描述） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0102（PropertyPanel）、API-0103（PropertyPanelProps） |

### T-06-01 实现分组命令

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-06-01 |
| 任务名称      | 实现分组命令 |
| 完成时间      | 2026-05-20 11:02 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | cbe839f |
| 修改记录      | 修改：src/core/commands.ts（新增 GroupElementsCommand/UngroupCommand/AddToGroupCommand/RemoveFromGroupCommand 四个分组命令类，实现创建组/解散组/追加成员/移除成员，支持跨层分组和完整 undo/redo）、src/canvas/selection.ts（SelectionManager 新增 selectGroup/selectGroupByName/getGroupsForSelected 方法）、src/core/index.ts（新增导出）、src/tests/unit/commands.test.ts（新增分组命令测试用例）、src/tests/unit/selection.test.ts（新增分组选择测试用例）；修改：README.md、docs/api-registry.md、docs/task-list.md |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0104（GroupElementsCommand）、API-0105（UngroupCommand）、API-0106（AddToGroupCommand）、API-0107（RemoveFromGroupCommand） |

### T-06-02 实现对齐命令

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-06-02 |
| 任务名称      | 实现对齐命令 |
| 完成时间      | 2026-05-20 11:25 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | 6790f93 |
| 修改记录      | 修改：src/core/commands.ts（新增 AlignType 类型、AlignElementsCommand 类：支持 left/right/top/bottom/centerHorizontal/centerVertical/center 七种对齐方式，计算统一包围盒，移动后检查图层冲突，连接线端点跟随）；修改：src/core/index.ts（新增 AlignElementsCommand 和 AlignType 导出）；修改：src/tests/unit/commands.test.ts（新增 12 个对齐命令测试用例） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0108（AlignType）、API-0109（AlignElementsCommand） |

### T-06-03 实现分布命令

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-06-03 |
| 任务名称      | 实现分布命令 |
| 完成时间      | 2026-05-20 11:40 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | ac6bedc |
| 修改记录      | 修改：src/core/commands.ts（新增 DistributeType 类型、CircularDistributeOptions 接口、DistributeElementsCommand 类：支持 horizontal/vertical/circular 三种分布方式，水平分布按中心点等距排列、垂直分布按中心点等距排列、环形分布按等角弧度在圆上排列，移动后检查图层冲突，连接线端点跟随）；修改：src/core/index.ts（新增 DistributeElementsCommand、DistributeType、CircularDistributeOptions 导出）；修改：src/tests/unit/commands.test.ts（新增 18 个分布命令测试用例） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0110（DistributeType）、API-0111（CircularDistributeOptions）、API-0112（DistributeElementsCommand） |

### T-06-04 实现 BatchLayerEdit 命令

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-06-04 |
| 任务名称      | 实现 BatchLayerEdit 命令 |
| 完成时间      | 2026-05-20 12:00 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | 4ea08db |
| 修改记录      | 修改：src/core/commands.ts（新增 BatchLayerOperation 类型、BatchLayerEditCommand 类：支持 setFill/setStroke/setOpacity/showAll/hideAll/deleteAll/copyAll/moveAll 八种按层批量操作，deleteAll 自动解绑关联的连接线端点，copyAll 在目标层克隆所有元素并生成新 ID，moveAll 迁移全部元素到目标层，所有操作均检查锁定元素和图层冲突（copy/move），完整的 undo/redo 支持）；修改：src/core/index.ts（新增 BatchLayerEditCommand 和 BatchLayerOperation 导出）；修改：src/tests/unit/commands.test.ts（新增 41 个批量编辑命令测试用例） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0113（BatchLayerOperation）、API-0114（BatchLayerEditCommand） |

### T-06-05 实现 MoveLayers 命令

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-06-05 |
| 任务名称      | 实现 MoveLayers 命令 |
| 完成时间      | 2026-05-20 12:25 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | 965aa11 |
| 修改记录      | 修改：src/core/commands.ts（新增 LayerMoveDirection 类型、MoveLayersCommand 类：支持多图层 up/down 移动指定步数，每个选中层独立计算目标位置并跳过非选中层，保持选中层相对顺序，事务式校验——计算移动后最终状态并检查每层内碰撞冲突，任一层冲突则整体回滚，完整 undo/redo 支持）；修改：src/core/index.ts（新增 MoveLayersCommand 和 LayerMoveDirection 导出）；修改：src/tests/unit/commands.test.ts（新增 22 个 MoveLayersCommand 测试用例：基本移动、多步移动、非连续层移动、相对顺序保持、边界校验、冲突检测、undo/redo、事务回滚） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0115（LayerMoveDirection）、API-0116（MoveLayersCommand） |

### T-07-01 实现锚点系统

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-07-01 |
| 任务名称      | 实现锚点系统 |
| 完成时间      | 2026-05-20 12:40 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | c150208 |
| 修改记录      | 新建：src/core/anchors.ts（getAnchors + resolveAnchor 函数，9 个默认锚点，shape 自定义锚点支持，旋转坐标计算）、src/tests/unit/anchors.test.ts（26 个测试用例）；修改：src/core/index.ts（新增 getAnchors 和 resolveAnchor 导出） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0117（getAnchors）、API-0118（resolveAnchor） |

### T-07-02 实现连接线创建和渲染

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-07-02 |
| 任务名称      | 实现连接线创建和渲染 |
| 完成时间      | 2026-05-20 13:10 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | 8dcef8b |
| 修改记录      | 修改：src/canvas/CanvasView.tsx（DrawingToolType 新增 'connector'、新增 getVisibleAnchors/findElementAtPoint/findNearestAnchor 辅助函数、新增 connector 工具交互：悬停显示锚点高亮、点击锚点拖拽创建连接线、实时预览线渲染、鼠标事件处理、getCursor 支持 crosshair、connector 渲染按 route.type 使用 line 或 polyline 元素）；修改：src/ui/ShapeToolbar.tsx（新增 connector 工具按钮和图标）；修改：src/tests/unit/canvas-view.test.tsx（修正 straight 路由 connector 测试：line 替代 polyline、新增 2 个 connector 渲染测试）；修改：src/tests/unit/shape-toolbar.test.tsx（按钮数量从 7 更新为 8）；修改：src/tests/unit/commands.test.ts（新增 4 个 connector 创建测试：锚点绑定、碰撞豁免、polyline 路由、自由端点）；修改：docs/api-registry.md（更新 API-0057/API-0089/API-0117/API-0118 记录） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0057（CanvasView 修订）、API-0089（DrawingToolType 修订）、API-0117（getAnchors 修订）、API-0118（resolveAnchor 修订） |

### T-07-03 实现连接线箭头和标签

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-07-03 |
| 任务名称      | 实现连接线箭头和标签 |
| 完成时间      | 2026-05-20 13:30 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | c438a4f |
| 修改记录      | 修改：src/core/commands.ts（ElementInput 新增 arrowStart/arrowEnd/labels 字段，buildElementFromInput connector 分支支持箭头和标签，ElementChanges 新增 arrowStart/arrowEnd/labels 字段，UpdateElementCommand.execute 新增箭头和标签处理逻辑）；修改：src/canvas/CanvasView.tsx（新增 computePathPoints/computeTotalPathLength/computePointOnPath 路径计算函数，新增 createArrowMarkerId/buildArrowMarkers 箭头标记生成，renderConnectorElement 重构为支持箭头 marker 和标签渲染，SVG 根元素新增 <defs> 箭头标记定义，导入 useMemo 和 ConnectorLabel/ArrowStyle 类型）；修改：src/ui/PropertyPanel.tsx（新增 ConnectorElement/ConnectorLabel 导入，Section 类型新增 'connector'，新增连接器属性编辑区：箭头类型下拉选择、箭头尺寸、标签列表编辑和增删）；修改：src/tests/unit/canvas-view.test.tsx（新增 connector arrows 测试组 7 个用例：箭头标记 defs、marker-end、marker-start、none 样式、openTriangle、circle、polyline 标记；新增 connector labels 测试组 7 个用例：中点标签、多标签、位置计算、偏移、polyline 路径标签、无标签、字体继承）；修改：src/tests/unit/commands.test.ts（新增 UpdateElementCommand 测试组 8 个用例：arrowEnd 更新、arrowStart 更新、箭头设为 null、labels 更新、多 labels 更新、undo 恢复 arrowEnd、undo 恢复 labels、CreateElementCommand 创建带箭头和标签的 connector） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0024（ConnectorElement 修订）、API-0057（CanvasView 修订）、API-0070（UpdateElementCommand/ElementChanges 修订）、API-0119（computePointOnPath）、API-0120（buildArrowMarkers） |

### T-07-04 实现正交路由

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-07-04 |
| 任务名称      | 实现正交路由 |
| 完成时间      | 2026-05-20 15:15 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | 290c6d8 |
| 修改记录      | 新建：src/core/routing.ts（正交路由算法：directionToCardinal、computeOrthogonalRoute、recalculateConnectorRoute、recalculateRoutesForElements）、src/tests/unit/routing.test.ts（23 个测试用例）；修改：src/core/index.ts（新增 routing 导出）、src/core/commands.ts（MoveElementsCommand/AlignElementsCommand/DistributeElementsCommand/TransformElementsCommand 的 execute 方法集成路由自动重算）、src/canvas/CanvasView.tsx（connector 创建默认使用 orthogonal 路由、bend point 拖拽交互支持、新增 onConnectorRouteChange prop）、src/App.tsx（新增 handleConnectorRouteChange 回调） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0121（directionToCardinal）、API-0122（computeOrthogonalRoute）、API-0123（recalculateConnectorRoute）、API-0124（recalculateRoutesForElements）、API-0057（CanvasView 修订：新增 onConnectorRouteChange prop） |

### T-07-05 实现连接线端点校验

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号 | T-07-05 |
| 任务名称 | 实现连接线端点校验 |
| 完成时间 | 2026-05-20 16:45 |
| 作者/智能体 | OpenCode/deepseek-v4-pro |
| Git Commit | a60b7cb |
| 修改记录 | 新增：src/core/commands.ts（DeleteElementStrategy 类型、findConnectorsReferencingElements 辅助函数、DeleteElementCommand 类）；修改：src/core/index.ts（导出 DeleteElementCommand 和 DeleteElementStrategy）；修改：src/tests/unit/commands.test.ts（新增 18 个 DeleteElementCommand 测试用例：unbind 策略 6 个、cascade 策略 4 个、block 策略 2 个、通用行为 6 个）；更新：docs/api-registry.md（新增 API-0125 DeleteElementStrategy、API-0126 DeleteElementCommand） |
| 发现缺陷 | 无 |
| 产出接口/函数 | API-0125 DeleteElementStrategy、API-0126 DeleteElementCommand |

### T-08-01 实现模板系统框架

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号 | T-08-01 |
| 任务名称 | 实现模板系统框架 |
| 完成时间 | 2026-05-20 16:50 |
| 作者/智能体 | OpenCode/deepseek-v4-pro |
| Git Commit | 86f42b8 |
| 修改记录 | 新建：src/core/templates.ts（TemplateElementDef、TemplateConnectorDef、TemplateDefinition 接口，registerTemplate/getTemplate/getAllTemplates/getTemplatesByCategory/unregisterTemplate/clearTemplates/instantiateTemplate/createTemplateInstance 函数）；修改：src/core/index.ts（导出所有新类型和函数）；新建：src/tests/unit/templates.test.ts（29 个测试用例，覆盖注册/查找/分类/移除/实例化/连接线/坐标偏移与默认样式） |
| 发现缺陷 | 无 |
| 产出接口/函数 | API-0127～API-0137（TemplateElementDef、TemplateConnectorDef、TemplateDefinition、registerTemplate、getTemplate、getAllTemplates、getTemplatesByCategory、unregisterTemplate、clearTemplates、instantiateTemplate、createTemplateInstance） |

### T-08-02 实现基础几何模板

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号 | T-08-02 |
| 任务名称 | 实现基础几何模板 |
| 完成时间 | 2026-05-20 17:15 |
| 作者/智能体 | OpenCode/deepseek-v4-pro |
| Git Commit | 9fcb3ed |
| 修改记录 | 新建：src/modules/geometric-templates.ts（registerGeometricTemplates 函数 + 9 个基础几何模板定义：矩形/圆/椭圆/三角形/菱形/五角星/箭头/双向箭头/线条，全部归类为'基础几何'）；修改：src/modules/index.ts（导出 registerGeometricTemplates 和 geometricTemplateDefinitions）；新建：src/tests/unit/geometric-templates.test.ts（37 个测试用例，覆盖模板数量/唯一性/分类/形状类型/多边形顶点数/实例化/位置偏移/ID生成/图层分配） |
| 发现缺陷 | 无 |
| 产出接口/函数 | API-0138（registerGeometricTemplates）、API-0139（geometricTemplateDefinitions） |

### T-08-03 实现流程图模板

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号 | T-08-03 |
| 任务名称 | 实现流程图模板 |
| 完成时间 | 2026-05-20 17:25 |
| 作者/智能体 | OpenCode/deepseek-v4-pro |
| Git Commit | 54a1947 |
| 修改记录 | 新建：src/modules/flowchart-templates.ts（registerFlowchartTemplates 函数 + 7 个流程图专用模板定义：开始/结束（圆角矩形 fc-terminator）、处理（矩形 fc-process）、判断（菱形 fc-decision，含 是/否 标注锚点）、输入输出（平行四边形 fc-io）、子流程（双边框矩形 fc-subprocess，外框+内框两元素）、泳道（容器 fc-swimlane）、注释（文本 fc-annotation，虚线边框））；修改：src/modules/index.ts（新增 registerFlowchartTemplates 和 flowchartTemplateDefinitions 导出）；修改：src/tests/unit/templates.test.ts（新增 27 个流程图模板测试用例：覆盖 7 模板数量/ID/分类验证、各模板实例化、判断节点是/否锚点、子流程双元素偏移、容器/文本属性、注册函数幂等性） |
| 发现缺陷 | 无 |
| 产出接口/函数 | API-0140（registerFlowchartTemplates）、API-0141（flowchartTemplateDefinitions） |

### T-08-04 实现架构图模板

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号 | T-08-04 |
| 任务名称 | 实现架构图模板 |
| 完成时间 | 2026-05-20 |
| 作者/智能体 | Claude |
| Git Commit | 7d77231 |
| 修改记录 | 1. 新建 src/modules/architecture-templates.ts — 注册 8 个架构图模板：服务、数据库（圆柱体路径）、缓存（闪电形状多边形）、消息队列（三叠矩形）、API网关（六边形）、负载均衡（圆+四向箭头）、云区域（容器）、浏览器/客户端（窗口框架+标题栏+红黄绿点+地址栏）。2. 更新 src/modules/index.ts 导出 registerArchitectureTemplates 和 architectureTemplateDefinitions。3. 新建 src/tests/unit/architecture-templates.test.ts — 36 个测试用例，含注册、分类、形状类型、实例化、ID唯一性、三层架构组合场景。全量 949 测试通过，零回归。 |
| 发现缺陷 | 无 |
| 产出接口/函数 | registerArchitectureTemplates(), architectureTemplateDefinitions（8 个 TemplateDefinition 对象，分类 '架构图'），模板 ID 列表：arch-service, arch-database, arch-cache, arch-mq, arch-gateway, arch-lb, arch-cloud, arch-client |

### T-08-05 实现 RTL 模块模板

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号 | T-08-05 |
| 任务名称 | 实现 RTL 模块模板 |
| 完成时间 | 2026-05-20 18:06 |
| 作者/智能体 | OpenCode/deepseek-v4-pro |
| Git Commit | 6845071 |
| 修改记录 | 新建：src/modules/rtl-templates.ts（registerRtlTemplates 函数 + 9 个 RTL 模板定义：通用模块 rtl-gen-module、寄存器 rtl-register、多路选择器 rtl-mux、ALU rtl-alu、FSM rtl-fsm、存储器 rtl-memory、流水线级 rtl-pipeline、控制器 rtl-controller、数据通路容器 rtl-datapath，全部归类为'RTL'）；修改：src/core/templates.ts（新增 TemplateRtlPortDef 接口、TemplateElementDef.ports 类型从 never[] 改为 TemplateRtlPortDef[]、buildElement 中 rtlModule case 支持根据端口方向和数量自动计算端口位置——input 在左侧、output 在右侧、inout 在上方）；修改：src/core/index.ts（新增 TemplateRtlPortDef 类型导出）；修改：src/modules/index.ts（新增 registerRtlTemplates 和 rtlTemplateDefinitions 导出）；新建：src/tests/unit/rtl-templates.test.ts（35 个测试用例，覆盖 9 模板注册、实例化、端口数量/名称/位宽/方向、端口位置布局、端口样式颜色、模块样式、Datapath 容器属性、无端口模块、注册函数幂等性、定义导出） |
| 发现缺陷 | 无 |
| 产出接口/函数 | API-0144（registerRtlTemplates）、API-0145（rtlTemplateDefinitions）、API-0146（TemplateRtlPortDef） |

### T-08-06 实现模板面板 UI

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号 | T-08-06 |
| 任务名称 | 实现模板面板 UI |
| 完成时间 | 2026-05-20 23:15 |
| 作者/智能体 | OpenCode/deepseek-v4-pro |
| Git Commit | 791c5d3 |
| 修改记录 | 新建：src/ui/TemplatePanel.tsx（模板面板组件：分类浏览、搜索过滤、SVG缩略图预览、点击插入）、src/tests/unit/template-panel.test.tsx（14个测试用例）；修改：src/ui/index.ts（新增 TemplatePanel 和 TemplatePanelProps 导出） |
| 发现缺陷 | 无 |
| 产出接口/函数 | API-0147（TemplatePanel）、API-0148（TemplatePanelProps） |

### T-09-01 实现 CSV 解析器

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号 | T-09-01 |
| 任务名称 | 实现 CSV 解析器 |
| 完成时间 | 2026-05-20 23:23 |
| 作者/智能体 | OpenCode/deepseek-v4-pro |
| Git Commit | f7ba583 |
| 修改记录 | 新建：src/io/csv-parser.ts（parseCSV 函数 + ParsedData/ColumnInfo/CsvParseOptions 接口，集成 PapaParse，列类型推断 number/string/date/boolean，缺失值识别 N/A NA null 空串）、src/tests/unit/csv-parser.test.ts（28 个测试用例）；修改：src/io/index.ts（新增 parseCSV/ParsedData/ColumnInfo/CsvParseOptions 导出）、package.json（新增 papaparse @types/papaparse 依赖） |
| 发现缺陷 | 无 |
| 产出接口/函数 | API-0149（parseCSV）、API-0150（ParsedData）、API-0151（ColumnInfo）、API-0152（CsvParseOptions） |

### T-09-02 实现数据面板 UI

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号 | T-09-02 |
| 任务名称 | 实现数据面板 UI |
| 完成时间 | 2026-05-20 |
| 作者/智能体 | OpenCode/deepseek-v4-pro |
| Git Commit | a9f63b3 |
| 修改记录 | 新建：src/ui/DataPanel.tsx（DataPanel 组件 + ChartConfig 接口，支持数据源列表、列信息表含类型徽章/缺失率/样例值预览、6 种图表类型选择器、列到轴/分组/颜色映射配置、可折叠分区、可关闭面板）、src/tests/unit/data-panel.test.tsx（24 个测试用例覆盖渲染、数据源列表交互、加载/错误状态、列信息/样例值显示、图表类型选择、列映射、生成按钮启用/禁用、面板关闭/重开、空值/空列处理）；修改：src/ui/index.ts（新增 DataPanel 和 ChartConfig 导出） |
| 发现缺陷 | 无 |
| 产出接口/函数 | API-0153（DataPanel）、API-0154（ChartConfig） |

### T-09-03 实现基础图表生成

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号 | T-09-03 |
| 任务名称 | 实现基础图表生成 |
| 完成时间 | 2026-05-21 |
| 作者/智能体 | OpenCode/deepseek-v4-pro |
| Git Commit | 8b15257 |
| 修改记录 | 新建：src/modules/chart/generator.ts（generateChart 函数 + ChartGenerationConfig 接口 + 6 种图表 SVG 渲染器：bar/line/scatter/boxplot/histogram/heatmap，自动轴刻度、图例、多系列分组、热图矩阵、数据准备函数）、src/modules/chart/index.ts（模块导出）、src/tests/unit/chart-generator.test.ts（39 个测试用例覆盖所有图表类型、边界情况、数据结构、数据绑定）；修改：src/core/commands.ts（ElementInput 新增 dataSourceId/chartType/columnMappings/options/svgContent 字段，buildElementFromInput 新增 'chart' case）、src/modules/index.ts（新增 chart 模块导出） |
| 发现缺陷 | 无 |
| 产出接口/函数 | API-0155（generateChart）、API-0156（ChartGenerationConfig）、API-0081（ElementInput 扩展） |

### T-09-04 实现图表样式编辑

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号 | T-09-04 |
| 任务名称 | 实现图表样式编辑 |
| 完成时间 | 2026-05-21 |
| 作者/智能体 | OpenCode/deepseek-v4-pro |
| Git Commit | eddbb49 |
| 修改记录 | 修改：src/modules/chart/generator.ts（ChartGenerationConfig 新增 showGrid/colorScheme/legendPosition/xAxisLabel/yAxisLabel 字段；新增 LegendPosition 类型、ChartColorScheme 接口、CHART_COLOR_SCHEMES 常量（6 种配色方案）、resolveColors 函数；renderBarChart/renderLineChart/renderScatterChart/renderBoxplotChart 支持 config.showGrid/config.legendPosition；renderHistogramChart 使用 resolveColors；renderLegend 支持 bottom/right/top/none 位置；svgWrap 支持 xLabel/yLabel 轴标签文本；computeLayout 使用 xAxisLabel/yAxisLabel 选项；generateChart 新增 existingOptions 参数支持样式合并；所有 prepare* 函数使用 resolveColors）、src/modules/chart/index.ts（新增导出 CHART_COLOR_SCHEMES/LegendPosition/ChartColorScheme）、src/modules/index.ts（新增导出）、src/core/commands.ts（ElementChanges 新增 dataSourceId/chartType/columnMappings/options/svgContent 字段；UpdateElementCommand.execute 处理这 5 个新字段）、src/ui/PropertyPanel.tsx（新增 'chart' Section、allChart/singleChart 检测、Chart Style 编辑区：标题/X轴标签/Y轴标签输入框、配色方案下拉、图例位置下拉、网格线开关；新增 parsedDataMap prop 支持 chart SVG 重新生成）、src/App.tsx（传递 parsedDataMap prop） |
| 发现缺陷 | 无 |
| 产出接口/函数 | API-0157（ChartColorScheme）、API-0158（CHART_COLOR_SCHEMES）、API-0159（LegendPosition）、API-0156 更新（ChartGenerationConfig 扩展 5 字段）、API-0155 更新（generateChart 新增 existingOptions）、API-0083 更新（ElementChanges 扩展 5 字段）、API-0105 更新（PropertyPanel 新增图表样式编辑和 parsedDataMap） |

### T-09-05 实现图表转矢量组

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号 | T-09-05 |
| 任务名称 | 实现图表转矢量组 |
| 完成时间 | 2026-05-21 07:04 |
| 作者/智能体 | OpenCode/deepseek-v4-pro |
| Git Commit | 8fcd69f |
| 修改记录 | 新建：src/modules/chart/convert.ts（convertChartSvgToElements 函数 + SVG 元素解析器：支持 rect/circle/ellipse/line/polyline/polygon/path/text 标签提取和坐标映射、ConvertedElementResult 接口）、src/tests/unit/chart-convert.test.ts（21 个测试用例覆盖 6 种图表类型转换、坐标映射、元素属性、ID 唯一性、边界情况）；修改：src/core/commands.ts（新增 ChartToVectorCommand 类：校验图表类型/svgContent、创建新图层、转换 SVG 为独立 shape/text 元素、生成 ElementGroup、撤销恢复原图表/删除新图层和组）、src/core/index.ts（新增 ChartToVectorCommand 导出）、src/modules/chart/index.ts（新增 convertChartSvgToElements 和 ConvertedElementResult 导出）、src/modules/index.ts（新增导出）、src/tests/unit/commands.test.ts（新增 13 个 ChartToVectorCommand 测试用例：构造、校验、执行、撤销、重做） |
| 发现缺陷 | 无 |
| 产出接口/函数 | API-0160（convertChartSvgToElements）、API-0161（ConvertedElementResult）、API-0162（ChartToVectorCommand） |

### T-09-06 实现 Excel 解析（Full 包）

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号 | T-09-06 |
| 任务名称 | 实现 Excel 解析（Full 包） |
| 完成时间 | 2026-05-21 |
| 作者/智能体 | OpenCode/deepseek-v4-pro |
| Git Commit | 30e8db9 |
| 修改记录 | 新建：src/io/excel-parser.ts（parseExcel/parseExcelFromBuffer/getExcelSheetNames/getExcelSheetNamesFromBuffer 函数 + ExcelParseOptions 接口，动态加载 SheetJS xlsx 库，Lite 包返回友好错误提示，支持工作表选择，内部通过 sheet_to_csv → parseCSV 保证输出格式一致，导出 _resetXlsxCacheForTesting/_setXlsxCacheForTesting 测试辅助）、src/tests/unit/excel-parser.test.ts（14 个测试用例覆盖 File/ArrayBuffer 解析、指定工作表、工作表不存在、空工作簿、列类型推断、缺失值处理、空数据、默认第一工作表、Lite 包错误提示、getExcelSheetNames 功能）；修改：src/io/index.ts（新增 parseExcel/parseExcelFromBuffer/getExcelSheetNames/getExcelSheetNamesFromBuffer 导出和 ExcelParseOptions 类型导出）、package.json（新增 xlsx 依赖） |
| 发现缺陷 | 无 |
| 产出接口/函数 | API-0163（parseExcel）、API-0164（parseExcelFromBuffer）、API-0165（getExcelSheetNames）、API-0166（getExcelSheetNamesFromBuffer）、API-0167（ExcelParseOptions） |

### T-10-01 实现布局引擎接口

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-10-01 |
| 任务名称      | 实现布局引擎接口 |
| 完成时间      | 2026-05-21 08:45 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | ca110fa |
| 修改记录      | 新建：src/core/layout.ts（LayoutEngine 接口、LayoutResult/LayoutOptions/LayoutNode/LayoutEdge/LayoutNodeResult/LayoutEdgeResult 类型、applyLayoutToScene/extractLayoutNodes/extractLayoutEdges 函数）、src/tests/unit/layout.test.ts（35 个单元测试覆盖类型定义、LayoutEngine 接口形状、提取函数、布局应用和引擎可替换性验证）；修改：src/core/index.ts（新增所有 layout 类型和函数导出）；更新：docs/api-registry.md（新增 API-0168 ~ API-0180）、docs/task-list.md（T-10-01 状态改为已完成）、README.md（更新测试计数和可用功能描述） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0168（LayoutDirection）、API-0169（LayoutHAlign）、API-0170（LayoutVAlign）、API-0171（LayoutOptions）、API-0172（LayoutNode）、API-0173（LayoutEdge）、API-0174（LayoutNodeResult）、API-0175（LayoutEdgeResult）、API-0176（LayoutResult）、API-0177（LayoutEngine）、API-0178（applyLayoutToScene）、API-0179（extractLayoutNodes）、API-0180（extractLayoutEdges） |

### T-10-02 实现基础流程图布局

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号 | T-10-02 |
| 任务名称 | 实现基础流程图布局 |
| 完成时间 | 2026-05-21 |
| 作者/智能体 | opencode |
| Git Commit | f8293e2 |
| 修改记录 | 1. 新建 src/modules/flowchart/layout.ts - 实现 FlowchartLayoutEngine，基于简化 dagre 式图布局算法（最长路径 rank 分配 + barycenter 交叉减少 + 正交边路由），支持 TB/LR/BT/RL 四种方向。2. 修改 src/core/commands.ts - 新增 LayoutCommand 类和 createLayoutCommand 工厂函数，将布局操作纳入命令系统支持撤销。3. 修改 src/core/layout.ts - extractLayoutNodes 增加 connector 类型过滤。4. 修改 src/core/index.ts - 导出 LayoutCommand 和 createLayoutCommand。5. 修改 src/modules/index.ts - 导出 FlowchartLayoutEngine 和 flowchartLayoutEngine。6. 新建 src/tests/unit/flowchart-layout.test.ts - 36 个测试覆盖引擎接口、空输入、线性图、菱形图、方向、间距、边路由、场景集成、LayoutCommand 和 CommandExecutor undo/redo。 |
| 发现缺陷 | 无 |
| 产出接口/函数 | FlowchartLayoutEngine (LayoutEngine 实现), flowchartLayoutEngine (单例), LayoutCommand, createLayoutCommand |

### T-10-03 实现 RTL 模块布局

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号 | T-10-03 |
| 任务名称 | 实现 RTL 模块布局 |
| 完成时间 | 2026-05-21 10:16 |
| 作者/智能体 | OpenCode/deepseek-v4-pro |
| Git Commit | e020c0d |
| 修改记录 | 新建：src/modules/rtl/layout.ts（RtlLayoutEngine 类实现 LayoutEngine 接口、rtlLayoutEngine 单例、extractRtlLayoutNodes/extractRtlLayoutEdges RTL 专用提取函数、RtlLayoutOptions 接口、RtlLayoutCommand 命令类、createRtlLayoutCommand 工厂函数）。RTL 布局功能：默认 LR（左到右）数据流方向、port-position-aware 节点排序减少连线交叉、bus 信号线（rtl-bus semanticKind）视觉偏置、clock/reset 信号元数据标记（从端口名和标签识别 clk/rst）、折叠模块高度压缩（40px）；修改：src/modules/index.ts（新增 rtl/layout 模块全部导出）。新建：src/tests/unit/rtl-layout.test.ts（50 个测试用例，覆盖：LayoutEngine 接口一致性、LR/TB/RL/BT 四种方向、diamond graph 布局、hSpacing/vSpacing 间距、正交边界路由、自环和缺失边处理、确定性验证、bus 信号偏置、clock/reset 元数据保留、RTL 专用提取函数（模块端口/折叠/clock/reset 检测、端口锚点元数据、rtl-bus/rtl-net 信号类型、clock/reset 端口名识别）、场景集成（applyLayoutToScene）、RtlLayoutCommand 验证/执行/撤销/重做/CommandExecutor 集成、折叠模块处理、端口感知排序） |
| 发现缺陷 | 无 |
| 产出接口/函数 | API-0186（RtlLayoutEngine）、API-0187（rtlLayoutEngine）、API-0188（extractRtlLayoutNodes）、API-0189（extractRtlLayoutEdges）、API-0190（RtlLayoutOptions）、API-0191（RtlLayoutCommand）、API-0192（createRtlLayoutCommand） |

### T-10-04 实现思维导图布局

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号 | T-10-04 |
| 任务名称 | 实现思维导图布局 |
| 完成时间 | 2026-05-21 10:45 |
| 作者/智能体 | OpenCode/deepseek-v4-pro |
| Git Commit | 7d357bb |
| 修改记录 | 新建：src/modules/mindmap/layout.ts（MindmapLayoutEngine 类实现 LayoutEngine 接口、mindmapLayoutEngine 单例、extractMindmapLayoutNodes/extractMindmapLayoutEdges 思维导图专用提取函数、MindmapLayoutOptions 接口、MindmapLayoutMode 类型、MindmapLayoutCommand 命令类、createMindmapLayoutCommand 工厂函数）。思维导图布局功能：lr-split 模式（根节点居中，子节点交替左右排列，每个分支水平向外延伸）、radial 模式（根节点居中，子节点按扇形角度均匀辐射，每层半径递增）、折叠节点子树排除、贝塞尔曲线（cubic bezier）边路由、孤儿节点（无有效 parentId）自动挂载到根节点、可配置 hSpacing/vSpacing 间距；修改：src/modules/index.ts（新增 mindmap/layout 模块全部导出）。新建：src/tests/unit/mindmap-layout.test.ts（35 个测试用例，覆盖：LayoutEngine 接口一致性、空输入/单节点/简单树/深度树/lr-split 模式/radial 模式/折叠节点排除/边路由/自环排除/缺失端点/确定性验证/BBox 计算/孤儿节点/自定义间距/提取函数/extractMindmapLayoutNodes（mindNode 含 parentId/childrenIds/collapsed/text/折叠检测/shape 类型支持）/extractMindmapLayoutEdges/MindmapLayoutCommand 验证/执行/撤销/倒置/CommandExecutor 集成/radial 模式选项/场景集成（applyLayoutToScene 更新 node 位置和 connector 路由）/折叠节点场景集成） |
| 发现缺陷 | 无 |
| 产出接口/函数 | API-0193（MindmapLayoutEngine）、API-0194（mindmapLayoutEngine）、API-0195（extractMindmapLayoutNodes）、API-0196（extractMindmapLayoutEdges）、API-0197（MindmapLayoutOptions）、API-0198（MindmapLayoutMode）、API-0199（MindmapLayoutCommand）、API-0200（createMindmapLayoutCommand） |

### T-10-05 实现网络拓扑布局

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号 | T-10-05 |
| 任务名称 | 实现网络拓扑布局 |
| 完成时间 | 2026-05-21 11:10 |
| 作者/智能体 | OpenCode/deepseek-v4-pro |
| Git Commit | 96bf532 |
| 修改记录 | 新建：src/modules/topology/layout.ts（TopologyLayoutEngine 类实现 LayoutEngine 接口、topologyLayoutEngine 单例、extractTopologyLayoutNodes/extractTopologyLayoutEdges 拓扑专用提取函数、TopologyLayoutOptions 接口、TopologyLayoutMode 类型、TopologyLayoutCommand 命令类、createTopologyLayoutCommand 工厂函数）。拓扑布局功能：hierarchical 模式（按网络层级分层排列，路由=核心层 rank0，交换机=分布层 rank1，防火墙/负载均衡/网关=聚合层 rank2，服务器=接入层 rank3，默认 TB 方向）、force-directed 模式（力导向迭代模拟节点位置，排斥力+吸引力+阻尼）、容器子网区域自动扩边包含子设备（layoutContainers 内部函数）、正交边路由（TB/LR/BT/RL 四种方向）、链路标签元数据保留（linkLabels/semanticKind）、撤消/重做支持（保存前态位置+尺寸+连接线路由）；修改：src/modules/index.ts（新增 topology/layout 模块全部导出）。新建：src/tests/unit/topology-layout.test.ts（37 个测试用例，覆盖：LayoutEngine 接口一致性、空输入、节点无边、层级设备排列 TB/LR、孤立节点 rank 排序、hSpacing/vSpacing 间距、正交边路由、自环过滤、未知端点过滤、总 BBox、force-directed 模式非重叠位置、force-directed 边生成、extractTopologyLayoutNodes（topologyNode 提取、deviceType/rank 元数据、container 提取含 childElementIds、非拓扑类型排除、宽高提取）、extractTopologyLayoutEdges（连接线边提取、semanticKind 丰富、源/目标不在集合排除、linkLabels 元数据）、TopologyLayoutCommand（工厂创建、验证存在/缺失/空列表、执行层级节点+连接器路由、撤销/重做、场景 applyLayoutToScene 集成、所有设备类型、容器定位）、TopologyLayoutOptions） |
| 发现缺陷 | 无 |
| 产出接口/函数 | API-0201（TopologyLayoutEngine）、API-0202（topologyLayoutEngine）、API-0203（extractTopologyLayoutNodes）、API-0204（extractTopologyLayoutEdges）、API-0205（TopologyLayoutOptions）、API-0206（TopologyLayoutMode）、API-0207（TopologyLayoutCommand）、API-0208（createTopologyLayoutCommand） |

### T-11-01 实现布尔运算

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号 | T-11-01 |
| 任务名称 | 实现布尔运算 |
| 完成时间 | 2026-05-21 11:35 |
| 作者/智能体 | OpenCode/deepseek-v4-pro |
| Git Commit | 70c12a4 |
| 修改记录 | 新建：src/core/boolean-ops.ts（performBooleanOperation/geometryToSvgPath 函数 + BooleanOperationType 类型，使用 polygon-clipping 库实现 union/intersect/xor/subtract 四种布尔运算，支持多形状输入，输出 SVG path 命令字符串）、src/tests/unit/boolean-ops.test.ts（29 个测试用例覆盖 getGeometry 几何提取、performBooleanOperation 四种运算、geometryToSvgPath 转换、BooleanOperationCommand 的验证/执行/撤销/重做/锁定/类型检查/图层上限/圆与矩形混合运算）；修改：src/core/geometry.ts（新增 getGeometry 函数，从 shape 元素提取 GeometryShape：rect 转 4 顶点多边形、circle 近似 64 顶点、ellipse 近似 64 顶点、polygon 直接使用顶点，均应用 transform 旋转；createGeometryAdapter 现在实际提供 getGeometry 而非 undefined）、src/core/commands.ts（新增 BooleanOperationCommand 类 + 引入 boolean-ops 模块，实现 check: 至少2个元素、元素存在/未锁定/为 shape 类型、几何可提取、图层未达上限；execute: 提取几何执行布尔运算生成新 path 元素放入新图层；invert: 保存原始元素并删除结果元素和图层，支持 undo/redo）、src/core/index.ts（新增 getGeometry/performBooleanOperation/geometryToSvgPath 导出、BooleanOperationType 类型导出、BooleanOperationCommand 导出）、package.json（新增 polygon-clipping 0.15.7 依赖）；更新：src/tests/unit/geometry.test.ts（createGeometryAdapter 测试更新为 getGeometry 不为 undefined） |
| 发现缺陷 | 无 |
| 产出接口/函数 | API-0210（BooleanOperationType）、API-0211（performBooleanOperation）、API-0212（geometryToSvgPath）、API-0213（getGeometry）、API-0214（BooleanOperationCommand） |

### T-11-02 实现元素裁剪

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号 | T-11-02 |
| 任务名称 | 实现元素裁剪 |
| 完成时间 | 2026-05-21 12:00 |
| 作者/智能体 | OpenCode/deepseek-v4-pro |
| 修改记录 | 修改：src/core/commands.ts（新增 ClipStrategy 类型、geometryToRelativeSvgPath 辅助函数、ClipElementCommand 类：支持 shape 元素的布尔交集裁剪和 image 元素的 clipPath 元数据裁剪，支持 removeClipShape 选项控制裁剪形状是否保留，完整的 validate/execute/invert 实现用于 undo/redo）、src/core/index.ts（新增 ClipElementCommand 和 ClipStrategy 导出）；新建：src/tests/unit/clip-command.test.ts（23 个测试用例覆盖 shape 裁剪、image 裁剪、undo/redo、非重叠裁剪处理、验证失败场景、getter 方法） |
| Git Commit | 0ee12fe |
| 发现缺陷 | 无 |
| 产出接口/函数 | API-0215（ClipStrategy）、API-0216（ClipElementCommand）、API-0217（geometryToRelativeSvgPath） |

### T-11-03 实现真实几何碰撞检测

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号 | T-11-03 |
| 任务名称 | 实现真实几何碰撞检测 |
| 完成时间 | 2026-05-21 |
| 作者/智能体 | OpenCode/deepseek-v4-pro |
| Git Commit | c395c81 |
| 修改记录 | 新建：src/tests/unit/intersects.test.ts（26 个测试用例覆盖 intersects 函数 15 个、checkLayerCollisions 几何策略 7 个、checkElementsCollide 4 个）；修改：src/core/geometry.ts（新增 intersects 函数：BBox 快速剔除 + getGeometry 提取 + polygon-clipping intersection 真实几何检测；新增 geometriesIntersect 和 geometryToMultiPolygon 辅助函数；新增 bboxesOverlap 辅助函数（与 collision.ts 保持独立）；createGeometryAdapter 现在提供 intersects 而非 undefined）、src/core/collision.ts（CollisionCheckOptions 新增 collisionStrategy?: CollisionStrategy；checkLayerCollisions 在 strategy='geometry' 且适配器有 intersects 时使用真实几何检测，否则退化为 BBox；新增 checkElementsCollide 便捷函数供命令验证使用，支持策略参数）、src/core/validator.ts（validateGeometryRules 从 rulesObj.collisionStrategy 传递策略到 checkLayerCollisions 的 CollisionCheckOptions）、src/core/commands.ts（import checkElementsCollide；checkElementCollision 新增 collisionStrategy 参数，在 geometry 策略下使用 adapter.intersects 做真实几何过滤；CreateElementCommand 传递 scene.rules.collisionStrategy；MoveLayersCommand 传递策略到 checkLayerCollisions）、src/core/index.ts（导出 intersects 和 checkElementsCollide）、src/tests/unit/geometry.test.ts（createGeometryAdapter 测试从期望 intersects undefined 改为期望 defined） |
| 发现缺陷 | 无 |
| 产出接口/函数 | API-0218（intersects）、API-0219（checkElementsCollide） |

### T-12-01 实现 SVG 导出

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-12-01 |
| 任务名称      | 实现 SVG 导出 |
| 完成时间      | 2026-05-21 12:50 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | db69fae |
| 修改记录      | 修改：src/io/exporters.ts（新增 SvgExportOptions 接口、svgAttr/attrStr/computeTransformString/styleToAttr/renderShapeToSvg/renderTextToSvg/renderImageToSvg/createArrowMarkerDef/resolveEndpointPositionSvg/computePathLength/computePointAtLength/renderConnectorToSvg/renderElementToSvg/collectArrowDefs/computeExportBBox/exportToSVG/downloadSvg 函数）、src/io/index.ts（新增 exportToSVG/downloadSvg 和 SvgExportOptions 导出）；新建：src/tests/unit/svg-export.test.ts（38 个测试用例） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0220（SvgExportOptions）、API-0221（exportToSVG）、API-0222（downloadSvg） |

### T-12-02 实现 PNG/JPG 导出

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号 | T-12-02 |
| 任务名称 | 实现 PNG/JPG 导出 |
| 完成时间 | 2026-05-21 13:25 |
| 作者/智能体 | OpenCode/deepseek-v4-pro |
| Git Commit | 2d3c0bd |
| 修改记录 | 修改：src/io/exporters.ts（新增 RasterExportOptions 接口、exportToRaster、downloadRaster 函数）、src/io/index.ts（新增 exportToRaster/downloadRaster 和 RasterExportOptions 导出）；新建：src/tests/unit/raster-export.test.ts（23 个测试用例） |
| 发现缺陷 | 无 |
| 产出接口/函数 | API-0223（RasterExportOptions）、API-0224（exportToRaster）、API-0225（downloadRaster） |

### T-12-03 实现 PWA 离线支持

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号 | T-12-03 |
| 任务名称 | 实现 PWA 离线支持 |
| 完成时间 | 2026-05-21 14:35 |
| 作者/智能体 | OpenCode/deepseek-v4-pro |
| Git Commit | 117dc4a |
| 修改记录 | 新建：public/sw.js（自定义 Service Worker，实现离线缓存：install/activate/fetch 事件处理，stale-while-revalidate 策略缓存同源资源，SKIP_WAITING 消息支持更新）、public/manifest.webmanifest（PWA 应用清单：name/short_name/description/theme_color/background_color/display/icons）、public/pwa-192x192.png（192px PWA 图标）、public/pwa-512x512.png（512px PWA 图标）、src/ui/PwaPrompt.tsx（PWA 安装和更新提示组件：beforeinstallprompt 安装提示、Service Worker updatefound 更新提示、SKIP_WAITING 消息触发更新、UI 动画和样式）；修改：src/ui/index.ts（新增 PwaPrompt 和 PwaPromptProps 导出）、src/App.css（新增 .pwa-prompt 浮层样式含滑入动画）、src/App.tsx（集成 PwaPrompt 组件）、src/main.tsx（手动注册 Service Worker）、index.html（新增 PWA meta 标签：theme-color/description/apple-touch-icon/manifest link） |
| 发现缺陷 | 无 |
| 产出接口/函数 | API-0226（PwaPrompt）、API-0227（PwaPromptProps） |

### T-12-04 实现快捷键系统

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号 | T-12-04 |
| 任务名称 | 实现快捷键系统 |
| 完成时间 | 2026-05-21 15:00 |
| 作者/智能体 | OpenCode/deepseek-v4-pro |
| Git Commit | bb162fb |
| 修改记录 | 新建：src/core/keyboard.ts（ShortcutActionId/ShortcutBinding/ShortcutMap 类型、DEFAULT_SHORTCUTS 默认映射、ALT_REDO_BINDING 备用重做绑定、matchShortcut/matchShortcutOr 匹配函数、loadShortcutMap/saveShortcutMap 持久化函数、formatShortcut 格式化函数、isInputFocused 焦点检测）、src/ui/useKeyboardShortcuts.ts（React Hook：useKeyboardShortcuts，接收 executorRef/selectionManager/forceUpdate/activeLayerId，实现 Ctrl+Z 撤销、Ctrl+Shift+Z/Ctrl+Y 重做、Ctrl+C 复制、Ctrl+V 粘贴、Ctrl+X 剪切、Delete/Backspace 删除、Ctrl+A 全选、Ctrl+G 分组、Ctrl+Shift+G 解散组、Ctrl+S 保存等快捷键，内置剪贴板支持复制粘贴元素）、src/tests/unit/keyboard.test.ts（43 个测试用例）；修改：src/core/index.ts（新增 keyboard 模块全部导出）、src/ui/index.ts（新增 useKeyboardShortcuts 导出）、src/App.tsx（集成 useKeyboardShortcuts hook） |
| 发现缺陷 | 无 |
| 产出接口/函数 | API-0228（ShortcutActionId）、API-0229（ShortcutBinding）、API-0230（ShortcutMap）、API-0231（DEFAULT_SHORTCUTS）、API-0232（matchShortcut）、API-0233（matchShortcutOr）、API-0234（loadShortcutMap）、API-0235（saveShortcutMap）、API-0236（formatShortcut）、API-0237（isInputFocused）、API-0238（useKeyboardShortcuts） |

### T-12-05 实现右键菜单

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号 | T-12-05 |
| 任务名称 | 实现右键菜单 |
| 完成时间 | 2026-05-21 16:45 |
| 作者/智能体 | OpenCode/deepseek-v4-pro |
| Git Commit | 58ec357 |
| 修改记录 | 新建：src/core/clipboard.ts（共享剪贴板模块，getClipboard/setClipboard/clearClipboard/hasClipboard/elementToClipboardInput/computePastePosition/PASTE_OFFSET）、src/ui/ContextMenu.tsx（ContextMenu 组件，支持 Canvas/Element 两种上下文、子菜单、快捷键显示、动态启用/禁用、Esc/点击外部关闭）；修改：src/ui/useKeyboardShortcuts.ts（改用共享剪贴板模块）、src/canvas/CanvasView.tsx（新增 onContextMenu 回调和 CanvasContextMenuEvent 类型、handleContextMenu 实现右键元素自动选中和上下文事件发送）、src/App.tsx（集成 ContextMenu，实现 Canvas 右键：全选/粘贴/适配画布/缩放/重置缩放；Element 右键：复制/剪切/删除/改层子菜单/分组/对齐子菜单/分布子菜单）、src/App.css（上下文菜单样式）、src/ui/index.ts（导出 ContextMenu/MenuItem/ContextMenuState）、src/canvas/index.ts（导出 CanvasContextMenuEvent）、src/core/index.ts（导出 clipboard 模块） |
| 发现缺陷 | 无 |
| 产出接口/函数 | API-0239（getClipboard）、API-0240（setClipboard）、API-0241（hasClipboard）、API-0242（elementToClipboardInput）、API-0243（computePastePosition）、API-0244（ContextMenu）、API-0245（MenuItem）、API-0246（ContextMenuState）、API-0247（CanvasContextMenuEvent） |

### T-12-06 实现图层面板 UI

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-12-06 |
| 任务名称      | 实现图层面板 UI |
| 完成时间      | 2026-05-21 17:20 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | e3bd6f9 |
| 修改记录      | 新建：src/ui/LayerPanel.tsx（LayerPanel 组件：图层列表按 order 降序显示、可见性切换、锁定切换、元素计数、点击选中全层元素、拖拽排序（HTML5 drag-and-drop）、双击重命名、批量操作下拉菜单（全选/改色/改透明度/显示隐藏/复制到层/移动到层/删除全部）、冲突图层红色高亮）；修改：src/ui/index.ts（新增 LayerPanel/LayerPanelProps 导出）、src/App.tsx（集成 LayerPanel 组件） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0248（LayerPanel）、API-0249（LayerPanelProps） |

### T-12-07 实现网格、标尺和吸附

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号 | T-12-07 |
| 任务名称 | 实现网格、标尺和吸附 |
| 完成时间 | 2026-05-21 17:52 |
| 作者/智能体 | OpenCode/deepseek-v4-pro |
| Git Commit | 73364b4 |
| 修改记录 | 新建：src/canvas/snap.ts（SnapManager 类：网格吸附、元素边缘/中心吸附、可配置吸附距离、Alt 临时禁用）、src/ui/Ruler.tsx（Ruler 组件：顶部水平标尺、左侧垂直标尺、自适应刻度间隔、主刻度+子刻度渲染、角方块）、src/tests/unit/snap.test.ts（13 个 SnapManager 单元测试）；修改：src/canvas/CanvasView.tsx（新增 snapManager/onElementMove props、新增元素拖拽交互（mousedown/mousemove/mouseup 三阶段、支持多选拖拽、拖拽预览变换、dragging 光标）、网格点阵渲染（SVG pattern 加 background rect）、吸附参考线渲染（垂直/水平虚线）、Alt 键临时禁用吸附）、src/canvas/index.ts（新增 SnapManager/SnapConfig/SnapResult 导出）、src/ui/index.ts（新增 Ruler/RulerProps 导出）、src/App.tsx（新增 SnapManager 实例化、Ruler 组件集成（含 window resize 监听）、元素拖拽 MoveElementsCommand 回调） |
| 发现缺陷 | 无 |
| 产出接口/函数 | API-0250（SnapManager）、API-0251（SnapConfig）、API-0252（SnapResult）、API-0253（Ruler）、API-0254（RulerProps） |

### T-12-08 构建 Lite 和 Full 包

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-12-08 |
| 任务名称      | 构建 Lite 和 Full 包 |
| 完成时间      | 2026-05-21 18:05 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | 53d4fbc |
| 修改记录      | 修改：vite.config.ts（新增 define.__BUNDLE_TYPE__/__BUILD_TIME__ 常量注入、build.outDir 按包类型分目录输出 dist/lite 和 dist/full、Lite 包 rollupOptions.external 排除 xlsx）；修改：src/vite-env.d.ts（声明 __BUNDLE_TYPE__ 和 __BUILD_TIME__ 全局类型）；修改：src/io/excel-parser.ts（新增 __BUNDLE_TYPE__ === 'lite' 编译期提早返回，避免 Lite 包运行时触发失败的 xlsx 动态 import）；修改：src/main.tsx（根据 __BUNDLE_TYPE__ 设置文档标题）；修改：package.json（新增 build:all/preview:lite/preview:full 脚本，build 脚本默认输出 dist/full） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0255（__BUNDLE_TYPE__）、API-0256（__BUILD_TIME__） |

### T-12-09 创建示例项目集

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-12-09 |
| 任务名称      | 创建示例项目集 |
| 完成时间      | 2026-05-21 19:02 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | d324ad1 |
| 修改记录      | 新建：examples/flowchart/scene.json（完整流程图：开始→输入→处理→判断→分支→结束，7 个节点、4 个图层、7 条连接线）、examples/architecture/scene.json（三层架构图：表示层/应用层/数据层，3 个容器、12 个服务节点、5 个图层、9 条依赖连接线）、examples/rtl/scene.json（RTL datapath：PC、指令存储器、译码器、寄存器文件、ALU、数据存储器、多路选择器，7 个 rtlModule、8 条 net/bus 连接线、4 个图层）、examples/statistics/scene.json（统计图：柱状图 chart 元素、坐标轴、标题和图例标签、CSV 数据源和图表定义）、examples/topology/scene.json（网络拓扑图：核心层/分布层/接入层/DMZ/服务器区，5 个容器、11 个拓扑节点、4 个图层、8 条网络链路）、examples/statistics/data/measurements.csv（实验数据 CSV）、src/tests/unit/example-scenes-validation.test.ts（5 个示例项目的 validateScene 校验测试）；新建目录：examples/flowchart/data/、examples/flowchart/assets/、examples/architecture/data/、examples/architecture/assets/、examples/rtl/data/、examples/rtl/assets/、examples/statistics/data/、examples/statistics/assets/、examples/topology/data/、examples/topology/assets/ |
| 发现缺陷      | 无 |
| 产出接口/函数 | 无（仅示例项目文件，无新增 API） |

### T-12-10 性能优化

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号 | T-12-10 |
| 任务名称 | 性能优化 |
| 完成时间 | 2026-05-21 20:02 |
| 作者/智能体 | OpenCode/deepseek-v4-pro |
| Git Commit | 725b999 |
| 修改记录 | 新建：src/core/spatial-index.ts（SpatialIndex类包装rbush空间索引、findCollisionPairsFromIndex函数用于O(n log n)碰撞对查找）、src/workers/layout.worker.ts（布局计算Web Worker：简单有向图层次布局算法、正交边路由、独立线程执行）、src/workers/layout-worker-manager.ts（Worker生命周期管理、Promise化API - computeLayoutInWorker/terminateLayoutWorker）、src/tests/unit/performance.test.ts（5个性能基准测试：1000元素碰撞检测、500重叠元素、O(n²)vsO(n log n)缩放对比、正确性验证、connector豁免）；修改：src/core/collision.ts（集成空间索引：50元素以上自动切换到rbush加速路径、保留50以下线性扫描、保持接口兼容）、src/core/index.ts（新增SpatialIndex/findCollisionPairsFromIndex导出）、src/io/csv-parser.ts（新增parseCSVChunked函数：分块解析大CSV、进度回调ChunkProgress、100k行安全上限）、src/canvas/CanvasView.tsx（实现视口裁剪：useMemo计算可见元素ID集合、视口BBox与元素BBox相交检测、connector永远渲染、200px缓冲区、动态跟随zoom/offset变化）、package.json（新增rbush和@types/rbush依赖） |
| 发现缺陷 | 无 |
| 产出接口/函数 | API-0257（SpatialIndex）、API-0258（findCollisionPairsFromIndex）、API-0259（parseCSVChunked）、API-0260（computeLayoutInWorker）、API-0261（ChunkProgress）、API-0262（ChunkedParseOptions）、API-0263（terminateLayoutWorker）、API-0069（checkLayerCollisions — 已更新为支持空间索引） |

### T-12-11 完善测试覆盖

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号 | T-12-11 |
| 任务名称 | 完善测试覆盖 |
| 完成时间 | 2026-05-21 20:36 |
| 作者/智能体 | OpenCode/deepseek-v4-pro |
| Git Commit | 7a3c39a |
| 修改记录 | 新建：src/tests/unit/clipboard.test.ts（16个测试，覆盖getClipboard/setClipboard/clearClipboard/hasClipboard/elementToClipboardInput/computePastePosition）、src/tests/unit/context-menu.test.tsx（13个测试，覆盖渲染/点击/禁用/Escape关闭/外部点击关闭/子菜单/位置调整）、src/tests/unit/layer-panel.test.tsx（12个测试，覆盖图层列表/折叠展开/批量操作菜单/添加图层/重命名/可见性/锁定/冲突高亮）、src/tests/unit/ruler.test.tsx（9个测试，覆盖双canvas渲染/角标/自定义尺寸/缩放和平移状态）、src/tests/unit/pwa-prompt.test.tsx（6个测试，覆盖安装提示/安装按钮/关闭/更新提示）、src/tests/integration/open-save.test.ts（10个测试，覆盖场景校验/加载/脏标志/JSON序列化往返/ZIP导出/updateScene）、src/tests/integration/csv-import.test.ts（10个测试，覆盖带表头CSV/无表头CSV/类型推断/缺失率/行数/错误/数据行格式/空CSV/单行CSV）、src/tests/integration/chart-export.test.ts（10个测试，覆盖图表生成/SVG导出/图表转矢量/文本导出/背景色）、src/tests/integration/connector-export.test.ts（10个测试，覆盖连接线校验/锚点/碰撞检测/BBox/命令/撤销/创建元素）、src/tests/e2e/canvas-interaction.spec.ts、src/tests/e2e/drawing-tools.spec.ts、src/tests/e2e/navigation.spec.ts（3个E2E测试文件）、playwright.config.ts（Playwright E2E配置）；修改：vite.config.ts（增加coverage配置/覆盖率阈值80%/排除E2E目录/test include规则）、package.json（增加test:coverage/test:all脚本） |
| 发现缺陷 | 无 |
| 产出接口/函数 | 无（仅测试文件，无新增API） |

### T-12-12 编写用户手册和 Agent 指南

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-12-12 |
| 任务名称      | 编写用户手册和 Agent 指南 |
| 完成时间      | 2026-05-22 00:00 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | 72aeb43 |
| 修改记录      | 新建：docs/user-manual.md（用户手册：涵盖安装启动、界面布局、打开保存项目、画布操作、绘制图形、编辑元素、图层管理、对齐分布、数据图表、导出、示例项目）、docs/agent-guide.md（Agent 生成指南：scene.json 顶层结构、所有字段详细定义、11 种元素类型完整 Schema 参考含 JSON 示例、错误码参考与修复方式、校验器工作流程、7 个生成示例含流程图/架构图/RTL/拓扑/统计图模式、图层规划原则、锚点参考、项目目录结构）；修改：docs/documentation-guide.md（文档清单新增用户手册和 Agent 指南）、README.md（可用功能新增文档编写记录、文档索引新增两条记录） |
| 发现缺陷      | 无 |
| 产出接口/函数 | 无（仅文档文件，无新增 API） |
